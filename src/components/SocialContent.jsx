import { Video } from 'lucide-react'
import '../styles/SocialContent.css'

const reels = [
  {
    title: 'Reel de Instagram 1',
    src: 'https://www.instagram.com/reel/DIg6YMxNMZ3/embed',
  },
  {
    title: 'Reel de Instagram 2',
    src: 'https://www.instagram.com/reel/DIeU2AQNNuN/embed',
  },
  {
    title: 'Reel de Instagram 3',
    src: 'https://www.instagram.com/reel/DFpu5rDsU-c/embed',
  },
]

export default function SocialContent() {
  return (
    <section id="contenido" className="social-content">
      <div className="social-content-container">
        <div className="section-heading">
          <span>Contenido</span>
          <h2>Mira parte del contenido que comparte Kimberly</h2>
          <p>
            Recursos breves para acercarte a su forma de comunicar, explicar y
            acompañar procesos terapéuticos.
          </p>
        </div>

        <div className="reels-grid">
          {reels.map((reel) => (
            <div className="reel-card" key={reel.src}>
              <div className="reel-card-header">
                <Video size={18} />
                <span>Instagram Reel</span>
              </div>
              <iframe
                src={reel.src}
                title={reel.title}
                loading="lazy"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
