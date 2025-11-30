# 🧩 Componentes UI

## Visión General

Paws usa una combinación de:
- **shadcn/ui**: Componentes base accesibles (basados en Radix UI)
- **Componentes custom**: Específicos del dominio de adopción

---

## Componentes de shadcn/ui

Estos componentes están en `src/components/ui/` y siguen el estilo "New York" con color base Slate.

### Button
```tsx
import { Button } from "@/components/ui/button"

// Variantes
<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><Icon /></Button>

// Estilos custom comunes en Paws
<Button className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
  CTA Principal
</Button>
```

### Card
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

<Card className="overflow-hidden border-none shadow-md">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Input
```tsx
import { Input } from "@/components/ui/input"

<Input 
  placeholder="Buscar..."
  className="rounded-full h-12 pl-12"
/>
```

### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="rounded-full">
    <SelectValue placeholder="Seleccionar" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="dog">Perro</SelectItem>
    <SelectItem value="cat">Gato</SelectItem>
  </SelectContent>
</Select>
```

### Dialog (Modal)
```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-4xl">
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* Contenido */}
  </DialogContent>
</Dialog>
```

### Sheet (Drawer)
```tsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button>Abrir</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
    <SheetHeader>
      <SheetTitle>Filtros</SheetTitle>
    </SheetHeader>
    {/* Contenido */}
  </SheetContent>
</Sheet>
```

---

## Componentes de Layout

### Header
`src/components/layout/Header.tsx`

Barra de navegación fija con comportamiento transparente/sólido.

**Props**: Ninguna (usa `useLocation` internamente)

**Comportamiento**:
- Transparente en Home sin scroll
- Fondo sólido en otras páginas o con scroll
- Navegación responsive (menú hamburguesa en móvil)

```tsx
import { Header } from "@/components/layout/Header"

// En App.tsx
<Header />
```

### Footer
`src/components/layout/Footer.tsx`

Footer oscuro con links, redes sociales y newsletter.

```tsx
import { Footer } from "@/components/layout/Footer"

// En App.tsx
<Footer />
```

---

## Componentes de Feature

### PetCard
`src/pages/Adopt.tsx` (componente interno)

Tarjeta de mascota para el catálogo.

**Props**:
```typescript
interface PetCardProps {
  pet: PetWithFoundation
  onClick: () => void
}
```

**Características**:
- Imagen con placeholder emoji si no hay foto
- Badge de estado (en proceso)
- Botón de favorito
- Hover con elevación
- Tags de edad, tamaño, género

```tsx
<PetCard 
  pet={pet} 
  onClick={() => openPetModal(pet)} 
/>
```

### PetDetailModal
`src/components/PetDetailModal.tsx`

Modal de detalle de mascota con carrusel y tono "inverso".

**Props**:
```typescript
interface PetDetailModalProps {
  pet: PetForModal | null
  isOpen: boolean
  onClose: () => void
}
```

**Características**:
- Carrusel de imágenes (si hay múltiples)
- Info detallada a la derecha
- Frases con tono "el animal te adopta"
- Botón WhatsApp para contacto
- Botón de postulación

```tsx
<PetDetailModal 
  pet={selectedPet}
  isOpen={isModalOpen}
  onClose={closePetModal}
/>
```

### FoundationCard
`src/pages/Foundations.tsx` (componente interno)

Tarjeta de fundación para el directorio.

**Props**:
```typescript
interface FoundationCardProps {
  foundation: FoundationWithPetCount
}
```

**Características**:
- Logo o placeholder con ícono
- Badge de verificación
- Conteo de mascotas
- Links a redes sociales
- Botones WhatsApp y Donar

---

## Patrones de Estilo Comunes

### Gradientes de marca
```css
/* Botón principal */
bg-gradient-to-r from-cyan-500 to-blue-500

/* Hero de adoptar */
bg-gradient-to-br from-brand-sky via-cyan-500 to-blue-600

/* Hero de fundaciones */
bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600
```

### Bordes redondeados
```css
/* Botones y inputs */
rounded-full

/* Cards */
rounded-xl overflow-hidden

/* Badges */
rounded-full px-3 py-1
```

### Sombras
```css
/* Cards */
shadow-md hover:shadow-xl

/* Botones destacados */
shadow-lg shadow-cyan-500/25
```

### Hover effects con Framer Motion
```tsx
<motion.div
  whileHover={{ y: -5 }}
  transition={{ duration: 0.2 }}
>
  <Card />
</motion.div>
```

---

## Animaciones con Framer Motion

### Entry animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  Contenido
</motion.div>
```

### Stagger children (scroll into view)
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
  transition={{ staggerChildren: 0.1 }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
    />
  ))}
</motion.div>
```

### AnimatePresence para listas
```tsx
<AnimatePresence>
  {filteredPets.map((pet) => (
    <motion.div
      key={pet.id}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <PetCard pet={pet} />
    </motion.div>
  ))}
</AnimatePresence>
```

---

## Iconografía (Lucide React)

```tsx
import { 
  PawPrint,     // Logo, decoración
  Heart,        // Favoritos, donar
  Search,       // Búsqueda
  MapPin,       // Ubicación
  Dog, Cat,     // Especies
  Calendar,     // Edad
  MessageCircle,// WhatsApp
  BadgeCheck,   // Verificado
  X,            // Cerrar
  ChevronLeft, ChevronRight, // Navegación
  Loader2,      // Loading spinner
} from "lucide-react"
```

---

## Placeholders de Imagen

Cuando una mascota no tiene foto, se muestra un emoji:

```tsx
const petEmojis = {
  dog: { male: "🐕", female: "🐕‍🦺" },
  cat: { male: "🐈", female: "😺" }
}

// Uso
{pet.main_photo_url ? (
  <img src={pet.main_photo_url} alt={pet.name} />
) : (
  <div className="text-8xl">
    {petEmojis[pet.species][pet.gender]}
  </div>
)}
```
