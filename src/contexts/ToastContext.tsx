import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
}

interface ToastOptions {
  title: string
  message?: string
  duration?: number
}

interface ToastContextValue {
  toast: (type: ToastType, options: ToastOptions) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

const typeStyles: Record<ToastType, { icon: typeof Info; iconColor: string; bar: string }> = {
  success: { icon: CheckCircle2, iconColor: "text-emerald-500", bar: "bg-emerald-500" },
  error: { icon: AlertCircle, iconColor: "text-red-500", bar: "bg-red-500" },
  info: { icon: Info, iconColor: "text-cyan-500", bar: "bg-cyan-500" },
}

let nextId = 1

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((type: ToastType, options: ToastOptions) => {
    const id = nextId++
    const duration = options.duration ?? 4000
    setToasts((prev) => [...prev, { id, type, title: options.title, message: options.message }])
    window.setTimeout(() => remove(id), duration)
  }, [remove])

  const success = useCallback((title: string, message?: string) => toast("success", { title, message }), [toast])
  const error = useCallback((title: string, message?: string) => toast("error", { title, message }), [toast])
  const info = useCallback((title: string, message?: string) => toast("info", { title, message }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}

      {/* Toaster */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = typeStyles[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex"
              >
                <div className={`w-1 shrink-0 ${style.bar}`} />
                <div className="flex items-start gap-3 p-4 flex-1">
                  <style.icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                    {t.message && <p className="text-sm text-gray-500 mt-0.5 break-words">{t.message}</p>}
                  </div>
                  <button
                    onClick={() => remove(t.id)}
                    className="text-gray-400 hover:text-gray-600 shrink-0"
                    aria-label="Cerrar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider")
  return ctx
}
