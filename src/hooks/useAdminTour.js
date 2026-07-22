import { useCallback, useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { getAdminTour } from '../config/adminTours'
import '../styles/AdminTour.css'

export default function useAdminTour(activePanel) {
  const driverRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => () => {
    driverRef.current?.destroy()
    driverRef.current = null
  }, [activePanel])

  return useCallback((event) => {
    driverRef.current?.destroy()
    triggerRef.current = event?.currentTarget || null

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const tour = driver({
      steps: getAdminTour(activePanel),
      animate: !reduceMotion,
      duration: reduceMotion ? 0 : 260,
      overlayColor: '#20170f',
      overlayOpacity: 0.62,
      smoothScroll: !reduceMotion,
      allowClose: true,
      allowScroll: true,
      overlayClickBehavior: 'close',
      allowKeyboardControl: true,
      skipMissingElement: true,
      stagePadding: 8,
      stageRadius: 14,
      popoverOffset: 12,
      popoverClass: 'kimberly-admin-tour',
      showButtons: ['previous', 'next', 'close'],
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      onPopoverRender: ({ closeButton }) => {
        closeButton.setAttribute('aria-label', 'Cerrar recorrido')
        closeButton.setAttribute('title', 'Cerrar recorrido')
      },
      onDestroyed: () => {
        driverRef.current = null
        if (triggerRef.current && document.contains(triggerRef.current)) {
          triggerRef.current.focus()
        }
      },
    })

    driverRef.current = tour
    tour.drive()
  }, [activePanel])
}
