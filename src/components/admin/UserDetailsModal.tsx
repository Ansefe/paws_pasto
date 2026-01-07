import { X, User, Phone, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Profile } from "@/types/database.types"

interface UserDetailsModalProps {
  user: Profile | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-500" />
            Detalles del Usuario
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user.full_name?.charAt(0) || user.id.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{user.full_name || "Sin nombre"}</h3>
              <p className="text-sm text-gray-500 font-mono">{user.id}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rol</p>
                <p className="font-medium capitalize text-gray-800">
                  {user.role === 'admin' ? 'Administrador' : 
                   user.role === 'foundation' ? 'Fundación' : 'Adoptante'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="font-medium text-gray-800">
                  {user.phone || "No registrado"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de registro</p>
                <p className="font-medium text-gray-800">
                  {new Date(user.created_at).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="outline" className="rounded-xl">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

