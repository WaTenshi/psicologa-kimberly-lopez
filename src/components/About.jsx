import { GraduationCap, Heart, MapPinned } from 'lucide-react'
import '../styles/About.css'

export default function About() {
  const cards = [
    {
      icon: GraduationCap,
      title: 'Formación clínica',
      text: (
        <>
          Psicóloga clínica formada en la
          <strong> Universidad Academia Humanismo Cristiano</strong>, con una
          mirada integral del bienestar psicológico.
        </>
      ),
    },
    {
      icon: MapPinned,
      title: 'Consulta en Concepción',
      text:
        'Atención en Concepción Centro, en un espacio pensado para conversar con privacidad, calma y continuidad.',
    },
    {
      icon: Heart,
      title: 'Acompañamiento respetuoso',
      text:
        'Un proceso basado en confianza, confidencialidad y trabajo conjunto para que puedas avanzar a tu ritmo.',
    },
  ]

  return (
    <section id="sobre-mi" className="about">
      <div className="about-container">
        <div className="about-copy">
          <span className="section-kicker">Sobre mí</span>
          <h2>Un espacio profesional para sentirte escuchado y acompañado</h2>
          <p>
            Mi trabajo busca sostener un lugar donde puedas mirar lo que te preocupa,
            comprender tus recursos y desarrollar estrategias concretas para tu vida
            cotidiana.
          </p>
        </div>

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
    </section>
  )
}
