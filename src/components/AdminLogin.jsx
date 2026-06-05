import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { LockKeyhole, Mail, X } from 'lucide-react'
import { auth } from '../config/firebase'
import '../styles/AdminLogin.css'

export default function AdminLogin({ onLoginSuccess, onClose }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      if (userCredential.user) {
        onLoginSuccess(userCredential.user)
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      console.error('Error de login:', err)
      if (err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos')
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuario no encontrado')
      } else {
        setError('Error al iniciar sesión')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-overlay" onClick={onClose}>
      <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar acceso administrador">
          <X size={20} />
        </button>

        <div className="admin-login-container">
          <div className="admin-login-badge">
            <LockKeyhole size={22} />
          </div>
          <h2>Panel administrativo</h2>
          <p className="subtitle">Gestiona agenda, pacientes, sesiones y notas clínicas desde un solo lugar.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <div className="admin-login-input">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ps.natasha.silva@gmail.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="admin-login-input">
                <LockKeyhole size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña de administrador"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Acceder'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
