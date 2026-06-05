import { CheckCircle2, HeartHandshake, Route, Target } from 'lucide-react'
import '../styles/Approach.css'

export default function Approach() {
  const benefits = [
    'Enfoque práctico y orientado a objetivos',
    'Estrategias concretas para aplicar entre sesiones',
    'Revisión de pensamientos, emociones y conductas',
    'Proceso colaborativo y respetuoso de tu ritmo',
  ]

  return (
    <section id="enfoque" className="approach">
      <div className="approach-container">
        <div className="approach-content">
          <span className="section-kicker">Enfoque terapéutico</span>
          <h2>Un proceso claro, humano y orientado a cambios posibles</h2>
          <p>
            Trabajo desde el modelo cognitivo-conductual, integrando comprensión,
            psicoeducación y estrategias prácticas para que puedas reconocer patrones
            y construir nuevas formas de responder a lo que te ocurre.
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
              Una forma de trabajo activa, estructurada y colaborativa, centrada en
              comprender qué sostiene el malestar y qué herramientas pueden ayudarte
              a avanzar.
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
