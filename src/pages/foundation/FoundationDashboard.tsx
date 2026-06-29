import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  LayoutDashboard, PawPrint, LogOut, Menu, Loader2,
  Plus, Edit2, Trash2, AlertTriangle, Building2,
  Heart, HandHeart, Check, X as XIcon, Clock, CheckCircle2, XCircle, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { PetFormModal } from "@/components/admin/PetFormModal"
import { FoundationFormModal } from "@/components/admin/FoundationFormModal"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/AuthContext"
import { useMyFoundation } from "@/hooks/useMyFoundation"
import { useToast } from "@/contexts/ToastContext"
import type { Pet } from "@/types/database.types"

type Section = "overview" | "pets" | "claims" | "donations" | "profile"

const petStatus: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-emerald-100 text-emerald-700" },
  in_process: { label: "En proceso", color: "bg-amber-100 text-amber-700" },
  adopted: { label: "Adoptado", color: "bg-pink-100 text-pink-700" },
  paused: { label: "Pausado", color: "bg-gray-100 text-gray-700" },
}

const reviewStatus: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  reported: { label: "Reportada", color: "bg-amber-100 text-amber-700", icon: Clock },
  confirmed: { label: "Confirmada", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700", icon: XCircle },
}

const formatCop = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)

type ClaimRow = {
  id: string
  status: "pending" | "confirmed" | "rejected"
  story: string | null
  created_at: string
  pet: { name: string; main_photo_url: string | null; species: string } | null
  adopter: { full_name: string | null } | null
}

type DonationRow = {
  id: string
  amount_cop: number
  status: "reported" | "confirmed" | "rejected"
  note: string | null
  created_at: string
  donor: { full_name: string | null } | null
  reporter_name: string | null
}

export function FoundationDashboard() {
  const { profile, signOut } = useAuth()
  const { foundation, loading: loadingFoundation, refetch: refetchFoundation } = useMyFoundation()
  const toast = useToast()
  const navigate = useNavigate()

  const [section, setSection] = useState<Section>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)

  const [pets, setPets] = useState<Pet[]>([])
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [donations, setDonations] = useState<DonationRow[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const [petToEdit, setPetToEdit] = useState<Pet | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const foundationId = foundation?.id

  useEffect(() => {
    let active = true
    if (!foundationId) {
      setLoadingData(false)
      return
    }
    ;(async () => {
      const [petsRes, claimsRes, donationsRes] = await Promise.all([
        supabase.from("pets").select("*").eq("foundation_id", foundationId).order("created_at", { ascending: false }),
        supabase
          .from("adoption_claims")
          .select("id, status, story, created_at, pet:pets(name, main_photo_url, species), adopter:profiles!adoption_claims_profile_id_fkey(full_name)")
          .eq("foundation_id", foundationId)
          .order("created_at", { ascending: false }),
        supabase
          .from("donation_reports")
          .select("id, amount_cop, status, note, created_at, reporter_name, donor:profiles!donation_reports_profile_id_fkey(full_name)")
          .eq("foundation_id", foundationId)
          .order("created_at", { ascending: false }),
      ])
      if (!active) return
      setPets((petsRes.data as Pet[]) ?? [])
      setClaims((claimsRes.data as unknown as ClaimRow[]) ?? [])
      setDonations((donationsRes.data as unknown as DonationRow[]) ?? [])
      setLoadingData(false)
    })()
    return () => { active = false }
  }, [foundationId, reloadKey])

  const refresh = () => setReloadKey((k) => k + 1)

  const handleDelete = async () => {
    if (!petToDelete) return
    setDeleting(true)
    try {
      const { error } = await supabase.from("pets").delete().eq("id", petToDelete.id)
      if (error) throw error
      toast.success("Mascota eliminada", petToDelete.name)
      setPetToDelete(null)
      refresh()
    } catch (err) {
      toast.error("No se pudo eliminar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setDeleting(false)
    }
  }

  const updateClaim = async (row: ClaimRow, status: "confirmed" | "rejected") => {
    setActionLoading(true)
    try {
      const { error } = await supabase.from("adoption_claims").update({ status }).eq("id", row.id)
      if (error) throw error
      toast.success(status === "confirmed" ? "Adopción confirmada 🎉" : "Reclamo rechazado", row.pet?.name || "")
      refresh()
    } catch (err) {
      toast.error("No se pudo actualizar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setActionLoading(false)
    }
  }

  const updateDonation = async (row: DonationRow, status: "confirmed" | "rejected") => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from("donation_reports")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", row.id)
      if (error) throw error
      toast.success(status === "confirmed" ? "Donación confirmada" : "Donación rechazada", formatCop(row.amount_cop))
      refresh()
    } catch (err) {
      toast.error("No se pudo actualizar", err instanceof Error ? err.message : "Inténtalo de nuevo")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  const stats = {
    total: pets.length,
    available: pets.filter((p) => p.status === "available").length,
    inProcess: pets.filter((p) => p.status === "in_process").length,
    adopted: pets.filter((p) => p.status === "adopted").length,
  }
  const pendingClaims = claims.filter((c) => c.status === "pending").length
  const pendingDonations = donations.filter((d) => d.status === "reported").length
  const donorName = (d: DonationRow) => d.donor?.full_name || d.reporter_name || "Anónimo"

  const menu = [
    { id: "overview" as const, label: "Resumen", icon: LayoutDashboard },
    { id: "pets" as const, label: "Mis Mascotas", icon: PawPrint },
    { id: "claims" as const, label: "Reclamos", icon: Heart },
    { id: "donations" as const, label: "Donaciones", icon: HandHeart },
    { id: "profile" as const, label: "Mi Perfil", icon: Building2 },
  ]

  if (loadingFoundation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    )
  }

  if (!foundation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">No tienes una fundación asociada</h1>
          <p className="text-gray-500 mb-6">Tu cuenta aún no está vinculada a una fundación. Contacta al administrador.</p>
          <Button onClick={() => navigate("/")} variant="outline" className="rounded-xl">Volver al inicio</Button>
        </div>
      </div>
    )
  }

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center gap-2 px-4 border-b border-gray-100">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-gray-800 truncate">{foundation.foundation_name}</span>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) => {
          const badge = item.id === "claims" ? pendingClaims : item.id === "donations" ? pendingDonations : 0
          return (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setMobileOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                section === item.id
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium flex-1 text-left">{item.label}</span>
              {badge > 0 && (
                <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${section === item.id ? "bg-white/30 text-white" : "bg-amber-100 text-amber-700"}`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
            {(profile?.full_name?.charAt(0) || "F").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || "Fundación"}</p>
            <p className="text-xs text-gray-500 truncate">{foundation.foundation_name}</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start gap-2">
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
        <SidebarContent />
      </aside>

      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold text-gray-800">{menu.find((m) => m.id === section)?.label}</h2>
        </header>

        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {/* RESUMEN */}
          {section === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Hola, {foundation.foundation_name} 👋</h1>
                <p className="text-gray-500">Resumen de tu actividad en Paws</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100"><p className="text-2xl font-bold text-gray-800">{stats.total}</p><p className="text-sm text-gray-500">Mascotas</p></div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"><p className="text-2xl font-bold text-emerald-700">{stats.available}</p><p className="text-sm text-emerald-600">Disponibles</p></div>
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100"><p className="text-2xl font-bold text-amber-700">{stats.inProcess}</p><p className="text-sm text-amber-600">En proceso</p></div>
                <div className="bg-pink-50 rounded-xl p-4 border border-pink-100"><p className="text-2xl font-bold text-pink-700">{stats.adopted}</p><p className="text-sm text-pink-600">Adoptadas</p></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <button onClick={() => setSection("claims")} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow text-left">
                  <div><p className="text-sm text-gray-500">Reclamos por revisar</p><p className="text-3xl font-bold text-gray-800">{pendingClaims}</p></div>
                  <Heart className="w-8 h-8 text-cyan-400" />
                </button>
                <button onClick={() => setSection("donations")} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow text-left">
                  <div><p className="text-sm text-gray-500">Donaciones por revisar</p><p className="text-3xl font-bold text-gray-800">{pendingDonations}</p></div>
                  <HandHeart className="w-8 h-8 text-pink-400" />
                </button>
              </div>
            </div>
          )}

          {/* MIS MASCOTAS */}
          {section === "pets" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Mis Mascotas</h1>
                  <p className="text-gray-500">Gestiona las mascotas de tu fundación</p>
                </div>
                <Button
                  onClick={() => { setPetToEdit(null); setIsFormOpen(true) }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl gap-2"
                >
                  <Plus className="w-4 h-4" /> Agregar Mascota
                </Button>
              </div>

              {loadingData ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
              ) : pets.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aún no tienes mascotas registradas.</p>
                  <Button onClick={() => { setPetToEdit(null); setIsFormOpen(true) }} variant="outline" className="rounded-xl">Agregar la primera</Button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Mascota</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Detalles</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                          <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pets.map((pet) => {
                          const st = petStatus[pet.status] || petStatus.available
                          return (
                            <tr key={pet.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                    {pet.main_photo_url ? (
                                      <img src={pet.main_photo_url} alt={pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl">{pet.species === "cat" ? "🐈" : "🐕"}</div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">{pet.name}</p>
                                    <p className="text-sm text-gray-500">{pet.breed || "—"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {pet.species === "dog" ? "Perro" : "Gato"} • {pet.age_approx || "?"} • {pet.gender === "male" ? "Macho" : "Hembra"}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => { setPetToEdit(pet); setIsFormOpen(true) }}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setPetToDelete(pet)}>
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RECLAMOS */}
          {section === "claims" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Reclamos de adopción</h1>
                <p className="text-gray-500">Adopciones reportadas por usuarios sobre tus mascotas</p>
              </div>
              {loadingData ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
              ) : claims.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aún no hay reclamos de adopción.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((c) => {
                    const st = reviewStatus[c.status]
                    return (
                      <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {c.pet?.main_photo_url ? (
                            <img src={c.pet.main_photo_url} alt={c.pet.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">{c.pet?.species === "cat" ? "🐈" : "🐕"}</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800">{c.pet?.name || "Mascota"}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><User className="w-3.5 h-3.5" /> {c.adopter?.full_name || "Adoptante"}</p>
                          {c.story && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{c.story}</p>}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${st.color}`}>
                          <st.icon className="w-3.5 h-3.5" /> {st.label}
                        </span>
                        {c.status === "pending" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" disabled={actionLoading} onClick={() => updateClaim(c, "confirmed")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                              <Check className="w-4 h-4" /> Confirmar
                            </Button>
                            <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => updateClaim(c, "rejected")} className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 gap-1">
                              <XIcon className="w-4 h-4" /> Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* DONACIONES */}
          {section === "donations" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Donaciones</h1>
                <p className="text-gray-500">Donaciones reportadas hacia tu fundación</p>
              </div>
              {loadingData ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>
              ) : donations.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <HandHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aún no hay donaciones reportadas.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
                  {donations.map((d) => {
                    const st = reviewStatus[d.status]
                    return (
                      <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800">{donorName(d)}</p>
                          {d.note && <p className="text-sm text-gray-500 line-clamp-1">{d.note}</p>}
                          <p className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString("es-CO")}</p>
                        </div>
                        <p className="font-bold text-pink-600 shrink-0">{formatCop(d.amount_cop)}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${st.color}`}>
                          <st.icon className="w-3.5 h-3.5" /> {st.label}
                        </span>
                        {d.status === "reported" && (
                          <div className="flex gap-2 shrink-0">
                            <Button size="sm" disabled={actionLoading} onClick={() => updateDonation(d, "confirmed")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                              <Check className="w-4 h-4" /> Confirmar
                            </Button>
                            <Button size="sm" variant="outline" disabled={actionLoading} onClick={() => updateDonation(d, "rejected")} className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 gap-1">
                              <XIcon className="w-4 h-4" /> Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* MI PERFIL */}
          {section === "profile" && (
            <div className="space-y-6 max-w-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
                  <p className="text-gray-500">Datos públicos de tu fundación</p>
                </div>
                <Button onClick={() => setIsProfileOpen(true)} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl gap-2">
                  <Edit2 className="w-4 h-4" /> Editar
                </Button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {foundation.logo_url ? (
                      <img src={foundation.logo_url} alt={foundation.foundation_name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-gray-800">{foundation.foundation_name}</h2>
                      {foundation.is_verified && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{foundation.location_city}</p>
                  </div>
                </div>
                {foundation.description && <p className="text-sm text-gray-600">{foundation.description}</p>}
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <p><span className="text-gray-400">WhatsApp:</span> {foundation.whatsapp_number || "—"}</p>
                  <p><span className="text-gray-400">Email:</span> {foundation.email || "—"}</p>
                  <p><span className="text-gray-400">Dirección:</span> {foundation.location_address || "—"}</p>
                  <p><span className="text-gray-400">Donación:</span> {foundation.donation_link || "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modales */}
      <PetFormModal
        pet={petToEdit}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => { setIsFormOpen(false); refresh() }}
        lockedFoundationId={foundation.id}
      />

      <FoundationFormModal
        foundation={foundation}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSaved={() => { setIsProfileOpen(false); refetchFoundation() }}
        selfEdit
      />

      <Dialog open={!!petToDelete} onOpenChange={(open) => !open && setPetToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Eliminar mascota
            </DialogTitle>
            <DialogDescription>
              ¿Eliminar a <strong>{petToDelete?.name}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPetToDelete(null)} disabled={deleting} className="rounded-xl">Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl bg-red-600 hover:bg-red-700">
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Eliminando...</> : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
