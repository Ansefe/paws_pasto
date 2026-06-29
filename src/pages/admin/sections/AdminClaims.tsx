import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search, PawPrint, Check, X as XIcon, Loader2, Eye,
  Clock, CheckCircle2, XCircle, Building2, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/contexts/ToastContext"
import type { AdoptionClaim } from "@/types/database.types"

type ClaimRow = AdoptionClaim & {
  pet: { name: string; main_photo_url: string | null; species: string } | null
  adopter: { full_name: string | null } | null
  foundation: { foundation_name: string } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700", icon: XCircle },
}

export function AdminClaims() {
  const toast = useToast()

  const [rows, setRows] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [toView, setToView] = useState<ClaimRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchClaims = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("adoption_claims")
        .select(`*, pet:pets(name, main_photo_url, species), adopter:profiles!adoption_claims_profile_id_fkey(full_name), foundation:foundations(foundation_name)`)
        .order("created_at", { ascending: false })
      if (fetchError) throw fetchError
      setRows((data as unknown as ClaimRow[]) ?? [])
    } catch (err) {
      console.error("Error fetching claims:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los reclamos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClaims() }, [])

  const adopterName = (r: ClaimRow) => r.adopter?.full_name || "Adoptante"

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return rows.filter((r) => {
      const matchesSearch =
        adopterName(r).toLowerCase().includes(term) ||
        (r.pet?.name || "").toLowerCase().includes(term) ||
        (r.foundation?.foundation_name || "").toLowerCase().includes(term)
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rows, searchTerm, statusFilter])

  const pendingCount = useMemo(() => rows.filter((r) => r.status === "pending").length, [rows])

  const updateStatus = async (row: ClaimRow, status: "confirmed" | "rejected") => {
    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from("adoption_claims")
        .update({ status })
        .eq("id", row.id)
      if (updateError) throw updateError
      await fetchClaims()
      setToView(null)
      toast.success(
        status === "confirmed" ? "Adopción confirmada 🎉" : "Reclamo rechazado",
        `${row.pet?.name || "Mascota"} · ${adopterName(row)}`
      )
    } catch (err) {
      console.error("Error actualizando reclamo:", err)
      toast.error("No se pudo actualizar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Reclamos de adopción</h1>
        <p className="text-gray-500">
          Adopciones reportadas por los usuarios
          {pendingCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {pendingCount} por revisar</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por adoptante, mascota o fundación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "rejected"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl ${statusFilter === status ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
            >
              {status === "all" ? "Todos" : statusConfig[status].label + "s"}
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
          <Button onClick={fetchClaims} variant="outline" className="mt-4 rounded-xl">Reintentar</Button>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Mascota</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Adoptante</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fundación</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r) => {
                  const st = statusConfig[r.status] || statusConfig.pending
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            {r.pet?.main_photo_url ? (
                              <img src={r.pet.main_photo_url} alt={r.pet.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">{r.pet?.species === "cat" ? "🐈" : "🐕"}</div>
                            )}
                          </div>
                          <p className="font-medium text-gray-800">{r.pet?.name || "—"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                          <User className="w-4 h-4 text-gray-300" /> {adopterName(r)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          <Building2 className="w-4 h-4 text-cyan-500" /> {r.foundation?.foundation_name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          <st.icon className="w-3.5 h-3.5" /> {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(r.created_at).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => setToView(r)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {r.status === "pending" && (
                            <>
                              <Button
                                variant="ghost" size="icon"
                                className="rounded-lg h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Confirmar"
                                disabled={actionLoading}
                                onClick={() => updateStatus(r, "confirmed")}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Rechazar"
                                disabled={actionLoading}
                                onClick={() => updateStatus(r, "rejected")}
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
              <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay reclamos</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!toView} onOpenChange={(open) => !open && setToView(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          {toView && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <PawPrint className="w-5 h-5 text-pink-500" />
                  {toView.pet?.name || "Mascota"} · {adopterName(toView)}
                </DialogTitle>
                <DialogDescription>
                  Reclamo {toView.initiated_by === "adopter" ? "del adoptante" : "de la fundación"} ·{" "}
                  {new Date(toView.created_at).toLocaleDateString("es-CO")}
                </DialogDescription>
              </DialogHeader>

              {toView.story && <p className="text-sm text-gray-600 whitespace-pre-line">{toView.story}</p>}

              {toView.photo_urls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {toView.photo_urls.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded-xl" />
                  ))}
                </div>
              )}

              {toView.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                    disabled={actionLoading}
                    onClick={() => updateStatus(toView, "rejected")}
                  >
                    <XIcon className="w-4 h-4 mr-2" /> Rechazar
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actionLoading}
                    onClick={() => updateStatus(toView, "confirmed")}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    Confirmar adopción
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
