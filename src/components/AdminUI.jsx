import { useEffect, useId, useRef } from 'react'
import { MdClose, MdInbox } from 'react-icons/md'
import '../styles/AdminUI.css'

export function PageHeader({ actions, description, eyebrow, title }) {
  return (
    <header className="admin-page-header">
      <div>
        {eyebrow && <span className="admin-page-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  )
}

export function SectionToolbar({ children, className = '' }) {
  return <div className={`admin-section-toolbar ${className}`}>{children}</div>
}

export function StatCard({ icon, label, tone = 'brown', value }) {
  return (
    <article className={`admin-stat-card tone-${tone}`}>
      <span className="admin-stat-icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}

export function EmptyState({ action, description, icon, title }) {
  return (
    <div className="admin-empty-state">
      <span className="admin-empty-icon">{icon || <MdInbox />}</span>
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export function Drawer({ children, footer, onClose, open, size = 'wide', title }) {
  const titleId = useId()
  const drawerRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return
      const focusable = [...drawerRef.current.querySelectorAll(
        'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )]
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
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
  }, [open])

  if (!open) return null

  return (
    <div className="admin-drawer-layer">
      <button className="admin-drawer-backdrop" onClick={onClose} aria-label="Cerrar panel" />
      <aside ref={drawerRef} className={`admin-drawer size-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="admin-drawer-header">
          <h2 id={titleId}>{title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Cerrar">
            <MdClose />
          </button>
        </header>
        <div className="admin-drawer-body">{children}</div>
        {footer && <footer className="admin-drawer-footer">{footer}</footer>}
      </aside>
    </div>
  )
}

export function Toast({ message, onDismiss, type = 'success' }) {
  useEffect(() => {
    if (!message) return undefined
    const timeout = window.setTimeout(onDismiss, 4200)
    return () => window.clearTimeout(timeout)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div className={`admin-toast type-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Cerrar notificación"><MdClose /></button>
    </div>
  )
}
