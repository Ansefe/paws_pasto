import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Heart, HandHeart, PawPrint, Loader2, CheckCircle2, Clock, XCircle, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"

type ClaimRow = {
  id: string
  status: "pending" | "confirmed" | "rejected"
  story: string | null
  created_at: string
  pet: { name: string; main_photo_url: string | null; species: string } | null
}

type DonationRow = {
  id: string
  amount_cop: number
  status: "reported" | "confirmed" | "rejected"
  created_at: string
  foundation: { foundation_name: string } | null
}

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

const claimStatus: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "En revisión", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700", icon: XCircle },
}

export function ProfilePage() {
  const { user, profile, isLoading, signOut } = useAuth()
  const navigate = useNavigate()

  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [donations, setDonations] = useState<DonationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/")
    }
  }, [isLoading, user, navigate])

  useEffect(() => {
    if (!user) return
    let active = true
    ;(async () => {
      const [claimsRes, donationsRes] = await Promise.all([
        supabase
          .from("adoption_claims")
          .select("id, status, story, created_at, pet:pets(name, main_photo_url, species)")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("donation_reports")
          .select("id, amount_cop, status, created_at, foundation:foundations(foundation_name)")
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false }),
      ])
      if (!active) return
      if (!claimsRes.error) setClaims((claimsRes.data as unknown as ClaimRow[]) ?? [])
      if (!donationsRes.error) setDonations((donationsRes.data as unknown as DonationRow[]) ?? [])
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [user])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    )
  }

  const confirmedAdoptions = claims.filter((c) => c.status === "confirmed").length
  const totalDonated = donations.filter((d) => d.status === "confirmed").reduce((s, d) => s + d.amount_cop, 0)
  const initial = (profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero */}
      <section className="relative pt-28 pb-12 bg-gradient-to-br from-cyan-500 to-blue-600">
        <div className="container px-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur text-white text-3xl font-bold flex items-center justify-center shadow-lg">
              {initial}
            </div>
            <div className="text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name || "Mi perfil"}</h1>
              <p className="text-white/80 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8 max-w-md">
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-white">
              <p className="text-3xl font-bold">{confirmedAdoptions}</p>
              <p className="text-white/80 text-sm">Adopciones</p>
            </div>
            <div className="bg-white/15 backdrop-blur rounded-2xl p-4 text-white">
              <p className="text-3xl font-bold">{formatCop(totalDonated)}</p>
              <p className="text-white/80 text-sm">Donado (confirmado)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container px-4 py-8 space-y-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Adopciones */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" /> Mis adopciones
              </h2>
              {claims.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <PawPrint className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aún no has registrado adopciones.</p>
                  <Link to="/adoptar">
                    <Button variant="outline" className="rounded-full">Explorar mascotas</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {claims.map((c) => {
                    const st = claimStatus[c.status]
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="aspect-video bg-gray-100">
                          {c.pet?.main_photo_url ? (
                            <img src={c.pet.main_photo_url} alt={c.pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">
                              {c.pet?.species === "cat" ? "🐈" : "🐕"}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-800">{c.pet?.name || "Mascota"}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                              <st.icon className="w-3 h-3" /> {st.label}
                            </span>
                          </div>
                          {c.story && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.story}</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Donaciones */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-pink-500" /> Mis donaciones
              </h2>
              {donations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <HandHeart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aún no has reportado donaciones.</p>
                  <Link to="/donar">
                    <Button variant="outline" className="rounded-full">Apoyar una fundación</Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                  {donations.map((d) => {
                    const st = claimStatus[d.status === "reported" ? "pending" : d.status]
                    return (
                      <div key={d.id} className="flex items-center justify-between px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{d.foundation?.foundation_name || "Fundación"}</p>
                          <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString("es-CO")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                            {d.status === "reported" ? "Reportada" : st.label}
                          </span>
                          <p className="font-bold text-pink-600">{formatCop(d.amount_cop)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button variant="ghost" onClick={async () => { await signOut(); navigate("/") }} className="text-red-600 hover:bg-red-50 gap-2">
                <LogOut className="w-4 h-4" /> Cerrar sesión
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
