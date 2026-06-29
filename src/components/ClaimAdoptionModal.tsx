import { useState } from "react"
import { X, Loader2, Heart, ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/contexts/ToastContext"
import type { AdoptionClaimInsert } from "@/types/database.types"

interface ClaimAdoptionModalProps {
  petId: string
  foundationId: string
  petName: string
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
}

const MAX_PHOTOS = 3

export function ClaimAdoptionModal({ petId, foundationId, petName, isOpen, onClose, onCreated }: ClaimAdoptionModalProps) {
  const { user } = useAuth()
  const toast = useToast()

  const [story, setStory] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    setFiles((prev) => [...prev, ...selected].slice(0, MAX_PHOTOS))
    e.target.value = ""
  }

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const uploadPhotos = async (): Promise<string[]> => {
    if (!user || files.length === 0) return []
    const urls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
      const path = `adoptions/${user.id}/${Date.now()}-${i}-${safeName}`
      const { error: upErr } = await supabase.storage.from("images").upload(path, file)
      if (upErr) throw upErr
      const { data } = supabase.storage.from("images").getPublicUrl(path)
      urls.push(data.publicUrl)
    }
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Inicia sesión", "Necesitas una cuenta para registrar tu adopción.")
      return
    }

    setIsLoading(true)
    try {
      const photo_urls = await uploadPhotos()
      const payload: AdoptionClaimInsert = {
        pet_id: petId,
        profile_id: user.id,
        foundation_id: foundationId,
        story: story.trim() || null,
        photo_urls,
        initiated_by: "adopter",
      }
      const { error } = await supabase.from("adoption_claims").insert(payload)
      if (error) throw error

      toast.success("¡Felicidades! 🎉", "Tu adopción quedó registrada. La fundación la confirmará pronto.")
      onCreated?.()
      handleClose()
    } catch (err) {
      console.error("Error registrando adopción:", err)
      toast.error("No se pudo registrar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    setStory("")
    setFiles([])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">¡Adopté a {petName}!</h2>
              <p className="text-sm text-gray-500">Comparte tu historia con la comunidad</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} disabled={isLoading} className="rounded-lg">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="story">Tu historia (opcional)</Label>
            <Textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder={`¿Cómo conociste a ${petName}? ¿Cómo va todo en casa?`}
              disabled={isLoading}
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Fotos (hasta {MAX_PHOTOS}, opcional)</Label>
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={URL.createObjectURL(f)} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-pink-300 transition-colors">
                  <ImagePlus className="w-6 h-6 text-gray-400" />
                  <input type="file" accept="image/*" multiple onChange={handleAddFiles} disabled={isLoading} className="hidden" />
                </label>
              )}
            </div>
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
                  Registrar adopción
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
