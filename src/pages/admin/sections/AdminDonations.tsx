import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search, HandHeart, Check, X as XIcon, Loader2,
  Clock, CheckCircle2, XCircle, Building2, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import type { DonationReport } from "@/types/database.types"

type DonationRow = DonationReport & {
  foundation: { id: string; foundation_name: string } | null
  donor: { full_name: string | null } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  reported: { label: "Reportada", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700", icon: XCircle },
}

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

export function AdminDonations() {
  const { user } = useAuth()
  const toast = useToast()

  const [rows, setRows] = useState<DonationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [toReject, setToReject] = useState<DonationRow | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDonations = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("donation_reports")
        .select(`*, foundation:foundations(id, foundation_name), donor:profiles!donation_reports_profile_id_fkey(full_name)`)
        .order("created_at", { ascending: false })
      if (fetchError) throw fetchError
      setRows((data as unknown as DonationRow[]) ?? [])
    } catch (err) {
      console.error("Error fetching donations:", err)
      setError(err instanceof Error ? err.message : "Error al cargar las donaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDonations() }, [])

  const donorName = (r: DonationRow) => r.donor?.full_name || r.reporter_name || "Anónimo"

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return rows.filter((r) => {
      const matchesSearch =
        donorName(r).toLowerCase().includes(term) ||
        (r.foundation?.foundation_name || "").toLowerCase().includes(term)
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rows, searchTerm, statusFilter])

  const stats = useMemo(() => {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    let reportedSum = 0
    let confirmedMonthSum = 0
    let reportedCount = 0
    for (const r of rows) {
      if (r.status === "reported") {
        reportedSum += r.amount_cop
        reportedCount++
      }
      if (r.status === "confirmed" && new Date(r.created_at) >= startOfMonth) {
        confirmedMonthSum += r.amount_cop
      }
    }
    return { reportedSum, confirmedMonthSum, reportedCount }
  }, [rows])

  const updateStatus = async (row: DonationRow, status: "confirmed" | "rejected", notes?: string) => {
    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from("donation_reports")
        .update({
          status,
          review_notes: notes ?? row.review_notes ?? null,
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", row.id)
      if (updateError) throw updateError
      await fetchDonations()
      return true
    } catch (err) {
      console.error("Error actualizando donación:", err)
      toast.error("No se pudo actualizar", err instanceof Error ? err.message : "Inténtalo de nuevo")
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirm = async (row: DonationRow) => {
    const ok = await updateStatus(row, "confirmed")
    if (ok) toast.success("Donación confirmada", `${formatCop(row.amount_cop)} · ${donorName(row)}`)
  }

  const handleReject = async () => {
    if (!toReject) return
    const ok = await updateStatus(toReject, "rejected", rejectNotes.trim() || undefined)
    if (ok) {
      toast.success("Donación rechazada", donorName(toReject))
      setToReject(null)
      setRejectNotes("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Donaciones</h1>
        <p className="text-gray-500">
          Donaciones reportadas
          {stats.reportedCount > 0 && (
            <span className="ml-2 text-amber-600 font-medium">· {stats.reportedCount} por revisar</span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-sm text-amber-700">Reportado pendiente</p>
          <p className="text-2xl font-bold text-amber-800">{formatCop(stats.reportedSum)}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-sm text-emerald-700">Confirmado este mes</p>
          <p className="text-2xl font-bold text-emerald-800">{formatCop(stats.confirmedMonthSum)}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total registros</p>
          <p className="text-2xl font-bold text-gray-800">{rows.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por donador o fundación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "reported", "confirmed", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl ${statusFilter === status ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
            >
              {status === "all" ? "Todas" : statusConfig[status].label + "s"}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      )}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchDonations} variant="outline" className="mt-4 rounded-xl">Reintentar</Button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Donador</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fundación</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Monto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const st = statusConfig[r.status] || statusConfig.reported
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-300" />
                          <div>
                            <p className="font-medium text-gray-800">{donorName(r)}</p>
                            {r.note && <p className="text-xs text-gray-400 max-w-[200px] truncate">{r.note}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Building2 className="w-4 h-4 text-cyan-500" />
                          {r.foundation?.foundation_name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{formatCop(r.amount_cop)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          <st.icon className="w-3.5 h-3.5" />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(r.created_at).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === "reported" && (
                            <>
                              <Button
                                variant="ghost" size="icon"
                                className="rounded-lg h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Confirmar"
                                disabled={actionLoading}
                                onClick={() => handleConfirm(r)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Rechazar"
                                disabled={actionLoading}
                                onClick={() => { setToReject(r); setRejectNotes("") }}
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <HandHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay donaciones</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!toReject} onOpenChange={(open) => !open && setToReject(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Rechazar donación</DialogTitle>
            <DialogDescription>
              Rechazar la donación de <strong>{toReject ? donorName(toReject) : ""}</strong>
              {toReject ? ` (${formatCop(toReject.amount_cop)})` : ""}. Puedes dejar una nota (opcional).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="Motivo del rechazo (opcional)..."
            rows={3}
            className="rounded-xl"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setToReject(null)} disabled={actionLoading} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading} className="rounded-xl bg-red-600 hover:bg-red-700">
              {actionLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rechazando...</> : "Rechazar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
