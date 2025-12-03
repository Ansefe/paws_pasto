import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, PawPrint,
  Eye, Edit2, Trash2, 
  ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Datos de ejemplo
const mockPets = [
  {
    id: "1",
    name: "Luna",
    species: "dog",
    breed: "Mestizo",
    age: "2 años",
    gender: "female",
    size: "medium",
    status: "available",
    foundation: "Fundación Patitas Felices",
    photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200",
    createdAt: "2024-02-01"
  },
  {
    id: "2",
    name: "Max",
    species: "dog",
    breed: "Labrador",
    age: "3 años",
    gender: "male",
    size: "large",
    status: "in_process",
    foundation: "Huellas de Amor",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=200",
    createdAt: "2024-02-05"
  },
  {
    id: "3",
    name: "Michi",
    species: "cat",
    breed: "Siamés",
    age: "1 año",
    gender: "male",
    size: "small",
    status: "adopted",
    foundation: "Fundación Patitas Felices",
    photo: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200",
    createdAt: "2024-01-20"
  },
  {
    id: "4",
    name: "Coco",
    species: "dog",
    breed: "Poodle",
    age: "4 años",
    gender: "female",
    size: "small",
    status: "available",
    foundation: "Huellas de Amor",
    photo: "https://images.unsplash.com/photo-1591856419156-25d2eb925a6b?w=200",
    createdAt: "2024-02-10"
  },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  in_process: { label: "En proceso", color: "bg-amber-100 text-amber-700" },
  adopted: { label: "Adoptado", color: "bg-pink-100 text-pink-700" },
  paused: { label: "Pausado", color: "bg-gray-100 text-gray-700" },
}

const speciesEmoji: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
}

export function AdminPets() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [speciesFilter, setSpeciesFilter] = useState<string>("all")

  const filteredPets = mockPets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || pet.status === statusFilter
    const matchesSpecies = speciesFilter === "all" || pet.species === speciesFilter
    return matchesSearch && matchesStatus && matchesSpecies
  })

  const stats = {
    total: mockPets.length,
    available: mockPets.filter(p => p.status === "available").length,
    inProcess: mockPets.filter(p => p.status === "in_process").length,
    adopted: mockPets.filter(p => p.status === "adopted").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mascotas</h1>
          <p className="text-gray-500">Gestiona todas las mascotas en la plataforma</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl">
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={() => setSpeciesFilter(species)}
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
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg text-xs ${statusFilter === status ? "bg-white shadow-sm" : ""}`}
              >
                {status === "all" ? "Todos" : statusConfig[status]?.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Pets Table */}
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
              {filteredPets.map((pet) => {
                const statusInfo = statusConfig[pet.status]
                return (
                  <tr key={pet.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                          {pet.photo ? (
                            <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              {speciesEmoji[pet.species]}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{pet.name}</p>
                          <p className="text-sm text-gray-500">{pet.breed}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-700">{speciesEmoji[pet.species]} {pet.species === "dog" ? "Perro" : "Gato"}</p>
                        <p className="text-gray-500">{pet.age} • {pet.gender === "male" ? "Macho" : "Hembra"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{pet.foundation}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(pet.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Mostrando {filteredPets.length} de {mockPets.length} mascotas
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-lg" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg bg-cyan-50 border-cyan-200 text-cyan-700">
              1
            </Button>
            <Button variant="outline" size="icon" className="rounded-lg" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredPets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron mascotas</p>
        </div>
      )}
    </div>
  )
}
