import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import type { Foundation } from "@/types/database.types"

// Devuelve la fundación cuyo profile_id = usuario autenticado (panel de fundación).
export function useMyFoundation() {
  const { user } = useAuth()
  const [foundation, setFoundation] = useState<Foundation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    const userId = user?.id
    ;(async () => {
      if (!userId) {
        if (active) {
          setFoundation(null)
          setLoading(false)
        }
        return
      }
      const { data, error: queryError } = await supabase
        .from("foundations")
        .select("*")
        .eq("profile_id", userId)
        .maybeSingle()
      if (!active) return
      if (queryError) setError(queryError.message)
      else setFoundation(data)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [user?.id, reloadKey])

  return { foundation, loading, error, refetch: () => setReloadKey((k) => k + 1) }
}
