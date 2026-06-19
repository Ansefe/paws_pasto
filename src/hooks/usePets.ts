import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { PetWithFoundation, PetSpecies, PetSize, PetGender, PetStatus } from '@/types/database.types'

export interface PetFilters {
  species?: PetSpecies | 'all'
  size?: PetSize | 'all'
  gender?: PetGender | 'all'
  status?: PetStatus | 'all'
  good_with_kids?: boolean
  good_with_pets?: boolean
  search?: string
}

interface UsePetsReturn {
  pets: PetWithFoundation[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface UsePetReturn {
  pet: PetWithFoundation | null
  loading: boolean
  error: string | null
}

// Hook para obtener lista de mascotas con filtros
export function usePets(filters?: PetFilters): UsePetsReturn {
  const [pets, setPets] = useState<PetWithFoundation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('pets')
        .select(`
          *,
          foundation:foundations!inner(
            id,
            foundation_name,
            location_city,
            whatsapp_number
          )
        `)
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters?.species && filters.species !== 'all') {
        query = query.eq('species', filters.species)
      }
      if (filters?.size && filters.size !== 'all') {
        query = query.eq('size', filters.size)
      }
      if (filters?.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender)
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      } else {
        // Por defecto, mostrar solo disponibles y en proceso
        query = query.in('status', ['available', 'in_process'])
      }
      if (filters?.good_with_kids) {
        query = query.eq('good_with_kids', true)
      }
      if (filters?.good_with_pets) {
        query = query.eq('good_with_pets', true)
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,breed.ilike.%${filters.search}%`)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setPets((data ?? []) as PetWithFoundation[])
    } catch (err) {
      console.error('Error fetching pets:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las mascotas')
    } finally {
      setLoading(false)
    }
  }, [filters?.species, filters?.size, filters?.gender, filters?.status, filters?.good_with_kids, filters?.good_with_pets, filters?.search])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  return { pets, loading, error, refetch: fetchPets }
}

// Hook para obtener una mascota individual por ID
export function usePet(petId: string | null): UsePetReturn {
  const [pet, setPet] = useState<PetWithFoundation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!petId) {
      setPet(null)
      return
    }

    const fetchPet = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: queryError } = await supabase
          .from('pets')
          .select(`
            *,
            foundation:foundations!inner(
              id,
              foundation_name,
              location_city,
              whatsapp_number
            )
          `)
          .eq('id', petId)
          .single()

        if (queryError) throw queryError

        setPet({
          ...data,
          foundation: data.foundation
        } as PetWithFoundation)
      } catch (err) {
        console.error('Error fetching pet:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar la mascota')
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [petId])

  return { pet, loading, error }
}

// Hook para obtener mascotas destacadas (para la home)
export function useFeaturedPets(limit: number = 6): UsePetsReturn {
  const [pets, setPets] = useState<PetWithFoundation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('pets')
        .select(`
          *,
          foundation:foundations!inner(
            id,
            foundation_name,
            location_city,
            whatsapp_number
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (queryError) throw queryError

      setPets((data ?? []) as PetWithFoundation[])
    } catch (err) {
      console.error('Error fetching featured pets:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las mascotas destacadas')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchPets()
  }, [fetchPets])

  return { pets, loading, error, refetch: fetchPets }
}
