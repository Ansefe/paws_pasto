import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  MapPin, 
  Heart, 
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  BadgeCheck,
  PawPrint,
  Loader2,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Target,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import type { Foundation, PetWithFoundation } from "@/types/database.types"
import { PetDetailModal, type PetForModal } from "@/components/PetDetailModal"

// Tipo extendido para la fundación con mascotas
interface FoundationDetail extends Foundation {
  pets?: PetWithFoundation[]
}

// Adaptador para el modal
function adaptPetForModal(pet: PetWithFoundation) {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed ?? undefined,
    age_approx: pet.age_approx ?? undefined,
    gender: pet.gender,
    size: pet.size,
    description_story: pet.description_story ?? undefined,
    main_photo_url: pet.main_photo_url ?? undefined,
    gallery_urls: pet.gallery_urls ?? undefined,
    status: pet.status,
    is_vaccinated: pet.is_vaccinated ?? undefined,
    is_sterilized: pet.is_sterilized ?? undefined,
    is_dewormed: pet.is_dewormed ?? undefined,
    good_with_kids: pet.good_with_kids ?? undefined,
    good_with_pets: pet.good_with_pets ?? undefined,
    special_needs: pet.special_needs ?? undefined,
    foundation: {
      name: pet.foundation.foundation_name,
      location: pet.foundation.location_city,
      whatsapp: pet.foundation.whatsapp_number ?? undefined
    }
  }
}

// Emojis para placeholder de fotos
const petEmojis = {
  dog: { male: "🐕", female: "🐕‍🦺" },
  cat: { male: "🐈", female: "😺" }
}

// Mini card de mascota
function MiniPetCard({ pet, onClick }: { pet: PetWithFoundation; onClick: () => void }) {
  const emoji = petEmojis[pet.species][pet.gender]
  
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all bg-white">
        <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
          {pet.main_photo_url ? (
            <img 
              src={pet.main_photo_url} 
              alt={pet.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {emoji}
            </div>
          )}
          {pet.status === "in_process" && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
              En proceso
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <h4 className="font-semibold text-gray-900 truncate">{pet.name}</h4>
          <p className="text-xs text-gray-500">{pet.breed || pet.species === 'dog' ? 'Perrito' : 'Gatito'}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function FoundationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [foundation, setFoundation] = useState<FoundationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPet, setSelectedPet] = useState<PetForModal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchFoundation() {
      if (!id) return

      try {
        setLoading(true)
        
        // Obtener fundación
        const { data: foundationData, error: foundationError } = await supabase
          .from('foundations')
          .select('*')
          .eq('id', id)
          .single()

        if (foundationError) throw foundationError

        // Obtener mascotas de la fundación
        const { data: petsData, error: petsError } = await supabase
          .from('pets')
          .select(`
            *,
            foundation:foundations!inner(
              id,
              foundation_name,
              location_city,
              whatsapp_number
            )
          `)
          .eq('foundation_id', id)
          .in('status', ['available', 'in_process'])
          .order('created_at', { ascending: false })

        if (petsError) throw petsError

        setFoundation({
          ...(foundationData as Foundation),
          pets: petsData as PetWithFoundation[]
        })
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar la fundación')
      } finally {
        setLoading(false)
      }
    }

    fetchFoundation()
  }, [id])

  const openPetModal = (pet: PetWithFoundation) => {
    setSelectedPet(adaptPetForModal(pet))
    setIsModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }

  if (error || !foundation) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-6xl mb-4">😿</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Fundación no encontrada'}
          </h2>
          <Link to="/fundaciones">
            <Button variant="outline" className="rounded-full mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a fundaciones
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero con imagen de fondo */}
      <section className="relative pt-20">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 h-80 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600">
          <div className="absolute inset-0 bg-black/20" />
          {/* Decoración */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container px-4 relative z-10">
          {/* Breadcrumb */}
          <div className="pt-6 pb-4">
            <Link 
              to="/fundaciones" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a fundaciones</span>
            </Link>
          </div>

          {/* Card principal de la fundación */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden border-none shadow-2xl bg-white">
              <div className="md:flex">
                {/* Logo/Imagen */}
                <div className="md:w-1/3 p-6 md:p-8 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                  {foundation.logo_url ? (
                    <img 
                      src={foundation.logo_url} 
                      alt={foundation.foundation_name}
                      className="w-48 h-48 object-contain rounded-2xl"
                    />
                  ) : (
                    <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <PawPrint className="w-24 h-24 text-emerald-500" />
                    </div>
                  )}
                </div>

                {/* Info principal */}
                <div className="md:w-2/3 p-6 md:p-8">
                  <div className="flex flex-wrap items-start gap-3 mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {foundation.foundation_name}
                    </h1>
                    {foundation.is_verified && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-sm font-medium px-3 py-1 rounded-full">
                        <BadgeCheck className="w-4 h-4" />
                        Verificada
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <span>{foundation.location_city}</span>
                    {foundation.location_address && (
                      <span className="text-gray-400">• {foundation.location_address}</span>
                    )}
                  </div>

                  {foundation.description && (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {foundation.description}
                    </p>
                  )}

                  {/* Stats rápidos */}
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
                      <PawPrint className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">
                        {foundation.pets?.length || 0} mascotas
                      </span>
                    </div>
                    {foundation.verified_at && (
                      <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-700">
                          Verificada desde {new Date(foundation.verified_at).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones principales */}
                  <div className="flex flex-wrap gap-3">
                    {foundation.whatsapp_number && (
                      <a 
                        href={`https://wa.me/${foundation.whatsapp_number}?text=${encodeURIComponent(`¡Hola! Vi su perfil en Paws y me gustaría conocer más sobre ${foundation.foundation_name}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full gap-2">
                          <MessageCircle className="w-5 h-5" />
                          Contactar por WhatsApp
                        </Button>
                      </a>
                    )}
                    {foundation.donation_link && (
                      <a 
                        href={foundation.donation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="rounded-full gap-2 border-pink-200 text-pink-600 hover:bg-pink-50">
                          <Heart className="w-5 h-5" />
                          Apoyar con donación
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="container px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Sección: Nuestra Historia / Misión */}
            {foundation.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-none shadow-md overflow-hidden">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">Nuestra Misión</h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {foundation.description}
                    </p>
                    {/* Aquí se podría agregar más contenido extenso si la fundación lo proporciona */}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Sección: Mascotas en adopción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <PawPrint className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Nuestros Peluditos en Adopción
                  </h2>
                </div>
                <span className="text-sm text-gray-500">
                  {foundation.pets?.length || 0} disponibles
                </span>
              </div>

              {foundation.pets && foundation.pets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {foundation.pets.map((pet) => (
                    <MiniPetCard 
                      key={pet.id} 
                      pet={pet} 
                      onClick={() => openPetModal(pet)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="border-none shadow-md">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">🏠</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      ¡Todas nuestras mascotas encontraron hogar!
                    </h3>
                    <p className="text-gray-600">
                      Por el momento no tenemos mascotas en adopción, pero puedes seguirnos en redes para enterarte de nuevos rescates.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card de contacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-none shadow-md sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Información de Contacto
                  </h3>

                  <div className="space-y-4">
                    {foundation.email && (
                      <a 
                        href={`mailto:${foundation.email}`}
                        className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-sm">{foundation.email}</span>
                      </a>
                    )}

                    {foundation.whatsapp_number && (
                      <a 
                        href={`https://wa.me/${foundation.whatsapp_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-gray-600 hover:text-emerald-600 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-sm">+{foundation.whatsapp_number}</span>
                      </a>
                    )}

                    {foundation.location_address && (
                      <div className="flex items-start gap-3 text-gray-600">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-sm">{foundation.location_address}, {foundation.location_city}</span>
                      </div>
                    )}
                  </div>

                  {/* Redes sociales */}
                  {(foundation.instagram_url || foundation.facebook_url || foundation.website_url) && (
                    <>
                      <hr className="my-5 border-gray-100" />
                      <h4 className="font-medium text-gray-700 mb-3">Síguenos</h4>
                      <div className="flex gap-3">
                        {foundation.instagram_url && (
                          <a 
                            href={foundation.instagram_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {foundation.facebook_url && (
                          <a 
                            href={foundation.facebook_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          >
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                        {foundation.website_url && (
                          <a 
                            href={foundation.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center text-white hover:scale-110 transition-transform"
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </>
                  )}

                  {/* CTA de donación */}
                  {foundation.donation_link && (
                    <>
                      <hr className="my-5 border-gray-100" />
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="w-5 h-5 text-pink-500" />
                          <h4 className="font-medium text-gray-900">Apoya nuestra labor</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Cada aporte nos ayuda a rescatar y cuidar más animalitos.
                        </p>
                        <a 
                          href={foundation.donation_link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full">
                            Donar ahora
                          </Button>
                        </a>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-12 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Listo para adoptar?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Conoce a todas nuestras mascotas y encuentra al compañero perfecto para ti.
            </p>
            <Link to="/adoptar">
              <Button 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold rounded-full px-8 gap-2"
              >
                Ver todas las mascotas
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Modal de detalle de mascota */}
      <PetDetailModal 
        pet={selectedPet}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPet(null)
        }}
      />
    </div>
  )
}
