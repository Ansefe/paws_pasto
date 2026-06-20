import { X, Building2, MapPin, Phone, Mail, Instagram, Facebook, Globe, Heart, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FoundationWithPetCount } from "@/types/database.types"

interface FoundationDetailsModalProps {
  foundation: FoundationWithPetCount | null
  isOpen: boolean
  onClose: () => void
}

function Row({ icon: Icon, label, value, href }: { icon: typeof Phone; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <span className="text-gray-500">{label}:</span>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline break-all">{value}</a>
      ) : (
        <span className="text-gray-700 break-all">{value}</span>
      )}
    </div>
  )
}

export function FoundationDetailsModal({ foundation, isOpen, onClose }: FoundationDetailsModalProps) {
  if (!isOpen || !foundation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Detalles de la fundación</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Logo + nombre */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
              {foundation.logo_url ? (
                <img src={foundation.logo_url} alt={foundation.foundation_name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{foundation.foundation_name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-3 h-3" /> {foundation.location_city}
              </div>
              <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                foundation.is_verified ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
              }`}>
                {foundation.is_verified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {foundation.is_verified ? "Verificada" : "Pendiente"}
              </span>
            </div>
          </div>

          {/* Descripción */}
          {foundation.description && (
            <p className="text-sm text-gray-600 whitespace-pre-line">{foundation.description}</p>
          )}

          {/* Mascotas */}
          <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
            <Heart className="w-4 h-4 text-pink-500" />
            <strong>{foundation.pet_count}</strong> mascotas en adopción
          </div>

          {/* Contacto */}
          <div className="space-y-2">
            {foundation.location_address && <Row icon={MapPin} label="Dirección" value={foundation.location_address} />}
            {foundation.whatsapp_number && <Row icon={Phone} label="WhatsApp" value={foundation.whatsapp_number} />}
            {foundation.email && <Row icon={Mail} label="Email" value={foundation.email} />}
            {foundation.instagram_url && <Row icon={Instagram} label="Instagram" value={foundation.instagram_url} href={foundation.instagram_url} />}
            {foundation.facebook_url && <Row icon={Facebook} label="Facebook" value={foundation.facebook_url} href={foundation.facebook_url} />}
            {foundation.website_url && <Row icon={Globe} label="Web" value={foundation.website_url} href={foundation.website_url} />}
            {foundation.donation_link && <Row icon={Heart} label="Donaciones" value={foundation.donation_link} href={foundation.donation_link} />}
          </div>

          <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
            Registrada el {new Date(foundation.created_at).toLocaleDateString("es-CO")}
          </p>
        </div>
      </div>
    </div>
  )
}
