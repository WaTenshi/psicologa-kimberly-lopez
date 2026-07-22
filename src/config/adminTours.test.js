import { describe, expect, it } from 'vitest'
import { ADMIN_PANEL_IDS } from '../hooks/useAdminNavigation'
import { ADMIN_TOURS, getAdminTour } from './adminTours'

describe('adminTours', () => {
  it('define un recorrido breve para cada módulo administrativo', () => {
    expect(Object.keys(ADMIN_TOURS)).toEqual(ADMIN_PANEL_IDS)

    ADMIN_PANEL_IDS.forEach((panel) => {
      expect(ADMIN_TOURS[panel].length).toBeGreaterThanOrEqual(3)
      expect(ADMIN_TOURS[panel].length).toBeLessThanOrEqual(4)
      ADMIN_TOURS[panel].forEach((step) => {
        expect(step.element).toBeTruthy()
        expect(step.popover.title).toBeTruthy()
        expect(step.popover.description).toBeTruthy()
      })
    })
  })

  it('usa el tour del dashboard como alternativa segura', () => {
    expect(getAdminTour('inexistente')).toBe(ADMIN_TOURS.dashboard)
  })
})
