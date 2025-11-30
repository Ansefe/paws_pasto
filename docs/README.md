# 📚 Documentación de Paws Pasto Adopciones

> Plataforma de adopción de mascotas para Pasto, Nariño, Colombia

## 🎯 Visión General

**Paws Pasto Adopciones** (o simplemente **Paws**) es una plataforma web diseñada para centralizar y facilitar la adopción de animales de compañía en Pasto, Colombia. Conecta fundaciones de rescate animal con personas interesadas en adoptar, creando un ecosistema de confianza donde los animales encuentran hogares y las fundaciones obtienen visibilidad.

### Propósito Principal
- Dar visibilidad a animales rescatados que buscan hogar
- Facilitar el proceso de adopción para adoptantes potenciales
- Proveer herramientas digitales gratuitas a fundaciones locales
- Ser el punto de referencia confiable para adopción en Pasto

---

## 📁 Estructura de la Documentación

| Documento | Descripción |
|-----------|-------------|
| [Arquitectura](./architecture.md) | Stack técnico, estructura de carpetas, patrones de diseño |
| [Base de Datos](./database.md) | Schema de Supabase, tablas, relaciones, RLS policies |
| [Componentes UI](./components.md) | Componentes reutilizables, props, ejemplos de uso |
| [Páginas](./pages.md) | Descripción de cada página y su funcionalidad |
| [Hooks](./hooks.md) | Custom hooks para fetching de datos |
| [Estilos](./styles.md) | Sistema de diseño, paleta de colores, tipografía |
| [Flujos de Usuario](./user-flows.md) | Journeys de usuario, casos de uso |
| [API y Backend](./api.md) | Endpoints de Supabase, autenticación |

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js >= 18
- npm o pnpm
- Cuenta de Supabase

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd paws-pasto-adopciones

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 🏗️ Stack Técnico Resumido

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite + SWC |
| **Estilos** | Tailwind CSS v3.4 |
| **Componentes** | shadcn/ui (New York style) |
| **Animaciones** | Framer Motion |
| **Routing** | React Router DOM v6 |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Estado** | React hooks (useState, useEffect) |

---

## 🎨 Identidad Visual

### Paleta de Colores
- **Primary (Sky Blue):** `#4FC3F7` - Confianza, calma
- **Accent (Yellow):** `#FFF176` - Alegría, optimismo
- **Secondary (Mint):** `#AED581` - Naturaleza, esperanza

### Tipografía
- **Display:** Fredoka (títulos, headings)
- **Body:** Nunito (texto general)

### Tono de Comunicación
La plataforma usa un **tono inverso**: los animales "adoptan" a los humanos. Esto crea una conexión emocional más profunda y diferencia a Paws.

Ejemplos:
- "¡Postúlate para que Luna te adopte!"
- "Requisitos para que te adopte"
- "Háblale a mi cuidador"

---

## 📊 Modelo de Datos (Simplificado)

```
profiles (usuarios)
    ↓
foundations (fundaciones)
    ↓
pets (mascotas)
    ↓
adoptions (solicitudes)
```

---

## 🔐 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Visitante** | Navegar catálogo, ver fundaciones |
| **Adoptante** | Todo + favoritos + solicitar adopción |
| **Fundación** | Todo + gestionar mascotas + aprobar solicitudes |
| **Admin** | Todo + verificar fundaciones + moderación |

---

## 📱 Páginas Principales

1. **Home** (`/`) - Landing con hero, mascotas destacadas, CTA
2. **Adoptar** (`/adoptar`) - Catálogo de mascotas con filtros
3. **Fundaciones** (`/fundaciones`) - Directorio de fundaciones verificadas
4. **Nosotros** (`/nosotros`) - About con navegación vertical
5. **Donar** (`/donar`) - Información para donaciones (TODO)

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview

# Lint
npm run lint
```

---

## 📞 Contacto y Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: añadir funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

**Última actualización:** Noviembre 2024
