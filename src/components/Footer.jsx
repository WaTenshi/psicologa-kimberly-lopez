import { AtSign, Lock, Mail, MapPin } from 'lucide-react'
import '../styles/Footer.css'

export default function Footer({ onAdminClick }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contacto" className="footer">
      <div className="footer-container">
        <div className="footer-cta">
          <div>
            <span>Agenda disponible</span>
            <h2>Da el primer paso cuando te sientas listo</h2>
          </div>
          <a href="#inicio">Agendar consulta</a>
        </div>

        <div className="footer-content">
          <div className="footer-section">
            <h3>Natasha Silva</h3>
            <p>Psicóloga clínica. Atención online y presencial en Concepción.</p>
          </div>

          <div className="footer-section">
            <h4>Consulta</h4>
            <p><MapPin size={16} /> Barros Arana 645, Oficina 8</p>
            <p><Lock size={16} /> Espacio confidencial y reservado</p>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <p><Mail size={16} /> ps.natasha.silva@gmail.com</p>
            <p><AtSign size={16} /> Atención administrativa por redes</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Natasha Silva - Psicóloga. Todos los derechos reservados.</p>
          <button className="admin-access-btn" onClick={onAdminClick} title="Acceso Administrador">
            ⚙️
          </button>
        </div>
      </div>
    </footer>
  )
}
