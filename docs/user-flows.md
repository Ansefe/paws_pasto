# 🔄 Flujos de Usuario

## Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Visitante** | Usuario sin cuenta | Ver catálogo, ver fundaciones |
| **Adoptante** | Usuario registrado | + Favoritos, + Solicitar adopción |
| **Fundación** | Org. verificada | + Gestionar mascotas, + Aprobar solicitudes |
| **Admin** | Superusuario | + Verificar fundaciones, + Moderar |

---

## Flujo 1: Explorar Mascotas (Visitante)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Landing    │────▶│  Catálogo   │────▶│  Modal      │
│  (Home)     │     │  (/adoptar) │     │  Detalle    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                    │
      │                   │                    │
      ▼                   ▼                    ▼
 Ver mascotas        Usar filtros         Ver fotos
 destacadas         (especie, tamaño)     Ver historia
                                          Contactar WhatsApp
```

### Pasos Detallados

1. **Visitante llega a Home**
   - Ve hero con mensaje emotivo
   - Ve mascotas destacadas (últimas 6)
   - Click en "Ver mascotas" o en una mascota

2. **En Catálogo (/adoptar)**
   - Ve grid de todas las mascotas
   - Puede filtrar por especie, tamaño, género
   - Puede buscar por nombre
   - Ve contador de resultados

3. **Click en Mascota → Modal**
   - Ve carrusel de fotos
   - Lee historia con tono "el animal te adopta"
   - Ve características (vacunado, esterilizado, etc.)
   - Opciones:
     - "Háblale a mi cuidador" → WhatsApp
     - "Postúlate" → (requiere login)

---

## Flujo 2: Guardar Favoritos (Adoptante)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Sin login  │────▶│   Login     │────▶│  Favorito   │
│  Click ❤️   │     │   Modal     │     │  Guardado   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Pasos

1. Usuario (sin login) ve una mascota que le gusta
2. Click en botón de corazón (❤️)
3. Se muestra modal amigable: "Para guardar favoritos, inicia sesión"
4. Usuario inicia sesión / se registra
5. Favorito se guarda automáticamente
6. Usuario puede ver sus favoritos en su perfil

---

## Flujo 3: Solicitar Adopción (Adoptante)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Modal      │────▶│  Formulario │────▶│ Confirmación│────▶│  Seguimiento│
│  Detalle    │     │  Adopción   │     │             │     │  (Perfil)   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Vía Formal (Proceso en Plataforma)

1. Usuario logueado ve mascota
2. Click en "Postúlate para que [Nombre] te adopte"
3. Completa formulario:
   - Mensaje/motivación
   - Info de contacto (pre-llenada)
4. Envía solicitud
5. Ve confirmación: "Tu solicitud fue enviada a [Fundación]"
6. Puede ver estado en su perfil:
   - Pendiente → En revisión → Aprobada/Rechazada

### Vía Rápida (WhatsApp)

1. Click en "Háblale a mi cuidador"
2. Abre WhatsApp con mensaje pre-llenado:
   ```
   ¡Hola! Vi a [Nombre] en Paws y me encantaría conocer más...
   ```
3. Comunicación directa con la fundación

---

## Flujo 4: Explorar Fundaciones (Visitante)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Navegación  │────▶│ Directorio  │────▶│  Acciones   │
│ o Home      │     │ Fundaciones │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    Ver fundación
                    → WhatsApp
                    → Donar
                    → Redes sociales
```

### Pasos

1. Click en "Fundaciones" en navegación
2. Ve directorio de fundaciones verificadas
3. Puede buscar por nombre/ciudad
4. En cada card:
   - Ver descripción
   - Ver conteo de mascotas
   - Click WhatsApp → Contactar
   - Click Donar → Link externo (Nequi, etc.)
   - Click iconos sociales → Instagram/Facebook

---

## Flujo 5: Registrar Fundación (Nueva Fundación)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  CTA en     │────▶│  Registro   │────▶│ Verificación│────▶│   Panel     │
│  Fundaciones│     │  + Form     │     │   (Admin)   │     │  Fundación  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### Pasos

1. Fundación ve CTA "Registrar mi Fundación"
2. Completa registro:
   - Datos de autenticación
   - Información de la fundación
   - Documentos/redes para verificación
3. Envía solicitud
4. **Admin revisa**:
   - Verifica redes sociales activas
   - Verifica documentación
   - Aprueba o rechaza
5. Si aprobada:
   - Fundación recibe badge "Verificada"
   - Accede a panel de administración

---

## Flujo 6: Gestionar Mascotas (Fundación)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Panel     │────▶│   Agregar   │────▶│  Publicada  │
│  Fundación  │     │   Mascota   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │
       ▼
  Editar mascota
  Cambiar estado
  (En proceso / Adoptada)
```

### Acciones Disponibles

1. **Agregar Mascota**
   - Nombre, especie, edad, etc.
   - Subir fotos
   - Escribir historia
   - Publicar

2. **Editar Mascota**
   - Actualizar información
   - Agregar/quitar fotos

3. **Cambiar Estado**
   - Disponible → En proceso (hay interesado)
   - En proceso → Adoptada (adopción exitosa)
   - Pausar publicación

---

## Flujo 7: Procesar Solicitud (Fundación)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Solicitud  │────▶│   Revisar   │────▶│  Decisión   │
│  Recibida   │     │   Perfil    │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                    ┌─────────┴─────────┐
                                    ▼                   ▼
                              ┌──────────┐        ┌──────────┐
                              │ Aprobar  │        │ Rechazar │
                              │          │        │          │
                              └──────────┘        └──────────┘
                                    │                   │
                                    ▼                   ▼
                              Notificar           Notificar
                              adoptante           + razón
```

### Pasos

1. Fundación recibe notificación de nueva solicitud
2. Revisa:
   - Mensaje del adoptante
   - Historial (si hay)
3. Puede:
   - Contactar por WhatsApp para más info
   - Aprobar directamente
   - Rechazar con razón

4. **Si aprueba**:
   - Mascota pasa a "En proceso"
   - Se coordina entrega
   - Luego se marca como "Adoptada"

5. **Si rechaza**:
   - Se envía razón al adoptante
   - Se sugieren otras mascotas compatibles

---

## Casos de Borde

### Mascota Sin Foto
- Se muestra emoji según especie/género
- Cards y modal funcionan igual

### Fundación Sin Verificar
- No aparece en directorio público
- No puede publicar mascotas

### Usuario Sin Completar Perfil
- Puede navegar normalmente
- Al solicitar adopción, se pide completar datos

### Mascota Ya en Proceso
- Se muestra badge "En proceso"
- Botón de postulación deshabilitado
- Mensaje: "Ya está conociendo a alguien especial"

---

## Narrativa Inversa: "Los Animales Adoptan Humanos"

### Implementación en UI

| Contexto | Tradicional | Paws |
|----------|-------------|-------------|
| Header modal | "[Nombre] en adopción" | "¡Hola! Soy [Nombre]" |
| CTA | "Solicitar adopción" | "Postúlate para que [Nombre] te adopte" |
| Requisitos | "Requisitos de adopción" | "Lo que busco en mi futuro humano" |
| Estado | "En proceso de adopción" | "Ya estoy conociendo a alguien especial" |
| WhatsApp | "Contactar fundación" | "Háblale a mi cuidador" |
| Favoritos | "Agregar a favoritos" | "¿Te robé el corazón?" |

### Frases en Primera Persona

Las descripciones de mascotas usan primera persona:
- "Soy muy juguetona y me encanta..."
- "Busco una familia que..."
- "Mi corazón tiene espacio para ti"

---

## Flujo 6: Login y Acceso Admin (Implementado)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Click      │────▶│   Login     │────▶│  Verificar  │
│  "Ingresar" │     │   Modal     │     │   Perfil    │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    ▼                          ▼                          ▼
              ┌───────────┐            ┌───────────────┐          ┌───────────────┐
              │  No existe│            │ role: admin   │          │ role: adopter │
              │  perfil   │            │               │          │               │
              └─────┬─────┘            └───────┬───────┘          └───────┬───────┘
                    │                          │                          │
                    ▼                          ▼                          ▼
              Error: "No          Redirigir a          Cerrar modal
              autorizado"            /admin             y continuar
```

### Componentes Involucrados

1. **LoginModal** (`src/components/auth/LoginModal.tsx`)
   - Formulario de email/password
   - Usa `createPortal` para renderizar sobre todo
   - Bloquea scroll del body
   - Opción de cambiar a postulación

2. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Maneja estado de sesión y perfil
   - Provee `signIn`, `signOut`, `isAdmin`, `isFoundation`
   - Carga perfil en background

3. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
   - Envuelve rutas que requieren autenticación
   - Verifica `isLoading` → muestra loading
   - Verifica `user` → redirige si no hay
   - Verifica `isAdmin` → muestra "No autorizado"

### Estados del Login

| Estado | UI | Acción |
|--------|-----|--------|
| Loading | Spinner en botón | Esperar |
| Error credenciales | Mensaje rojo | Corregir datos |
| Error sin perfil | "No autorizado" | Contactar admin |
| Éxito (admin) | "Redirigiendo..." | Ir a /admin |
| Éxito (adopter) | "Bienvenido" | Cerrar modal |

---

## Flujo 7: Postulación de Fundación (Implementado)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Click      │────▶│ Application │────▶│  Enviar vía │
│"Postularse" │     │   Modal     │     │  Telegram   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         ▼                                           ▼
                   ┌───────────┐                              ┌───────────┐
                   │  Success  │                              │  Fallback │
                   │  Telegram │                              │ Web3Forms │
                   └───────────┘                              └───────────┘
```

### Datos del Formulario
- Nombre de la fundación/rescatista
- Nombre del responsable
- Email
- Teléfono
- Redes sociales
- Experiencia en rescate

### Notificación a Admin
El admin recibe notificación en Telegram con formato:
```
🐾 Nueva Postulación de Fundación

📋 Fundación: Patitas Felices
👤 Responsable: Juan Pérez
📧 Email: juan@email.com
📱 Teléfono: +57 300 123 4567
🔗 Redes: @patitasfelices

📝 Experiencia:
[Descripción de la experiencia...]
```
