import { CheckCircle2, HeartHandshake, Route, Target } from 'lucide-react'
import '../styles/Approach.css'

export default function Approach() {
  const benefits = [
    'Sesiones online con encuadre confidencial',
    'Objetivos terapéuticos acordados en conjunto',
    'Herramientas prácticas para el día a día',
    'Seguimiento respetuoso de tus tiempos',
  ]

  return (
    <section id="enfoque" className="approach">
      <div className="approach-container">
        <div className="approach-content">
          <span className="section-kicker">Enfoque terapéutico</span>
          <h2>Un vínculo que cuida, desde el respeto y la calma</h2>
          <p>
            Trabajo desde un enfoque cognitivo-conductual, integrando escucha,
            psicoeducación y estrategias que te ayuden a comprender lo que ocurre
            y avanzar paso a paso.
          </p>

          <div className="approach-benefits">
            {benefits.map((benefit) => (
              <div key={benefit}>
                <CheckCircle2 size={19} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="approach-panel">
          <div className="approach-method">
            <div className="method-icon">
              <Target size={28} />
            </div>
            <h3>Enfoque Cognitivo-Conductual</h3>
            <p>
              Una forma de trabajo colaborativa y concreta, adaptada a tu motivo de
              consulta, etapa vital y contexto familiar o laboral.
            </p>
          </div>

          <div className="approach-mini-grid">
            <div>
              <HeartHandshake size={24} />
              <strong>Vínculo seguro</strong>
              <span>Escucha sin juicio</span>
            </div>
            <div>
              <Route size={24} />
              <strong>Plan de trabajo</strong>
              <span>Objetivos compartidos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
