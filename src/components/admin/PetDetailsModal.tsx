import { X, PawPrint, Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PetWithFoundation } from "@/types/database.types"

interface PetDetailsModalProps {
  pet: PetWithFoundation | null
  isOpen: boolean
  onClose: () => void
}

const speciesLabel: Record<string, string> = { dog: "🐕 Perro", cat: "🐈 Gato" }
const genderLabel: Record<string, string> = { male: "Macho", female: "Hembra" }
const sizeLabel: Record<string, string> = { small: "Pequeño", medium: "Mediano", large: "Grande" }
const statusConfig: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  in_process: { label: "En proceso", color: "bg-amber-100 text-amber-700" },
  adopted: { label: "Adoptado", color: "bg-pink-100 text-pink-700" },
  paused: { label: "Pausado", color: "bg-gray-100 text-gray-700" },
}

function Flag({ label, value }: { label: string; value: boolean | null }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {value ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Minus className="w-4 h-4 text-gray-300" />
      )}
      <span className={value ? "text-gray-700" : "text-gray-400"}>{label}</span>
    </div>
  )
}

export function PetDetailsModal({ pet, isOpen, onClose }: PetDetailsModalProps) {
  if (!isOpen || !pet) return null

  const status = statusConfig[pet.status] || { label: pet.status, color: "bg-gray-100 text-gray-600" }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Detalles de la mascota</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Foto + nombre */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
              {pet.main_photo_url ? (
                <img src={pet.main_photo_url} alt={pet.name} className="w-full h-full object-cover" />
              ) : (
                <PawPrint className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{pet.name}</h3>
              <p className="text-sm text-gray-500">{pet.breed || "Sin raza"}</p>
              <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Datos básicos */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Especie:</span> {speciesLabel[pet.species] || pet.species}</div>
            <div><span className="text-gray-500">Género:</span> {genderLabel[pet.gender] || pet.gender}</div>
            <div><span className="text-gray-500">Tamaño:</span> {sizeLabel[pet.size] || pet.size}</div>
            <div><span className="text-gray-500">Edad:</span> {pet.age_approx || "—"}</div>
            <div className="col-span-2"><span className="text-gray-500">Fundación:</span> {pet.foundation?.foundation_name || "—"}</div>
          </div>

          {/* Historia */}
          {pet.description_story && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Historia</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{pet.description_story}</p>
            </div>
          )}

          {/* Salud y convivencia */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Salud y convivencia</p>
            <div className="grid grid-cols-2 gap-2">
              <Flag label="Vacunado" value={pet.is_vaccinated} />
              <Flag label="Esterilizado" value={pet.is_sterilized} />
              <Flag label="Desparasitado" value={pet.is_dewormed} />
              <Flag label="Bueno con niños" value={pet.good_with_kids} />
              <Flag label="Bueno con mascotas" value={pet.good_with_pets} />
            </div>
          </div>

          {/* Necesidades especiales */}
          {pet.special_needs && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Necesidades especiales</p>
              <p className="text-sm text-gray-600">{pet.special_needs}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Registrado el {new Date(pet.created_at).toLocaleDateString("es-CO")}
          </p>
        </div>
      </div>
    </div>
  )
}
