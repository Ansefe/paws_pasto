import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PawPrint, Home, Search } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 pt-24 pb-12">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-50 rounded-full mb-6">
          <PawPrint className="w-10 h-10 text-cyan-400" />
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Página no encontrada</h2>
        <p className="text-gray-500 mb-8">
          La página que buscas no existe o fue movida. Pero hay muchos peluditos esperándote.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full">
            <Link to="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" /> Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/adoptar" className="flex items-center gap-2">
              <Search className="w-4 h-4" /> Ver mascotas
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
