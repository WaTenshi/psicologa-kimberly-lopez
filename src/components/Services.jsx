import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  formatServicePrice,
  getServiceDate,
  getServiceDiscountPercentage,
  isServiceDiscountActive,
} from '../config/services'
import { subscribeToServiceCatalog } from '../services/serviceCatalogService'
import ServiceIcon from './ServiceIcon'
import '../styles/Services.css'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => subscribeToServiceCatalog(
    (catalog) => {
      setServices(catalog.filter((service) => service.active))
      setLoading(false)
      setLoadError(false)
    },
    () => {
      setServices([])
      setLoading(false)
      setLoadError(true)
    },
  ), [])

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

        {loading ? (
          <div className="services-grid services-loading" role="status" aria-label="Cargando servicios">
            {[1, 2, 3].map((item) => <div key={item} className="service-card service-card-skeleton" />)}
          </div>
        ) : services.length > 0 ? (
          <div className="services-grid">
            {services.map((service) => {
              const offerActive = isServiceDiscountActive(service)
              const offerEndsAt = getServiceDate(service.discountEndsAt)
              return (
                <article key={service.id} className={`service-card ${offerActive ? 'has-offer' : ''}`}>
                  <div className="service-card-topline">
                    <div className="service-icon">
                      <ServiceIcon name={service.icon} size={28} />
                    </div>
                    {offerActive && (
                      <span className="service-discount-badge">
                        {getServiceDiscountPercentage(service)}% dcto.
                      </span>
                    )}
                  </div>
                  {service.meta && <span className="service-meta">{service.meta}</span>}
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <div className="service-price-block">
                    {offerActive && <del>{formatServicePrice(service.price)}</del>}
                    <strong className="service-price">
                      {formatServicePrice(offerActive ? service.discountPrice : service.price)}
                    </strong>
                    {offerActive && offerEndsAt && (
                      <small>Oferta válida hasta el {offerEndsAt.toLocaleDateString('es-CL')}</small>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="services-empty-public">
            <Sparkles size={28} />
            <h3>Nuevos servicios próximamente</h3>
            <p>
              {loadError
                ? 'No pudimos cargar el catálogo. Intenta nuevamente en unos minutos.'
                : 'Escríbeme si quieres consultar por una atención personalizada.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
