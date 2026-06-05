import { useState } from 'react'
import { CalendarCheck, Menu, X } from 'lucide-react'
import '../styles/Navbar.css'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a className="navbar-logo" href="#inicio" onClick={() => setIsOpen(false)}>
          <h1>Natasha Silva</h1>
          <span className="subtitle">Psicóloga clínica</span>
        </a>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Abrir navegación">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li>
            <a href="#servicios" onClick={() => setIsOpen(false)}>
              Servicios
            </a>
          </li>
          <li>
            <a href="#enfoque" onClick={() => setIsOpen(false)}>
              Enfoque
            </a>
          </li>
          <li>
            <a href="#sobre-mi" onClick={() => setIsOpen(false)}>
              Sobre Mí
            </a>
          </li>
          <li>
            <a href="#forma-trabajo" onClick={() => setIsOpen(false)}>
              Mi Forma de Trabajo
            </a>
          </li>
          <li>
            <a href="#diplomas" onClick={() => setIsOpen(false)}>
              Credenciales
            </a>
          </li>
          <li>
            <a href="#ubicacion" onClick={() => setIsOpen(false)}>
              Ubicación
            </a>
          </li>
          <li>
            <a href="#contacto" onClick={() => setIsOpen(false)}>
              Contacto
            </a>
          </li>
          <li>
            <a className="nav-cta" href="#inicio" onClick={() => setIsOpen(false)}>
              <CalendarCheck size={17} />
              Agendar
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
