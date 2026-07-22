export const SERVICE_ICON_OPTIONS = [
  { value: 'sparkles', label: 'Destellos' },
  { value: 'heart', label: 'Corazón' },
  { value: 'brain', label: 'Bienestar mental' },
  { value: 'people', label: 'Personas' },
  { value: 'child', label: 'Infantojuvenil' },
  { value: 'home', label: 'Domicilio' },
  { value: 'clipboard', label: 'Evaluación' },
  { value: 'video', label: 'Atención online' },
  { value: 'calendar', label: 'Agenda' },
  { value: 'message', label: 'Conversación' },
  { value: 'support', label: 'Apoyo' },
  { value: 'couple', label: 'Pareja' },
  { value: 'family', label: 'Familia' },
  { value: 'shield', label: 'Protección' },
  { value: 'medical', label: 'Salud' },
  { value: 'activity', label: 'Bienestar' },
  { value: 'smile', label: 'Ánimo' },
  { value: 'moon', label: 'Descanso' },
  { value: 'sun', label: 'Vitalidad' },
  { value: 'puzzle', label: 'Desarrollo' },
  { value: 'book', label: 'Orientación' },
  { value: 'education', label: 'Educación' },
  { value: 'nature', label: 'Calma' },
]

export function formatServicePrice(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}

export function getServiceDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isServiceDiscountActive(service, now = new Date()) {
  const endsAt = getServiceDate(service?.discountEndsAt)
  return Boolean(
    service?.discountEnabled
      && Number(service.discountPrice) > 0
      && Number(service.discountPrice) < Number(service.price)
      && endsAt
      && endsAt.getTime() >= now.getTime(),
  )
}

export function getEffectiveServicePrice(service, now = new Date()) {
  return isServiceDiscountActive(service, now)
    ? Number(service.discountPrice)
    : Number(service?.price || 0)
}

export function getServiceDiscountPercentage(service, now = new Date()) {
  if (!isServiceDiscountActive(service, now)) return 0
  return Math.round((1 - Number(service.discountPrice) / Number(service.price)) * 100)
}

export function normalizeService(service) {
  const price = Number(service?.price || 0)
  const discountPrice = Number(service?.discountPrice || 0)
  const title = String(service?.title || '').trim()
  const meta = String(service?.meta || '').trim()

  return {
    ...service,
    id: String(service?.id || ''),
    title,
    meta,
    description: String(service?.description || '').trim(),
    bookingLabel: String(service?.bookingLabel || (meta ? `${title} - ${meta}` : title)),
    price,
    priceLabel: String(service?.priceLabel || formatServicePrice(price)),
    discountPrice,
    discountPriceLabel: String(service?.discountPriceLabel || formatServicePrice(discountPrice)),
    active: service?.active !== false,
    discountEnabled: service?.discountEnabled === true,
    icon: SERVICE_ICON_OPTIONS.some((option) => option.value === service?.icon)
      ? service.icon
      : 'sparkles',
    order: Number(service?.order || 0),
  }
}

export function sortServices(services) {
  return [...services].sort((left, right) => (
    Number(left.order || 0) - Number(right.order || 0)
      || left.title.localeCompare(right.title, 'es')
  ))
}
