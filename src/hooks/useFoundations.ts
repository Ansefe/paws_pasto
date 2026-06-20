import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Foundation, FoundationWithPetCount, Pet } from '@/types/database.types'

interface UseFoundationsReturn {
  foundations: FoundationWithPetCount[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UseFoundationReturn {
  foundation: Foundation | null
  loading: boolean
  error: string | null
}

// Hook para obtener lista de fundaciones verificadas
export function useFoundations(onlyVerified: boolean = true): UseFoundationsReturn {
  const [foundations, setFoundations] = useState<FoundationWithPetCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFoundations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Primero obtenemos las fundaciones
      let query = supabase
        .from('foundations')
        .select('*')
        .order('foundation_name', { ascending: true })

      if (onlyVerified) {
        query = query.eq('is_verified', true)
      }

      const { data: foundationsData, error: foundationsError } = await query

      if (foundationsError) throw foundationsError

      // Luego obtenemos el conteo de mascotas por fundación
      const { data: petsCount, error: petsError } = await supabase
        .from('pets')
        .select('foundation_id')
        .in('status', ['available', 'in_process'])

      if (petsError) throw petsError

      // Contar mascotas por fundación
      const petCountMap = (petsCount || []).reduce((acc, pet) => {
        acc[pet.foundation_id] = (acc[pet.foundation_id] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Combinar datos
      const foundationsWithCount: FoundationWithPetCount[] = (foundationsData || []).map(foundation => ({
        ...foundation,
        pet_count: petCountMap[foundation.id] || 0
      }))

      setFoundations(foundationsWithCount)
    } catch (err) {
      console.error('Error fetching foundations:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las fundaciones')
    } finally {
      setLoading(false)
    }
  }, [onlyVerified])

  useEffect(() => {
    fetchFoundations()
  }, [fetchFoundations])

  return { foundations, loading, error, refetch: fetchFoundations }
}

// Hook para obtener una fundación individual por ID
export function useFoundation(foundationId: string | null): UseFoundationReturn {
  const [foundation, setFoundation] = useState<Foundation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!foundationId) {
      setFoundation(null)
      return
    }

    const fetchFoundation = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('foundations')
          .select('*')
          .eq('id', foundationId)
          .single()

        if (queryError) throw queryError

        setFoundation(data)
      } catch (err) {
        console.error('Error fetching foundation:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar la fundación')
      } finally {
        setLoading(false)
      }
    }

    fetchFoundation()
  }, [foundationId])

  return { foundation, loading, error }
}

// Hook para obtener mascotas de una fundación específica
export function useFoundationPets(foundationId: string | null) {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!foundationId) {
      setPets([])
      return
    }

    const fetchPets = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('pets')
          .select('*')
          .eq('foundation_id', foundationId)
          .in('status', ['available', 'in_process'])
          .order('created_at', { ascending: false })

        if (queryError) throw queryError

        setPets(data || [])
      } catch (err) {
        console.error('Error fetching foundation pets:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar las mascotas')
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [foundationId])

  return { pets, loading, error }
}
