import { useState } from "react"
import { motion } from "framer-motion"
import { 
  LayoutDashboard, Users, Building2, PawPrint, Settings,
  ChevronRight, LogOut, Bell, Search, Menu, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Importar las secciones
import { AdminOverview } from "./sections/AdminOverview"
import { AdminUsers } from "./sections/AdminUsers"
import { AdminFoundations } from "./sections/AdminFoundations"
import { AdminPets } from "./sections/AdminPets"
import { AdminSettings } from "./sections/AdminSettings"

type AdminSection = "overview" | "users" | "foundations" | "pets" | "settings"

const menuItems = [
  { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "users" as const, label: "Usuarios", icon: Users },
  { id: "foundations" as const, label: "Fundaciones", icon: Building2 },
  { id: "pets" as const, label: "Mascotas", icon: PawPrint },
  { id: "settings" as const, label: "Configuración", icon: Settings },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />
      case "users":
        return <AdminUsers />
      case "foundations":
        return <AdminFoundations />
      case "pets":
        return <AdminPets />
      case "settings":
        return <AdminSettings />
      default:
        return <AdminOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-800">Paws Admin</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg"
          >
            <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">Administrador</p>
                <p className="text-xs text-gray-500 truncate">admin@paws.com</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ${
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-800">Paws Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id)
                setMobileSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeSection === item.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Buscar..." 
                className="pl-10 w-64 rounded-xl border-gray-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderSection()}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
