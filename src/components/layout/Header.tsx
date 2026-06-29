import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, Heart, PawPrint, User, LogOut, LayoutDashboard } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { LoginModal } from "@/components/auth/LoginModal"
import { ApplicationModal } from "@/components/auth/ApplicationModal"
import { useFavorites } from "@/hooks/useFavorites"
import { useAuth } from "@/contexts/AuthContext"

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/adoptar", label: "Adoptar" },
  { to: "/fundaciones", label: "Fundaciones" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/donar", label: "Donar" },
]

export function Header() {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const [scrolled, setScrolled] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const { count: favoritesCount } = useFavorites()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName = profile?.full_name || user?.email || "Mi cuenta"
  const initial = (profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()
  const isAdmin = profile?.role === "admin"
  const isFoundation = profile?.role === "foundation"

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // El header es transparente solo en home Y cuando no se ha hecho scroll
  const isTransparent = isHome && !scrolled

  return (
    <motion.header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 border-b ${
        isTransparent 
          ? "bg-transparent border-transparent" 
          : "bg-white/95 backdrop-blur-lg border-gray-200/50 shadow-sm"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            className="relative"
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <div className={`w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center transition-shadow ${
              isTransparent ? "shadow-[0_4px_12px_rgba(0,0,0,0.3)] group-hover:shadow-cyan-300/50" : "shadow-lg group-hover:shadow-cyan-300/50"
            }`}>
              <PawPrint className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <span className={`text-xl font-bold transition-colors ${
            isTransparent 
              ? "text-white [text-shadow:_0_1px_3px_rgb(0_0_0_/_60%),_0_2px_8px_rgb(0_0_0_/_40%)]" 
              : "text-gray-800"
          }`}>
            Paws<span className={isTransparent ? "text-brand-yellow [text-shadow:_0_1px_3px_rgb(0_0_0_/_50%)]" : "text-brand-sky"}>.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {/* Contenedor con efecto cristal solo cuando es transparente */}
          <div className={`flex items-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-300 ${
            isTransparent 
              ? "bg-black/20 backdrop-blur-md border border-white/10 shadow-lg" 
              : ""
          }`}>
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
                  isTransparent 
                    ? "text-white hover:text-white hover:bg-white/20" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="ml-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={`relative rounded-full ${
                isTransparent
                  ? "text-white hover:bg-white/20 [filter:_drop-shadow(0_1px_2px_rgb(0_0_0_/_50%))]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Link to="/favoritos" aria-label="Mis favoritos">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-bold flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                    {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                  </div>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/admin")}>
                      <LayoutDashboard className="w-4 h-4" /> Panel admin
                    </DropdownMenuItem>
                  )}
                  {isFoundation && (
                    <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/fundacion")}>
                      <LayoutDashboard className="w-4 h-4" /> Mi panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/perfil")}>
                    <User className="w-4 h-4" /> Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate("/favoritos")}>
                    <Heart className="w-4 h-4" /> Mis favoritos
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 cursor-pointer text-red-600" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium px-6 rounded-full shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all"
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              className={`rounded-full ${
                isTransparent ? "text-white hover:bg-white/10" : ""
              }`}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-white" />
                </div>
                <span>Paws</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t my-4" />
              <Button
                variant="ghost"
                asChild
                className="justify-start gap-3 px-4 py-3 h-auto font-medium"
              >
                <Link to="/favoritos">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Mis Favoritos
                  {favoritesCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
              </Button>
              {user ? (
                <>
                  {isAdmin && (
                    <Button variant="ghost" asChild className="justify-start gap-3 px-4 py-3 h-auto font-medium">
                      <Link to="/admin">
                        <LayoutDashboard className="h-5 w-5 text-cyan-600" /> Panel admin
                      </Link>
                    </Button>
                  )}
                  {isFoundation && (
                    <Button variant="ghost" asChild className="justify-start gap-3 px-4 py-3 h-auto font-medium">
                      <Link to="/fundacion">
                        <LayoutDashboard className="h-5 w-5 text-emerald-600" /> Mi panel
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" asChild className="justify-start gap-3 px-4 py-3 h-auto font-medium">
                    <Link to="/perfil">
                      <User className="h-5 w-5 text-gray-600" /> Mi perfil
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="justify-start gap-3 px-4 py-3 h-auto font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" /> Cerrar sesión
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-medium rounded-xl h-12"
                >
                  Iniciar Sesión
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Modales de autenticación */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToApplication={() => {
          setShowLoginModal(false)
          setShowApplicationModal(true)
        }}
      />
      <ApplicationModal 
        isOpen={showApplicationModal} 
        onClose={() => setShowApplicationModal(false)}
        onSwitchToLogin={() => {
          setShowApplicationModal(false)
          setShowLoginModal(true)
        }}
      />
    </motion.header>
  )
}
