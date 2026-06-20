import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Heart, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Calendar,
  Dog,
  Cat,
  PawPrint,
  MessageCircle,
  Shield,
  Sparkles,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { sendAdoptionInterestNotification } from "@/lib/telegram"

// Construye una URL de WhatsApp (wa.me) a partir de un número y un mensaje.
// Normaliza el número a dígitos y antepone el código de Colombia (57) si falta.
function buildWhatsappUrl(rawNumber: string, message: string): string {
  let digits = rawNumber.replace(/\D/g, "")
  if (digits.length === 10 && digits.startsWith("3")) {
    digits = "57" + digits // celular colombiano sin código de país
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

// Tipo de mascota (simplificado para el modal)
export interface PetForModal {
  id: string
  name: string
  species: "dog" | "cat"
  breed?: string
  age_approx?: string
  gender: "male" | "female"
  size: "small" | "medium" | "large"
  description_story?: string
  main_photo_url?: string
  gallery_urls?: string[]
  status: "available" | "in_process" | "adopted" | "paused"
  is_vaccinated?: boolean
  is_sterilized?: boolean
  is_dewormed?: boolean
  good_with_kids?: boolean
  good_with_pets?: boolean
  special_needs?: string
  foundation: {
    name: string
    location: string
    whatsapp?: string
  }
}

// Emojis para placeholder
const petEmojis = {
  dog: { male: "🐕", female: "🐕‍🦺" },
  cat: { male: "🐈", female: "😺" }
}

// Frases que "dicen" las mascotas (tono inverso: ellos adoptan humanos)
const adoptionPhrases = {
  available: [
    "¡Hola! Estoy buscando a mi humano perfecto",
    "¿Serás tú quien complete mi manada?",
    "Tengo mucho amor guardado esperándote",
    "Mi corazón tiene espacio para ti"
  ],
  cta: [
    "Postúlate para ser mi humano",
    "Déjame conocerte",
    "Aplica para que te adopte",
    "Preséntate ante mí"
  ],
  requirements: "Requisitos para que te adopte",
  whatsapp: "Háblale a mi cuidador"
}

// Función para obtener frase aleatoria
const getRandomPhrase = (phrases: string[]) => {
  return phrases[Math.floor(Math.random() * phrases.length)]
}

interface PetDetailModalProps {
  pet: PetForModal | null
  isOpen: boolean
  onClose: () => void
}

export function PetDetailModal({ pet, isOpen, onClose }: PetDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  if (!pet) return null

  const emoji = petEmojis[pet.species][pet.gender]
  
  // Combinar foto principal con galería
  const allImages = [pet.main_photo_url, ...(pet.gallery_urls || [])]
  
  const sizeLabels = { small: "Pequeño", medium: "Mediano", large: "Grande" }
  const genderLabels = { male: "Macho", female: "Hembra" }
  const speciesLabels = { dog: "Perro", cat: "Gato" }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
  }

  // Flujo de postulación: abre WhatsApp con la fundación, notifica por Telegram
  // y marca la mascota "en proceso" (sin bloquear nuevas postulaciones).
  const handleAdopt = () => {
    if (!pet) return

    const whatsapp = pet.foundation.whatsapp
    const pronoun = pet.gender === "female" ? "la" : "lo"
    const message = `¡Hola! Vi a *${pet.name}* en Paws y me encantaría postularme para adoptar${pronoun}. ¿Me pueden dar más información?`

    // 1. Abrir WhatsApp de la fundación (si tiene número configurado)
    if (whatsapp) {
      window.open(buildWhatsappUrl(whatsapp, message), "_blank", "noopener,noreferrer")
    }

    // 2. Notificar al equipo por Telegram (best-effort)
    void sendAdoptionInterestNotification({
      petName: pet.name,
      species: pet.species,
      breed: pet.breed,
      foundationName: pet.foundation.name,
      foundationWhatsapp: whatsapp,
    })

    // 3. Marcar la mascota "en proceso" (best-effort; no bloquea otras postulaciones)
    void supabase.rpc("mark_pet_in_process", { pet_id: pet.id })
  }

  // Características de la mascota
  const traits = [
    pet.is_vaccinated && { icon: Shield, label: "Vacunado", color: "text-green-600" },
    pet.is_sterilized && { icon: Check, label: "Esterilizado", color: "text-blue-600" },
    pet.is_dewormed && { icon: Check, label: "Desparasitado", color: "text-purple-600" },
    pet.good_with_kids && { icon: Heart, label: "Amigo de niños", color: "text-pink-600" },
    pet.good_with_pets && { icon: PawPrint, label: "Sociable con mascotas", color: "text-amber-600" },
  ].filter(Boolean)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Detalles de {pet.name}</DialogTitle>
        
        <div className="grid md:grid-cols-2">
          {/* Lado izquierdo: Carrusel de imágenes */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-square md:aspect-auto md:min-h-[500px]">
            {/* Imagen o emoji */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {allImages[currentImageIndex] ? (
                  <img 
                    src={allImages[currentImageIndex]}
                    alt={`${pet.name} - Foto ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[150px]">{emoji}</span>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navegación del carrusel */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? "bg-white w-8" 
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Botón favorito */}
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            >
              <Heart 
                className={`w-6 h-6 transition-colors ${
                  isFavorite 
                    ? "text-pink-500 fill-pink-500" 
                    : "text-gray-400"
                }`} 
              />
            </button>

            {/* Badge de estado */}
            {pet.status === "in_process" && (
              <div className="absolute top-4 left-4 bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-full">
                🤝 Ya estoy conociendo a alguien
              </div>
            )}
          </div>

          {/* Lado derecho: Información */}
          <div className="p-6 md:p-8 md:pr-16 flex flex-col">
            {/* Header con nombre */}
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {pet.name}
                  </h2>
                  <p className="text-gray-500">{pet.breed}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium shrink-0 ${
                  pet.species === "dog" 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-purple-100 text-purple-700"
                }`}>
                  {speciesLabels[pet.species]}
                </span>
              </div>
              
              {/* Frase de la mascota (solo si está disponible) */}
              {pet.status === "available" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-brand-yellow-100 to-brand-yellow-50 rounded-2xl p-4 mt-4"
                >
                  <p className="text-gray-700 font-medium flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-yellow-600" />
                    <span className="italic">"{getRandomPhrase(adoptionPhrases.available)}"</span>
                  </p>
                </motion.div>
              )}
            </div>

            {/* Características básicas */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{pet.age_approx}</p>
                <p className="text-xs text-gray-500">Edad</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                {pet.species === "dog" ? (
                  <Dog className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                ) : (
                  <Cat className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                )}
                <p className="text-sm font-medium text-gray-900">{sizeLabels[pet.size]}</p>
                <p className="text-xs text-gray-500">Tamaño</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <PawPrint className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-sm font-medium text-gray-900">{genderLabels[pet.gender]}</p>
                <p className="text-xs text-gray-500">Sexo</p>
              </div>
            </div>

            {/* Historia */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Mi historia</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {pet.description_story}
              </p>
            </div>

            {/* Traits/Características */}
            {traits.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">{adoptionPhrases.requirements}</h3>
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait, idx) => trait && (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
                    >
                      <trait.icon className={`w-4 h-4 ${trait.color}`} />
                      {trait.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Necesidades especiales */}
            {pet.special_needs && (
              <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                  <strong>🌟 Necesito cuidados especiales:</strong> {pet.special_needs}
                </p>
              </div>
            )}

            {/* Fundación */}
            <div className="mb-6 flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <div className="w-12 h-12 bg-brand-sky-100 rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-brand-sky" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Estoy bajo el cuidado de</p>
                <p className="font-semibold text-gray-900">{pet.foundation.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {pet.foundation.location}
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-auto space-y-3">
              {pet.status === "adopted" ? (
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 text-center">
                  <p className="text-pink-800 font-medium">
                    🎉 ¡Ya encontré mi hogar para siempre!
                  </p>
                  <p className="text-pink-600 text-sm mt-1">
                    Gracias por tu interés. Hay muchos más amigos esperándote
                  </p>
                </div>
              ) : (
                <>
                  {/* Aviso si ya hay alguien en proceso (no bloquea postularse) */}
                  {pet.status === "in_process" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <p className="text-amber-800 text-sm font-medium">
                        🤝 Ya hay alguien interesado, ¡pero aún puedes postularte!
                      </p>
                    </div>
                  )}

                  {/* CTA Principal - Postularse vía WhatsApp */}
                  <Button
                    onClick={handleAdopt}
                    size="lg"
                    className="w-full bg-gradient-to-r from-brand-sky to-blue-600 hover:from-brand-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl h-14 text-base shadow-lg shadow-brand-sky/25"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {getRandomPhrase(adoptionPhrases.cta)}
                  </Button>

                  {!pet.foundation.whatsapp && (
                    <p className="text-xs text-gray-400 text-center">
                      Esta fundación aún no tiene WhatsApp configurado; igual avisaremos a nuestro equipo.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
      </DialogContent>
    </Dialog>
  )
}
