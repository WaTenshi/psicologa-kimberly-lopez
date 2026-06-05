import { useState } from 'react'
import { CalendarCheck, MapPin, Monitor, ShieldCheck } from 'lucide-react'
import '../styles/Hero.css'
import consultorioHero from '../assets/consultorio-hero.jpg'
import BookingModal from './BookingModal'

export default function Hero() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  return (
    <>
      <section id="inicio" className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Psicóloga clínica en Concepción</span>
          <h1>Natasha Silva</h1>
          <p className="hero-description">
            Un espacio terapéutico cercano, confidencial y profesional para acompañarte
            en procesos de ansiedad, estrés, autoestima y bienestar emocional.
          </p>

          <div className="hero-actions">
            <button
              className="cta-button"
              onClick={() => setIsBookingOpen(true)}
            >
              <CalendarCheck size={19} />
              Agendar consulta
            </button>
            <a className="hero-secondary-link" href="#ubicacion">
              <MapPin size={18} />
              Ver ubicación
            </a>
          </div>

          <div className="hero-highlights" aria-label="Información de atención">
            <div>
              <ShieldCheck size={20} />
              <span>Atención confidencial</span>
            </div>
            <div>
              <Monitor size={20} />
              <span>Online y presencial</span>
            </div>
            <div>
              <MapPin size={20} />
              <span>Concepción Centro</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Consultorio psicológico cálido y profesional">
          <img src={consultorioHero} alt="Consultorio psicológico cálido con sillones, plantas y luz natural" />
          <div className="hero-availability">
            <span>Próximas horas</span>
            <strong>Lunes a sábado</strong>
            <small>Agenda online disponible</small>
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

