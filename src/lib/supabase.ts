import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

/**
 * Crea un cliente Supabase aislado que NO persiste sesión.
 *
 * Se usa para operaciones como `auth.signUp` desde el panel admin: si se llamara
 * sobre el cliente principal, Supabase reemplazaría la sesión del administrador
 * por la del usuario recién creado (expulsando al admin). Este cliente mantiene
 * su sesión solo en memoria, así que la sesión del admin queda intacta.
 */
export function createIsolatedClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Helper para obtener la URL pública de imágenes de Supabase Storage
export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

const IMAGES_BUCKET = 'images'

/**
 * Sube un archivo de imagen al bucket `images` dentro de la carpeta indicada
 * (p. ej. `pets`) y devuelve la URL pública.
 */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg'
  const filePath = `${folder}/${crypto.randomUUID()}.${fileExt}`

  const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(IMAGES_BUCKET).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Elimina una imagen del bucket `images` a partir de su URL pública.
 * No lanza error si la URL no pertenece al bucket (se ignora silenciosamente).
 */
export async function deleteImageByUrl(publicUrl: string): Promise<void> {
  const marker = `/storage/v1/object/public/${IMAGES_BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return
  const path = publicUrl.substring(idx + marker.length)
  await supabase.storage.from(IMAGES_BUCKET).remove([path])
}
