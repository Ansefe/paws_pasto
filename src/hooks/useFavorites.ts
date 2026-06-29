import { useSyncExternalStore } from "react"

// Favoritos persistidos en localStorage, sin necesidad de login.
// Usa useSyncExternalStore + un store en memoria para que TODOS los componentes
// (tarjetas, modal, contador del header) se mantengan sincronizados en vivo.

const KEY = "paws:favorites"
const EMPTY: string[] = []
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Cache estable: useSyncExternalStore compara por referencia (Object.is).
let cache: string[] = read()

function emit() {
  cache = read()
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  // Sincroniza entre pestañas del navegador.
  window.addEventListener("storage", emit)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", emit)
  }
}

function getSnapshot() {
  return cache
}

function getServerSnapshot() {
  return EMPTY
}

function setFavorites(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Ignorar errores de cuota / modo privado
  }
  emit()
}

export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isFavorite = (id: string) => ids.includes(id)

  const toggleFavorite = (id: string) => {
    setFavorites(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])
  }

  return { ids, isFavorite, toggleFavorite, count: ids.length }
}
