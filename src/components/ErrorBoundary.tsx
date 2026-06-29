import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// Captura errores de render en el árbol y evita la pantalla en blanco.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Error capturado:", error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🐾</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-6">
              Ocurrió un error inesperado. Puedes intentar recargar la página.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Recargar
              </button>
              <a
                href="/"
                className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-all"
              >
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
