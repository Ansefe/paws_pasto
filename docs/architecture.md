# 🏗️ Arquitectura del Proyecto

## Stack Técnico Detallado

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.x | Librería UI principal |
| **TypeScript** | 5.x | Tipado estático |
| **Vite** | 5.x | Build tool y dev server |
| **SWC** | - | Compilador ultra-rápido (reemplaza Babel) |

### Estilos
| Tecnología | Propósito |
|------------|-----------|
| **Tailwind CSS** | Utility-first CSS framework |
| **shadcn/ui** | Componentes accesibles basados en Radix UI |
| **Framer Motion** | Animaciones declarativas |
| **Lucide React** | Iconografía consistente |

### Backend (Supabase)
| Servicio | Uso |
|----------|-----|
| **PostgreSQL** | Base de datos relacional |
| **Auth** | Autenticación y manejo de sesiones |
| **Storage** | Almacenamiento de imágenes |
| **Row Level Security** | Seguridad a nivel de fila |
| **Realtime** | Suscripciones en tiempo real (futuro) |

### Routing
- **React Router DOM v6** con rutas declarativas

---

## Estructura de Carpetas

```
HogarPeludo/
├── docs/                    # Documentación del proyecto
│   ├── README.md            # Índice de documentación
│   ├── architecture.md      # Este archivo
│   ├── database.md          # Schema y modelos
│   ├── components.md        # Componentes UI
│   ├── pages.md             # Páginas de la app
│   ├── hooks.md             # Custom hooks
│   ├── styles.md            # Sistema de diseño
│   └── user-flows.md        # Flujos de usuario
│
├── public/                  # Assets estáticos
│
├── src/
│   ├── components/          # Componentes React
│   │   ├── layout/          # Header, Footer, Sidebar
│   │   ├── ui/              # Componentes shadcn/ui
│   │   └── *.tsx            # Componentes de feature
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── usePets.ts       # Fetching de mascotas
│   │   └── useFoundations.ts # Fetching de fundaciones
│   │
│   ├── lib/                 # Utilidades y configuración
│   │   ├── supabase.ts      # Cliente de Supabase
│   │   └── utils.ts         # Funciones de utilidad
│   │
│   ├── pages/               # Páginas/vistas principales
│   │   ├── Home.tsx
│   │   ├── Adopt.tsx
│   │   ├── Foundations.tsx
│   │   └── About.tsx
│   │
│   ├── types/               # Definiciones de TypeScript
│   │   └── database.types.ts # Tipos de Supabase
│   │
│   ├── App.tsx              # Componente raíz con routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales + Tailwind
│
├── supabase/                # Configuración de Supabase
│   ├── schema.sql           # DDL de la base de datos
│   ├── seed.sql             # Datos de prueba
│   └── fix_auth_trigger.sql # Scripts de corrección
│
├── .env.example             # Template de variables de entorno
├── tailwind.config.js       # Configuración de Tailwind
├── tsconfig.json            # Configuración de TypeScript
├── vite.config.ts           # Configuración de Vite
└── package.json             # Dependencias y scripts
```

---

## Patrones de Arquitectura

### 1. Component-Based Architecture
Cada componente es autocontenido con su lógica, estilos y tipos.

```tsx
// Ejemplo de estructura de componente
function PetCard({ pet, onClick }: PetCardProps) {
  // Estado local
  const [isFavorite, setIsFavorite] = useState(false)
  
  // Handlers
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }
  
  // Render
  return (
    <motion.div onClick={onClick}>
      {/* JSX */}
    </motion.div>
  )
}
```

### 2. Custom Hooks para Data Fetching
Los hooks encapsulan la lógica de fetching y estado.

```tsx
// Uso del hook
const { pets, loading, error } = usePets({ species: 'dog' })
```

### 3. Composición sobre Herencia
Los componentes se componen en lugar de extenderse.

```tsx
// Composición de componentes
<Card>
  <CardHeader>
    <CardTitle />
  </CardHeader>
  <CardContent />
</Card>
```

### 4. Separación de Concerns
- **Pages**: Composición y layout
- **Components**: UI reutilizable
- **Hooks**: Lógica de negocio y fetching
- **Types**: Definiciones de datos

---

## Flujo de Datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Supabase  │────▶│   Hooks     │────▶│  Components │
│  (Database) │     │ (usePets)   │     │  (PetCard)  │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │                                       │
       └───────────────────────────────────────┘
                    User Actions
```

1. Los **hooks** obtienen datos de Supabase
2. Los **componentes** reciben datos via props
3. Las **acciones de usuario** disparan mutations
4. Supabase actualiza y los hooks refetch

---

## Configuración de Vite

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

El alias `@` permite imports absolutos:
```tsx
import { Button } from "@/components/ui/button"
```

---

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## Consideraciones de Performance

1. **Code Splitting**: Vite hace splitting automático por ruta
2. **Lazy Loading**: Imágenes con loading="lazy"
3. **Memoization**: useMemo/useCallback donde sea necesario
4. **Optimistic Updates**: Para mejor UX (futuro)

---

## Seguridad

1. **RLS en Supabase**: Políticas a nivel de fila
2. **Anon Key**: Solo expone operaciones públicas
3. **Service Role**: Solo en backend (no en cliente)
4. **Input Validation**: Validación en frontend y backend
