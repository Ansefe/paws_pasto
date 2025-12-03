import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, MoreVertical, Mail, Phone,
  Shield, User, Building2, Trash2, Edit2, Eye,
  ChevronLeft, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Datos de ejemplo
const mockUsers = [
  { 
    id: "1", 
    name: "María García", 
    email: "maria@email.com", 
    phone: "300 123 4567",
    role: "adopter", 
    status: "active",
    createdAt: "2024-01-15",
    avatar: null
  },
  { 
    id: "2", 
    name: "Fundación Patitas", 
    email: "patitas@email.com", 
    phone: "301 234 5678",
    role: "foundation", 
    status: "active",
    createdAt: "2024-01-10",
    avatar: null
  },
  { 
    id: "3", 
    name: "Carlos Ruiz", 
    email: "carlos@email.com", 
    phone: "302 345 6789",
    role: "adopter", 
    status: "active",
    createdAt: "2024-02-01",
    avatar: null
  },
  { 
    id: "4", 
    name: "Rescatista Ana", 
    email: "ana.rescate@email.com", 
    phone: "303 456 7890",
    role: "foundation", 
    status: "pending",
    createdAt: "2024-02-10",
    avatar: null
  },
]

const roleLabels: Record<string, { label: string; color: string; icon: typeof User }> = {
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-700", icon: Shield },
  foundation: { label: "Fundación", color: "bg-cyan-100 text-cyan-700", icon: Building2 },
  adopter: { label: "Adoptante", color: "bg-green-100 text-green-700", icon: User },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  inactive: { label: "Inactivo", color: "bg-gray-100 text-gray-700" },
}

export function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500">Gestiona todos los usuarios de la plataforma</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl">
          + Agregar Usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          {["all", "adopter", "foundation"].map((role) => (
            <Button
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              onClick={() => setRoleFilter(role)}
              className={`rounded-xl ${roleFilter === role ? "bg-cyan-500 hover:bg-cyan-600" : ""}`}
            >
              {role === "all" ? "Todos" : role === "adopter" ? "Adoptantes" : "Fundaciones"}
            </Button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Contacto</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rol</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Registro</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => {
                const roleInfo = roleLabels[user.role]
                const statusInfo = statusLabels[user.status]
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {user.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                        <roleInfo.icon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" /> Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="w-4 h-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-600">
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            Mostrando {filteredUsers.length} de {mockUsers.length} usuarios
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
    </div>
  )
}
