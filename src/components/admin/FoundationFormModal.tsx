import { useState, useEffect } from "react"
import { X, Loader2, Save, Building2, ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase, uploadImage } from "@/lib/supabase"
import type { Foundation, FoundationInsert } from "@/types/database.types"

export interface FoundationPrefill {
  foundation_name?: string
  description?: string
  location_city?: string
  location_address?: string
  whatsapp_number?: string
  email?: string
  instagram_url?: string
  facebook_url?: string
  website_url?: string
}

interface FoundationFormModalProps {
  foundation: Foundation | null // null = crear
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  prefill?: FoundationPrefill // datos iniciales al crear (p. ej. desde una postulación)
}

interface ProfileOption {
  id: string
  full_name: string | null
}

interface FoundationFormState {
  profile_id: string
  foundation_name: string
  description: string
  location_city: string
  location_address: string
  whatsapp_number: string
  email: string
  donation_link: string
  instagram_url: string
  facebook_url: string
  website_url: string
  is_verified: boolean
  logo_url: string
}

const emptyForm: FoundationFormState = {
  profile_id: "",
  foundation_name: "",
  description: "",
  location_city: "",
  location_address: "",
  whatsapp_number: "",
  email: "",
  donation_link: "",
  instagram_url: "",
  facebook_url: "",
  website_url: "",
  is_verified: false,
  logo_url: "",
}

export function FoundationFormModal({ foundation, isOpen, onClose, onSaved, prefill }: FoundationFormModalProps) {
  const isEdit = !!foundation

  const [form, setForm] = useState<FoundationFormState>(emptyForm)
  const [profiles, setProfiles] = useState<ProfileOption[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cargar perfiles con rol 'foundation' (solo necesario al crear)
  useEffect(() => {
    if (!isOpen || isEdit) return
    const fetchProfiles = async () => {
      setLoadingProfiles(true)
      try {
        const { data, error: profErr } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "foundation")
          .order("created_at", { ascending: false })
        if (profErr) throw profErr
        setProfiles(data ?? [])
      } catch (err) {
        console.error("Error cargando perfiles:", err)
      } finally {
        setLoadingProfiles(false)
      }
    }
    fetchProfiles()
  }, [isOpen, isEdit])

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setSuccess(false)
    if (foundation) {
      setForm({
        profile_id: foundation.profile_id,
        foundation_name: foundation.foundation_name,
        description: foundation.description || "",
        location_city: foundation.location_city,
        location_address: foundation.location_address || "",
        whatsapp_number: foundation.whatsapp_number || "",
        email: foundation.email || "",
        donation_link: foundation.donation_link || "",
        instagram_url: foundation.instagram_url || "",
        facebook_url: foundation.facebook_url || "",
        website_url: foundation.website_url || "",
        is_verified: foundation.is_verified,
        logo_url: foundation.logo_url || "",
      })
    } else {
      setForm({ ...emptyForm, ...prefill })
    }
  }, [foundation, isOpen, prefill])

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setIsUploading(true)
    try {
      const url = await uploadImage(file, "foundations")
      setForm((prev) => ({ ...prev, logo_url: url }))
    } catch (err) {
      console.error("Error subiendo logo:", err)
      setError(err instanceof Error ? err.message : "Error al subir el logo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isEdit && !form.profile_id) {
      setError("Selecciona el perfil propietario de la fundación")
      return
    }

    setIsLoading(true)
    try {
      // verified_at coherente con is_verified
      const verifiedAt = form.is_verified
        ? (foundation?.verified_at ?? new Date().toISOString())
        : null

      const payload: FoundationInsert = {
        profile_id: form.profile_id,
        foundation_name: form.foundation_name.trim(),
        description: form.description.trim() || null,
        location_city: form.location_city.trim(),
        location_address: form.location_address.trim() || null,
        whatsapp_number: form.whatsapp_number.trim() || null,
        email: form.email.trim() || null,
        donation_link: form.donation_link.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        facebook_url: form.facebook_url.trim() || null,
        website_url: form.website_url.trim() || null,
        is_verified: form.is_verified,
        verified_at: verifiedAt,
        logo_url: form.logo_url || null,
      }

      if (isEdit && foundation) {
        const { error: updateError } = await supabase
          .from("foundations")
          .update(payload)
          .eq("id", foundation.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("foundations").insert(payload)
        if (insertError) throw insertError
      }

      setSuccess(true)
      setTimeout(() => {
        onSaved()
        handleClose()
      }, 1200)
    } catch (err) {
      console.error("Error guardando fundación:", err)
      setError(err instanceof Error ? err.message : "Error al guardar la fundación")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      onClose()
      setError(null)
      setSuccess(false)
    }
  }

  if (!isOpen) return null

  const busy = isLoading || isUploading

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isEdit ? "Editar Fundación" : "Agregar Fundación"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEdit ? `Modificando ${foundation?.foundation_name}` : "Registra una nueva fundación o rescatista"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={busy} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                  {isUploading ? "Subiendo..." : "Subir logo"}
                  <input type="file" accept="image/*" onChange={handleLogoChange} disabled={busy} className="hidden" />
                </label>
                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, logo_url: "" }))}
                    disabled={busy}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" /> Quitar logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Perfil propietario (solo al crear) */}
          {!isEdit && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Perfil propietario *</Label>
              <Select
                value={form.profile_id}
                onValueChange={(value) => setForm({ ...form, profile_id: value })}
                disabled={busy || loadingProfiles}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={loadingProfiles ? "Cargando..." : "Selecciona un perfil con rol Fundación"} />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.full_name || `Perfil ${p.id.substring(0, 8)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loadingProfiles && profiles.length === 0 && (
                <p className="text-xs text-amber-600">
                  No hay perfiles con rol "Fundación". Crea primero el usuario en la sección Usuarios.
                </p>
              )}
            </div>
          )}

          {/* Nombre + Ciudad */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="f-name" className="text-sm font-medium text-gray-700">Nombre *</Label>
              <Input
                id="f-name"
                value={form.foundation_name}
                onChange={(e) => setForm({ ...form, foundation_name: e.target.value })}
                placeholder="Ej: Fundación Patitas Felices"
                required
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-city" className="text-sm font-medium text-gray-700">Ciudad *</Label>
              <Input
                id="f-city"
                value={form.location_city}
                onChange={(e) => setForm({ ...form, location_city: e.target.value })}
                placeholder="Ej: Pasto"
                required
                disabled={busy}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="f-desc" className="text-sm font-medium text-gray-700">Descripción</Label>
            <Textarea
              id="f-desc"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe la labor de la fundación..."
              disabled={busy}
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="f-address" className="text-sm font-medium text-gray-700">Dirección</Label>
            <Input
              id="f-address"
              value={form.location_address}
              onChange={(e) => setForm({ ...form, location_address: e.target.value })}
              placeholder="Calle 123 #45-67"
              disabled={busy}
              className="rounded-xl"
            />
          </div>

          {/* WhatsApp + Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="f-whatsapp" className="text-sm font-medium text-gray-700">WhatsApp</Label>
              <Input
                id="f-whatsapp"
                value={form.whatsapp_number}
                onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                placeholder="300 123 4567"
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="f-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contacto@fundacion.com"
                disabled={busy}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Redes y enlaces */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="f-instagram" className="text-sm font-medium text-gray-700">Instagram</Label>
              <Input
                id="f-instagram"
                value={form.instagram_url}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                placeholder="https://instagram.com/..."
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-facebook" className="text-sm font-medium text-gray-700">Facebook</Label>
              <Input
                id="f-facebook"
                value={form.facebook_url}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
                placeholder="https://facebook.com/..."
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-website" className="text-sm font-medium text-gray-700">Sitio web</Label>
              <Input
                id="f-website"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://..."
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-donation" className="text-sm font-medium text-gray-700">Enlace de donación</Label>
              <Input
                id="f-donation"
                value={form.donation_link}
                onChange={(e) => setForm({ ...form, donation_link: e.target.value })}
                placeholder="https://..."
                disabled={busy}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Verificada */}
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_verified}
              onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
              disabled={busy}
              className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
            />
            Fundación verificada
          </label>

          {/* Error / Success */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-600 font-medium">
                ✓ Fundación {isEdit ? "actualizada" : "creada"} exitosamente
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={busy} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={busy}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> {isEdit ? "Guardar Cambios" : "Crear Fundación"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
