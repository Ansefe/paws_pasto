import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  LayoutDashboard, Users, Building2, PawPrint, Settings,
  Inbox, HandHeart, Heart, ChevronRight, LogOut, Menu, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

// Importar las secciones
import { AdminOverview } from "./sections/AdminOverview"
import { AdminUsers } from "./sections/AdminUsers"
import { AdminFoundations } from "./sections/AdminFoundations"
import { AdminPets } from "./sections/AdminPets"
import { AdminApplications } from "./sections/AdminApplications"
import { AdminDonations } from "./sections/AdminDonations"
import { AdminClaims } from "./sections/AdminClaims"
import { AdminSettings } from "./sections/AdminSettings"

type AdminSection = "overview" | "users" | "foundations" | "pets" | "applications" | "donations" | "claims" | "settings"

const menuItems = [
  { id: "overview" as const, label: "Dashboard", icon: LayoutDashboard },
  { id: "users" as const, label: "Usuarios", icon: Users },
  { id: "foundations" as const, label: "Fundaciones", icon: Building2 },
  { id: "pets" as const, label: "Mascotas", icon: PawPrint },
  { id: "applications" as const, label: "Solicitudes", icon: Inbox },
  { id: "donations" as const, label: "Donaciones", icon: HandHeart },
  { id: "claims" as const, label: "Reclamos", icon: Heart },
  { id: "settings" as const, label: "Configuración", icon: Settings },
]

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  const adminName = profile?.full_name || "Administrador"
  const adminEmail = user?.email || ""
  const adminInitial = (profile?.full_name?.charAt(0) || adminEmail.charAt(0) || "A").toUpperCase()

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
      case "applications":
        return <AdminApplications />
      case "donations":
        return <AdminDonations />
      case "claims":
        return <AdminClaims />
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
              {adminInitial}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
                <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
              </div>
            )}
          </div>
          {sidebarOpen ? (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
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
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col transform transition-transform duration-300 ${
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

        {/* User & Logout (móvil) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
              {adminInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{adminName}</p>
              <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold text-gray-800">
            {menuItems.find((m) => m.id === activeSection)?.label}
          </h2>
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
