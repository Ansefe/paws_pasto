import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search, PawPrint,
  Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, Loader2, AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PetFormModal } from "@/components/admin/PetFormModal"
import { PetDetailsModal } from "@/components/admin/PetDetailsModal"
import { usePets } from "@/hooks/usePets"
import { supabase, deleteImageByUrl } from "@/lib/supabase"
import { useToast } from "@/contexts/ToastContext"
import type { Pet, PetWithFoundation } from "@/types/database.types"

const PAGE_SIZE = 10

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  in_process: { label: "En proceso", color: "bg-amber-100 text-amber-700" },
  adopted: { label: "Adoptado", color: "bg-pink-100 text-pink-700" },
  paused: { label: "Pausado", color: "bg-gray-100 text-gray-700" },
}

const speciesEmoji: Record<string, string> = { dog: "🐕", cat: "🐈" }

export function AdminPets() {
  const { pets, loading, error, refetch } = usePets({ adminMode: true })
  const toast = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [speciesFilter, setSpeciesFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [petToEdit, setPetToEdit] = useState<Pet | null>(null)
  const [petToView, setPetToView] = useState<PetWithFoundation | null>(null)
  const [petToDelete, setPetToDelete] = useState<PetWithFoundation | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const stats = useMemo(() => ({
    total: pets.length,
    available: pets.filter((p) => p.status === "available").length,
    inProcess: pets.filter((p) => p.status === "in_process").length,
    adopted: pets.filter((p) => p.status === "adopted").length,
  }), [pets])

  const filteredPets = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return pets.filter((pet) => {
      const matchesSearch =
        pet.name.toLowerCase().includes(term) ||
        (pet.breed?.toLowerCase().includes(term) ?? false)
      const matchesStatus = statusFilter === "all" || pet.status === statusFilter
      const matchesSpecies = speciesFilter === "all" || pet.species === speciesFilter
      return matchesSearch && matchesStatus && matchesSpecies
    })
  }, [pets, searchTerm, statusFilter, speciesFilter])

  // Paginación client-side
  const totalPages = Math.max(1, Math.ceil(filteredPets.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedPets = filteredPets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const openCreate = () => {
    setPetToEdit(null)
    setIsFormOpen(true)
  }

  const openEdit = (pet: Pet) => {
    setPetToEdit(pet)
    setIsFormOpen(true)
  }

  const handleDelete = async () => {
    if (!petToDelete) return
    setIsDeleting(true)
    try {
      const { error: deleteError } = await supabase.from("pets").delete().eq("id", petToDelete.id)
      if (deleteError) throw deleteError

      // Borrado best-effort de la foto en Storage
      if (petToDelete.main_photo_url) {
        await deleteImageByUrl(petToDelete.main_photo_url).catch(() => {})
      }

      const name = petToDelete.name
      setPetToDelete(null)
      await refetch()
      toast.success("Mascota eliminada", `${name} se eliminó correctamente`)
    } catch (err) {
      console.error("Error eliminando mascota:", err)
      toast.error("No se pudo eliminar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mascotas</h1>
          <p className="text-gray-500">Gestiona todas las mascotas en la plataforma</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
        >
          + Agregar Mascota
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-2xl font-bold text-emerald-700">{stats.available}</p>
          <p className="text-sm text-emerald-600">Disponibles</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">{stats.inProcess}</p>
          <p className="text-sm text-amber-600">En proceso</p>
        </div>
        <div className="bg-pink-50 rounded-xl p-4 border border-pink-100">
          <p className="text-2xl font-bold text-pink-700">{stats.adopted}</p>
          <p className="text-sm text-pink-600">Adoptados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre o raza..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {["all", "dog", "cat"].map((species) => (
              <Button
                key={species}
                variant="ghost"
                size="sm"
                onClick={() => { setSpeciesFilter(species); setPage(1) }}
                className={`rounded-lg ${speciesFilter === species ? "bg-white shadow-sm" : ""}`}
              >
                {species === "all" ? "Todos" : species === "dog" ? "🐕 Perros" : "🐈 Gatos"}
              </Button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {["all", "available", "in_process", "adopted"].map((status) => (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                onClick={() => { setStatusFilter(status); setPage(1) }}
                className={`rounded-lg text-xs ${statusFilter === status ? "bg-white shadow-sm" : ""}`}
              >
                {status === "all" ? "Todos" : statusConfig[status]?.label}
              </Button>
            ))}
          </div>
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

      {/* Pets Table */}
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Detalles</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fundación</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Registro</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPets.map((pet) => {
                  const statusInfo = statusConfig[pet.status] || { label: pet.status, color: "bg-gray-100 text-gray-600" }
                  return (
                    <tr key={pet.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {pet.main_photo_url ? (
                              <img src={pet.main_photo_url} alt={pet.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                {speciesEmoji[pet.species]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{pet.name}</p>
                            <p className="text-sm text-gray-500">{pet.breed || "Sin raza"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-700">{speciesEmoji[pet.species]} {pet.species === "dog" ? "Perro" : "Gato"}</p>
                          <p className="text-gray-500">{pet.age_approx || "—"} • {pet.gender === "male" ? "Macho" : "Hembra"}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700">{pet.foundation?.foundation_name || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(pet.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon" className="rounded-lg h-8 w-8"
                            onClick={() => setPetToView(pet)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="rounded-lg h-8 w-8"
                            onClick={() => openEdit(pet)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setPetToDelete(pet)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPets.length === 0 && (
            <div className="text-center py-12">
              <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron mascotas</p>
            </div>
          )}

          {/* Pagination */}
          {filteredPets.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Mostrando {paginatedPets.length} de {filteredPets.length} mascotas
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="icon" className="rounded-lg"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline" size="icon" className="rounded-lg"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Create / Edit Modal */}
      <PetFormModal
        pet={petToEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={refetch}
      />

      {/* Details Modal */}
      <PetDetailsModal
        pet={petToView}
        isOpen={!!petToView}
        onClose={() => setPetToView(null)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!petToDelete} onOpenChange={(open) => !open && setPetToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Mascota
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar a <strong>{petToDelete?.name}</strong>?
              <br /><br />
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPetToDelete(null)} disabled={isDeleting} className="rounded-xl">
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
                "Eliminar Mascota"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
