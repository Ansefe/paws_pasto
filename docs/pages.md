# 📄 Páginas de la Aplicación

## Estructura de Rutas

```tsx
// src/App.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/nosotros" element={<AboutPage />} />
  <Route path="/adoptar" element={<AdoptPage />} />
  <Route path="/fundaciones" element={<FoundationsPage />} />
</Routes>
```

---

## 🏠 HomePage (`/`)

**Archivo**: `src/pages/Home.tsx`

### Descripción
Landing page principal. Primera impresión de la plataforma con hero atractivo, mascotas destacadas y CTAs.

### Secciones

1. **Hero**
   - Gradiente cyan/blue de fondo
   - Título con mensaje emotivo
   - CTA principal "Ver mascotas"
   - Estadísticas (mascotas adoptadas, fundaciones, etc.)

2. **Mascotas Destacadas**
   - Grid de 6 mascotas recientes
   - Cards con hover effect
   - Link a página de adopción

3. **Cómo Funciona**
   - 3-4 pasos del proceso
   - Iconos ilustrativos
   - Descripciones breves

4. **CTA Fundaciones**
   - Sección para atraer fundaciones
   - Gradiente verde
   - Botones: Registrar fundación, Conocer más

5. **Testimonios** (opcional)
   - Historias de adopción exitosas
   - Carrusel o grid

### Estado
- No tiene estado propio significativo
- Usa `useFeaturedPets()` para mascotas destacadas

---

## 🐾 AdoptPage (`/adoptar`)

**Archivo**: `src/pages/Adopt.tsx`

### Descripción
Catálogo completo de mascotas con filtros avanzados y modal de detalle.

### Componentes Internos
- `PetCard` - Tarjeta de mascota
- `MobileFilters` - Sheet de filtros para móvil

### Secciones

1. **Hero pequeño**
   - Título "Encuentra tu compañero ideal"
   - Contador de mascotas disponibles

2. **Barra de filtros (sticky)**
   - Input de búsqueda
   - Select de especie, tamaño, género
   - Filtros móvil via Sheet
   - Toggle grid/lista

3. **Grid de mascotas**
   - Layout responsive (1-4 columnas)
   - AnimatePresence para transiciones
   - Estado de loading/error/vacío

4. **Modal de detalle**
   - Se abre al hacer clic en una mascota
   - Carrusel de imágenes
   - Info detallada con tono "inverso"

5. **CTA Fundaciones**
   - Invitación a registrar fundación

### Estado
```typescript
const [filters, setFilters] = useState({
  species: "all",
  size: "all",
  gender: "all",
  age: "all",
  search: ""
})
const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
const [selectedPet, setSelectedPet] = useState<PetForModal | null>(null)
const [isModalOpen, setIsModalOpen] = useState(false)
```

### Hooks Usados
- `usePets(filters)` - Obtiene mascotas filtradas

---

## 🏛️ FoundationsPage (`/fundaciones`)

**Archivo**: `src/pages/Foundations.tsx`

### Descripción
Directorio de fundaciones de rescate verificadas en Pasto.

### Componentes Internos
- `FoundationCard` - Tarjeta de fundación

### Secciones

1. **Hero**
   - Gradiente verde/teal
   - Badge "Fundaciones Verificadas"
   - Estadísticas totales

2. **Barra de búsqueda (sticky)**
   - Input de búsqueda por nombre/ciudad

3. **Grid de fundaciones**
   - 3 columnas en desktop
   - Cards con logo, descripción, conteo de mascotas
   - Links a redes sociales
   - Botones: Conocer más, WhatsApp, Donar

4. **CTA Registro**
   - Invitación a nuevas fundaciones

### Estado
```typescript
const [searchQuery, setSearchQuery] = useState("")
```

### Hooks Usados
- `useFoundations(true)` - Solo fundaciones verificadas

---

## 🏛️ FoundationDetailPage (`/fundaciones/:id`)

**Archivo**: `src/pages/FoundationDetail.tsx`

### Descripción
Página de detalle de una fundación individual. Permite a las fundaciones mostrar su historia, misión, información de contacto y las mascotas que tienen disponibles.

### Secciones

1. **Hero con card principal**
   - Logo de la fundación (o placeholder)
   - Nombre y badge de verificación
   - Ubicación y descripción
   - Stats (mascotas, fecha verificación)
   - Botones de contacto (WhatsApp, Donar)

2. **Contenido principal (2 columnas)**
   - **Columna principal (2/3)**:
     - Sección "Nuestra Misión"
     - Grid de mascotas en adopción (`MiniPetCard`)
   - **Sidebar (1/3)**:
     - Card de contacto (sticky)
     - Email, teléfono, dirección
     - Redes sociales
     - CTA de donación

3. **Modal de mascota**
   - Al hacer clic en una mascota se abre el `PetDetailModal`

4. **CTA final**
   - "¿Listo para adoptar?"
   - Botón a catálogo general

### Componentes Internos
- `MiniPetCard` - Tarjeta compacta de mascota

### Estado
```typescript
const [foundation, setFoundation] = useState<FoundationDetail | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [selectedPet, setSelectedPet] = useState<PetForModal | null>(null)
const [isModalOpen, setIsModalOpen] = useState(false)
```

### Data Fetching
Usa `supabase` directamente para:
1. Obtener datos de la fundación por ID
2. Obtener mascotas de esa fundación

### Features
- Breadcrumb para volver al directorio
- Card de contacto sticky en scroll
- Links directos a redes sociales
- Mensaje especial si no hay mascotas disponibles

---

## ℹ️ AboutPage (`/nosotros`)

**Archivo**: `src/pages/About.tsx`

### Descripción
Página informativa con navegación vertical por secciones.

### Secciones (con navegación lateral)

1. **Nuestra Misión**
   - Visión y propósito de HogarPeludo
   - Iconos representativos

2. **Nuestros Valores**
   - Lista de valores (confianza, transparencia, etc.)
   - Cards con íconos

3. **Cómo Funciona**
   - Para Adoptantes
   - Para Fundaciones
   - Pasos ilustrados

4. **Para Fundaciones**
   - Beneficios de unirse
   - Proceso de registro
   - (Anchor: #fundaciones)

5. **Para Adoptantes**
   - Proceso de adopción
   - Compromiso requerido

6. **CTA Final**
   - Doble botón: Adoptar / Ver Fundaciones

### Features
- Navegación vertical sticky (desktop)
- Smooth scroll a secciones
- Anchor links desde otras páginas (`/nosotros#fundaciones`)

### Estado
```typescript
const [activeSection, setActiveSection] = useState("mision")
```

---

## 🚧 Páginas Pendientes

### DonatePage (`/donar`)
- Información sobre cómo donar
- Links a fundaciones para donaciones directas

### ProfilePage (`/perfil`)
- Información del usuario
- Historial de favoritos
- Solicitudes de adopción

### FoundationDashboard (`/fundacion/dashboard`)
- Panel de administración para fundaciones
- Gestión de mascotas
- Solicitudes recibidas

### AdminDashboard (`/admin`)
- Verificación de fundaciones
- Moderación de contenido
- Estadísticas

---

## Layout Común

Todas las páginas comparten:

```tsx
// App.tsx
<Router>
  <div className="min-h-screen flex flex-col">
    <Header />           {/* Fijo en la parte superior */}
    <main className="flex-1">
      <Routes>...</Routes>
    </main>
    <Footer />           {/* Al final */}
  </div>
</Router>
```

### Padding Top
Las páginas con hero usan `pt-28` para compensar el Header fijo (h-20 + margen).

---

## Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

### Ejemplo de Grid Responsive
```tsx
className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
```
