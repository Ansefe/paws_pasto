import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Loader2, Medal } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { TopDonor } from "@/types/database.types"

type Period = "month" | "all"

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

const medalColor = (i: number) =>
  i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-700" : "text-gray-300"

export function TopDonors() {
  const [period, setPeriod] = useState<Period>("month")
  const [donors, setDonors] = useState<TopDonor[]>([])
  const [loading, setLoading] = useState(true)

  // El setState ocurre solo tras el await (no de forma síncrona en el efecto).
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data, error } = await supabase.rpc("top_donors", { period, max_rows: 10 })
      if (!active) return
      if (!error) setDonors((data as TopDonor[]) ?? [])
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [period])

  const changePeriod = (p: Period) => {
    if (p === period) return
    setLoading(true) // en handler de evento (permitido), no en el efecto
    setPeriod(p)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" />
          Top donadores
        </span>
        <h2 className="text-3xl font-bold text-gray-800">Gracias a quienes más apoyan</h2>
        <p className="text-gray-500 mt-2">Solo cuentan las donaciones confirmadas.</p>
      </div>

      {/* Tabs de periodo */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex gap-1 bg-gray-100 p-1 rounded-full">
          {(["month", "all"] as const).map((p) => (
            <button
              key={p}
              onClick={() => changePeriod(p)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                period === p ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "month" ? "Este mes" : "Histórico"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      ) : donors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">Aún no hay donaciones confirmadas en este periodo.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {donors.map((d, i) => (
            <motion.div
              key={d.profile_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="w-8 flex justify-center">
                {i < 3 ? (
                  <Medal className={`w-6 h-6 ${medalColor(i)}`} />
                ) : (
                  <span className="text-sm font-bold text-gray-400">{i + 1}</span>
                )}
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                {d.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{d.display_name}</p>
                <p className="text-xs text-gray-400">
                  {d.donations} {d.donations === 1 ? "donación" : "donaciones"}
                </p>
              </div>
              <p className="font-bold text-pink-600">{formatCop(d.total_cop)}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
