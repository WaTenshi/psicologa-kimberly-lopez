import { HandHeart, LockKeyhole, MessageCircleHeart, Shield } from 'lucide-react'
import '../styles/WorkingStyle.css'

export default function WorkingStyle() {
  const principles = [
    {
      icon: MessageCircleHeart,
      title: 'Cercanía',
      description: 'Una conversación humana, clara y respetuosa desde el primer encuentro.'
    },
    {
      icon: LockKeyhole,
      title: 'Confianza',
      description: 'Un encuadre confidencial para hablar con libertad y sin juicios.'
    },
    {
      icon: HandHeart,
      title: 'Proceso activo',
      description: 'Sesiones participativas, con herramientas y acuerdos de trabajo.'
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Un espacio contenido para avanzar sin apurar lo que necesita tiempo.'
    }
  ]

  return (
    <section id="forma-trabajo" className="working-style">
      <div className="working-style-container">
        <div className="section-heading">
          <span>Forma de trabajo</span>
          <h2>Un acompañamiento que combina contención y dirección</h2>
          <p>
            La terapia no tiene que sentirse confusa. Trabajamos con objetivos,
            revisamos avances y cuidamos que el proceso sea sostenible para ti.
          </p>
        </div>

        <div className="principles-grid">
          {principles.map((principle, index) => (
            <div key={index} className="principle-card">
              <div className="principle-icon">
                <principle.icon size={25} />
              </div>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </div>
          ))}
        </div>

        <div className="working-message">
          <p>
            La primera sesión permite comprender qué estás viviendo, acordar una
            dirección de trabajo y definir si la modalidad presencial u online se
            ajusta mejor a tus necesidades.
          </p>
        </div>
      </div>
    </section>
  )
}
