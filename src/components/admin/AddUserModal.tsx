import { useState } from "react"
import { X, Loader2, UserPlus } from "lucide-react"
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
import { supabase, createIsolatedClient } from "@/lib/supabase"
import type { UserRole } from "@/types/database.types"

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: () => void
}

export function AddUserModal({ isOpen, onClose, onUserCreated }: AddUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "adopter" as UserRole,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log("Iniciando creación de usuario:", { ...formData, password: "***" })
      
      // Validar rol
      const validRoles: UserRole[] = ["adopter", "foundation", "admin"]
      if (!validRoles.includes(formData.role)) {
        throw new Error(`Rol inválido seleccionado: ${formData.role}`)
      }

      // 1. Crear usuario en Auth con metadata que incluye el teléfono.
      // IMPORTANTE: usamos un cliente AISLADO para que el signUp no reemplace
      // la sesión del administrador por la del usuario recién creado.
      const authClient = createIsolatedClient()
      const { data: authData, error: authError } = await authClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: formData.role,
          },
          emailRedirectTo: undefined, // No enviar email de confirmación
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("No se pudo crear el usuario")

      console.log("Usuario creado:", authData.user.id)

      // 2. Esperar a que el trigger cree el perfil y verificar datos
      // Intentamos varias veces con polling para asegurar que el perfil existe
      let existingProfile = null
      let attempts = 0
      const maxAttempts = 10
      
      while (!existingProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data } = await supabase
          .from('profiles')
          .select('id, role, phone, full_name')
          .eq('id', authData.user.id)
          .single()
        
        if (data) {
          existingProfile = data
          console.log("Perfil encontrado:", data)
        } else {
          attempts++
          console.log(`Esperando creación de perfil... intento ${attempts}`)
        }
      }

      if (!existingProfile) {
        throw new Error("El perfil no fue creado automáticamente. Verifica el trigger de la base de datos.")
      }

      // 3. Verificar si necesitamos actualizar (Respaldo)
      // Si el trigger funcionó correctamente, los datos ya deberían estar bien.
      const needsUpdate = 
        existingProfile.role !== formData.role ||
        (existingProfile.phone || "") !== formData.phone ||
        existingProfile.full_name !== formData.fullName

      if (needsUpdate) {
        console.log("Datos del perfil incompletos o incorrectos, aplicando actualización manual...")
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: formData.role,
            phone: formData.phone || null,
            full_name: formData.fullName,
          })
          .eq('id', authData.user.id)
          // IMPORTANTE: No usamos .select() ni .single() para evitar error 406
          // si la política RLS no permite retornar la fila actualizada.

        if (profileError) {
          console.error("Error actualizando perfil:", profileError)
          throw new Error(`Error al actualizar perfil: ${profileError.message}`)
        }
        console.log("Perfil actualizado manualmente.")
      } else {
        console.log("El perfil se creó correctamente con todos los datos. No se requiere actualización.")
      }

      setSuccess(true)
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onUserCreated()
        handleClose()
      }, 1500)

    } catch (err) {
      console.error("Error creando usuario:", err)
      setError(err instanceof Error ? err.message : "Error al crear usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: "",
        password: "",
        fullName: "",
        phone: "",
        role: "adopter",
      })
      setError(null)
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Agregar Usuario</h2>
              <p className="text-sm text-gray-500">Crea una nueva cuenta en la plataforma</p>
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
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Nombre completo *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej: María García"
              required
              disabled={isLoading}
              className="rounded-xl"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="correo@ejemplo.com"
              required
              disabled={isLoading}
              className="rounded-xl"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              disabled={isLoading}
              className="rounded-xl"
            />
            <p className="text-xs text-gray-500">
              El usuario recibirá esta contraseña temporalmente
            </p>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Teléfono
            </Label>
            <Input
              id="phone"
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
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
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
              {formData.role === "adopter" && "Usuario normal que puede adoptar mascotas"}
              {formData.role === "foundation" && "Organización que gestiona mascotas"}
              {formData.role === "admin" && "Acceso completo al panel administrativo"}
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
                ✓ Usuario creado exitosamente
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
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

