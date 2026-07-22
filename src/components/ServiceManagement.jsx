import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdLocalOffer,
  MdOutlineInventory2,
  MdPublic,
  MdVisibility,
  MdVisibilityOff,
  MdExpandMore,
} from 'react-icons/md'
import {
  SERVICE_ICON_OPTIONS,
  formatServicePrice,
  getServiceDate,
  getServiceDiscountPercentage,
  isServiceDiscountActive,
} from '../config/services'
import {
  createDiscountEndTimestamp,
  deleteService,
  saveService,
  setServiceActive,
  subscribeToServiceCatalog,
} from '../services/serviceCatalogService'
import { Drawer, EmptyState, PageHeader, StatCard, Toast } from './AdminUI'
import ServiceIcon from './ServiceIcon'
import '../styles/ServiceManagement.css'

const EMPTY_FORM = {
  id: '',
  title: '',
  meta: '',
  description: '',
  price: '',
  icon: 'sparkles',
  order: '1',
  active: true,
  discountEnabled: false,
  discountPrice: '',
  discountEndDate: '',
}

const toInputDate = (value) => {
  const date = getServiceDate(value)
  if (!date || date.getTime() <= 0) return ''
  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function ServiceManagement({ createRequest = 0 }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState(null)
  const [iconMenuOpen, setIconMenuOpen] = useState(false)
  const lastCreateRequest = useRef(createRequest)
  const iconPickerRef = useRef(null)

  useEffect(() => {
    let active = true
    const unsubscribe = subscribeToServiceCatalog(
      (catalog) => {
        if (!active) return
        setServices(catalog)
        setLoading(false)
      },
      () => {
        if (!active) return
        setToast({ type: 'error', message: 'No pudimos cargar el catálogo de servicios.' })
        setLoading(false)
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!iconMenuOpen) return undefined
    const handlePointerDown = (event) => {
      if (!iconPickerRef.current?.contains(event.target)) setIconMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [iconMenuOpen])

  const openNewService = useCallback(() => {
    const nextOrder = services.reduce((maximum, service) => Math.max(maximum, Number(service.order || 0)), 0) + 1
    setForm({ ...EMPTY_FORM, order: String(nextOrder) })
    setFormError('')
    setIconMenuOpen(false)
    setDrawerOpen(true)
  }, [services])

  useEffect(() => {
    if (createRequest > lastCreateRequest.current) openNewService()
    lastCreateRequest.current = createRequest
  }, [createRequest, openNewService])

  const openEditService = (service) => {
    setForm({
      id: service.id,
      title: service.title,
      meta: service.meta || '',
      description: service.description,
      price: String(service.price),
      icon: service.icon,
      order: String(service.order || 1),
      active: service.active !== false,
      discountEnabled: service.discountEnabled === true,
      discountPrice: service.discountPrice ? String(service.discountPrice) : '',
      discountEndDate: toInputDate(service.discountEndsAt),
    })
    setFormError('')
    setIconMenuOpen(false)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    if (saving) return
    setDrawerOpen(false)
    setFormError('')
    setIconMenuOpen(false)
  }

  const handleChange = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (form.title.trim().length < 3) return 'Escribe un nombre de al menos 3 caracteres.'
    if (form.description.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres.'
    if (Number(form.price) < 1000) return 'El precio debe ser igual o superior a $1.000.'
    if (Number(form.order) < 1) return 'El orden debe ser igual o superior a 1.'
    if (form.discountEnabled) {
      if (Number(form.discountPrice) <= 0) return 'Ingresa el precio final de la oferta.'
      if (Number(form.discountPrice) >= Number(form.price)) return 'El precio de oferta debe ser menor al precio normal.'
      if (!form.discountEndDate) return 'Selecciona hasta cuándo estará disponible la oferta.'
      const endDate = createDiscountEndTimestamp(form.discountEndDate).toDate()
      if (endDate.getTime() < Date.now()) return 'La fecha de término de la oferta debe ser futura.'
    }
    return ''
  }

  const handleSave = async () => {
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    try {
      setSaving(true)
      setFormError('')
      await saveService({
        ...form,
        title: form.title.trim(),
        meta: form.meta.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        order: Number(form.order),
        discountPrice: form.discountEnabled ? Number(form.discountPrice) : 0,
        discountEndsAt: form.discountEnabled
          ? createDiscountEndTimestamp(form.discountEndDate)
          : null,
      })
      setDrawerOpen(false)
      setToast({
        type: 'success',
        message: form.id ? 'Servicio actualizado y publicado.' : 'Servicio agregado y publicado.',
      })
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      setFormError('No pudimos guardar el servicio. Revisa tu conexión e intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (service) => {
    try {
      await setServiceActive(service.id, !service.active)
      setToast({
        type: 'success',
        message: service.active
          ? 'Servicio ocultado del sitio y de las reservas.'
          : 'Servicio publicado nuevamente.',
      })
    } catch (error) {
      console.error('Error al cambiar visibilidad:', error)
      setToast({ type: 'error', message: 'No pudimos cambiar la visibilidad del servicio.' })
    }
  }

  const handleDelete = async (service) => {
    const confirmed = window.confirm(
      `¿Eliminar “${service.title}”? Las citas históricas conservarán el nombre y valor registrados.`,
    )
    if (!confirmed) return

    try {
      await deleteService(service.id)
      setToast({ type: 'success', message: 'Servicio eliminado del catálogo.' })
    } catch (error) {
      console.error('Error al eliminar servicio:', error)
      setToast({ type: 'error', message: 'No pudimos eliminar el servicio.' })
    }
  }

  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter((service) => service.active).length,
    offers: services.filter((service) => service.active && isServiceDiscountActive(service)).length,
  }), [services])

  return (
    <section className="admin-module service-management">
      <PageHeader
        eyebrow="Catálogo público"
        title="Servicios y precios"
        description="Administra qué servicios se muestran, sus valores y las ofertas con fecha de término. Los cambios se reflejan automáticamente en el sitio y en la reserva de horas."
        actions={(
          <button className="services-primary-button" onClick={openNewService}>
            <MdAdd /> Agregar servicio
          </button>
        )}
      />

      <div className="services-admin-stats" aria-label="Resumen del catálogo">
        <StatCard icon={<MdOutlineInventory2 />} value={stats.total} label="Servicios totales" />
        <StatCard icon={<MdPublic />} value={stats.active} label="Publicados" tone="green" />
        <StatCard icon={<MdLocalOffer />} value={stats.offers} label="Ofertas vigentes" tone="amber" />
      </div>

      {loading ? (
        <div className="services-admin-loading" role="status">Cargando catálogo…</div>
      ) : services.length === 0 ? (
        <div className="services-admin-panel">
          <EmptyState
            icon={<MdOutlineInventory2 />}
            title="No hay servicios publicados"
            description="Agrega el primer servicio para mostrarlo en el sitio y permitir que tus pacientes lo seleccionen al reservar."
            action={<button className="services-primary-button" onClick={openNewService}><MdAdd /> Agregar servicio</button>}
          />
        </div>
      ) : (
        <div className="services-admin-list">
          {services.map((service) => {
            const offerActive = isServiceDiscountActive(service)
            const endDate = getServiceDate(service.discountEndsAt)
            return (
              <article key={service.id} className={`services-admin-card ${service.active ? '' : 'is-hidden'}`}>
                <div className="services-admin-card-main">
                  <span className="services-admin-order" aria-label={`Orden ${service.order}`}>{service.order}</span>
                  <div className="services-admin-copy">
                    <div className="services-admin-title-row">
                      <h3>{service.title}</h3>
                      <span className={`services-status ${service.active ? 'is-active' : ''}`}>
                        {service.active ? 'Publicado' : 'Oculto'}
                      </span>
                      {offerActive && (
                        <span className="services-offer-badge">
                          -{getServiceDiscountPercentage(service)}%
                        </span>
                      )}
                    </div>
                    {service.meta && <span className="services-admin-meta">{service.meta}</span>}
                    <p>{service.description}</p>
                  </div>
                  <div className="services-admin-price">
                    {offerActive ? (
                      <>
                        <del>{formatServicePrice(service.price)}</del>
                        <strong>{formatServicePrice(service.discountPrice)}</strong>
                        <small>Hasta {endDate?.toLocaleDateString('es-CL')}</small>
                      </>
                    ) : (
                      <strong>{formatServicePrice(service.price)}</strong>
                    )}
                  </div>
                </div>

                <div className="services-admin-actions">
                  <button onClick={() => openEditService(service)}><MdEdit /> Editar</button>
                  <button onClick={() => handleToggleActive(service)}>
                    {service.active ? <MdVisibilityOff /> : <MdVisibility />}
                    {service.active ? 'Ocultar' : 'Publicar'}
                  </button>
                  <button className="is-danger" onClick={() => handleDelete(service)}>
                    <MdDeleteOutline /> Eliminar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={form.id ? 'Editar servicio' : 'Nuevo servicio'}
        size="medium"
        footer={(
          <>
            <button className="services-secondary-button" onClick={closeDrawer} disabled={saving}>Cancelar</button>
            <button className="services-primary-button" onClick={handleSave} disabled={saving}>
              {saving ? 'Publicando…' : form.id ? 'Guardar cambios' : 'Agregar servicio'}
            </button>
          </>
        )}
      >
        <div className="services-admin-form">
          {formError && <div className="services-form-error" role="alert">{formError}</div>}

          <div className="services-form-group">
            <label htmlFor="service-title">Nombre del servicio *</label>
            <input id="service-title" name="title" value={form.title} onChange={handleChange} maxLength="100" placeholder="Ej. Terapia de pareja" />
          </div>

          <div className="services-form-group">
            <label htmlFor="service-meta">Categoría o convenio</label>
            <input id="service-meta" name="meta" value={form.meta} onChange={handleChange} maxLength="60" placeholder="Ej. Particular o Fonasa A o B" />
            <small>Opcional. Aparecerá sobre el nombre del servicio.</small>
          </div>

          <div className="services-form-group">
            <label htmlFor="service-description">Descripción *</label>
            <textarea id="service-description" name="description" value={form.description} onChange={handleChange} maxLength="300" rows="4" placeholder="Explica brevemente en qué consiste…" />
            <small>{form.description.length}/300 caracteres</small>
          </div>

          <div className="services-form-grid">
            <div className="services-form-group">
              <label htmlFor="service-price">Precio normal *</label>
              <div className="services-money-input"><span>$</span><input id="service-price" type="number" name="price" value={form.price} onChange={handleChange} min="1000" step="1000" inputMode="numeric" /></div>
            </div>
            <div className="services-form-group">
              <label htmlFor="service-order">Orden *</label>
              <input id="service-order" type="number" name="order" value={form.order} onChange={handleChange} min="1" max="999" />
            </div>
          </div>

          <div className="services-form-group services-icon-field">
            <label id="service-icon-label">Icono</label>
            <div
              ref={iconPickerRef}
              className="services-icon-picker"
              onKeyDown={(event) => {
                if (event.key === 'Escape' && iconMenuOpen) {
                  event.stopPropagation()
                  setIconMenuOpen(false)
                }
              }}
            >
              <button
                type="button"
                className={`services-icon-trigger ${iconMenuOpen ? 'is-open' : ''}`}
                onClick={() => setIconMenuOpen((open) => !open)}
                aria-labelledby="service-icon-label service-icon-current"
                aria-haspopup="listbox"
                aria-expanded={iconMenuOpen}
              >
                <span className="services-icon-preview" aria-hidden="true">
                  <ServiceIcon name={form.icon} size={22} />
                </span>
                <span id="service-icon-current">
                  {SERVICE_ICON_OPTIONS.find((option) => option.value === form.icon)?.label || 'Destellos'}
                </span>
                <MdExpandMore className="services-icon-chevron" />
              </button>

              {iconMenuOpen && (
                <div className="services-icon-menu" role="listbox" aria-labelledby="service-icon-label">
                  {SERVICE_ICON_OPTIONS.map((option) => {
                    const selected = form.icon === option.value
                    return (
                      <button
                        type="button"
                        key={option.value}
                        className={`services-icon-option ${selected ? 'is-selected' : ''}`}
                        onClick={() => {
                          setForm((current) => ({ ...current, icon: option.value }))
                          setIconMenuOpen(false)
                        }}
                        role="option"
                        aria-selected={selected}
                      >
                        <span aria-hidden="true"><ServiceIcon name={option.value} size={25} /></span>
                        <small>{option.label}</small>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <label className="services-switch-row">
            <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
            <span><strong>Publicar servicio</strong><small>Visible en el sitio y disponible para reservar.</small></span>
          </label>

          <div className={`services-discount-box ${form.discountEnabled ? 'is-enabled' : ''}`}>
            <label className="services-switch-row">
              <input type="checkbox" name="discountEnabled" checked={form.discountEnabled} onChange={handleChange} />
              <span><strong>Agregar una oferta</strong><small>Muestra el precio normal tachado y la fecha de término.</small></span>
            </label>

            {form.discountEnabled && (
              <div className="services-form-grid services-discount-fields">
                <div className="services-form-group">
                  <label htmlFor="service-discount-price">Precio de oferta *</label>
                  <div className="services-money-input"><span>$</span><input id="service-discount-price" type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} min="1" step="1000" inputMode="numeric" /></div>
                </div>
                <div className="services-form-group">
                  <label htmlFor="service-discount-end">Oferta hasta *</label>
                  <input id="service-discount-end" type="date" name="discountEndDate" value={form.discountEndDate} onChange={handleChange} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Drawer>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onDismiss={() => setToast(null)}
      />
    </section>
  )
}
