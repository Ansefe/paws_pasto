import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/Home'
import { AboutPage } from '@/pages/About'
import { AdoptPage } from '@/pages/Adopt'
import { FoundationsPage } from '@/pages/Foundations'
import { FoundationDetailPage } from '@/pages/FoundationDetail'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/adoptar" element={<AdoptPage />} />
            <Route path="/fundaciones" element={<FoundationsPage />} />
            <Route path="/fundaciones/:id" element={<FoundationDetailPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
