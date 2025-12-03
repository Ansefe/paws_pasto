import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, Building2, CheckCircle2, XCircle, Clock,
  MapPin, Phone, Instagram,
  MoreVertical, Eye, Edit2, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Datos de ejemplo
const mockFoundations = [
  {
    id: "1",
    name: "Fundación Patitas Felices",
    description: "Rescatamos y cuidamos animales abandonados en Pasto",
    city: "Pasto",
    phone: "300 123 4567",
    email: "patitas@email.com",
    instagram: "@patitasfelices",
    isVerified: true,
    status: "active",
    petsCount: 15,
    logo: null,
    createdAt: "2024-01-10"
  },
  {
    id: "2",
    name: "Huellas de Amor",
    description: "Dedicados al rescate de perros y gatos callejeros",
    city: "Pasto",
    phone: "301 234 5678",
    email: "huellas@email.com",
    instagram: "@huellasdeamor",
    isVerified: true,
    status: "active",
    petsCount: 23,
    logo: null,
    createdAt: "2024-01-15"
  },
  {
    id: "3",
    name: "Rescatista María",
    description: "Rescatista independiente de la zona norte",
    city: "Pasto",
    phone: "302 345 6789",
    email: "maria.rescate@email.com",
    instagram: "@mariarescata",
    isVerified: false,
    status: "pending",
    petsCount: 0,
    logo: null,
    createdAt: "2024-02-20"
  },
]

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Activa", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  inactive: { label: "Inactiva", color: "bg-gray-100 text-gray-700", icon: XCircle },
}

export function AdminFoundations() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredFoundations = mockFoundations.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || f.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fundaciones</h1>
          <p className="text-gray-500">Gestiona las fundaciones y rescatistas aliados</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl">
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
          {["all", "active", "pending"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className={`rounded-xl ${statusFilter === status ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
            >
              {status === "all" ? "Todas" : status === "active" ? "Activas" : "Pendientes"}
            </Button>
          ))}
        </div>
      </div>

      {/* Foundations Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoundations.map((foundation, index) => {
          const statusInfo = statusConfig[foundation.status]
          return (
            <motion.div
              key={foundation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{foundation.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" /> {foundation.city}
                    </div>
                  </div>
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {foundation.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    <statusInfo.icon className="w-3 h-3" />
                    {statusInfo.label}
                  </span>
                </div>
                {foundation.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Verificada
                  </span>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {foundation.phone}
                </div>
                {foundation.instagram && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Instagram className="w-4 h-4 text-gray-400" />
                    {foundation.instagram}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  {foundation.petsCount} mascotas
                </span>
                <div className="flex items-center gap-1">
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
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredFoundations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron fundaciones</p>
        </div>
      )}
    </div>
  )
}
