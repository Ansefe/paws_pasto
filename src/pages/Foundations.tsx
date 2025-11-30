import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, 
  MapPin, 
  Heart, 
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  BadgeCheck,
  PawPrint,
  Loader2,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useFoundations } from "@/hooks/useFoundations"
import type { FoundationWithPetCount } from "@/types/database.types"

// Componente de tarjeta de fundación
function FoundationCard({ foundation }: { foundation: FoundationWithPetCount }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white h-full">
        {/* Header con logo o placeholder */}
        <div className="relative h-32 bg-gradient-to-br from-brand-sky/20 via-cyan-100 to-blue-100 overflow-hidden">
          {foundation.logo_url ? (
            <img 
              src={foundation.logo_url} 
              alt={foundation.foundation_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <PawPrint className="w-10 h-10 text-brand-sky" />
              </div>
            </div>
          )}
          
          {/* Badge de verificada */}
          {foundation.is_verified && (
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <BadgeCheck className="w-4 h-4" />
              Verificada
            </div>
          )}
        </div>
        
        {/* Info */}
        <CardContent className="p-5">
          <div className="mb-4">
            <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">
              {foundation.foundation_name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{foundation.location_city}</span>
            </div>
          </div>
          
          {foundation.description && (
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
              {foundation.description}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex items-center gap-4 mb-4 py-3 border-y border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-sky/10 flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-brand-sky" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{foundation.pet_count}</p>
                <p className="text-xs text-gray-500">Mascotas</p>
              </div>
            </div>
          </div>
          
          {/* Redes sociales */}
          <div className="flex items-center gap-2 mb-4">
            {foundation.instagram_url && (
              <a 
                href={foundation.instagram_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {foundation.facebook_url && (
              <a 
                href={foundation.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {foundation.website_url && (
              <a 
                href={foundation.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white hover:scale-110 transition-transform"
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link to={`/fundaciones/${foundation.id}`}>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full gap-2">
                Conocer más
              </Button>
            </Link>
            <div className="flex gap-2">
              {foundation.whatsapp_number && (
                <a 
                  href={`https://wa.me/${foundation.whatsapp_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="outline" className="w-full rounded-full gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </Button>
                </a>
              )}
              {foundation.donation_link && (
                <a 
                  href={foundation.donation_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="outline" className="w-full rounded-full gap-2 border-pink-200 text-pink-600 hover:bg-pink-50">
                    <Heart className="w-4 h-4" />
                    Donar
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function FoundationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const { foundations, loading, error } = useFoundations(true)
  
  // Filtrar por búsqueda
  const filteredFoundations = foundations.filter(f => 
    f.foundation_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location_city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-brand-yellow/20 rounded-full blur-3xl" />
          {/* Patitas decorativas */}
          <div className="absolute top-20 left-10 opacity-10">
            <PawPrint className="w-32 h-32 text-white rotate-[-15deg]" />
          </div>
          <div className="absolute bottom-10 right-20 opacity-10">
            <PawPrint className="w-24 h-24 text-white rotate-[25deg]" />
          </div>
        </div>
        
        <div className="container px-4 relative z-10">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <BadgeCheck className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Fundaciones Verificadas</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Nuestras Fundaciones Aliadas
            </h1>
            <p className="text-white/80 text-lg mb-8">
              Organizaciones de Pasto que trabajan con amor rescatando y cuidando animales. 
              Cada donación y adopción marca la diferencia.
            </p>
            
            {/* Stats */}
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">{foundations.length}</p>
                <p className="text-white/70 text-sm">Fundaciones</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  {foundations.reduce((sum, f) => sum + f.pet_count, 0)}
                </p>
                <p className="text-white/70 text-sm">Mascotas en adopción</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Barra de búsqueda */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="container px-4 py-4">
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar fundación por nombre o ciudad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-full border-gray-200 bg-gray-50 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de fundaciones */}
      <section className="container px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
            <p className="text-gray-600">Cargando fundaciones...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😿</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar fundaciones
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
              Reintentar
            </Button>
          </div>
        ) : filteredFoundations.length > 0 ? (
          <motion.div 
            layout
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredFoundations.map((foundation) => (
                <FoundationCard key={foundation.id} foundation={foundation} />
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
              No encontramos fundaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Intenta con otro término de búsqueda
            </p>
            <Button onClick={() => setSearchQuery("")} variant="outline" className="rounded-full">
              Limpiar búsqueda
            </Button>
          </motion.div>
        )}
      </section>

      {/* CTA - Registrar fundación */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Eres una fundación o rescatista en Pasto?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Únete a Paws y dale visibilidad a los animales que rescatas. 
              Es completamente gratis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold rounded-full px-8"
              >
                Registrar mi Fundación
              </Button>
              <Link to="/nosotros#fundaciones">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10 rounded-full px-8"
                >
                  Conocer más
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
