// @vitest-environment jsdom
import { useRef } from 'react'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useAdminNavigation, { normalizeAdminPanel } from './useAdminNavigation'

function NavigationHarness() {
  const contentRef = useRef(null)
  const { activePanel, navigate } = useAdminNavigation(contentRef)

  return (
    <div ref={contentRef}>
      <span data-testid="panel">{activePanel}</span>
      <button onClick={() => navigate('appointments')}>Ir a citas</button>
    </div>
  )
}

beforeEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/?panel=dashboard')
  Element.prototype.scrollTo = vi.fn()
})

describe('useAdminNavigation', () => {
  it('normaliza paneles desconocidos al dashboard', () => {
    expect(normalizeAdminPanel('desconocido')).toBe('dashboard')
    expect(normalizeAdminPanel('patients')).toBe('patients')
  })

  it('actualiza la sección y la URL sin router externo', async () => {
    const user = userEvent.setup()
    render(<NavigationHarness />)

    await user.click(screen.getByRole('button', { name: 'Ir a citas' }))

    expect(screen.getByTestId('panel')).toHaveTextContent('appointments')
    expect(new URLSearchParams(window.location.search).get('panel')).toBe('appointments')
  })

  it('responde al historial del navegador', async () => {
    render(<NavigationHarness />)
    window.history.replaceState({ panel: 'patients', scrollTop: 32 }, '', '/?panel=patients')
    window.dispatchEvent(new PopStateEvent('popstate', { state: { panel: 'patients', scrollTop: 32 } }))

    await waitFor(() => expect(screen.getByTestId('panel')).toHaveTextContent('patients'))
  })
})
