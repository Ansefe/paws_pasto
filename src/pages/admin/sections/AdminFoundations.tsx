import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search, Building2, CheckCircle2, Clock,
  MapPin, Phone, Instagram,
  MoreVertical, Eye, Edit2, Trash2, BadgeCheck,
  Loader2, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FoundationFormModal } from "@/components/admin/FoundationFormModal"
import { FoundationDetailsModal } from "@/components/admin/FoundationDetailsModal"
import { useFoundations } from "@/hooks/useFoundations"
import { supabase, deleteImageByUrl } from "@/lib/supabase"
import { useToast } from "@/contexts/ToastContext"
import type { Foundation, FoundationWithPetCount } from "@/types/database.types"

export function AdminFoundations() {
  const { foundations, loading, error, refetch } = useFoundations(false)
  const toast = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [foundationToEdit, setFoundationToEdit] = useState<Foundation | null>(null)
  const [foundationToView, setFoundationToView] = useState<FoundationWithPetCount | null>(null)
  const [foundationToDelete, setFoundationToDelete] = useState<FoundationWithPetCount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const filteredFoundations = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return foundations.filter((f) => {
      const matchesSearch = f.foundation_name.toLowerCase().includes(term)
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && f.is_verified) ||
        (statusFilter === "pending" && !f.is_verified)
      return matchesSearch && matchesStatus
    })
  }, [foundations, searchTerm, statusFilter])

  const openCreate = () => {
    setFoundationToEdit(null)
    setIsFormOpen(true)
  }

  const openEdit = (foundation: Foundation) => {
    setFoundationToEdit(foundation)
    setIsFormOpen(true)
  }

  const handleToggleVerify = async (foundation: FoundationWithPetCount) => {
    setVerifyingId(foundation.id)
    try {
      const newValue = !foundation.is_verified
      const { error: updateError } = await supabase
        .from("foundations")
        .update({
          is_verified: newValue,
          verified_at: newValue ? new Date().toISOString() : null,
        })
        .eq("id", foundation.id)
      if (updateError) throw updateError
      await refetch()
      toast.success(newValue ? "Fundación verificada" : "Verificación retirada", foundation.foundation_name)
    } catch (err) {
      console.error("Error verificando fundación:", err)
      toast.error("No se pudo actualizar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setVerifyingId(null)
    }
  }

  const handleDelete = async () => {
    if (!foundationToDelete) return
    setIsDeleting(true)
    try {
      const { error: deleteError } = await supabase
        .from("foundations")
        .delete()
        .eq("id", foundationToDelete.id)
      if (deleteError) throw deleteError

      if (foundationToDelete.logo_url) {
        await deleteImageByUrl(foundationToDelete.logo_url).catch(() => {})
      }

      const name = foundationToDelete.foundation_name
      setFoundationToDelete(null)
      await refetch()
      toast.success("Fundación eliminada", `${name} se eliminó correctamente`)
    } catch (err) {
      console.error("Error eliminando fundación:", err)
      toast.error("No se pudo eliminar", err instanceof Error ? err.message : "Puede tener mascotas asociadas.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fundaciones</h1>
          <p className="text-gray-500">Gestiona las fundaciones y rescatistas aliados</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
        >
          + Agregar Fundación
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar fundación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "verified", "pending"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl ${statusFilter === status ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
            >
              {status === "all" ? "Todas" : status === "verified" ? "Verificadas" : "Pendientes"}
            </Button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={refetch} variant="outline" className="mt-4 rounded-xl">
            Reintentar
          </Button>
        </div>
      )}

      {/* Foundations Grid */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFoundations.map((foundation, index) => (
            <motion.div
              key={foundation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.3) }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                    {foundation.logo_url ? (
                      <img src={foundation.logo_url} alt={foundation.foundation_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{foundation.foundation_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" /> {foundation.location_city}
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setFoundationToView(foundation)}>
                      <Eye className="w-4 h-4" /> Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => openEdit(foundation)}>
                      <Edit2 className="w-4 h-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleToggleVerify(foundation)}>
                      <BadgeCheck className="w-4 h-4" />
                      {foundation.is_verified ? "Quitar verificación" : "Verificar"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-red-600 cursor-pointer" onClick={() => setFoundationToDelete(foundation)}>
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                {foundation.description || "Sin descripción"}
              </p>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  foundation.is_verified ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {foundation.is_verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {foundation.is_verified ? "Verificada" : "Pendiente"}
                </span>
                {verifyingId === foundation.id && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm">
                {foundation.whatsapp_number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {foundation.whatsapp_number}
                  </div>
                )}
                {foundation.instagram_url && (
                  <div className="flex items-center gap-2 text-gray-600 truncate">
                    <Instagram className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="truncate">{foundation.instagram_url}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  {foundation.pet_count} mascotas
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => setFoundationToView(foundation)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => openEdit(foundation)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setFoundationToDelete(foundation)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredFoundations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron fundaciones</p>
        </div>
      )}

      {/* Create / Edit Modal */}
      <FoundationFormModal
        foundation={foundationToEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={refetch}
      />

      {/* Details Modal */}
      <FoundationDetailsModal
        foundation={foundationToView}
        isOpen={!!foundationToView}
        onClose={() => setFoundationToView(null)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!foundationToDelete} onOpenChange={(open) => !open && setFoundationToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Fundación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar a <strong>{foundationToDelete?.foundation_name}</strong>?
              <br /><br />
              Si tiene mascotas asociadas, la eliminación podría fallar. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setFoundationToDelete(null)} disabled={isDeleting} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Eliminando...</>
              ) : (
                "Eliminar Fundación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
