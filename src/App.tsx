import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FloatingBadge } from '@/components/FloatingBadge'
import { HomePage } from '@/pages/Home'
import { AboutPage } from '@/pages/About'
import { AdoptPage } from '@/pages/Adopt'
import { FoundationsPage } from '@/pages/Foundations'
import { FoundationDetailPage } from '@/pages/FoundationDetail'
import DonatePage from '@/pages/Donate'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import { AuthProvider } from '@/contexts/AuthContext'
import { SiteConfigProvider } from '@/contexts/SiteConfigContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Layout para páginas públicas (con header y footer)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingBadge />
    </div>
  )
}

// Componente que decide el layout basado en la ruta
function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <Routes>
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    )
  }

  return (
    <PublicLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/adoptar" element={<AdoptPage />} />
        <Route path="/fundaciones" element={<FoundationsPage />} />
        <Route path="/fundaciones/:id" element={<FoundationDetailPage />} />
        <Route path="/donar" element={<DonatePage />} />
      </Routes>
    </PublicLayout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SiteConfigProvider>
          <AppContent />
        </SiteConfigProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
