import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  SlidersHorizontal, 
  Heart, 
  MapPin, 
  X,
  Dog,
  Cat,
  PawPrint,
  Grid3X3,
  LayoutList,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { PetDetailModal } from "@/components/PetDetailModal"
import { usePets } from "@/hooks/usePets"
import type { PetWithFoundation, PetSpecies, PetSize, PetGender } from "@/types/database.types"
import type { PetForModal } from "@/components/PetDetailModal"

// Función para adaptar PetWithFoundation al formato del modal
function adaptPetForModal(pet: PetWithFoundation): PetForModal {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed || "Mestizo",
    age_approx: pet.age_approx || "Desconocida",
    gender: pet.gender,
    size: pet.size,
    description_story: pet.description_story || "",
    main_photo_url: pet.main_photo_url || "",
    gallery_urls: pet.gallery_urls || undefined,
    status: pet.status as "available" | "in_process" | "adopted",
    is_vaccinated: pet.is_vaccinated,
    is_sterilized: pet.is_sterilized,
    is_dewormed: pet.is_dewormed,
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

// Configuración de filtros
const speciesOptions = [
  { value: "all", label: "Todas las especies", icon: PawPrint },
  { value: "dog", label: "Perros", icon: Dog },
  { value: "cat", label: "Gatos", icon: Cat },
]

const sizeOptions = [
  { value: "all", label: "Todos los tamaños" },
  { value: "small", label: "Pequeño" },
  { value: "medium", label: "Mediano" },
  { value: "large", label: "Grande" },
]

const genderOptions = [
  { value: "all", label: "Todos" },
  { value: "male", label: "Macho" },
  { value: "female", label: "Hembra" },
]

const ageOptions = [
  { value: "all", label: "Todas las edades" },
  { value: "puppy", label: "Cachorro (0-1 año)" },
  { value: "young", label: "Joven (1-3 años)" },
  { value: "adult", label: "Adulto (3+ años)" },
]

// Componente de tarjeta de mascota
function PetCard({ pet, onClick }: { pet: PetWithFoundation; onClick: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false)
  const emoji = petEmojis[pet.species][pet.gender]
  
  const sizeLabels = { small: "Pequeño", medium: "Mediano", large: "Grande" }
  const genderLabels = { male: "Macho", female: "Hembra" }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div onClick={onClick} className="cursor-pointer">
        <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer bg-white">
          {/* Imagen */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {pet.main_photo_url ? (
              <img 
                src={pet.main_photo_url} 
                alt={pet.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-500">
                {emoji}
              </div>
            )}
            
            {/* Badge de estado */}
            {pet.status === "in_process" && (
              <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                En proceso
              </div>
            )}
            
            {/* Botón favorito */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsFavorite(!isFavorite)
              }}
              className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all"
            >
              <Heart 
                className={`w-5 h-5 transition-colors ${
                  isFavorite 
                    ? "text-pink-500 fill-pink-500" 
                    : "text-gray-400 hover:text-pink-400"
                }`} 
              />
            </button>
          </div>
          
          {/* Info */}
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-sky transition-colors">
                  {pet.name}
                </h3>
                <p className="text-sm text-gray-500">{pet.breed}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                pet.species === "dog" 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-purple-100 text-purple-700"
              }`}>
                {pet.species === "dog" ? "Perro" : "Gato"}
              </span>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {pet.age_approx}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {sizeLabels[pet.size as keyof typeof sizeLabels]}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {genderLabels[pet.gender as keyof typeof genderLabels]}
              </span>
            </div>
            
            {/* Fundación */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{pet.foundation.foundation_name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// Componente de filtros para móvil
function MobileFilters({ 
  filters, 
  setFilters,
  clearFilters,
  activeFiltersCount
}: { 
  filters: typeof initialFilters
  setFilters: React.Dispatch<React.SetStateAction<typeof initialFilters>>
  clearFilters: () => void
  activeFiltersCount: number
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 relative">
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-sky text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                Limpiar todo
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Especie */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Especie</label>
            <div className="grid grid-cols-3 gap-2">
              {speciesOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(f => ({ ...f, species: option.value }))}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    filters.species === option.value
                      ? "border-brand-sky bg-brand-sky-50 text-brand-sky"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <option.icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{option.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Tamaño</label>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(f => ({ ...f, size: option.value }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.size === option.value
                      ? "bg-brand-sky text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Género */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Género</label>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(f => ({ ...f, gender: option.value }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.gender === option.value
                      ? "bg-brand-sky text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Edad */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Edad</label>
            <div className="flex flex-wrap gap-2">
              {ageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(f => ({ ...f, age: option.value }))}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filters.age === option.value
                      ? "bg-brand-sky text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const initialFilters = {
  species: "all",
  size: "all",
  gender: "all",
  age: "all",
  search: ""
}

export function AdoptPage() {
  const [filters, setFilters] = useState(initialFilters)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedPet, setSelectedPet] = useState<PetForModal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Obtener mascotas desde Supabase con filtros
  const { pets, loading, error } = usePets({
    species: filters.species !== "all" ? filters.species as PetSpecies : undefined,
    size: filters.size !== "all" ? filters.size as PetSize : undefined,
    gender: filters.gender !== "all" ? filters.gender as PetGender : undefined,
    search: filters.search || undefined
  })

  const openPetModal = (pet: PetWithFoundation) => {
    setSelectedPet(adaptPetForModal(pet))
    setIsModalOpen(true)
  }

  const closePetModal = () => {
    setIsModalOpen(false)
    setSelectedPet(null)
  }

  // Las mascotas ya vienen filtradas del hook
  const filteredPets = pets

  const clearFilters = () => setFilters(initialFilters)
  
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== "search" && value !== "all"
  ).length

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero pequeño */}
      <section className="relative pt-28 pb-12 bg-gradient-to-br from-brand-sky via-cyan-500 to-blue-600 overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-brand-yellow/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container px-4 relative z-10">
          <motion.div 
            className="max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Encuentra a tu compañero ideal 🐾
            </h1>
            <p className="text-white/80 text-lg">
              {filteredPets.filter(p => p.status === "available").length} mascotas esperando un hogar en Pasto
            </p>
          </motion.div>
        </div>
      </section>

      {/* Barra de búsqueda y filtros sticky */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="container px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="pl-12 h-12 rounded-full border-gray-200 bg-gray-50 focus:bg-white"
              />
              {filters.search && (
                <button 
                  onClick={() => setFilters(f => ({ ...f, search: "" }))}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Filtros Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <Select 
                value={filters.species} 
                onValueChange={(value) => setFilters(f => ({ ...f, species: value }))}
              >
                <SelectTrigger className="w-40 h-12 rounded-full">
                  <SelectValue placeholder="Especie" />
                </SelectTrigger>
                <SelectContent>
                  {speciesOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.size} 
                onValueChange={(value) => setFilters(f => ({ ...f, size: value }))}
              >
                <SelectTrigger className="w-40 h-12 rounded-full">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.gender} 
                onValueChange={(value) => setFilters(f => ({ ...f, gender: value }))}
              >
                <SelectTrigger className="w-32 h-12 rounded-full">
                  <SelectValue placeholder="Género" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>

            {/* Filtros Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <MobileFilters 
                filters={filters} 
                setFilters={setFilters} 
                clearFilters={clearFilters}
                activeFiltersCount={activeFiltersCount}
              />
              
              {/* Toggle vista */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm" : ""
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtros activos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filters.species !== "all" && (
                <span className="inline-flex items-center gap-1 bg-brand-sky-50 text-brand-sky-700 px-3 py-1 rounded-full text-sm">
                  {filters.species === "dog" ? "Perros" : "Gatos"}
                  <button onClick={() => setFilters(f => ({ ...f, species: "all" }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.size !== "all" && (
                <span className="inline-flex items-center gap-1 bg-brand-sky-50 text-brand-sky-700 px-3 py-1 rounded-full text-sm">
                  {sizeOptions.find(o => o.value === filters.size)?.label}
                  <button onClick={() => setFilters(f => ({ ...f, size: "all" }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.gender !== "all" && (
                <span className="inline-flex items-center gap-1 bg-brand-sky-50 text-brand-sky-700 px-3 py-1 rounded-full text-sm">
                  {genderOptions.find(o => o.value === filters.gender)?.label}
                  <button onClick={() => setFilters(f => ({ ...f, gender: "all" }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Grid de mascotas */}
      <section className="container px-4 py-8">
        {/* Contador de resultados */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredPets.length}</span> mascotas encontradas
          </p>
          
          {/* Toggle vista desktop */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm" : ""
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-brand-sky animate-spin mb-4" />
            <p className="text-gray-600">Buscando mascotas...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😿</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar mascotas
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
              Reintentar
            </Button>
          </div>
        ) : filteredPets.length > 0 ? (
          <motion.div 
            layout
            className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-2xl"
            }`}
          >
            <AnimatePresence>
              {filteredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} onClick={() => openPetModal(pet)} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No encontramos mascotas
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta ajustar los filtros para ver más resultados
            </p>
            <Button onClick={clearFilters} variant="outline" className="rounded-full">
              Limpiar filtros
            </Button>
          </motion.div>
        )}
      </section>

      {/* CTA para fundaciones */}
      <section className="container px-4 pb-16">
        <div className="bg-gradient-to-br from-brand-mint-100 to-emerald-100 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            ¿Eres rescatista o fundación?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Únete a HogarPeludo y dale visibilidad a los animales que rescatas en Pasto.
          </p>
          <Link to="/nosotros#fundaciones">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8">
              Conocer más
            </Button>
          </Link>
        </div>
      </section>

      {/* Modal de detalle de mascota */}
      <PetDetailModal 
        pet={selectedPet}
        isOpen={isModalOpen}
        onClose={closePetModal}
      />
    </div>
  )
}
