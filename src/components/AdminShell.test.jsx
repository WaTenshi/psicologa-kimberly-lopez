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

  it('expone las siete secciones y delega la navegación', async () => {
    const user = userEvent.setup()
    const { container } = render(<AdminShell {...defaultProps}>Contenido</AdminShell>)

    expect(container.querySelectorAll('.admin-nav-item')).toHaveLength(7)
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

  it('ofrece un recorrido contextual para la sección activa', () => {
    render(<AdminShell {...defaultProps} activePanel="patients">Contenido</AdminShell>)

    const helpButton = screen.getByRole('button', { name: 'Ver ayuda de Pacientes' })
    expect(helpButton).toHaveTextContent('Ayuda')
    expect(helpButton).toHaveAttribute(
      'title',
      'Ver recorrido de Pacientes',
    )
  })

  it('inicia el recorrido del módulo y permite cancelarlo con Escape', async () => {
    const user = userEvent.setup()
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    render(
      <AdminShell {...defaultProps} activePanel="notes">
        <div className="quick-notes">
          <header className="admin-page-header">Encabezado de notas</header>
          <div className="notes-input-container">Nueva nota</div>
          <div className="notes-container">Notas guardadas</div>
        </div>
      </AdminShell>,
    )

    await user.click(screen.getByRole('button', { name: 'Ver ayuda de Notas' }))
    expect(await screen.findByRole('dialog')).toHaveTextContent('Notas rápidas')

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
