import { motion } from "framer-motion"
import {
  PawPrint, Building2, Users, Heart,
  AlertCircle,
  ArrowUpRight, Loader2, Inbox
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAdminMetrics, type ActivityItem } from "@/hooks/useAdminMetrics"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

// Formatea una fecha ISO como tiempo relativo en español
function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  const diffMs = Date.now() - then
  const diffMin = Math.round(diffMs / 60000)
  if (diffMin < 1) return "Hace un momento"
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffHours = Math.round(diffMin / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `Hace ${diffDays} d`
  return new Date(iso).toLocaleDateString('es-CO')
}

const activityStyles: Record<ActivityItem["type"], { icon: typeof Heart; color: string }> = {
  foundation: { icon: Building2, color: "text-amber-500" },
  pet: { icon: PawPrint, color: "text-cyan-500" },
  user: { icon: Users, color: "text-purple-500" },
}

export function AdminOverview() {
  const { metrics, activity, loading, error, refetch } = useAdminMetrics()

  const stats = metrics
    ? [
        {
          label: "Mascotas en Adopción",
          value: metrics.petsInAdoption,
          change: metrics.petsNewThisMonth > 0 ? `+${metrics.petsNewThisMonth} este mes` : null,
          icon: PawPrint,
          bgColor: "bg-cyan-50",
          iconColor: "text-cyan-600",
        },
        {
          label: "Fundaciones Activas",
          value: metrics.foundationsVerified,
          change: metrics.foundationsNewThisMonth > 0 ? `+${metrics.foundationsNewThisMonth} este mes` : null,
          icon: Building2,
          bgColor: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          label: "Mascotas Adoptadas",
          value: metrics.petsAdopted,
          change: null,
          icon: Heart,
          bgColor: "bg-pink-50",
          iconColor: "text-pink-600",
        },
        {
          label: "Usuarios Registrados",
          value: metrics.usersTotal,
          change: metrics.usersNewThisMonth > 0 ? `+${metrics.usersNewThisMonth} este mes` : null,
          icon: Users,
          bgColor: "bg-purple-50",
          iconColor: "text-purple-600",
        },
      ]
    : []

  const pendingItems = metrics
    ? [
        { type: "Fundaciones pendientes", count: metrics.foundationsPending, icon: Building2, urgent: metrics.foundationsPending > 0 },
        { type: "Mascotas en proceso", count: metrics.petsInProcess, icon: Heart, urgent: false },
        { type: "Mascotas sin foto", count: metrics.petsWithoutPhoto, icon: AlertCircle, urgent: false },
      ]
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Bienvenido al panel de administración de Paws</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={refetch} variant="outline" className="mt-4 rounded-xl">
            Reintentar
          </Button>
        </div>
      )}

      {!loading && !error && metrics && (
        <>
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
                  {stat.change && (
                    <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                      {stat.change}
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  )}
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
              </div>
              {activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item) => {
                    const style = activityStyles[item.type]
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gray-50 ${style.color}`}>
                          <style.icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700">{item.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(item.createdAt)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Sin actividad reciente</p>
                </div>
              )}
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

          {/* Mascotas por estado */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white"
          >
            <div className="flex items-center gap-2 mb-4">
              <PawPrint className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Mascotas por estado</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-bold">{metrics.petsAvailable}</p>
                <p className="text-white/80 text-sm">Disponibles</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics.petsInProcess}</p>
                <p className="text-white/80 text-sm">En proceso</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics.petsAdopted}</p>
                <p className="text-white/80 text-sm">Adoptadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{metrics.petsPaused}</p>
                <p className="text-white/80 text-sm">Pausadas</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
