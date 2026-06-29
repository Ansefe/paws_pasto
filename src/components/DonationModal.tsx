import { useState } from "react"
import { X, Heart, Loader2, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import type { Foundation, DonationReportInsert } from "@/types/database.types"

interface DonationModalProps {
  foundation: Foundation | null
  isOpen: boolean
  onClose: () => void
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000]

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

export function DonationModal({ foundation, isOpen, onClose }: DonationModalProps) {
  const { user } = useAuth()
  const toast = useToast()

  const [amount, setAmount] = useState<number | "">("")
  const [note, setNote] = useState("")
  const [reporterName, setReporterName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !foundation) return null

  // Construye el destino externo: enlace de donación o, en su defecto, WhatsApp.
  const buildExternalUrl = (amountCop: number): string | null => {
    if (foundation.donation_link) return foundation.donation_link
    if (foundation.whatsapp_number) {
      const phone = foundation.whatsapp_number.replace(/\D/g, "")
      const message = encodeURIComponent(
        `¡Hola ${foundation.foundation_name}! 🐾 Quiero donar ${formatCop(amountCop)} para apoyar su labor. ¿Cómo puedo hacerlo?`
      )
      return `https://wa.me/${phone}?text=${message}`
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const amountCop = typeof amount === "number" ? amount : parseInt(String(amount), 10)
    if (!amountCop || amountCop <= 0) {
      toast.error("Monto inválido", "Ingresa cuánto deseas donar.")
      return
    }

    setIsLoading(true)
    try {
      const payload: DonationReportInsert = {
        foundation_id: foundation.id,
        profile_id: user?.id ?? null,
        reporter_name: user ? null : reporterName.trim() || null,
        amount_cop: amountCop,
        note: note.trim() || null,
      }

      const { error } = await supabase.from("donation_reports").insert(payload)
      if (error) throw error

      toast.success("¡Gracias por tu apoyo!", "Registramos tu intención de donación.")

      // Redirigir al canal oficial de la fundación.
      const url = buildExternalUrl(amountCop)
      if (url) window.open(url, "_blank", "noopener,noreferrer")

      handleClose()
    } catch (err) {
      console.error("Error registrando donación:", err)
      toast.error("No se pudo registrar", "Intenta de nuevo en un momento.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    setAmount("")
    setNote("")
    setReporterName("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <HandHeart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Apoyar a {foundation.foundation_name}</h2>
              <p className="text-sm text-gray-500">Registra cuánto vas a donar</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isLoading} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto a donar (COP) *</Label>
            <Input
              id="amount"
              type="number"
              min={1000}
              step={1000}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Ej: 20000"
              required
              disabled={isLoading}
              className="rounded-xl"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    amount === q ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {formatCop(q)}
                </button>
              ))}
            </div>
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="reporterName">Tu nombre (opcional)</Label>
              <Input
                id="reporterName"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Para aparecer en el ranking de donadores"
                disabled={isLoading}
                className="rounded-xl"
              />
              <p className="text-xs text-gray-500">
                ¿Quieres acumular tus donaciones y salir en el top? Inicia sesión.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Un mensaje para la fundación..."
              disabled={isLoading}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              Paws no procesa dinero. Al continuar te llevamos al canal oficial de la fundación
              {foundation.donation_link ? " (enlace de donación)" : foundation.whatsapp_number ? " (WhatsApp)" : ""}.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1 rounded-xl">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Continuar a donar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
