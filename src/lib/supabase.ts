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
