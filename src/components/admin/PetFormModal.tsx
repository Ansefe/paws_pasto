import { useState, useEffect } from "react"
import { X, Loader2, Save, PawPrint, ImagePlus, Trash2 } from "lucide-react"
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
import { useFoundations } from "@/hooks/useFoundations"
import type {
  Pet, PetInsert, PetSpecies, PetGender, PetSize, PetStatus,
} from "@/types/database.types"

interface PetFormModalProps {
  pet: Pet | null // null = crear, Pet = editar
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  lockedFoundationId?: string // si se pasa, fija la fundación y oculta el selector (panel fundación)
}

interface PetFormState {
  name: string
  species: PetSpecies
  breed: string
  age_approx: string
  gender: PetGender
  size: PetSize
  status: PetStatus
  foundation_id: string
  description_story: string
  special_needs: string
  is_vaccinated: boolean
  is_sterilized: boolean
  is_dewormed: boolean
  good_with_kids: boolean
  good_with_pets: boolean
  main_photo_url: string
}

const emptyForm: PetFormState = {
  name: "",
  species: "dog",
  breed: "",
  age_approx: "",
  gender: "male",
  size: "medium",
  status: "available",
  foundation_id: "",
  description_story: "",
  special_needs: "",
  is_vaccinated: false,
  is_sterilized: false,
  is_dewormed: false,
  good_with_kids: false,
  good_with_pets: false,
  main_photo_url: "",
}

export function PetFormModal({ pet, isOpen, onClose, onSaved, lockedFoundationId }: PetFormModalProps) {
  const isEdit = !!pet
  const { foundations, loading: loadingFoundations } = useFoundations(false)

  const [form, setForm] = useState<PetFormState>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setSuccess(false)
    if (pet) {
      setForm({
        name: pet.name,
        species: pet.species,
        breed: pet.breed || "",
        age_approx: pet.age_approx || "",
        gender: pet.gender,
        size: pet.size,
        status: pet.status,
        foundation_id: pet.foundation_id,
        description_story: pet.description_story || "",
        special_needs: pet.special_needs || "",
        is_vaccinated: pet.is_vaccinated,
        is_sterilized: pet.is_sterilized,
        is_dewormed: pet.is_dewormed,
        good_with_kids: pet.good_with_kids ?? false,
        good_with_pets: pet.good_with_pets ?? false,
        main_photo_url: pet.main_photo_url || "",
      })
    } else {
      setForm({ ...emptyForm, foundation_id: lockedFoundationId ?? "" })
    }
  }, [pet, isOpen, lockedFoundationId])

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setIsUploading(true)
    try {
      const url = await uploadImage(file, "pets")
      setForm((prev) => ({ ...prev, main_photo_url: url }))
    } catch (err) {
      console.error("Error subiendo imagen:", err)
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.foundation_id) {
      setError("Selecciona una fundación")
      return
    }

    setIsLoading(true)
    try {
      const payload: PetInsert = {
        foundation_id: form.foundation_id,
        name: form.name.trim(),
        species: form.species,
        breed: form.breed.trim() || null,
        age_approx: form.age_approx.trim() || null,
        gender: form.gender,
        size: form.size,
        status: form.status,
        description_story: form.description_story.trim() || null,
        special_needs: form.special_needs.trim() || null,
        is_vaccinated: form.is_vaccinated,
        is_sterilized: form.is_sterilized,
        is_dewormed: form.is_dewormed,
        good_with_kids: form.good_with_kids,
        good_with_pets: form.good_with_pets,
        main_photo_url: form.main_photo_url || null,
      }

      if (isEdit && pet) {
        const { error: updateError } = await supabase
          .from("pets")
          .update(payload)
          .eq("id", pet.id)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("pets").insert(payload)
        if (insertError) throw insertError
      }

      setSuccess(true)
      setTimeout(() => {
        onSaved()
        handleClose()
      }, 1200)
    } catch (err) {
      console.error("Error guardando mascota:", err)
      setError(err instanceof Error ? err.message : "Error al guardar la mascota")
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
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isEdit ? "Editar Mascota" : "Agregar Mascota"}
              </h2>
              <p className="text-sm text-gray-500">
                {isEdit ? `Modificando a ${pet?.name}` : "Registra una nueva mascota"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={busy} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Foto principal */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Foto principal</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                {form.main_photo_url ? (
                  <img src={form.main_photo_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <PawPrint className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4" />
                  )}
                  {isUploading ? "Subiendo..." : "Subir foto"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={busy}
                    className="hidden"
                  />
                </label>
                {form.main_photo_url && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, main_photo_url: "" }))}
                    disabled={busy}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" /> Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Nombre + Fundación */}
          <div className={`grid gap-4 ${lockedFoundationId ? "" : "sm:grid-cols-2"}`}>
            <div className="space-y-2">
              <Label htmlFor="pet-name" className="text-sm font-medium text-gray-700">Nombre *</Label>
              <Input
                id="pet-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Luna"
                required
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            {!lockedFoundationId && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fundación *</Label>
                <Select
                  value={form.foundation_id}
                  onValueChange={(value) => setForm({ ...form, foundation_id: value })}
                  disabled={busy || loadingFoundations}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={loadingFoundations ? "Cargando..." : "Selecciona fundación"} />
                  </SelectTrigger>
                  <SelectContent>
                    {foundations.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.foundation_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Especie + Raza */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Especie *</Label>
              <Select
                value={form.species}
                onValueChange={(value: PetSpecies) => setForm({ ...form, species: value })}
                disabled={busy}
              >
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">🐕 Perro</SelectItem>
                  <SelectItem value="cat">🐈 Gato</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pet-breed" className="text-sm font-medium text-gray-700">Raza</Label>
              <Input
                id="pet-breed"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                placeholder="Ej: Mestizo"
                disabled={busy}
                className="rounded-xl"
              />
            </div>
          </div>

          {/* Edad + Género + Tamaño */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pet-age" className="text-sm font-medium text-gray-700">Edad aprox.</Label>
              <Input
                id="pet-age"
                value={form.age_approx}
                onChange={(e) => setForm({ ...form, age_approx: e.target.value })}
                placeholder="Ej: 2 años"
                disabled={busy}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Género *</Label>
              <Select
                value={form.gender}
                onValueChange={(value: PetGender) => setForm({ ...form, gender: value })}
                disabled={busy}
              >
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Macho</SelectItem>
                  <SelectItem value="female">Hembra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Tamaño *</Label>
              <Select
                value={form.size}
                onValueChange={(value: PetSize) => setForm({ ...form, size: value })}
                disabled={busy}
              >
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeño</SelectItem>
                  <SelectItem value="medium">Mediano</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Estado *</Label>
            <Select
              value={form.status}
              onValueChange={(value: PetStatus) => setForm({ ...form, status: value })}
              disabled={busy}
            >
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="in_process">En proceso</SelectItem>
                <SelectItem value="adopted">Adoptado</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Historia */}
          <div className="space-y-2">
            <Label htmlFor="pet-desc" className="text-sm font-medium text-gray-700">Historia / descripción</Label>
            <Textarea
              id="pet-desc"
              value={form.description_story}
              onChange={(e) => setForm({ ...form, description_story: e.target.value })}
              placeholder="Cuenta la historia de la mascota..."
              disabled={busy}
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* Necesidades especiales */}
          <div className="space-y-2">
            <Label htmlFor="pet-special" className="text-sm font-medium text-gray-700">Necesidades especiales</Label>
            <Input
              id="pet-special"
              value={form.special_needs}
              onChange={(e) => setForm({ ...form, special_needs: e.target.value })}
              placeholder="Ej: dieta especial, medicación..."
              disabled={busy}
              className="rounded-xl"
            />
          </div>

          {/* Checkboxes de salud y convivencia */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {([
              ["is_vaccinated", "Vacunado"],
              ["is_sterilized", "Esterilizado"],
              ["is_dewormed", "Desparasitado"],
              ["good_with_kids", "Bueno con niños"],
              ["good_with_pets", "Bueno con mascotas"],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  disabled={busy}
                  className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                />
                {label}
              </label>
            ))}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-600 font-medium">
                ✓ Mascota {isEdit ? "actualizada" : "creada"} exitosamente
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
                <><Save className="w-4 h-4 mr-2" /> {isEdit ? "Guardar Cambios" : "Crear Mascota"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
