import { createContext, useContext, type ReactNode } from 'react'
import { useSiteConfig, defaultSiteConfig } from '@/hooks/useSiteConfig'
import type { SiteConfig } from '@/types/database.types'

interface SiteConfigContextType {
  config: SiteConfig
  isLoading: boolean
  error: string | null
  saveConfig: (newConfig: Partial<SiteConfig>) => Promise<{ success: boolean; error: unknown }>
  refreshConfig: () => Promise<void>
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const siteConfig = useSiteConfig()

  return (
    <SiteConfigContext.Provider value={siteConfig}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfigContext() {
  const context = useContext(SiteConfigContext)
  if (context === undefined) {
    // Retornar valores por defecto si no hay provider
    return {
      config: defaultSiteConfig,
      isLoading: false,
      error: null,
      saveConfig: async () => ({ success: false, error: 'No provider' }),
      refreshConfig: async () => {},
    }
  }
  return context
}
