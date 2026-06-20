import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Métricas agregadas para el dashboard de administración
export interface AdminMetrics {
  // Tarjetas principales
  petsInAdoption: number
  foundationsVerified: number
  petsAdopted: number
  usersTotal: number
  // Deltas "este mes" (para mostrar tendencia real)
  petsNewThisMonth: number
  usersNewThisMonth: number
  foundationsNewThisMonth: number
  // Pendientes
  foundationsPending: number
  petsInProcess: number
  petsWithoutPhoto: number
  // Mascotas por estado (resumen)
  petsAvailable: number
  petsPaused: number
}

export interface ActivityItem {
  id: string
  type: 'foundation' | 'pet' | 'user'
  message: string
  createdAt: string
}

interface UseAdminMetricsReturn {
  metrics: AdminMetrics | null
  activity: ActivityItem[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Cuenta filas de una tabla aplicando un constructor de query opcional
async function countRows(
  table: 'pets' | 'foundations' | 'profiles',
  build?: (q: ReturnType<typeof buildBase>) => ReturnType<typeof buildBase>
): Promise<number> {
  let query = buildBase(table)
  if (build) query = build(query)
  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

function buildBase(table: 'pets' | 'foundations' | 'profiles') {
  return supabase.from(table).select('*', { count: 'exact', head: true })
}

export function useAdminMetrics(): UseAdminMetricsReturn {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Inicio del mes actual en ISO (para deltas "este mes")
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        petsTotal,
        petsAvailable,
        petsInProcess,
        petsAdopted,
        foundationsVerified,
        usersTotal,
        petsNewThisMonth,
        usersNewThisMonth,
        foundationsNewThisMonth,
        foundationsPending,
        petsWithoutPhoto,
        recentPets,
        recentFoundations,
        recentUsers,
      ] = await Promise.all([
        // Conteos de mascotas por estado (no consultamos 'paused' directamente
        // para no depender de que el valor del enum exista en la BD)
        countRows('pets'),
        countRows('pets', (q) => q.eq('status', 'available')),
        countRows('pets', (q) => q.eq('status', 'in_process')),
        countRows('pets', (q) => q.eq('status', 'adopted')),
        countRows('foundations', (q) => q.eq('is_verified', true)),
        countRows('profiles'),
        // Deltas "este mes"
        countRows('pets', (q) => q.gte('created_at', startOfMonth)),
        countRows('profiles', (q) => q.gte('created_at', startOfMonth)),
        countRows('foundations', (q) => q.gte('created_at', startOfMonth)),
        // Pendientes
        countRows('foundations', (q) => q.eq('is_verified', false)),
        countRows('pets', (q) => q.is('main_photo_url', null)),
        // Actividad reciente
        supabase
          .from('pets')
          .select('id, name, species, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('foundations')
          .select('id, foundation_name, is_verified, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('profiles')
          .select('id, full_name, role, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      // Pausadas = total - (disponibles + en proceso + adoptadas). Robusto aunque
      // el enum aún no tenga 'paused'.
      const petsPaused = Math.max(0, petsTotal - petsAvailable - petsInProcess - petsAdopted)

      setMetrics({
        petsInAdoption: petsAvailable + petsInProcess,
        foundationsVerified,
        petsAdopted,
        usersTotal,
        petsNewThisMonth,
        usersNewThisMonth,
        foundationsNewThisMonth,
        foundationsPending,
        petsInProcess,
        petsWithoutPhoto,
        petsAvailable,
        petsPaused,
      })

      // Construir lista de actividad combinada
      const items: ActivityItem[] = []

      for (const pet of recentPets.data ?? []) {
        const speciesLabel = pet.species === 'dog' ? 'Perro' : 'Gato'
        items.push({
          id: `pet-${pet.id}`,
          type: 'pet',
          message: `Nuevo peludo registrado: ${pet.name} (${speciesLabel})`,
          createdAt: pet.created_at,
        })
      }
      for (const foundation of recentFoundations.data ?? []) {
        items.push({
          id: `foundation-${foundation.id}`,
          type: 'foundation',
          message: foundation.is_verified
            ? `Nueva fundación verificada: ${foundation.foundation_name}`
            : `Fundación pendiente de verificar: ${foundation.foundation_name}`,
          createdAt: foundation.created_at,
        })
      }
      for (const user of recentUsers.data ?? []) {
        items.push({
          id: `user-${user.id}`,
          type: 'user',
          message: `Nuevo usuario registrado: ${user.full_name || 'Sin nombre'}`,
          createdAt: user.created_at,
        })
      }

      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setActivity(items.slice(0, 6))
    } catch (err) {
      console.error('Error fetching admin metrics:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar las métricas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { metrics, activity, loading, error, refetch: fetchMetrics }
}
