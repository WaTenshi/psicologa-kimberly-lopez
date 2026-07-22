import { useEffect, useRef, useState } from 'react'
import {
  MdAdd,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDashboard,
  MdDocumentScanner,
  MdEvent,
  MdGroup,
  MdHelpOutline,
  MdLogout,
  MdMenu,
  MdMedicalServices,
  MdNotes,
  MdSchedule,
} from 'react-icons/md'
import useAdminTour from '../hooks/useAdminTour'
import '../styles/AdminShell.css'

const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: MdDashboard },
  { id: 'appointments', label: 'Citas', icon: MdEvent },
  { id: 'availability', label: 'Disponibilidad', icon: MdSchedule },
  { id: 'services', label: 'Servicios y precios', icon: MdMedicalServices },
  { id: 'patients', label: 'Pacientes', icon: MdGroup },
  { id: 'sessions', label: 'Sesiones', icon: MdDocumentScanner },
  { id: 'notes', label: 'Notas', icon: MdNotes },
]

const SIDEBAR_STORAGE_KEY = 'kimberly.admin.sidebar.collapsed'

const getInitialCollapsedState = () => {
  try {
    const savedValue = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (savedValue !== null) return savedValue === 'true'
  } catch {
    // El panel sigue funcionando aunque el navegador bloquee el almacenamiento local.
  }
  return window.matchMedia('(max-width: 1199px)').matches
}

export default function AdminShell({
  activePanel,
  children,
  contentRef,
  onLogout,
  onNavigate,
  primaryAction,
  userEmail,
}) {
  const [collapsed, setCollapsed] = useState(getInitialCollapsedState)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef(null)
  const closeButtonRef = useRef(null)
  const activeItem = ADMIN_NAV_ITEMS.find((item) => item.id === activePanel) || ADMIN_NAV_ITEMS[0]
  const startTour = useAdminTour(activePanel)

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
    } catch {
      // Preferencia no persistente en navegadores con almacenamiento restringido.
    }
  }, [collapsed])

  useEffect(() => {
    if (!mobileOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        return
      }

      if (event.key !== 'Tab' || !sidebarRef.current) return
      const focusable = [...sidebarRef.current.querySelectorAll(
        'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const handleNavigate = (panel) => {
    onNavigate(panel)
    setMobileOpen(false)
  }

  return (
    <div className={`admin-dashboard admin-shell ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
      <aside ref={sidebarRef} className="admin-sidebar" aria-label="Navegación administrativa">
        <div className="admin-sidebar-brand">
          <div className="admin-brand-mark" aria-hidden="true">KL</div>
          <div className="admin-brand-copy">
            <strong>Kimberly López</strong>
            <span>Panel clínico</span>
          </div>
          <button
            ref={closeButtonRef}
            className="admin-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <MdClose />
          </button>
        </div>

        <button
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed((current) => !current)}
          aria-label={collapsed ? 'Expandir navegación' : 'Plegar navegación'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
          <span>{collapsed ? 'Expandir' : 'Plegar menú'}</span>
        </button>

        <nav className="admin-sidebar-nav">
          <span className="admin-nav-caption">Navegación</span>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activePanel === item.id
            return (
              <button
                key={item.id}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-summary" title={collapsed ? userEmail : undefined}>
            <span className="admin-user-avatar" aria-hidden="true">K</span>
            <div>
              <strong>Kimberly</strong>
              <small>{userEmail || 'Administradora'}</small>
            </div>
          </div>
          <button className="admin-logout-action" onClick={onLogout} aria-label="Cerrar sesión" title={collapsed ? 'Cerrar sesión' : undefined}>
            <MdLogout />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <button className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />

      <div className="admin-main-column">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button className="admin-menu-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú" aria-expanded={mobileOpen}>
              <MdMenu />
            </button>
            <div>
              <span>Panel administrativo</span>
              <h1>{activeItem.label}</h1>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <button
              className="admin-tour-button"
              onClick={startTour}
              aria-label={`Ver ayuda de ${activeItem.label}`}
              title={`Ver recorrido de ${activeItem.label}`}
            >
              <MdHelpOutline />
              <span>Ayuda</span>
            </button>
            {primaryAction && (
              <button className="admin-primary-action" onClick={primaryAction.onClick}>
                {primaryAction.icon || <MdAdd />}
                <span>{primaryAction.label}</span>
              </button>
            )}
          </div>
        </header>

        <main ref={contentRef} className="admin-content" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  )
}
