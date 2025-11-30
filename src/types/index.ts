// Tipos base para HogarPeludo

export interface Animal {
  id: string
  nombre: string
  especie: 'perro' | 'gato' | 'otro'
  raza?: string
  edad: string
  sexo: 'macho' | 'hembra'
  tamaño: 'pequeño' | 'mediano' | 'grande'
  descripcion: string
  imagenes: string[]
  fundacionId: string
  estado: 'disponible' | 'en_proceso' | 'adoptado'
  createdAt: Date
}

export interface Fundacion {
  id: string
  nombre: string
  descripcion: string
  logo?: string
  direccion: string
  telefono: string
  whatsapp?: string
  email: string
  verificada: boolean
  createdAt: Date
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: 'adoptante' | 'fundacion' | 'admin'
  favoritos: string[]
  createdAt: Date
}

export interface SolicitudAdopcion {
  id: string
  animalId: string
  usuarioId: string
  fundacionId: string
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada'
  mensaje?: string
  createdAt: Date
}
