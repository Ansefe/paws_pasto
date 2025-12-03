import { motion } from "framer-motion"
import { 
  PawPrint, Building2, Users, Heart, 
  TrendingUp, Clock, AlertCircle,
  ArrowUpRight, ArrowDownRight
} from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stats = [
  { 
    label: "Mascotas en Adopción", 
    value: "124", 
    change: "+12%", 
    trend: "up",
    icon: PawPrint, 
    color: "cyan",
    bgColor: "bg-cyan-50",
    iconColor: "text-cyan-600"
  },
  { 
    label: "Fundaciones Activas", 
    value: "8", 
    change: "+2", 
    trend: "up",
    icon: Building2, 
    color: "emerald",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600"
  },
  { 
    label: "Adopciones este mes", 
    value: "23", 
    change: "+18%", 
    trend: "up",
    icon: Heart, 
    color: "pink",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600"
  },
  { 
    label: "Usuarios Registrados", 
    value: "342", 
    change: "+5%", 
    trend: "up",
    icon: Users, 
    color: "purple",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600"
  },
]

const recentActivity = [
  { type: "adoption", message: "Luna fue adoptada por María García", time: "Hace 2 horas", icon: Heart, color: "text-pink-500" },
  { type: "foundation", message: "Nueva fundación pendiente: Patitas Felices", time: "Hace 4 horas", icon: Building2, color: "text-amber-500" },
  { type: "pet", message: "Nuevo peludo registrado: Max (Perro)", time: "Hace 5 horas", icon: PawPrint, color: "text-cyan-500" },
  { type: "user", message: "Nuevo usuario registrado: Carlos Ruiz", time: "Hace 6 horas", icon: Users, color: "text-purple-500" },
]

const pendingItems = [
  { type: "Fundación pendiente", count: 2, icon: Building2, urgent: true },
  { type: "Solicitudes de adopción", count: 5, icon: Clock, urgent: false },
  { type: "Mascotas sin foto", count: 3, icon: AlertCircle, urgent: false },
]

export function AdminOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Bienvenido al panel de administración de Paws</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-emerald-600" : "text-red-600"
              }`}>
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Actividad Reciente</h2>
            <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">
              Ver todo
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${activity.color}`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">{activity.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pending Items */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Pendientes</h2>
          </div>
          <div className="space-y-3">
            {pendingItems.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 rounded-xl ${
                  item.urgent ? "bg-amber-50 border border-amber-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.urgent ? "text-amber-600" : "text-gray-500"}`} />
                  <span className={`font-medium ${item.urgent ? "text-amber-800" : "text-gray-700"}`}>
                    {item.type}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  item.urgent 
                    ? "bg-amber-200 text-amber-800" 
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Resumen del Mes</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-3xl font-bold">23</p>
            <p className="text-white/80 text-sm">Adopciones</p>
          </div>
          <div>
            <p className="text-3xl font-bold">45</p>
            <p className="text-white/80 text-sm">Nuevas mascotas</p>
          </div>
          <div>
            <p className="text-3xl font-bold">89</p>
            <p className="text-white/80 text-sm">Nuevos usuarios</p>
          </div>
          <div>
            <p className="text-3xl font-bold">2</p>
            <p className="text-white/80 text-sm">Nuevas fundaciones</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
