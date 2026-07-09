import { AtSign, CalendarDays, Clock3, Mail, MessageCircle, MonitorCheck, Phone } from 'lucide-react'
import '../styles/Location.css'

export default function Location() {
  return (
    <section id="agenda" className="location">
      <div className="location-container">
        <div className="location-info">
          <span className="section-kicker">Agenda y contacto</span>
          <h2>Atenciones online con horarios acotados y claros</h2>
          <p>
            Las sesiones se realizan solo en modalidad online. La agenda se abre
            los sábados y durante la semana se coordinan horarios tarde/noche.
          </p>

          <div className="address-box">
            <div className="address-detail">
              <span className="icon"><MonitorCheck size={24} /></span>
              <div>
                <p className="label">Online</p>
                <p className="content">Sesiones remotas con encuadre privado y continuidad clínica.</p>
              </div>
            </div>
            <div className="address-detail">
              <span className="icon"><CalendarDays size={24} /></span>
              <div>
                <p className="label">Sábados</p>
                <p className="content">Agenda abierta para reservar y confirmar disponibilidad.</p>
              </div>
            </div>
            <div className="address-detail">
              <span className="icon"><Clock3 size={24} /></span>
              <div>
                <p className="label">Semana</p>
                <p className="content">Horarios de atención solo tarde/noche.</p>
              </div>
            </div>
          </div>

          <a
            className="location-link"
            href="https://wa.me/message/3SQXBB3I5PN7I1"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} />
            Escribir por WhatsApp
          </a>
        </div>

        <div className="location-contact-panel">
          <div>
            <Mail size={24} />
            <span>Correo</span>
            <strong>terapiaconkimberlylopez@gmail.com</strong>
          </div>
          <div>
            <Phone size={24} />
            <span>WhatsApp</span>
            <strong>Contacto directo</strong>
          </div>
          <div>
            <MessageCircle size={24} />
            <span>Reserva</span>
            <strong>Agenda y coordinación online</strong>
          </div>
          <div>
            <AtSign size={24} />
            <span>Instagram</span>
            <strong>@terapiaconkimberly</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
