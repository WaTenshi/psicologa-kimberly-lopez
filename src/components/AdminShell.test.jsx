// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminShell from './AdminShell'

const defaultProps = {
  activePanel: 'dashboard',
  contentRef: { current: null },
  onLogout: vi.fn(),
  onNavigate: vi.fn(),
  primaryAction: null,
  userEmail: 'kimberly@example.com',
}

beforeEach(() => {
  cleanup()
  window.localStorage.clear()
  defaultProps.onLogout.mockClear()
  defaultProps.onNavigate.mockClear()
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
})

describe('AdminShell', () => {
  it('pliega el sidebar, conserva los iconos y persiste la preferencia', async () => {
    const user = userEvent.setup()
    const { container } = render(<AdminShell {...defaultProps}>Contenido</AdminShell>)

    await user.click(screen.getByRole('button', { name: 'Plegar navegación' }))

    expect(container.firstChild).toHaveClass('is-collapsed')
    expect(screen.getByRole('button', { name: 'Dashboard' })).toBeInTheDocument()
    expect(window.localStorage.getItem('kimberly.admin.sidebar.collapsed')).toBe('true')
  })

  it('expone las seis secciones y delega la navegación', async () => {
    const user = userEvent.setup()
    render(<AdminShell {...defaultProps}>Contenido</AdminShell>)

    expect(screen.getAllByRole('button', { name: /Dashboard|Citas|Disponibilidad|Pacientes|Sesiones|Notas/ })).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: 'Citas' }))

    expect(defaultProps.onNavigate).toHaveBeenCalledWith('appointments')
  })

  it('abre y cierra el menú móvil de forma accesible', async () => {
    const user = userEvent.setup()
    const { container } = render(<AdminShell {...defaultProps}>Contenido</AdminShell>)

    await user.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(container.firstChild).toHaveClass('is-mobile-open')

    await user.click(screen.getAllByRole('button', { name: 'Cerrar menú' })[0])
    expect(container.firstChild).not.toHaveClass('is-mobile-open')
  })
})
