import { useCallback, useEffect, useState } from 'react'

export const ADMIN_PANEL_IDS = [
  'dashboard',
  'appointments',
  'availability',
  'services',
  'patients',
  'sessions',
  'notes',
]

export const normalizeAdminPanel = (panel) =>
  ADMIN_PANEL_IDS.includes(panel) ? panel : 'dashboard'

export const getAdminPanelFromLocation = (location = window.location) =>
  normalizeAdminPanel(new URLSearchParams(location.search).get('panel'))

const buildPanelUrl = (panel) => {
  const url = new URL(window.location.href)
  url.searchParams.set('panel', normalizeAdminPanel(panel))
  return `${url.pathname}${url.search}${url.hash}`
}

export const clearAdminPanelFromUrl = () => {
  const url = new URL(window.location.href)
  url.searchParams.delete('panel')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

export default function useAdminNavigation(contentRef) {
  const [activePanel, setActivePanel] = useState(getAdminPanelFromLocation)

  useEffect(() => {
    const requestedPanel = new URLSearchParams(window.location.search).get('panel')
    if (!ADMIN_PANEL_IDS.includes(requestedPanel)) {
      window.history.replaceState(
        { ...window.history.state, panel: 'dashboard', scrollTop: 0 },
        '',
        buildPanelUrl('dashboard'),
      )
    }

    const handlePopState = (event) => {
      const panel = getAdminPanelFromLocation()
      const navigationEvent = new CustomEvent('admin:before-panel-change', {
        cancelable: true,
        detail: { to: panel },
      })
      if (!window.dispatchEvent(navigationEvent)) {
        window.history.go(1)
        return
      }
      setActivePanel(panel)
      requestAnimationFrame(() => {
        contentRef.current?.scrollTo({ top: event.state?.scrollTop || 0 })
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [contentRef])

  const navigate = useCallback((panel, options = {}) => {
    const nextPanel = normalizeAdminPanel(panel)
    const currentScrollTop = contentRef.current?.scrollTop || 0

    window.history.replaceState(
      { ...window.history.state, panel: activePanel, scrollTop: currentScrollTop },
      '',
      window.location.href,
    )

    const nextState = { panel: nextPanel, scrollTop: 0 }
    if (options.replace) {
      window.history.replaceState(nextState, '', buildPanelUrl(nextPanel))
    } else if (nextPanel !== activePanel) {
      window.history.pushState(nextState, '', buildPanelUrl(nextPanel))
    }

    setActivePanel(nextPanel)
    requestAnimationFrame(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: options.smooth ? 'smooth' : 'auto' })
      contentRef.current?.focus({ preventScroll: true })
    })
  }, [activePanel, contentRef])

  return { activePanel, navigate }
}
