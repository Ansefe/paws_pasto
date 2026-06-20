import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Search, MoreVertical, Phone,
  Shield, User, Building2, Trash2, Edit2, Eye,
  ChevronLeft, ChevronRight, Loader2, AlertTriangle
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

import { AddUserModal } from "@/components/admin/AddUserModal"
import { EditUserModal } from "@/components/admin/EditUserModal"
import { UserDetailsModal } from "@/components/admin/UserDetailsModal"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/contexts/ToastContext"
import type { Profile } from "@/types/database.types"

const roleLabels: Record<string, { label: string; color: string; icon: typeof User }> = {
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-700", icon: Shield },
  foundation: { label: "Fundación", color: "bg-cyan-100 text-cyan-700", icon: Building2 },
  adopter: { label: "Adoptante", color: "bg-green-100 text-green-700", icon: User },
}

export function AdminUsers() {
  const toast = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<Profile | null>(null)
  const [userToView, setUserToView] = useState<Profile | null>(null)
  const [userToDelete, setUserToDelete] = useState<Profile | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      setUsers(data || [])
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Error al cargar usuarios")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleUserCreated = () => {
    fetchUsers() 
  }

  const handleUserUpdated = () => {
    fetchUsers()
    setUserToEdit(null)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    setIsDeleting(true)
    try {
      // Usamos la función RPC para eliminar de auth y profiles al mismo tiempo
      const { error } = await supabase.rpc('delete_user_complete', {
        target_user_id: userToDelete.id
      })

      if (error) {
        console.error("Error RPC:", error)
        // Fallback: Si la RPC no existe o falla, intentamos borrar solo perfil
        // Esto es útil si el usuario no ha ejecutado el script SQL aún
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userToDelete.id)

        if (profileError) throw profileError
      }

      // Actualizamos la lista localmente
      const name = userToDelete.full_name || "El usuario"
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setUserToDelete(null)
      toast.success("Usuario eliminado", `${name} se eliminó correctamente`)

    } catch (err) {
      console.error("Error deleting user:", err)
      toast.error("No se pudo eliminar el usuario", "Verifica haber ejecutado 'rpc_delete_user.sql' en Supabase.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500">Gestiona todos los usuarios de la plataforma</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
        >
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={fetchUsers}
            variant="outline"
            className="mt-4 rounded-xl"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && (
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Registro</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const roleInfo = roleLabels[user.role] || {
                    label: user.role || "Desconocido",
                    color: "bg-gray-100 text-gray-600",
                    icon: User
                  }
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                            {user.full_name?.charAt(0) || (user.id ? user.id.charAt(0).toUpperCase() : "?")}
                          </div>
                          <div className="flex flex-col">
                            <p className="font-medium text-gray-800">{user.full_name || "Sin nombre"}</p>
                            <code className="text-[10px] text-gray-400 bg-gray-50 px-1 py-0.5 rounded w-fit">
                              {user.id.substring(0, 8)}...
                            </code>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.phone ? (
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="w-3 h-3 text-cyan-500" /> 
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic flex items-center gap-2">
                              <Phone className="w-3 h-3" /> Sin teléfono
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
                          <roleInfo.icon className="w-3.5 h-3.5" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('es-CO')}
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
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer"
                              onClick={() => setUserToView(user)}
                            >
                              <Eye className="w-4 h-4" /> Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer"
                              onClick={() => setUserToEdit(user)}
                            >
                              <Edit2 className="w-4 h-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-red-600 cursor-pointer"
                              onClick={() => setUserToDelete(user)}
                            >
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

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron usuarios</p>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Mostrando {filteredUsers.length} de {users.length} usuarios
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
          )}
        </motion.div>
      )}

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={userToEdit}
        isOpen={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        onUserUpdated={handleUserUpdated}
      />

      {/* View User Modal */}
      <UserDetailsModal
        user={userToView}
        isOpen={!!userToView}
        onClose={() => setUserToView(null)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Eliminar Usuario
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar a <strong>{userToDelete?.full_name}</strong>?
              <br /><br />
              Esta acción eliminará su perfil y podría afectar datos relacionados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setUserToDelete(null)}
              disabled={isDeleting}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar Usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
