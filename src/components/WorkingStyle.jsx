import { ClipboardList, HandHeart } from 'lucide-react'
import '../styles/WorkingStyle.css'

export default function WorkingStyle() {
  const stages = [
    {
      icon: ClipboardList,
      title: 'Proceso de evaluación y diagnóstico',
      subtitle: '3 a 4 sesiones',
      description:
        'Las primeras sesiones están destinadas a conocerte, comprender el motivo de consulta, explorar tu historia personal y evaluar factores que pueden estar influyendo en tu bienestar. Esta etapa permite construir una comprensión integral y definir objetivos terapéuticos claros.',
    },
    {
      icon: HandHeart,
      title: 'Proceso de intervención psicoterapéutica',
      subtitle: 'Terapia Cognitivo-Conductual',
      description:
        'Luego trabajaremos con herramientas y estrategias basadas en evidencia científica para afrontar las dificultades que motivaron la consulta, promoviendo cambios que favorezcan tu bienestar y calidad de vida.',
    },
  ]

  return (
    <section id="forma-trabajo" className="working-style">
      <div className="working-style-container">
        <div className="section-heading">
          <span>Forma de trabajo</span>
          <h2>¿Cómo trabajaremos?</h2>
          <p>
            Cada proceso terapéutico es único y se adapta a las necesidades de
            cada persona, pero suele desarrollarse en dos etapas.
          </p>
        </div>

        <div className="principles-grid work-stages">
          {stages.map((principle) => (
            <div key={principle.title} className="principle-card">
              <div className="principle-icon">
                <principle.icon size={25} />
              </div>
              <span>{principle.subtitle}</span>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </div>
          ))}
        </div>

        <div className="working-message">
          <p>
            El ritmo será siempre respetuoso de tus tiempos, avanzando de manera
            colaborativa y adaptando el tratamiento a tus objetivos y necesidades.
          </p>
        </div>
      </div>
    </section>
  )
}
