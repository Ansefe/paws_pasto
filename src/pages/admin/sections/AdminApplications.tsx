import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search, Inbox, Building2, Heart, Eye, Check, X as XIcon,
  Loader2, Mail, Phone, MapPin, Instagram, Facebook, Globe,
  CheckCircle2, Clock, XCircle, FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { FoundationFormModal, type FoundationPrefill } from "@/components/admin/FoundationFormModal"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/contexts/ToastContext"
import type { Application } from "@/types/database.types"

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  approved: { label: "Aprobada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700", icon: XCircle },
}

function prefillFromApplication(app: Application): FoundationPrefill {
  return {
    foundation_name: app.organization_name,
    description: app.description || "",
    location_city: app.city,
    location_address: app.address || "",
    whatsapp_number: app.phone,
    email: app.email,
    instagram_url: app.instagram || "",
    facebook_url: app.facebook || "",
    website_url: app.website || "",
  }
}

export function AdminApplications() {
  const toast = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [toView, setToView] = useState<Application | null>(null)
  const [toReject, setToReject] = useState<Application | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  // Tras aprobar, abrimos el formulario de fundación precargado
  const [foundationPrefill, setFoundationPrefill] = useState<FoundationPrefill | null>(null)
  const [isFoundationFormOpen, setIsFoundationFormOpen] = useState(false)

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
      if (fetchError) throw fetchError
      setApplications(data || [])
    } catch (err) {
      console.error("Error fetching applications:", err)
      setError(err instanceof Error ? err.message : "Error al cargar las postulaciones")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [])

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return applications.filter((a) => {
      const matchesSearch =
        a.organization_name.toLowerCase().includes(term) ||
        a.contact_name.toLowerCase().includes(term) ||
        a.email.toLowerCase().includes(term)
      const matchesStatus = statusFilter === "all" || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [applications, searchTerm, statusFilter])

  const pendingCount = useMemo(() => applications.filter((a) => a.status === "pending").length, [applications])

  const updateStatus = async (app: Application, status: "approved" | "rejected", notes?: string) => {
    setActionLoading(true)
    try {
      const { error: updateError } = await supabase
        .from("applications")
        .update({
          status,
          review_notes: notes ?? app.review_notes ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", app.id)
      if (updateError) throw updateError
      await fetchApplications()
      return true
    } catch (err) {
      console.error("Error actualizando postulación:", err)
      toast.error("No se pudo actualizar", err instanceof Error ? err.message : "Inténtalo de nuevo")
      return false
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async (app: Application) => {
    const ok = await updateStatus(app, "approved")
    if (ok) {
      setToView(null)
      toast.success("Postulación aprobada", "Completa los datos para crear la fundación")
      // Abrir formulario de fundación precargado para crear la cuenta verificada
      setFoundationPrefill(prefillFromApplication(app))
      setIsFoundationFormOpen(true)
    }
  }

  const handleReject = async () => {
    if (!toReject) return
    const ok = await updateStatus(toReject, "rejected", rejectNotes.trim() || undefined)
    if (ok) {
      toast.success("Postulación rechazada", toReject.organization_name)
      setToReject(null)
      setRejectNotes("")
      setToView(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Solicitudes</h1>
          <p className="text-gray-500">
            Postulaciones de fundaciones y rescatistas
            {pendingCount > 0 && <span className="ml-2 text-amber-600 font-medium">· {pendingCount} pendientes</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por organización, contacto o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
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
          <Button onClick={fetchApplications} variant="outline" className="mt-4 rounded-xl">Reintentar</Button>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Organización</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contacto</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((app) => {
                  const st = statusConfig[app.status] || statusConfig.pending
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{app.organization_name}</p>
                        <p className="text-xs text-gray-400">{app.city}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                          {app.type === "foundation" ? <Building2 className="w-4 h-4 text-cyan-500" /> : <Heart className="w-4 h-4 text-pink-500" />}
                          {app.type === "foundation" ? "Fundación" : "Rescatista"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{app.contact_name}</p>
                        <p className="text-xs text-gray-400">{app.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                          <st.icon className="w-3.5 h-3.5" />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString("es-CO")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => setToView(app)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {app.status === "pending" && (
                            <>
                              <Button
                                variant="ghost" size="icon"
                                className="rounded-lg h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                title="Aprobar"
                                disabled={actionLoading}
                                onClick={() => handleApprove(app)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost" size="icon"
                                className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Rechazar"
                                disabled={actionLoading}
                                onClick={() => { setToReject(app); setRejectNotes("") }}
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
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hay postulaciones</p>
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
                  {toView.type === "foundation" ? <Building2 className="w-5 h-5 text-cyan-500" /> : <Heart className="w-5 h-5 text-pink-500" />}
                  {toView.organization_name}
                </DialogTitle>
                <DialogDescription>
                  Postulación de {toView.type === "foundation" ? "fundación" : "rescatista"} ·{" "}
                  {new Date(toView.created_at).toLocaleDateString("es-CO")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {toView.email}</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {toView.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {toView.city}{toView.address ? ` · ${toView.address}` : ""}</div>
                <div className="text-gray-700"><span className="text-gray-500">Contacto:</span> {toView.contact_name}</div>
                {toView.instagram && <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-gray-400" /> {toView.instagram}</div>}
                {toView.facebook && <div className="flex items-center gap-2"><Facebook className="w-4 h-4 text-gray-400" /> {toView.facebook}</div>}
                {toView.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400" /> {toView.website}</div>}

                {toView.description && (
                  <div className="pt-2"><p className="font-medium text-gray-700 mb-1">Descripción</p><p className="text-gray-600 whitespace-pre-line">{toView.description}</p></div>
                )}
                {toView.experience && (
                  <div><p className="font-medium text-gray-700 mb-1">Experiencia</p><p className="text-gray-600 whitespace-pre-line">{toView.experience}</p></div>
                )}
                {toView.references_info && (
                  <div className="flex items-start gap-2"><FileText className="w-4 h-4 text-gray-400 mt-0.5" /><div><p className="font-medium text-gray-700">Referencias</p><p className="text-gray-600 whitespace-pre-line">{toView.references_info}</p></div></div>
                )}
                {toView.review_notes && (
                  <div className="bg-gray-50 rounded-xl p-3"><p className="font-medium text-gray-700 mb-1">Notas de revisión</p><p className="text-gray-600">{toView.review_notes}</p></div>
                )}
              </div>

              {toView.status === "pending" && (
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                    disabled={actionLoading}
                    onClick={() => { setToReject(toView); setRejectNotes("") }}
                  >
                    <XIcon className="w-4 h-4 mr-2" /> Rechazar
                  </Button>
                  <Button
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={actionLoading}
                    onClick={() => handleApprove(toView)}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                    Aprobar y crear fundación
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!toReject} onOpenChange={(open) => !open && setToReject(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Rechazar postulación</DialogTitle>
            <DialogDescription>
              Rechazar la postulación de <strong>{toReject?.organization_name}</strong>. Puedes dejar una nota (opcional).
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

      {/* Foundation Form (tras aprobar) */}
      <FoundationFormModal
        foundation={null}
        isOpen={isFoundationFormOpen}
        onClose={() => setIsFoundationFormOpen(false)}
        onSaved={() => setIsFoundationFormOpen(false)}
        prefill={foundationPrefill ?? undefined}
      />
    </div>
  )
}
