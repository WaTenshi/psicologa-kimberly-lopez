import { useState } from 'react'
import { CalendarCheck, CircleDollarSign, Clock3, MonitorCheck, MessageCircle } from 'lucide-react'
import '../styles/Hero.css'
import meadowHero from '../assets/pexels-tubarones-3755300.jpg'
import kimberlyProfile from '../assets/foto kimberly.jpg'
import BookingModal from './BookingModal'

export default function Hero() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <>
      <section id="inicio" className="hero">
        <img
          className="hero-background"
          src={meadowHero}
          alt=""
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-content">
            <h1>¿Te cuesta pedir ayuda aunque la necesites?</h1>
            <p className="hero-lead">
              Un lugar seguro para hablar, soltar y comenzar a sanar.
            </p>
            <p className="hero-description">
              Atención psicológica online para adultos, infantojuvenil y
              evaluación WISC-V, desde un enfoque cognitivo-conductual. Agenda
              abierta los sábados y horarios tarde/noche durante la semana.
            </p>

            <div className="hero-actions">
              <button
                className="cta-button"
                onClick={() => setIsBookingOpen(true)}
              >
                <CalendarCheck size={19} />
                Agendar consulta
              </button>
              <a
                className="hero-whatsapp"
                href="https://wa.me/message/3SQXBB3I5PN7I1"
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} />
                Contactar
              </a>
            </div>

            <div className="hero-highlights" aria-label="Información de atención">
              <div>
                <MonitorCheck size={20} />
                <span>Solo atenciones online</span>
              </div>
              <div>
                <Clock3 size={20} />
                <span>Semana tarde/noche y sábados disponibles</span>
              </div>
            </div>
          </div>

          <div className="hero-portrait">
            <img src={kimberlyProfile} alt="Kimberly López, psicóloga" />
            <div className="hero-portrait-label">
              <strong>Kimberly López</strong>
              <span>Psicóloga</span>
            </div>
          </div>
        </div>

        <div className="hero-info-strip" aria-label="Resumen de atención">
          <div>
            <MonitorCheck size={18} />
            <span>Psicoterapia 100% online</span>
          </div>
          <div>
            <CalendarCheck size={18} />
            <span>Agenda abierta sábados</span>
          </div>
          <div>
            <Clock3 size={18} />
            <span>Semana tarde/noche</span>
          </div>
          <div>
            <CircleDollarSign size={18} />
            <span>Servicios con valor aparte</span>
          </div>
        </div>
      </section>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
      />
    </>
  )
}

