# 🎨 Sistema de Diseño

## Visión de Marca

Paws busca transmitir:
- **Esperanza** y optimismo (no tristeza)
- **Confianza** y seguridad
- **Ternura** y calidez
- **Profesionalismo** accesible

---

## Paleta de Colores

### Colores de Marca

| Nombre | Hex | Uso |
|--------|-----|-----|
| **brand-sky** | `#4FC3F7` | Color primario, CTAs, acentos |
| **brand-yellow** | `#FFF176` | Acento secundario, highlights |
| **brand-mint** | `#AED581` | Éxito, naturaleza |
| **brand-coral** | `#FF8A80` | Alertas suaves, amor |

### Configuración Tailwind

```javascript
// tailwind.config.js
colors: {
  'brand-sky': {
    DEFAULT: '#4FC3F7',
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4',
    600: '#039BE5',
  },
  'brand-yellow': {
    DEFAULT: '#FFF176',
    50: '#FFFDE7',
    100: '#FFF9C4',
    200: '#FFF59D',
    300: '#FFF176',
    400: '#FFEE58',
    500: '#FFEB3B',
    600: '#FDD835',
  },
  // ... más colores
}
```

### Gradientes Comunes

```css
/* Hero principal (adoptar) */
bg-gradient-to-br from-brand-sky via-cyan-500 to-blue-600

/* CTA y botones destacados */
bg-gradient-to-r from-cyan-500 to-blue-500

/* Sección fundaciones */
bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600

/* Cards con hover */
bg-gradient-to-br from-gray-100 to-gray-200
```

---

## Tipografía

### Fuentes

| Fuente | Uso | Variable |
|--------|-----|----------|
| **Fredoka** | Títulos, display | `font-display` |
| **Nunito** | Texto general | `font-sans` |
| **Quicksand** | Alternativa suave | - |

### Import en CSS

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');
```

### Configuración Tailwind

```javascript
fontFamily: {
  sans: ['Nunito', 'system-ui', 'sans-serif'],
  display: ['Fredoka', 'system-ui', 'sans-serif'],
}
```

### Escala Tipográfica

```css
/* Títulos principales (Hero) */
text-3xl md:text-5xl font-bold    /* 30px / 48px */

/* Subtítulos de sección */
text-2xl md:text-3xl font-bold    /* 24px / 30px */

/* Títulos de card */
text-lg font-bold                  /* 18px */

/* Texto de cuerpo */
text-base                          /* 16px */

/* Texto pequeño */
text-sm                            /* 14px */

/* Etiquetas, badges */
text-xs                            /* 12px */
```

---

## Border Radius

Paws usa bordes muy redondeados para transmitir suavidad.

```javascript
// tailwind.config.js
borderRadius: {
  DEFAULT: '0.75rem',  // 12px - más redondeado
  lg: '1rem',          // 16px
  xl: '1.25rem',       // 20px
  '2xl': '1.5rem',     // 24px
  '3xl': '2rem',       // 32px
  full: '9999px',      // Completamente redondo
}
```

### Uso Común

```css
/* Botones */
rounded-full

/* Cards */
rounded-xl overflow-hidden

/* Inputs */
rounded-full

/* Modales */
rounded-2xl md:rounded-3xl

/* Badges */
rounded-full px-3 py-1
```

---

## Sombras

```css
/* Cards en reposo */
shadow-md

/* Cards en hover */
shadow-xl

/* Botones destacados */
shadow-lg shadow-cyan-500/25

/* Botones hover */
shadow-xl shadow-cyan-500/30

/* Header con scroll */
shadow-sm
```

---

## Espaciado

Sistema de 4px base (Tailwind default):

```css
/* Padding de secciones */
py-16 md:py-24        /* 64px / 96px */

/* Padding de container */
px-4                  /* 16px */

/* Gap en grids */
gap-6                 /* 24px */

/* Margin entre elementos */
mb-4, mb-6, mb-8      /* 16px, 24px, 32px */
```

---

## Componentes Estilizados

### Botón Primario
```tsx
<Button className="
  bg-gradient-to-r from-cyan-500 to-blue-500 
  hover:from-cyan-600 hover:to-blue-600 
  text-white 
  font-medium 
  px-6 
  rounded-full 
  shadow-lg shadow-cyan-500/25 
  hover:shadow-xl hover:shadow-cyan-500/30 
  transition-all
">
  Texto
</Button>
```

### Botón Secundario
```tsx
<Button 
  variant="outline" 
  className="
    border-2 border-brand-sky 
    text-brand-sky 
    hover:bg-brand-sky/10 
    rounded-full
  "
>
  Texto
</Button>
```

### Card de Mascota
```tsx
<Card className="
  overflow-hidden 
  border-none 
  shadow-md 
  hover:shadow-xl 
  transition-all 
  duration-300 
  bg-white
">
```

### Input de Búsqueda
```tsx
<Input className="
  pl-12 
  h-12 
  rounded-full 
  border-gray-200 
  bg-gray-50 
  focus:bg-white
" />
```

### Badge de Estado
```tsx
// Disponible (implícito)
// En proceso
<span className="
  bg-amber-500 
  text-white 
  text-xs 
  font-medium 
  px-3 py-1 
  rounded-full
">
  En proceso
</span>

// Verificado
<span className="
  bg-emerald-500 
  text-white 
  text-xs 
  font-medium 
  px-3 py-1.5 
  rounded-full 
  flex items-center gap-1.5
">
  <BadgeCheck className="w-4 h-4" />
  Verificada
</span>
```

---

## Estados de UI

### Loading
```tsx
<div className="flex flex-col items-center justify-center py-16">
  <Loader2 className="w-12 h-12 text-brand-sky animate-spin mb-4" />
  <p className="text-gray-600">Cargando...</p>
</div>
```

### Empty State
```tsx
<div className="text-center py-16">
  <div className="text-6xl mb-4">🔍</div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    No encontramos resultados
  </h3>
  <p className="text-gray-600 mb-6">
    Mensaje descriptivo
  </p>
  <Button variant="outline" className="rounded-full">
    Acción
  </Button>
</div>
```

### Error State
```tsx
<div className="text-center py-16">
  <div className="text-6xl mb-4">😿</div>
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Error al cargar
  </h3>
  <p className="text-gray-600 mb-6">{error}</p>
  <Button variant="outline" className="rounded-full">
    Reintentar
  </Button>
</div>
```

---

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
2xl: 1536px /* Extra grande */
```

### Patrones Comunes

```css
/* Grid adaptativo */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4

/* Tamaño de texto adaptativo */
text-3xl md:text-5xl

/* Padding adaptativo */
p-4 md:p-8

/* Ocultar en móvil */
hidden md:flex

/* Solo en móvil */
md:hidden
```

---

## Animaciones

### Transiciones CSS
```css
transition-all duration-300
transition-colors duration-200
transition-transform duration-500
```

### Framer Motion
```tsx
// Fade in + slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Hover lift
whileHover={{ y: -5 }}

// Scale on hover
whileHover={{ scale: 1.05 }}

// Rotate (logo)
whileHover={{ rotate: [0, -10, 10, 0] }}
```

---

## Variables CSS Globales

```css
/* src/index.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 197 71% 73%;      /* brand-sky */
  --primary-foreground: 0 0% 100%;
  --accent: 54 100% 73%;        /* brand-yellow */
  --radius: 0.75rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```
