import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { Profile } from '@/types/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  isFoundation: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile: Profile | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Computed properties
  const isAdmin = profile?.role === 'admin'
  const isFoundation = profile?.role === 'foundation'

  // Fetch profile data
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[AUTH] Error fetching profile:', error)
        return null
      }

      return data as Profile
    } catch (error) {
      console.error('[AUTH] Exception in fetchProfile:', error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        // Primero obtener sesión
        const { data: { session } } = await supabase.auth.getSession()

        if (!isMounted) return

        setSession(session)
        setUser(session?.user ?? null)

        // Si hay usuario, intentar cargar perfil (pero no bloquear si falla)
        if (session?.user) {
          fetchProfile(session.user.id).then(profileData => {
            if (isMounted) {
              setProfile(profileData)
            }
          }).catch(err => {
            console.error('[AUTH] Profile fetch failed:', err)
          })
        }
        
        // Siempre terminar de cargar después de obtener sesión
        setIsLoading(false)
      } catch (err) {
        console.error('[AUTH] initAuth error:', err)
        if (isMounted) setIsLoading(false)
      }
    }
    
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Cargar perfil en background
          fetchProfile(session.user.id).then(profileData => {
            if (isMounted) setProfile(profileData)
          })
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setIsLoading(false)
        return { error: new Error(error.message), profile: null }
      }

      // Cargar el perfil inmediatamente después del login
      if (data.user) {
        const profileData = await fetchProfile(data.user.id)

        // Si no existe perfil, cerrar sesión y mostrar error
        if (!profileData) {
          await supabase.auth.signOut()
          setIsLoading(false)
          return {
            error: new Error('No tienes un perfil autorizado. Contacta al administrador.'),
            profile: null
          }
        }

        setProfile(profileData)
        setUser(data.user)
        setSession(data.session)
        setIsLoading(false)
        return { error: null, profile: profileData }
      }

      setIsLoading(false)
      return { error: null, profile: null }
    } catch (error) {
      console.error('[AUTH] Exception in signIn:', error)
      setIsLoading(false)
      return { error: error as Error, profile: null }
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error: new Error(error.message) }
      }

      // El perfil se crea automáticamente mediante el trigger de Supabase
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates as never)
        .eq('id', user.id)

      if (error) {
        return { error: new Error(error.message) }
      }

      // Refresh profile
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    isFoundation,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
