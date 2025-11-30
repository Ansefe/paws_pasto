import { motion } from "framer-motion"
import { PawPrint } from "lucide-react"

export function FloatingBadge() {
  return (
    <motion.div
      className="fixed bottom-6 left-6 z-40"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-4 py-2.5 border border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
          <PawPrint className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 leading-none">Paws</span>
          <span className="text-sm font-semibold text-gray-800 leading-tight">Pasto Adopciones</span>
        </div>
      </div>
    </motion.div>
  )
}
