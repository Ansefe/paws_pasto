import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Heart, Home, Users, Search, ArrowRight, Sparkles, PawPrint } from "lucide-react"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleIn = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: 0.5 }
}

// Posiciones pre-calculadas para las patitas decorativas
const pawPositions = [
  { top: '10%', left: '5%', delay: '0s', rotate: '15deg', size: 32 },
  { top: '20%', left: '85%', delay: '0.5s', rotate: '45deg', size: 28 },
  { top: '35%', left: '15%', delay: '1s', rotate: '-20deg', size: 40 },
  { top: '45%', left: '90%', delay: '1.5s', rotate: '60deg', size: 35 },
  { top: '60%', left: '8%', delay: '2s', rotate: '-45deg', size: 30 },
  { top: '70%', left: '80%', delay: '2.5s', rotate: '30deg', size: 38 },
  { top: '80%', left: '20%', delay: '0.3s', rotate: '-10deg', size: 33 },
  { top: '15%', left: '45%', delay: '1.2s', rotate: '75deg', size: 26 },
  { top: '85%', left: '70%', delay: '0.8s', rotate: '-55deg', size: 42 },
  { top: '50%', left: '3%', delay: '1.8s', rotate: '25deg', size: 29 },
  { top: '25%', left: '65%', delay: '2.2s', rotate: '-35deg', size: 36 },
  { top: '75%', left: '50%', delay: '0.6s', rotate: '50deg', size: 31 },
]

export function HomePage() {
  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section - Gradiente vibrante */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600" />
        
        {/* Formas decorativas flotantes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-300/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl animate-pulse-soft" />
        </div>

        {/* Patrones de patitas decorativas */}
        <div className="absolute inset-0 opacity-10">
          {pawPositions.map((paw, i) => (
            <PawPrint 
              key={i}
              className="absolute text-white animate-bounce-slow"
              style={{
                top: paw.top,
                left: paw.left,
                animationDelay: paw.delay,
                transform: `rotate(${paw.rotate})`
              }}
              size={paw.size}
            />
          ))}
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white/90 text-sm font-medium">Pasto Adopciones</span>
            </motion.div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Encuentra a tu
            <br />
            <span className="relative">
              <span className="relative z-10">compañero</span>
              <motion.span 
                className="absolute -bottom-2 left-0 right-0 h-4 bg-yellow-400/60 -z-0 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              />
            </span>
            {" "}peludo 🐾
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Conectamos animales que buscan hogar con familias llenas de amor en Pasto y Nariño.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-lg px-8 py-6 rounded-full shadow-lg shadow-yellow-400/30 hover:shadow-xl hover:shadow-yellow-400/40 transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/adoptar" className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Ver Mascotas en Adopción
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white/50 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/fundaciones">Conoce las Fundaciones</Link>
            </Button>
          </motion.div>

          {/* Stats rápidos */}
          <motion.div 
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { number: "500+", label: "Adoptados" },
              { number: "25+", label: "Fundaciones" },
              { number: "1.2k", label: "Familias felices" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">{stat.number}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Ola decorativa inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="hsl(var(--background))" 
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section - Cards modernas con hover effects */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block bg-primary/10 text-primary font-medium px-4 py-1 rounded-full text-sm mb-4">
              ¿Por qué elegirnos?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Adopción <span className="text-primary">fácil</span> y <span className="text-emerald-500">segura</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Hacemos que encontrar a tu nuevo mejor amigo sea una experiencia increíble
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Heart,
                title: "Adopción Responsable",
                description: "Conectamos directamente con fundaciones verificadas para garantizar el bienestar de cada animal.",
                gradient: "from-pink-500 to-rose-500",
                bgColor: "bg-pink-50",
                iconBg: "bg-gradient-to-br from-pink-500 to-rose-500"
              },
              {
                icon: Home,
                title: "Proceso Simple",
                description: "Inicia el proceso de adopción en minutos o contacta directamente por WhatsApp.",
                gradient: "from-cyan-500 to-blue-500",
                bgColor: "bg-cyan-50",
                iconBg: "bg-gradient-to-br from-cyan-500 to-blue-500"
              },
              {
                icon: Users,
                title: "Comunidad Local",
                description: "Enfocados en Pasto y Nariño para facilitar el seguimiento post-adopción.",
                gradient: "from-green-500 to-emerald-500",
                bgColor: "bg-green-50",
                iconBg: "bg-gradient-to-br from-green-500 to-emerald-500"
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group"
              >
                <div className={`${feature.bgColor} rounded-3xl p-8 h-full border border-transparent hover:border-gray-200 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50`}>
                  <div className={`${feature.iconBg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mascotas destacadas - Preview */}
      <section className="py-24 px-4 bg-gradient-to-b from-background via-primary/5 to-background">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block bg-yellow-400/20 text-yellow-700 font-medium px-4 py-1 rounded-full text-sm mb-4">
              ✨ Esperando por ti
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Conoce a nuestros <span className="text-primary">peluditos</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Estos adorables amigos están buscando una familia que los llene de amor
            </p>
          </motion.div>

          {/* Grid de mascotas placeholder */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { name: "Luna", type: "Perrita", age: "2 años", emoji: "🐕" },
              { name: "Michi", type: "Gatito", age: "1 año", emoji: "🐈" },
              { name: "Rocky", type: "Perrito", age: "3 años", emoji: "🐕‍🦺" },
              { name: "Nala", type: "Gatita", age: "6 meses", emoji: "😺" },
            ].map((pet, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                    {pet.emoji}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{pet.name}</h3>
                        <p className="text-muted-foreground text-sm">{pet.type} • {pet.age}</p>
                      </div>
                      <button className="p-2 rounded-full hover:bg-pink-50 transition-colors group/heart">
                        <Heart className="w-5 h-5 text-gray-400 group-hover/heart:text-pink-500 group-hover/heart:fill-pink-500 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-600/90 text-white font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link to="/adoptar" className="flex items-center gap-2">
                Ver todas las mascotas
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Fundaciones */}
      <section className="py-24 px-4 relative overflow-hidden">
        {/* Fondo con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600" />
        
        {/* Decoración */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-white/90 text-sm font-medium">Para fundaciones y rescatistas</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Rescatas animales? 
              <br />
              <span className="text-yellow-300">Únete a Paws</span>
            </h2>
            
            <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
              Dale visibilidad a los animales que rescatas y conecta con familias 
              comprometidas con la adopción responsable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Registra tu Fundación
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10 font-semibold text-lg px-8 py-6 rounded-full transition-all duration-300"
                asChild
              >
                <Link to="/nosotros#fundaciones">
                  Conocer más
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonios / Social proof */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="inline-block bg-pink-100 text-pink-600 font-medium px-4 py-1 rounded-full text-sm mb-4">
              💕 Historias de amor
            </span>
            <h2 className="text-4xl md:text-5xl font-bold">
              Familias <span className="text-pink-500">felices</span>
            </h2>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { 
                quote: "Adoptar a Luna fue la mejor decisión. El proceso fue súper fácil y rápido.", 
                name: "María García", 
                pet: "Adoptó a Luna 🐕",
                bg: "bg-gradient-to-br from-pink-50 to-rose-50"
              },
              { 
                quote: "Gracias a Paws encontramos a nuestro Michi. ¡No podemos estar más felices!", 
                name: "Carlos Muñoz", 
                pet: "Adoptó a Michi 🐈",
                bg: "bg-gradient-to-br from-cyan-50 to-blue-50"
              },
              { 
                quote: "Increíble plataforma. Conecté con la fundación en minutos y ahora Rocky es parte de mi familia.", 
                name: "Andrea López", 
                pet: "Adoptó a Rocky 🐕",
                bg: "bg-gradient-to-br from-green-50 to-emerald-50"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -5 }}
                className={`${testimonial.bg} rounded-3xl p-8 border border-gray-100`}
              >
                <div className="text-4xl mb-4">❝</div>
                <p className="text-gray-700 mb-6 leading-relaxed">{testimonial.quote}</p>
                <div>
                  <div className="font-bold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.pet}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
