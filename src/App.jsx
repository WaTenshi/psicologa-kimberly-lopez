import './App.css'
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './config/firebase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Services from './components/Services'
import Approach from './components/Approach'
import About from './components/About'
import WorkingStyle from './components/WorkingStyle'
import Diplomas from './components/Diplomas'
import Location from './components/Location'
import Footer from './components/Footer'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import FloatingChat from './components/FloatingChat'

function App() {
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminUser, setAdminUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  // Verificar estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUser(user)
        setShowAdminLogin(false)
      } else {
        setAdminUser(null)
      }
      setLoadingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  const handleAdminLoginSuccess = (user) => {
    setAdminUser(user)
    setShowAdminLogin(false)
  }

  const handleAdminLogout = () => {
    setAdminUser(null)
  }

  if (loadingAuth) {
    return <div className="app">Cargando...</div>
  }

  // Si está autenticado, mostrar el dashboard
  if (adminUser) {
    return <AdminDashboard onLogout={handleAdminLogout} />
  }

  return (
    <div className="app">
      <Navbar />
      <Hero />
      <Services />
      <Approach />
      <About />
      <WorkingStyle />
      <Diplomas />
      <Location />
      <Footer onAdminClick={() => setShowAdminLogin(true)} />

      <FloatingChat />
      
      {showAdminLogin && (
        <AdminLogin
          onLoginSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </div>
  )
}

export default App
