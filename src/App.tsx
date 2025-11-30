import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/Home'
import { AboutPage } from '@/pages/About'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            {/* Añadir más rutas aquí */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
