import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User, PawPrint, Eye, EyeOff, Building2, UserPlus, ArrowRight, Info, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/AuthContext"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToApplication: () => void
}

export function LoginModal({ isOpen, onClose, onSwitchToApplication }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const isRegister = mode === "register"

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const resetForm = () => {
    setError(null)
    setSuccess(false)
    setPassword("")
  }

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"))
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isRegister) {
        // Registro de adoptante. El trigger crea el perfil con rol 'adopter'.
        const { error: signUpError } = await signUp(email, password, fullName)
        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }
        // Intentar iniciar sesión de inmediato (si no requiere confirmación por email).
        const { error: signInError } = await signIn(email, password)
        setSuccess(true)
        setTimeout(() => {
          onClose()
          if (signInError) {
            // Probablemente requiere confirmación por email; no redirigimos.
          } else {
            navigate("/perfil")
          }
        }, 1500)
        return
      }

      const { error: signInError, profile } = await signIn(email, password)

      if (signInError) {
        setError(signInError.message === "Invalid login credentials"
          ? "Credenciales inválidas. Verifica tu email y contraseña."
          : signInError.message)
        setIsLoading(false)
        return
      }

      setSuccess(true)

      // Esperar un momento y luego cerrar/redirigir
      setTimeout(() => {
        onClose()
        // Si es admin, redirigir al panel
        if (profile?.role === 'admin') {
          navigate('/admin')
        }
      }, 1500)
    } catch (err) {
      console.error('[LOGIN] Exception:', err)
      setError("Error al procesar la solicitud. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const modalContent = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      
      {/* Container centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header decorativo */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-16 h-16 bg-white/30 rounded-full blur-xl" />
              <div className="absolute bottom-2 right-8 w-20 h-20 bg-yellow-300/30 rounded-full blur-xl" />
            </div>
            <motion.div
              className="relative inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <PawPrint className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {isRegister ? "Crea tu cuenta" : "¡Bienvenido de vuelta!"}
            </h2>
            <p className="text-white/80 text-sm">
              {isRegister ? "Únete a Paws para guardar favoritos y presumir tus adopciones" : "Inicia sesión en tu cuenta de Paws"}
            </p>
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Tu nombre"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10 h-12 rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-cyan-500 focus:ring-cyan-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  ¡Bienvenido! Redirigiendo...
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all"
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  isRegister ? "Crear cuenta" : "Iniciar Sesión"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  {isRegister ? "Inicia sesión" : "Regístrate"}
                </button>
              </div>
            </form>

            {/* Separador */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">¿Eres fundación o rescatista?</span>
              </div>
            </div>

            {/* CTA para postularse */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">¿Quieres unirte como aliado?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Las fundaciones y rescatistas deben postularse. Nuestro equipo revisará tu solicitud y creará tu cuenta verificada.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSwitchToApplication}
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 rounded-xl flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Postularme como Fundación/Rescatista
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Nota:</strong> Los visitantes pueden navegar libremente sin cuenta. 
                Solo necesitas iniciar sesión para guardar favoritos o gestionar tu fundación.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )

  return createPortal(
    <AnimatePresence>{modalContent}</AnimatePresence>,
    document.body
  )
}
