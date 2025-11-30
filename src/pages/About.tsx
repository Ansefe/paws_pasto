import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Heart, 
  Shield, 
  Users, 
  PawPrint, 
  Target, 
  Sparkles,
  Building2,
  UserCheck,
  HandHeart,
  CheckCircle2,
  ArrowRight,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// Secciones de navegación
const sections = [
  { id: "mision", label: "Nuestra Misión", icon: Target },
  { id: "por-que", label: "¿Por qué HogarPeludo?", icon: Sparkles },
  { id: "como-funciona", label: "¿Cómo Funciona?", icon: PawPrint },
  { id: "fundaciones", label: "Para Fundaciones", icon: Building2 },
  { id: "adoptantes", label: "Para Adoptantes", icon: UserCheck },
  { id: "valores", label: "Nuestros Valores", icon: Heart },
]

// Animación de entrada
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export function AboutPage() {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState("mision")

  // Detectar hash en URL y scroll a la sección
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace("#", "")
      const element = document.getElementById(sectionId)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }, 100)
      }
    }
  }, [location.hash])

  // Observar secciones para actualizar navegación activa
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    )

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero pequeño */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-brand-sky-50 via-white to-brand-yellow-50">
        <div className="container px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-sky-100 text-brand-sky-700 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              Conócenos
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Conectamos corazones peludos con{" "}
              <span className="text-brand-sky">familias amorosas</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              HogarPeludo es el punto de referencia confiable para la adopción responsable 
              de mascotas en Pasto, Nariño. Somos el puente entre fundaciones, rescatistas 
              y personas dispuestas a dar un hogar.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Layout con navegación lateral */}
      <div className="container px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Navegación lateral sticky */}
          <aside className="lg:w-64 shrink-0">
            <nav className="lg:sticky lg:top-28 space-y-1 bg-gray-50/50 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                En esta página
              </p>
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                    activeSection === id
                      ? "bg-brand-sky text-white shadow-md shadow-brand-sky/25"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 max-w-3xl">
            
            {/* SECCIÓN: Nuestra Misión */}
            <section id="mision" className="scroll-mt-28 mb-20">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-brand-sky-100 rounded-2xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-brand-sky" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Nuestra Misión</h2>
                </div>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  <strong className="text-gray-900">HogarPeludo</strong> nace con el objetivo de 
                  centralizar, dignificar y acelerar el proceso de adopción de animales de compañía 
                  en <strong className="text-gray-900">Pasto, Colombia</strong>.
                </p>

                <div className="grid gap-4">
                  {[
                    {
                      icon: PawPrint,
                      title: "Para los Animales",
                      description: "Darles visibilidad a través de perfiles dignos y emotivos para reducir sus tiempos de estancia en refugios.",
                      color: "brand-sky"
                    },
                    {
                      icon: Building2,
                      title: "Para las Fundaciones",
                      description: "Proveer herramientas digitales gratuitas para gestionar sus rescatados y un canal validado para recibir donaciones.",
                      color: "brand-mint"
                    },
                    {
                      icon: Users,
                      title: "Para la Comunidad",
                      description: "Ser el punto de referencia confiable, tierno y alegre para encontrar un nuevo miembro de la familia.",
                      color: "brand-yellow"
                    }
                  ].map((item, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="flex gap-4 p-5">
                        <div className={`w-10 h-10 bg-${item.color}-100 rounded-xl flex items-center justify-center shrink-0`}>
                          <item.icon className={`w-5 h-5 text-${item.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* SECCIÓN: ¿Por qué HogarPeludo? */}
            <section id="por-que" className="scroll-mt-28 mb-20">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-brand-yellow-100 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-yellow-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">¿Por qué HogarPeludo?</h2>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  La plataforma busca resolver la <strong className="text-gray-900">desconexión existente</strong> entre 
                  las fundaciones locales que están saturadas, los animales invisibles que necesitan un hogar, 
                  y las personas dispuestas a adoptar o donar pero que no saben dónde acudir con confianza.
                </p>

                <div className="bg-gradient-to-br from-brand-sky-50 to-brand-mint-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-sky" />
                    Enfoque Hiper-local
                  </h3>
                  <p className="text-gray-600">
                    Nos enfocamos específicamente en <strong>Pasto y Nariño</strong> para garantizar que las 
                    adopciones y el apoyo sean logísticamente viables y fomenten la comunidad local. 
                    No somos un catálogo genérico, somos la solución de nuestra ciudad.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-brand-yellow-50 to-brand-coral-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-brand-coral" />
                    Enfoque en la Esperanza
                  </h3>
                  <p className="text-gray-600">
                    Nos alejamos de la estética triste o excesivamente urgente. HogarPeludo se enfoca en la 
                    <strong> esperanza, la alegría de una nueva vida y la confianza</strong>. 
                    Nuestro tono es cercano, tierno y optimista.
                  </p>
                </div>
              </motion.div>
            </section>

            {/* SECCIÓN: ¿Cómo Funciona? */}
            <section id="como-funciona" className="scroll-mt-28 mb-20">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-brand-mint-100 rounded-2xl flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-brand-mint-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">¿Cómo Funciona?</h2>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  El proceso de adopción está diseñado para equilibrar la <strong className="text-gray-900">velocidad 
                  de contacto</strong> con la necesidad de formalidad. Ofrecemos dos caminos claros.
                </p>

                <div className="space-y-6">
                  {/* Paso 1 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-brand-sky rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Descubrimiento</h3>
                      <p className="text-gray-600">
                        Navega libremente por el catálogo, usa filtros por especie, tamaño, edad y encuentra 
                        a tu compañero ideal.
                      </p>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-brand-sky rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Conexión Emocional</h3>
                      <p className="text-gray-600">
                        Entra al perfil de cada mascota, conoce su historia, ve sus fotos y enamórate de su personalidad.
                      </p>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-brand-sky rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contacto (Doble Vía)</h3>
                      <div className="grid sm:grid-cols-2 gap-4 mt-3">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="font-medium text-green-800 mb-1">📱 Vía Rápida</p>
                          <p className="text-green-700 text-sm">
                            Contacta directamente por WhatsApp a la fundación. Inmediatez para quienes buscan agilidad.
                          </p>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <p className="font-medium text-blue-800 mb-1">📋 Vía Formal</p>
                          <p className="text-blue-700 text-sm">
                            Inicia el proceso dentro de la plataforma. Requiere registro y permite seguimiento ordenado.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* SECCIÓN: Para Fundaciones */}
            <section id="fundaciones" className="scroll-mt-28 mb-20">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Para Fundaciones</h2>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Si rescatas animales en Pasto, HogarPeludo te ofrece <strong className="text-gray-900">herramientas 
                  gratuitas</strong> para dar visibilidad a tus peluditos y recibir donaciones de forma segura.
                </p>

                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-8">
                  <h3 className="font-semibold text-xl mb-4">¿Qué obtienes?</h3>
                  <ul className="space-y-3">
                    {[
                      "Panel privado para gestionar perfiles de tus animales",
                      "Perfil público verificado con insignia de confianza",
                      "Enlaces de donación validados (Nequi, Daviplata, etc.)",
                      "Notificaciones de solicitudes de adopción",
                      "Estadísticas de visitas e interacciones"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Proceso de Verificación
                  </h4>
                  <p className="text-amber-700 text-sm mb-4">
                    Para garantizar la confianza de los adoptantes, todas las fundaciones pasan por un proceso 
                    de verificación manual antes de poder publicar.
                  </p>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    Solicitar Verificación
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            </section>

            {/* SECCIÓN: Para Adoptantes */}
            <section id="adoptantes" className="scroll-mt-28 mb-20">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-pink-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Para Adoptantes</h2>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                  Queremos que tu experiencia buscando un compañero peludo sea <strong className="text-gray-900">fácil, 
                  segura y emocionante</strong>. Sin barreras innecesarias.
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {[
                    {
                      title: "Sin registro obligatorio",
                      description: "Navega todo el catálogo libremente. Solo necesitas cuenta para guardar favoritos.",
                      icon: "🔓"
                    },
                    {
                      title: "Fundaciones verificadas",
                      description: "Todas las organizaciones han sido validadas. Adoptas con confianza.",
                      icon: "✅"
                    },
                    {
                      title: "Contacto directo",
                      description: "Habla directamente con la fundación por WhatsApp si prefieres inmediatez.",
                      icon: "💬"
                    },
                    {
                      title: "Historias reales",
                      description: "Conoce la historia de cada mascota para conectar emocionalmente.",
                      icon: "📖"
                    }
                  ].map((item, index) => (
                    <Card key={index} className="border-none shadow-sm">
                      <CardContent className="p-5">
                        <span className="text-3xl mb-3 block">{item.icon}</span>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Link to="/adoptar">
                  <Button size="lg" className="bg-brand-sky hover:bg-brand-sky-600 text-white rounded-full px-8">
                    <PawPrint className="w-5 h-5 mr-2" />
                    Explorar Mascotas
                  </Button>
                </Link>
              </motion.div>
            </section>

            {/* SECCIÓN: Nuestros Valores */}
            <section id="valores" className="scroll-mt-28 mb-20">
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-brand-coral-100 rounded-2xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-brand-coral" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Nuestros Valores</h2>
                </div>

                <div className="grid gap-4">
                  {[
                    {
                      value: "Confianza",
                      description: "Cada fundación es verificada. Cada donación va a donde debe ir.",
                      color: "bg-blue-50 border-blue-200"
                    },
                    {
                      value: "Transparencia",
                      description: "Sin costos ocultos. Los procesos son claros para todos los actores.",
                      color: "bg-green-50 border-green-200"
                    },
                    {
                      value: "Esperanza",
                      description: "Enfocados en la alegría de un nuevo comienzo, no en la tristeza.",
                      color: "bg-yellow-50 border-yellow-200"
                    },
                    {
                      value: "Comunidad",
                      description: "Construimos una red local de apoyo mutuo por los animales de Pasto.",
                      color: "bg-purple-50 border-purple-200"
                    }
                  ].map((item, index) => (
                    <div key={index} className={`${item.color} border rounded-xl p-5`}>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.value}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* CTA Final */}
            <section className="bg-gradient-to-br from-brand-sky to-blue-600 rounded-3xl p-8 text-center text-white">
              <HandHeart className="w-12 h-12 mx-auto mb-4 text-white/80" />
              <h2 className="text-2xl font-bold mb-3">¿Listo para encontrar a tu compañero?</h2>
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                Miles de peluditos en Pasto esperan por una familia como la tuya.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/adoptar">
                  <Button size="lg" className="bg-white text-brand-sky hover:bg-gray-100 rounded-full px-8 font-semibold">
                    Ver Mascotas
                  </Button>
                </Link>
                <Link to="/fundaciones">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8">
                    Ver Fundaciones
                  </Button>
                </Link>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  )
}
