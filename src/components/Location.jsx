import { Building2, ExternalLink, MapPin } from 'lucide-react'
import '../styles/Location.css'

export default function Location() {
  const address = 'Barros Arana 645, Galería Banco Español, Piso 7, Oficina 8'
  const city = 'Concepción, Chile'
  const googleMapsEmbedUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3231.5234!2d-72.1508!3d-36.8265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9629a28b3c5a5a5d%3A0x5a5a5a5a5a5a5a5a!2sBarros%20Arana%20645%2C%20Concepci%C3%B3n!5e0!3m2!1ses!2scl!4v1234567890'
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}`)}`

  return (
    <section id="ubicacion" className="location">
      <div className="location-container">
        <div className="location-info">
          <span className="section-kicker">Ubicación</span>
          <h2>Consulta presencial en Concepción Centro</h2>
          <p>
            El consultorio se encuentra en un punto céntrico y accesible para quienes
            buscan atención presencial. También puedes optar por atención online.
          </p>

          <div className="address-box">
            <div className="address-detail">
              <span className="icon"><MapPin size={24} /></span>
              <div>
                <p className="label">Dirección</p>
                <p className="content">{address}</p>
              </div>
            </div>
            <div className="address-detail">
              <span className="icon"><Building2 size={24} /></span>
              <div>
                <p className="label">Ciudad</p>
                <p className="content">{city}</p>
              </div>
            </div>
          </div>

          <a className="location-link" href={mapsUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={18} />
            Abrir en Google Maps
          </a>
        </div>

        <div className="location-map">
          <iframe
            title="Ubicación del Consultorio - Natasha Silva Psicología"
            src={googleMapsEmbedUrl}
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  )
}
