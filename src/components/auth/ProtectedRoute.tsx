import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'foundation' | 'adopter'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin, isFoundation } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, redirigir al inicio
  if (!user) {
    return <Navigate to="/" state={{ from: location, showLogin: true }} replace />
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole) {
    let hasAccess = false

    switch (requiredRole) {
      case 'admin':
        hasAccess = isAdmin
        break
      case 'foundation':
        hasAccess = isFoundation || isAdmin // Admin tiene acceso a todo
        break
      case 'adopter':
        hasAccess = true // Cualquier usuario autenticado
        break
    }

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta sección. 
              {requiredRole === 'admin' && ' Esta área es exclusiva para administradores.'}
              {requiredRole === 'foundation' && ' Esta área es exclusiva para fundaciones verificadas.'}
            </p>
            <a 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
