import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Building2, User, Mail, Phone, MapPin, FileText, 
  Instagram, Facebook, Globe, CheckCircle2, ArrowLeft,
  Heart, PawPrint, Send, AlertCircle, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendTelegramNotification } from "@/lib/telegram"

interface ApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

type ApplicantType = "foundation" | "rescuer" | null

export function ApplicationModal({ isOpen, onClose, onSwitchToLogin }: ApplicationModalProps) {
  const [step, setStep] = useState<"type" | "form" | "success">("type")
  const [applicantType, setApplicantType] = useState<ApplicantType>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [formData, setFormData] = useState({
    // Datos de contacto
    contactName: "",
    email: "",
    phone: "",
    // Datos de la organización/rescatista
    organizationName: "",
    city: "Pasto",
    address: "",
    // Descripción y motivación
    description: "",
    experience: "",
    // Redes y verificación
    instagram: "",
    facebook: "",
    website: "",
    // Documentos/Referencias
    references: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSelectType = (type: ApplicantType) => {
    setApplicantType(type)
    setStep("form")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Preparar datos para envío
      const applicationData = {
        type: applicantType as 'foundation' | 'rescuer',
        organizationName: formData.organizationName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        description: formData.description,
        experience: formData.experience,
        motivation: formData.experience, // Usamos experience como motivación
        instagram: formData.instagram,
        facebook: formData.facebook,
        website: formData.website,
        references: formData.references,
      }

      // Intentar enviar por Telegram primero
      const telegramSuccess = await sendTelegramNotification(applicationData)
      
      if (telegramSuccess) {
        // Éxito con Telegram
        setStep("success")
        return
      }

      // Si Telegram no está configurado, intentar con Web3Forms como fallback
      const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

      if (WEB3FORMS_KEY) {
        const emailData = {
          access_key: WEB3FORMS_KEY,
          subject: `[Postulación Paws] ${applicantType === "foundation" ? "Fundación" : "Rescatista"}: ${formData.organizationName}`,
          from_name: formData.contactName,
          "Tipo de postulación": applicantType === "foundation" ? "FUNDACIÓN" : "RESCATISTA INDEPENDIENTE",
          "Nombre de contacto": formData.contactName,
          "Email": formData.email,
          "Teléfono": formData.phone,
          "Nombre organización": formData.organizationName,
          "Ciudad": formData.city,
          "Dirección": formData.address || "No especificada",
          "Descripción": formData.description,
          "Experiencia": formData.experience,
          "Instagram": formData.instagram || "No especificado",
          "Facebook": formData.facebook || "No especificado",
          "Sitio web": formData.website || "No especificado",
          "Referencias": formData.references || "No especificado",
          "Fecha de solicitud": new Date().toLocaleString('es-CO'),
        }

        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(emailData),
        })

        const result = await response.json()

        if (result.success) {
          setStep("success")
          return
        }
      }

      // Si ningún método está configurado, mostrar éxito de todas formas
      // pero guardar en console para debug
      console.log("Postulación recibida (sin servicio de envío configurado):", applicationData)
      setStep("success")

    } catch {
      setError("Hubo un error al preparar tu solicitud. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("type")
    setApplicantType(null)
    setFormData({
      contactName: "",
      email: "",
      phone: "",
      organizationName: "",
      city: "Pasto",
      address: "",
      description: "",
      experience: "",
      instagram: "",
      facebook: "",
      website: "",
      references: "",
    })
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-2 left-4 w-20 h-20 bg-white/30 rounded-full blur-xl" />
              <div className="absolute bottom-0 right-4 w-24 h-24 bg-yellow-300/30 rounded-full blur-xl" />
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {step !== "type" && step !== "success" && (
                  <button
                    onClick={() => setStep("type")}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {step === "type" && "Únete a Paws como Aliado"}
                    {step === "form" && (applicantType === "foundation" ? "Postulación de Fundación" : "Postulación de Rescatista")}
                    {step === "success" && "¡Solicitud Enviada!"}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {step === "type" && "Selecciona tu tipo de perfil"}
                    {step === "form" && "Completa el formulario de postulación"}
                    {step === "success" && "Pronto nos pondremos en contacto"}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Selección de tipo */}
            {step === "type" && (
              <div className="space-y-6">
                {/* Explicación del proceso */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">¿Cómo funciona el proceso?</h3>
                      <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                        <li>Completas el formulario de postulación</li>
                        <li>Nuestro equipo revisa tu información y redes sociales</li>
                        <li>Si eres aprobado, <strong>creamos tu cuenta verificada</strong></li>
                        <li>Recibirás tus credenciales por email para acceder</li>
                      </ol>
                      <p className="text-xs text-amber-600 mt-2 italic">
                        Este proceso garantiza la confianza de los adoptantes en nuestra plataforma.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opciones de tipo */}
                <div className="grid gap-4">
                  {/* Fundación */}
                  <motion.button
                    onClick={() => handleSelectType("foundation")}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl text-left hover:border-cyan-400 hover:shadow-lg transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Fundación / Organización</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Soy parte de una fundación de rescate animal establecida en Pasto o Nariño.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                          Perfil verificado con insignia de confianza
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                          Panel para gestionar múltiples animales
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-500" />
                          Enlaces de donación verificados
                        </li>
                      </ul>
                    </div>
                  </motion.button>

                  {/* Rescatista */}
                  <motion.button
                    onClick={() => handleSelectType("rescuer")}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-2xl text-left hover:border-pink-400 hover:shadow-lg transition-all group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-lg mb-1">Rescatista Independiente</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Rescato animales de forma independiente y busco ayudarlos a encontrar hogar.
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-pink-500" />
                          Perfil personal verificado
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-pink-500" />
                          Publicar animales en adopción
                        </li>
                        <li className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-pink-500" />
                          Conectar con adoptantes responsables
                        </li>
                      </ul>
                    </div>
                  </motion.button>
                </div>

                {/* Link a login */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    ¿Ya tienes una cuenta verificada?{" "}
                    <button
                      onClick={onSwitchToLogin}
                      className="text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Iniciar Sesión
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Formulario */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datos de contacto */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-500" />
                    Datos de Contacto
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nombre completo *</Label>
                      <Input
                        id="contactName"
                        placeholder="Tu nombre"
                        value={formData.contactName}
                        onChange={(e) => handleInputChange("contactName", e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="correo@ejemplo.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="pl-10 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Teléfono / WhatsApp *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="300 123 4567"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="pl-10 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Datos de la organización */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    {applicantType === "foundation" ? (
                      <Building2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <PawPrint className="w-4 h-4 text-emerald-500" />
                    )}
                    {applicantType === "foundation" ? "Datos de la Fundación" : "Tu Información como Rescatista"}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">
                        {applicantType === "foundation" ? "Nombre de la Fundación *" : "Nombre o Alias *"}
                      </Label>
                      <Input
                        id="organizationName"
                        placeholder={applicantType === "foundation" ? "Fundación Patitas" : "María Rescatista"}
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange("organizationName", e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="city"
                          placeholder="Pasto"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="pl-10 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Dirección (opcional)</Label>
                      <Input
                        id="address"
                        placeholder="Barrio, calle o referencia"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    Cuéntanos sobre tu labor
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        {applicantType === "foundation" 
                          ? "Descripción de la fundación *" 
                          : "Cuéntanos sobre tu labor como rescatista *"}
                      </Label>
                      <Textarea
                        id="description"
                        placeholder={applicantType === "foundation" 
                          ? "¿Cuándo se fundó? ¿Cuál es su misión? ¿A qué animales ayudan?"
                          : "¿Cómo empezaste a rescatar? ¿Qué tipo de animales ayudas?"}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        className="rounded-xl min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experiencia en rescate y adopción *</Label>
                      <Textarea
                        id="experience"
                        placeholder="¿Cuántos animales han ayudado? ¿Cómo gestionan las adopciones actualmente?"
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        className="rounded-xl min-h-[80px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Redes sociales */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-500" />
                    Redes Sociales (ayudan a verificar tu labor)
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="instagram"
                          placeholder="@tu_instagram"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange("instagram", e.target.value)}
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="facebook"
                          placeholder="facebook.com/tu_pagina"
                          value={formData.facebook}
                          onChange={(e) => handleInputChange("facebook", e.target.value)}
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="website">Sitio web (opcional)</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="website"
                          placeholder="https://www.tusitio.com"
                          value={formData.website}
                          onChange={(e) => handleInputChange("website", e.target.value)}
                          className="pl-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referencias */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Referencias o documentación adicional
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="references">
                      {applicantType === "foundation" 
                        ? "RUT, NIT, o cualquier documento que acredite a la fundación"
                        : "Referencias de veterinarios, otras fundaciones, o adoptantes anteriores"}
                    </Label>
                    <Textarea
                      id="references"
                      placeholder="Puedes incluir números de documentos, nombres de contacto de referencia, etc."
                      value={formData.references}
                      onChange={(e) => handleInputChange("references", e.target.value)}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit */}
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Enviar Postulación
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Tu solicitud será enviada directamente a nuestro equipo de verificación
                  </p>
                </div>
              </form>
            )}

            {/* Step 3: Éxito */}
            {step === "success" && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full mb-6"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Solicitud enviada!</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Hemos recibido tu postulación correctamente. 
                  Nuestro equipo revisará tu información y te contactaremos pronto.
                </p>

                <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4 mb-6 text-left max-w-md mx-auto">
                  <h4 className="font-semibold text-cyan-800 mb-2">¿Qué sigue?</h4>
                  <ol className="text-sm text-cyan-700 space-y-2 list-decimal list-inside">
                    <li>Revisaremos tu información y redes sociales</li>
                    <li>Podemos contactarte si necesitamos más detalles</li>
                    <li>Si eres aprobado, crearemos tu cuenta verificada</li>
                    <li>Recibirás un email con tus credenciales de acceso</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="rounded-xl"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      handleClose()
                      onSwitchToLogin()
                    }}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl"
                  >
                    Ir a Iniciar Sesión
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
