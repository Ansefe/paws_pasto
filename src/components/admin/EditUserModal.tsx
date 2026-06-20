import { useState, useEffect } from "react"
import { X, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import type { UserRole, Profile } from "@/types/database.types"

interface EditUserModalProps {
  user: Profile | null
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
}

export function EditUserModal({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    role: "adopter" as UserRole,
  })

  useEffect(() => {
    if (user && isOpen) {
      // Asegurar que el rol sea válido
      let safeRole: UserRole = "adopter"
      if (user.role === "admin" || user.role === "foundation" || user.role === "adopter") {
        safeRole = user.role
      } else {
        console.warn("Rol desconocido recibido:", user.role)
      }

      setFormData({
        fullName: user.full_name || "",
        phone: user.phone || "",
        role: safeRole,
      })
      // Reset states
      setError(null)
      setSuccess(false)
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setIsLoading(true)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone || null,
          role: formData.role,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSuccess(true)
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onUserUpdated()
        handleClose()
      }, 1500)

    } catch (err) {
      console.error("Error actualizando usuario:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
      setError(null)
      setSuccess(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Save className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Editar Usuario</h2>
              <p className="text-sm text-gray-500">Modificar datos de {user.full_name || "usuario"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre completo */}
          <div className="space-y-2">
            <Label htmlFor="edit-fullName" className="text-sm font-medium text-gray-700">
              Nombre completo *
            </Label>
            <Input
              id="edit-fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej: María García"
              required
              disabled={isLoading}
              className="rounded-xl"
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="edit-phone" className="text-sm font-medium text-gray-700">
              Teléfono
            </Label>
            <Input
              id="edit-phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="300 123 4567"
              disabled={isLoading}
              className="rounded-xl"
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">
              Rol *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              disabled={isLoading}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adopter">Adoptante</SelectItem>
                <SelectItem value="foundation">Fundación</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Cuidado: cambiar el rol afectará los permisos del usuario inmediatamente.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-600 font-medium">
                ✓ Usuario actualizado exitosamente
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

