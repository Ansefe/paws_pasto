import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { 
  Heart, Shield, CheckCircle2, ExternalLink, 
  Phone, MessageCircle, Building2, AlertTriangle,
  HandHeart, Sparkles, ArrowRight, Search,
  Loader2, PawPrint
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFoundations } from "@/hooks/useFoundations"
import type { Foundation } from "@/types/database.types"

// Animaciones
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

// Componente de tarjeta de donación para fundación
function DonationCard({ foundation }: { foundation: Foundation }) {
  const hasDonationLink = !!foundation.donation_link
  const hasWhatsapp = !!foundation.whatsapp_number

  const handleWhatsAppClick = () => {
    if (foundation.whatsapp_number) {
      const phone = foundation.whatsapp_number.replace(/\D/g, '')
      const message = encodeURIComponent(
        `¡Hola ${foundation.foundation_name}! 🐾\n\nLos contacto desde Paws Pasto Adopciones. Me gustaría hacer una donación para apoyar su labor. ¿Me pueden indicar cómo puedo colaborar?`
      )
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Header con logo */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {foundation.logo_url ? (
              <img 
                src={foundation.logo_url} 
                alt={foundation.foundation_name}
                className="w-16 h-16 rounded-xl object-cover shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-800 truncate">
                {foundation.foundation_name}
              </h3>
              {foundation.is_verified && (
                <div className="flex-shrink-0 p-1 bg-emerald-100 rounded-full" title="Fundación verificada">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span>📍</span> {foundation.location_city}
            </p>
            {foundation.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {foundation.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Acciones de donación */}
      <div className="px-6 pb-6 space-y-3">
        {/* Enlace de donación */}
        {hasDonationLink && (
          <a
            href={foundation.donation_link!}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl hover:border-pink-400 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Donar ahora</p>
                <p className="text-xs text-gray-500">Enlace oficial de donación</p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-pink-500 group-hover:translate-x-1 transition-transform" />
          </a>
        )}

        {/* WhatsApp */}
        {hasWhatsapp && (
          <button
            onClick={handleWhatsAppClick}
            className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:border-green-400 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800">Contactar por WhatsApp</p>
                <p className="text-xs text-gray-500">Pregunta cómo puedes ayudar</p>
              </div>
            </div>
            <Phone className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Si no tiene ningún canal */}
        {!hasDonationLink && !hasWhatsapp && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <p className="text-sm text-gray-500">
              Próximamente canales de donación disponibles
            </p>
          </div>
        )}

        {/* Ver perfil completo */}
        <Link
          to={`/fundaciones/${foundation.id}`}
          className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-xl transition-colors"
        >
          Ver perfil completo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}

export default function DonatePage() {
  const { foundations, loading, error } = useFoundations()
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar solo fundaciones verificadas con canales de donación
  const verifiedFoundations = foundations.filter(f => 
    f.is_verified && 
    f.foundation_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Decoraciones de fondo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-40 h-40 bg-yellow-200/30 rounded-full blur-2xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
                <HandHeart className="w-4 h-4" />
                Tu apoyo hace la diferencia
              </span>
            </motion.div>

            {/* Título */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-6"
            >
              Apoya a las{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                fundaciones
              </span>{" "}
              de Pasto
            </motion.h1>

            {/* Descripción */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Cada donación directa a las fundaciones aliadas ayuda a salvar vidas. 
              Aquí encontrarás los canales oficiales y verificados de cada organización.
            </motion.p>

            {/* Aviso importante */}
            <motion.div 
              variants={fadeInUp}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left max-w-xl mx-auto"
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Donaciones 100% directas y seguras
                  </h3>
                  <p className="text-sm text-amber-700">
                    <strong>Paws no recibe ni procesa dinero.</strong> Somos un puente de confianza 
                    que conecta donantes con fundaciones verificadas. Cada enlace te lleva 
                    directamente a los canales oficiales de cada organización.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Buscador */}
            <motion.div variants={fadeInUp} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar fundación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-full border-gray-200 shadow-lg focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sección de Fundaciones */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Estado de carga */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-pink-500 animate-spin mb-4" />
              <p className="text-gray-500">Cargando fundaciones...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-red-800 mb-2">Error al cargar</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Grid de fundaciones */}
          {!loading && !error && (
            <>
              {verifiedFoundations.length > 0 ? (
                <>
                  <div className="text-center mb-8">
                    <p className="text-gray-600">
                      <span className="font-semibold text-gray-800">{verifiedFoundations.length}</span>
                      {" "}fundaciones verificadas disponibles
                    </p>
                  </div>
                  
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {verifiedFoundations.map((foundation) => (
                      <DonationCard key={foundation.id} foundation={foundation} />
                    ))}
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <PawPrint className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm ? "No se encontraron fundaciones" : "Próximamente"}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchTerm 
                      ? "Intenta con otro término de búsqueda"
                      : "Estamos verificando fundaciones para que puedas donar con total confianza."
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Sección ¿Cómo funciona? */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-12">
              <span className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Transparencia total
              </span>
              <h2 className="text-3xl font-bold text-gray-800">
                ¿Cómo funcionan las donaciones?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Elige una fundación",
                  description: "Navega por el directorio de fundaciones verificadas y elige a quién apoyar.",
                  icon: Building2,
                  color: "cyan"
                },
                {
                  step: "2",
                  title: "Canal oficial",
                  description: "Usa el enlace de donación o WhatsApp. Estos son los canales oficiales de cada organización.",
                  icon: Shield,
                  color: "emerald"
                },
                {
                  step: "3",
                  title: "Donación directa",
                  description: "Tu donación llega 100% directa a la fundación. Paws no procesa ni retiene dinero.",
                  icon: Heart,
                  color: "pink"
                }
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={fadeInUp}
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                    item.color === 'cyan' ? 'bg-cyan-100' :
                    item.color === 'emerald' ? 'bg-emerald-100' : 'bg-pink-100'
                  }`}>
                    <item.icon className={`w-8 h-8 ${
                      item.color === 'cyan' ? 'text-cyan-600' :
                      item.color === 'emerald' ? 'text-emerald-600' : 'text-pink-600'
                    }`} />
                  </div>
                  <div className="text-sm font-bold text-gray-400 mb-2">Paso {item.step}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden"
          >
            {/* Decoraciones */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative">
              <Heart className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                ¿Eres una fundación de Pasto?
              </h2>
              <p className="text-white/90 mb-6">
                Únete a Paws para que más personas puedan apoyar tu labor. 
                Verificamos tu organización y te conectamos con donantes comprometidos.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 rounded-full px-8 font-semibold shadow-lg"
              >
                <Link to="/fundaciones">
                  Registrar mi fundación
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
