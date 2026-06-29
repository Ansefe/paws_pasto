import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Heart, Loader2, PawPrint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useFavorites } from "@/hooks/useFavorites"
import { PetCard } from "@/pages/Adopt"
import { adaptPetForModal } from "@/lib/petAdapter"
import { PetDetailModal, type PetForModal } from "@/components/PetDetailModal"
import type { PetWithFoundation } from "@/types/database.types"

export function FavoritesPage() {
  const { ids, count } = useFavorites()
  const [pets, setPets] = useState<PetWithFoundation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPet, setSelectedPet] = useState<PetForModal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let active = true

    const fetchFavorites = async () => {
      if (ids.length === 0) {
        setPets([])
        setLoading(false)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from("pets")
        .select(
          `*, foundation:foundations!inner(id, foundation_name, location_city, whatsapp_number)`
        )
        .in("id", ids)

      if (active) {
        setPets((data ?? []) as PetWithFoundation[])
        setLoading(false)
      }
    }

    fetchFavorites()
    return () => {
      active = false
    }
  }, [ids])

  const openPetModal = (pet: PetWithFoundation) => {
    setSelectedPet(adaptPetForModal(pet))
    setIsModalOpen(true)
  }

  const closePetModal = () => {
    setIsModalOpen(false)
    setSelectedPet(null)
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="relative pt-28 pb-12 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-yellow-300/20 rounded-full blur-3xl" />
        </div>
        <div className="container px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 flex items-center gap-3">
              <Heart className="w-8 h-8 fill-white" />
              Mis Favoritos
            </h1>
            <p className="text-white/80 text-lg">
              {count === 0
                ? "Aún no has guardado mascotas"
                : `${count} ${count === 1 ? "mascota guardada" : "mascotas guardadas"}`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contenido */}
      <section className="container px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
            <p className="text-gray-600">Cargando tus favoritos...</p>
          </div>
        ) : pets.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onClick={() => openPetModal(pet)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-10 h-10 text-pink-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tu lista está vacía
            </h3>
            <p className="text-gray-600 mb-6">
              Toca el corazón en cualquier mascota para guardarla aquí.
            </p>
            <Link to="/adoptar">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full px-8">
                Explorar mascotas
              </Button>
            </Link>
          </div>
        )}
      </section>

      <PetDetailModal pet={selectedPet} isOpen={isModalOpen} onClose={closePetModal} />
    </div>
  )
}
