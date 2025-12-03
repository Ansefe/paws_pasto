import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Save, Globe, Mail, Phone, MapPin,
  Instagram, Facebook, FileText, Shield,
  AlertCircle, CheckCircle2, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSiteConfigContext } from "@/contexts/SiteConfigContext"
import type { SiteConfig } from "@/types/database.types"

type SettingsTab = "general" | "contact" | "social" | "legal"

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { config, isLoading, saveConfig } = useSiteConfigContext()

  // Estado local del formulario (inicializado con los valores de la DB)
  const [settings, setSettings] = useState<SiteConfig>(config)

  // Sincronizar cuando cambie la config de la DB
  useEffect(() => {
    setSettings(config)
  }, [config])

  const handleInputChange = (field: keyof SiteConfig, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    
    const { success, error } = await saveConfig(settings)
    
    setIsSaving(false)
    
    if (success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      setSaveError("Error al guardar la configuración. Verifica tu conexión.")
      console.error("Save error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    )
  }

  const tabs = [
    { id: "general" as const, label: "General", icon: Globe },
    { id: "contact" as const, label: "Contacto", icon: Mail },
    { id: "social" as const, label: "Redes Sociales", icon: Instagram },
    { id: "legal" as const, label: "Legal", icon: FileText },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
          <p className="text-gray-500">Gestiona la configuración del sitio</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl"
        >
          {isSaving ? (
            <motion.div
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Configuración guardada correctamente</span>
        </motion.div>
      )}

      {/* Error Message */}
      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{saveError}</span>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nombre del Sitio</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Descripción</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                className="rounded-xl min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">URL del Sitio</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="siteUrl"
                  value={settings.siteUrl}
                  onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Contact Settings */}
        {activeTab === "contact" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email de Contacto</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp (con código de país)</Label>
              <Input
                id="whatsapp"
                value={settings.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                placeholder="573001234567"
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">Ejemplo: 573001234567 (57 es Colombia)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="instagram"
                  value={settings.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
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
                  value={settings.facebook}
                  onChange={(e) => handleInputChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok (opcional)</Label>
              <Input
                id="tiktok"
                value={settings.tiktok}
                onChange={(e) => handleInputChange("tiktok", e.target.value)}
                placeholder="https://tiktok.com/@..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube (opcional)</Label>
              <Input
                id="youtube"
                value={settings.youtube}
                onChange={(e) => handleInputChange("youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Legal Settings */}
        {activeTab === "legal" && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800 font-medium">Importante</p>
                  <p className="text-sm text-amber-700">
                    Estos textos se mostrarán en las páginas de Términos y Condiciones y 
                    Política de Privacidad. Puedes usar formato Markdown.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Términos y Condiciones
              </Label>
              <Textarea
                id="terms"
                value={settings.termsAndConditions}
                onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                className="rounded-xl min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privacy" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Política de Privacidad
              </Label>
              <Textarea
                id="privacy"
                value={settings.privacyPolicy}
                onChange={(e) => handleInputChange("privacyPolicy", e.target.value)}
                className="rounded-xl min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
