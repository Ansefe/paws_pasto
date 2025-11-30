import { Link } from "react-router-dom"
import { PawPrint, Heart, Instagram, Facebook, Mail, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Fondo con gradiente suave */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />
      
      {/* Decoración */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      <div className="relative container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Hogar<span className="text-cyan-400">Peludo</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Conectando corazones peludos con familias amorosas en Pasto y Nariño. 
              Cada adopción es una nueva historia de amor. 💕
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-cyan-500 text-gray-400 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-blue-500 text-gray-400 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-800 hover:bg-pink-500 text-gray-400 hover:text-white transition-all">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-white font-semibold mb-6">Explora</h4>
            <ul className="space-y-3">
              {[
                { to: "/adoptar", label: "Adoptar Mascota" },
                { to: "/fundaciones", label: "Fundaciones" },
                { to: "/donar", label: "Hacer Donación" },
                { to: "/como-funciona", label: "Cómo Funciona" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-cyan-400 transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-cyan-400 mt-0.5" />
                <span className="text-gray-400">Pasto, Nariño, Colombia</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-cyan-400 mt-0.5" />
                <a href="mailto:contacto@hogarpeludo.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                  contacto@hogarpeludo.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-6">Únete a nuestra manada</h4>
            <p className="text-gray-400 text-sm mb-4">
              Recibe noticias sobre nuevas mascotas en adopción y eventos.
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Tu email" 
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-full focus:border-cyan-500"
              />
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full px-6">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} HogarPeludo. Hecho con 💙 para los peluditos.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/privacidad" className="text-gray-500 hover:text-gray-300 transition-colors">
              Privacidad
            </Link>
            <Link to="/terminos" className="text-gray-500 hover:text-gray-300 transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
