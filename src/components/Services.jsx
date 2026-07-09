import { Baby, Brain, ClipboardCheck, HeartPulse, Home, Sparkles, UsersRound } from 'lucide-react'
import '../styles/Services.css'

export default function Services() {
  const services = [
    {
      id: 1,
      icon: Sparkles,
      title: 'Primera consulta',
      price: '$20.000',
      description: 'Primer encuentro para revisar motivo de consulta y orientar el proceso.',
    },
    {
      id: 2,
      icon: HeartPulse,
      title: 'Psicoterapia adulto',
      price: '$20.000',
      meta: 'Fonasa A o B',
      description: 'Atención individual online para procesos emocionales, vinculares y personales.',
    },
    {
      id: 3,
      icon: Brain,
      title: 'Psicoterapia adulto',
      price: '$40.000',
      meta: 'Particular',
      description: 'Proceso terapéutico online desde el enfoque cognitivo-conductual.',
    },
    {
      id: 4,
      icon: UsersRound,
      title: 'Psicoterapia infantojuvenil',
      price: '$35.000',
      meta: 'Fonasa A o B',
      description: 'Acompañamiento psicológico para niños, niñas y adolescentes.',
    },
    {
      id: 5,
      icon: Baby,
      title: 'Psicoterapia infantojuvenil',
      price: '$45.000',
      meta: 'Particular',
      description: 'Trabajo terapéutico coordinado con el adulto responsable.',
    },
    {
      id: 6,
      icon: Home,
      title: 'Atención a domicilio infantil',
      price: '$50.000',
      description: 'Atención infantil en domicilio, según disponibilidad y coordinación previa.',
    },
    {
      id: 7,
      icon: ClipboardCheck,
      title: 'Evaluación WISC-V',
      price: '$120.000',
      description: 'Evaluación, análisis y devolución de resultados.',
    },
  ]

  return (
    <section id="servicios" className="services">
      <div className="services-container">
        <div className="section-heading">
          <span>Servicios</span>
          <h2>En qué te puedo acompañar</h2>
          <p>
            Valores diferenciados según tipo de consulta, etapa vital y evaluación
            requerida.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                <service.icon size={28} />
              </div>
              {service.meta && <span>{service.meta}</span>}
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <strong className="service-price">{service.price}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

