import { describe, expect, it } from 'vitest'
import {
  formatServicePrice,
  getEffectiveServicePrice,
  getServiceDiscountPercentage,
  isServiceDiscountActive,
  normalizeService,
  sortServices,
} from './services'

const discountedService = {
  id: 'test',
  title: 'Servicio de prueba',
  description: 'Descripción suficiente para probar el catálogo.',
  price: 40000,
  discountEnabled: true,
  discountPrice: 30000,
  discountEndsAt: { toDate: () => new Date('2030-05-20T23:59:59') },
}

describe('catálogo de servicios', () => {
  it('formatea valores en pesos chilenos', () => {
    expect(formatServicePrice(45000)).toMatch(/45\.000/)
  })

  it('aplica una oferta vigente y calcula su porcentaje', () => {
    const now = new Date('2030-05-10T12:00:00')
    expect(isServiceDiscountActive(discountedService, now)).toBe(true)
    expect(getEffectiveServicePrice(discountedService, now)).toBe(30000)
    expect(getServiceDiscountPercentage(discountedService, now)).toBe(25)
  })

  it('vuelve al precio normal cuando la oferta vence', () => {
    const now = new Date('2030-05-21T00:00:00')
    expect(isServiceDiscountActive(discountedService, now)).toBe(false)
    expect(getEffectiveServicePrice(discountedService, now)).toBe(40000)
  })

  it('normaliza y ordena el catálogo de forma estable', () => {
    const services = sortServices([
      normalizeService({ ...discountedService, id: 'second', title: 'Segundo', order: 2 }),
      normalizeService({ ...discountedService, id: 'first', title: 'Primero', order: 1 }),
    ])
    expect(services.map((service) => service.id)).toEqual(['first', 'second'])
  })

  it('conserva los nuevos iconos permitidos', () => {
    expect(normalizeService({ ...discountedService, icon: 'video' }).icon).toBe('video')
    expect(normalizeService({ ...discountedService, icon: 'desconocido' }).icon).toBe('sparkles')
  })
})
