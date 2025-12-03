import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { SiteConfig } from '@/types/database.types'

// Configuración por defecto
export const defaultSiteConfig: SiteConfig = {
  siteName: 'Paws Pasto Adopciones',
  siteDescription: 'Plataforma de adopción de mascotas en Pasto, Nariño',
  siteUrl: 'https://paws.com',
  email: 'info@paws.com',
  phone: '300 123 4567',
  whatsapp: '573001234567',
  address: 'Pasto, Nariño, Colombia',
  instagram: 'https://instagram.com/pawspasto',
  facebook: 'https://facebook.com/pawspasto',
  tiktok: '',
  youtube: '',
  termsAndConditions: `# Términos y Condiciones

## 1. Aceptación de los términos
Al acceder y utilizar Paws Pasto Adopciones, aceptas estos términos y condiciones.

## 2. Uso de la plataforma
Paws es una plataforma que conecta adoptantes con fundaciones de rescate animal en Pasto.

## 3. Responsabilidad
Paws no es responsable de las transacciones entre adoptantes y fundaciones.`,
  privacyPolicy: `# Política de Privacidad

## 1. Información que recopilamos
Recopilamos información básica como nombre, email y teléfono.

## 2. Uso de la información
Usamos tu información para facilitar el proceso de adopción.

## 3. Compartir información
Compartimos tu información únicamente con las fundaciones cuando inicias un proceso de adopción.`,
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultSiteConfig)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar configuración desde la base de datos
  const fetchConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')

      if (fetchError) {
        console.error('Error fetching site config:', fetchError)
        // Si hay error, usar configuración por defecto
        return
      }

      if (data && data.length > 0) {
        // Convertir array de settings a objeto de configuración
        const configObject = { ...defaultSiteConfig }
        data.forEach((setting: { key: string; value: unknown }) => {
          const key = setting.key as keyof SiteConfig
          if (key in configObject) {
            configObject[key] = setting.value as string
          }
        })
        setConfig(configObject)
      }
    } catch (err) {
      console.error('Error loading config:', err)
      setError('Error al cargar la configuración')
    } finally {
      setIsLoading(false)
    }
  }

  // Guardar configuración en la base de datos
  const saveConfig = async (newConfig: Partial<SiteConfig>) => {
    try {
      setError(null)

      // Convertir objeto de configuración a array de settings
      const entries = Object.entries(newConfig)
      
      for (const [key, value] of entries) {
        // Upsert cada setting
        const { error: upsertError } = await supabase
          .from('site_settings')
          .upsert(
            { 
              key, 
              value: value as string,
              updated_at: new Date().toISOString()
            } as never,
            { onConflict: 'key' }
          )

        if (upsertError) {
          console.error(`Error saving ${key}:`, upsertError)
          throw upsertError
        }
      }

      // Actualizar estado local
      setConfig(prev => ({ ...prev, ...newConfig }))
      return { success: true, error: null }
    } catch (err) {
      console.error('Error saving config:', err)
      setError('Error al guardar la configuración')
      return { success: false, error: err }
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  return {
    config,
    isLoading,
    error,
    saveConfig,
    refreshConfig: fetchConfig,
  }
}
