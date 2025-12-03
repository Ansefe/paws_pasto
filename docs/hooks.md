# 🪝 Custom Hooks

## Visión General

Los custom hooks encapsulan la lógica de fetching de datos desde Supabase, proporcionando:
- Datos tipados
- Estados de loading y error
- Funciones de refetch
- Filtrado del lado del servidor

---

## usePets

**Archivo**: `src/hooks/usePets.ts`

### usePets(filters?)
Obtiene lista de mascotas con filtros opcionales.

```typescript
interface PetFilters {
  species?: 'dog' | 'cat' | 'all'
  size?: 'small' | 'medium' | 'large' | 'all'
  gender?: 'male' | 'female' | 'all'
  status?: 'available' | 'in_process' | 'adopted' | 'paused' | 'all'
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

function usePets(filters?: PetFilters): UsePetsReturn
```

**Ejemplo de uso**:
```tsx
const { pets, loading, error } = usePets({
  species: 'dog',
  size: 'medium',
  search: 'Luna'
})
```

**Query Supabase**:
```sql
SELECT 
  pets.*,
  foundations.id,
  foundations.foundation_name,
  foundations.location_city,
  foundations.whatsapp_number
FROM pets
JOIN foundations ON pets.foundation_id = foundations.id
WHERE status IN ('available', 'in_process')
  AND species = $species
  AND size = $size
  -- etc.
ORDER BY created_at DESC
```

---

### usePet(petId)
Obtiene una mascota individual por ID.

```typescript
interface UsePetReturn {
  pet: PetWithFoundation | null
  loading: boolean
  error: string | null
}

function usePet(petId: string | null): UsePetReturn
```

**Ejemplo**:
```tsx
const { pet, loading, error } = usePet("uuid-de-mascota")
```

---

### useFeaturedPets(limit?)
Obtiene mascotas destacadas para la homepage.

```typescript
function useFeaturedPets(limit?: number): UsePetsReturn
```

**Ejemplo**:
```tsx
const { pets } = useFeaturedPets(6) // Últimas 6 mascotas disponibles
```

---

## useFoundations

**Archivo**: `src/hooks/useFoundations.ts`

### useFoundations(onlyVerified?)
Obtiene lista de fundaciones.

```typescript
interface UseFoundationsReturn {
  foundations: FoundationWithPetCount[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

function useFoundations(onlyVerified?: boolean): UseFoundationsReturn
```

**Ejemplo**:
```tsx
const { foundations, loading } = useFoundations(true) // Solo verificadas
```

**El hook también calcula el conteo de mascotas por fundación**.

---

### useFoundation(foundationId)
Obtiene una fundación individual.

```typescript
interface UseFoundationReturn {
  foundation: Foundation | null
  loading: boolean
  error: string | null
}

function useFoundation(foundationId: string | null): UseFoundationReturn
```

---

### useFoundationPets(foundationId)
Obtiene mascotas de una fundación específica.

```typescript
function useFoundationPets(foundationId: string | null): {
  pets: Pet[]
  loading: boolean
  error: string | null
}
```

---

## Patrones de Implementación

### Estructura Básica de un Hook

```typescript
function useData(params: Params) {
  const [data, setData] = useState<Data[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('table')
        .select('*')
        // ...filtros

      if (queryError) throw queryError
      setData(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

### Dependencias en useCallback/useEffect

Los filtros individuales se pasan como dependencias:

```typescript
const fetchPets = useCallback(async () => {
  // ...
}, [
  filters?.species, 
  filters?.size, 
  filters?.gender,
  // etc.
])
```

Esto asegura que el hook re-fetche cuando cambian los filtros.

---

## Tipos de Datos

### PetWithFoundation
```typescript
type PetWithFoundation = Pet & {
  foundation: Pick<Foundation, 
    'id' | 'foundation_name' | 'location_city' | 'whatsapp_number'
  >
}
```

### FoundationWithPetCount
```typescript
type FoundationWithPetCount = Foundation & {
  pet_count: number
}
```

---

## Manejo de Errores

Los hooks capturan errores y los exponen como string:

```tsx
const { error } = usePets()

if (error) {
  return <ErrorMessage message={error} />
}
```

---

## Loading States

```tsx
const { loading } = usePets()

if (loading) {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-12 h-12 animate-spin" />
    </div>
  )
}
```

---

## useAuth (Implementado)

**Archivo**: `src/contexts/AuthContext.tsx`

Hook para autenticación y gestión de sesión.

```typescript
interface UseAuthReturn {
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

function useAuth(): UseAuthReturn
```

**Ejemplo**:
```tsx
const { user, isAdmin, signIn, signOut } = useAuth()

// Login
const { error, profile } = await signIn(email, password)

// Verificar rol
if (isAdmin) {
  navigate('/admin')
}
```

---

## useSiteConfig (Implementado)

**Archivo**: `src/hooks/useSiteConfig.ts`

Hook para gestionar la configuración del sitio desde Supabase.

```typescript
interface UseSiteConfigReturn {
  config: SiteConfig
  loading: boolean
  error: string | null
  updateConfig: (key: string, value: string) => Promise<void>
  refreshConfig: () => Promise<void>
}

function useSiteConfig(): UseSiteConfigReturn
```

**Ejemplo**:
```tsx
const { config, updateConfig } = useSiteConfig()

// Leer configuración
console.log(config.site_name)

// Actualizar (solo admin)
await updateConfig('contact_email', 'nuevo@email.com')
```

---

## Futuros Hooks (TODO)

### useFavorites
```typescript
function useFavorites() {
  return {
    favorites: Pet[]
    isFavorite: (petId: string) => boolean
    toggleFavorite: (petId: string) => Promise<void>
  }
}
```

### useAdoption
```typescript
function useAdoption() {
  return {
    createApplication: (petId, message) => Promise<void>
    myApplications: Adoption[]
  }
}
```
