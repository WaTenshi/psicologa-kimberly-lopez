import { AtSign, CalendarDays, Lock, Mail, MessageCircle, MonitorCheck, Settings } from 'lucide-react'
import '../styles/Footer.css'

export default function Footer({ onAdminClick }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="contacto" className="footer">
      <div className="footer-container">
        <div className="footer-cta">
          <div>
            <span>Agenda online</span>
            <h2>Si ya decidiste empezar, demos juntas el primer paso</h2>
          </div>
          <a href="https://wa.me/message/3SQXBB3I5PN7I1" target="_blank" rel="noreferrer">
            Escribir por WhatsApp
          </a>
        </div>

        <div className="footer-content">
          <div className="footer-section">
            <h3>Kimberly López</h3>
            <p>Psicóloga clínica. Atención online para adultos, infantojuvenil y evaluación WISC-V.</p>
          </div>

          <div className="footer-section">
            <h4>Consulta</h4>
            <p><MonitorCheck size={16} /> Solo atenciones online</p>
            <p><CalendarDays size={16} /> Agenda abierta los sábados</p>
            <p><Lock size={16} /> Espacio confidencial y reservado</p>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <p><Mail size={16} /> terapiaconkimberlylopez@gmail.com</p>
            <p><MessageCircle size={16} /> WhatsApp directo</p>
            <p><AtSign size={16} /> @terapiaconkimberly</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Kimberly López - Psicóloga. Todos los derechos reservados.</p>
          <button className="admin-access-btn" onClick={onAdminClick} title="Acceso Administrador">
            <Settings size={17} />
          </button>
        </div>
      </div>
    </footer>
  )
}
