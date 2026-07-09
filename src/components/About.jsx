import { CalendarDays, GraduationCap, Heart, MonitorCheck } from 'lucide-react'
import '../styles/About.css'
import kimberlyProfile from '../assets/foto kimberly.jpg'

export default function About() {
  const cards = [
    {
      icon: GraduationCap,
      title: 'Psicóloga clínica',
      text: (
        <>
          Atención individual con foco en comprensión, herramientas y continuidad
          del proceso terapéutico.
        </>
      ),
    },
    {
      icon: MonitorCheck,
      title: 'Solo modalidad online',
      text:
        'Las sesiones se realizan de manera remota, cuidando privacidad, puntualidad y encuadre clínico.',
    },
    {
      icon: CalendarDays,
      title: 'Agenda acotada',
      text:
        'La agenda se abre los sábados y en semana se priorizan horarios tarde/noche.',
    },
    {
      icon: Heart,
      title: 'Acompañamiento respetuoso',
      text:
        'Un espacio de escucha, confidencialidad y trabajo conjunto para avanzar sin forzar lo que necesita tiempo.',
    },
  ]

  return (
    <section id="sobre-mi" className="about">
      <div className="about-container">
        <div className="about-photo">
          <img src={kimberlyProfile} alt="Kimberly López, psicóloga" />
        </div>

        <div className="about-copy">
          <span className="section-kicker">Sobre mí</span>
          <h2>Kimberly López, psicóloga para procesos que necesitan cuidado</h2>
          <p>
            Trabajo desde la Terapia Cognitivo-Conductual (TCC), un enfoque
            respaldado por evidencia científica que ayuda a comprender la relación
            entre pensamientos, emociones y conductas.
          </p>
          <p>
            Durante el proceso construiremos estrategias prácticas, adaptadas a tus
            necesidades y objetivos, en un espacio de respeto, confidencialidad y
            sin juicios.
          </p>

          <div className="about-content">
            {cards.map((card) => (
              <div key={card.title} className="about-card">
                <div className="about-icon">
                  <card.icon size={25} />
                </div>
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
