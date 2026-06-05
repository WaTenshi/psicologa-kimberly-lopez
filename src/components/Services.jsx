import { Building2, MonitorCheck, Sparkles } from 'lucide-react'
import '../styles/Services.css'

export default function Services() {
  const services = [
    {
      id: 1,
      icon: Building2,
      title: 'Atención presencial',
      meta: 'Consultorio en Concepción Centro',
      description:
        'Sesiones en un espacio reservado, cálido y profesional para trabajar con tranquilidad.',
    },
    {
      id: 2,
      icon: MonitorCheck,
      title: 'Atención online',
      meta: 'Para personas en todo Chile',
      description:
        'Acompañamiento remoto con la misma estructura clínica, privacidad y continuidad.',
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'Proceso individual',
      meta: 'Objetivos claros y ritmo propio',
      description:
        'Trabajo terapéutico centrado en tus necesidades, con herramientas prácticas para el día a día.',
    },
  ]

  return (
    <section id="servicios" className="services">
      <div className="services-container">
        <div className="section-heading">
          <span>Servicios</span>
          <h2>Atención psicológica para distintos momentos del proceso</h2>
          <p>
            Modalidades flexibles para iniciar o retomar terapia en un espacio cuidado,
            respetuoso y orientado a objetivos.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">
                <service.icon size={28} />
              </div>
              <span>{service.meta}</span>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

