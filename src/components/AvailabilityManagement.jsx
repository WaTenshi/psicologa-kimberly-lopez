import { useEffect, useMemo, useState } from 'react'
import {
  MdBlock,
  MdCalendarMonth,
  MdCheckCircle,
  MdDelete,
  MdEdit,
  MdExpandLess,
  MdExpandMore,
  MdRefresh,
  MdSave,
  MdSchedule,
} from 'react-icons/md'
import {
  BOOKING_TIME_SLOTS,
  createDefaultAvailabilityConfig,
  formatDateKey,
  getWeeklySlotsForDate,
  parseDateKey,
  sortTimeSlots,
  WEEK_DAYS,
} from '../config/availability'
import {
  loadAvailabilityConfig,
  saveAvailabilityConfig,
} from '../services/availabilityService'
import '../styles/AvailabilityManagement.css'
import { Toast } from './AdminUI'

const todayKey = formatDateKey(new Date())

const TIME_GROUPS = [
  { label: 'Mañana', slots: BOOKING_TIME_SLOTS.filter((time) => Number(time.slice(0, 2)) <= 13) },
  { label: 'Tarde', slots: BOOKING_TIME_SLOTS.filter((time) => Number(time.slice(0, 2)) >= 14 && Number(time.slice(0, 2)) <= 17) },
  { label: 'Noche', slots: BOOKING_TIME_SLOTS.filter((time) => Number(time.slice(0, 2)) >= 18) },
]

const toggleValue = (values, value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

export default function AvailabilityManagement() {
  const [config, setConfig] = useState(createDefaultAvailabilityConfig)
  const [savedConfig, setSavedConfig] = useState(createDefaultAvailabilityConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [hasSavedConfig, setHasSavedConfig] = useState(false)
  const [materializedThrough, setMaterializedThrough] = useState('')
  const [bulkDays, setBulkDays] = useState([])
  const [bulkTimes, setBulkTimes] = useState([])
  const [overrideDate, setOverrideDate] = useState('')
  const [overrideSlots, setOverrideSlots] = useState([])
  const [expandedDay, setExpandedDay] = useState('1')

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const result = await loadAvailabilityConfig()
        if (!active) return
        setConfig(result.config)
        setSavedConfig(result.config)
        setHasSavedConfig(result.exists)
        setMaterializedThrough(result.materializedThrough)
      } catch (loadError) {
        console.error('Error al cargar la disponibilidad:', loadError)
        if (active) setError('No fue posible cargar la configuración de disponibilidad.')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isDirty) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const handlePanelChange = (event) => {
      const shouldLeave = window.confirm('Tienes cambios de disponibilidad sin publicar. ¿Quieres salir y descartarlos?')
      if (!shouldLeave) {
        event.preventDefault()
      } else {
        setIsDirty(false)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('admin:before-panel-change', handlePanelChange)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('admin:before-panel-change', handlePanelChange)
    }
  }, [isDirty])

  const overrides = useMemo(
    () => Object.entries(config.dateOverrides).sort(([first], [second]) => first.localeCompare(second)),
    [config.dateOverrides],
  )

  const markUnsaved = (message = '') => {
    setIsDirty(true)
    if (message) setNotice(message)
    setError('')
  }

  const updateWeeklyDay = (dayId, slots) => {
    setConfig((current) => ({
      ...current,
      weeklySchedule: {
        ...current.weeklySchedule,
        [dayId]: sortTimeSlots(slots),
      },
    }))
    markUnsaved()
  }

  const toggleWeeklySlot = (dayId, time) => {
    updateWeeklyDay(dayId, toggleValue(config.weeklySchedule[dayId] || [], time))
  }

  const applyBulkRule = (action) => {
    if (bulkDays.length === 0 || bulkTimes.length === 0) {
      setError('Selecciona al menos un día y una hora para aplicar la regla masiva.')
      return
    }

    setConfig((current) => {
      const weeklySchedule = { ...current.weeklySchedule }
      bulkDays.forEach((dayId) => {
        const currentSlots = weeklySchedule[dayId] || []
        weeklySchedule[dayId] = action === 'enable'
          ? sortTimeSlots([...currentSlots, ...bulkTimes])
          : currentSlots.filter((time) => !bulkTimes.includes(time))
      })
      return { ...current, weeklySchedule }
    })
    markUnsaved(action === 'enable' ? 'Horas habilitadas en el patrón semanal.' : 'Horas bloqueadas en el patrón semanal.')
  }

  const selectOverrideDate = (dateKey) => {
    setOverrideDate(dateKey)
    setError('')
    if (!dateKey) {
      setOverrideSlots([])
      return
    }

    const savedOverride = config.dateOverrides[dateKey]
    setOverrideSlots(
      savedOverride
        ? [...savedOverride.slots]
        : getWeeklySlotsForDate(parseDateKey(dateKey), config),
    )
  }

  const saveDateOverride = () => {
    if (!overrideDate) {
      setError('Selecciona una fecha para crear la excepción.')
      return
    }

    setConfig((current) => ({
      ...current,
      dateOverrides: {
        ...current.dateOverrides,
        [overrideDate]: { slots: sortTimeSlots(overrideSlots) },
      },
    }))
    markUnsaved(`Excepción preparada para ${formatFriendlyDate(overrideDate)}.`)
  }

  const removeDateOverride = (dateKey) => {
    setConfig((current) => {
      const dateOverrides = { ...current.dateOverrides }
      delete dateOverrides[dateKey]
      return { ...current, dateOverrides }
    })
    if (overrideDate === dateKey) selectOverrideDate('')
    markUnsaved('La fecha volverá a usar el patrón semanal cuando guardes.')
  }

  const editDateOverride = (dateKey) => {
    setOverrideDate(dateKey)
    setOverrideSlots([...(config.dateOverrides[dateKey]?.slots || [])])
    document.getElementById('availability-date-editor')?.scrollIntoView({ behavior: 'smooth' })
  }

  const saveAllChanges = async () => {
    try {
      setSaving(true)
      setError('')
      const saved = await saveAvailabilityConfig(config)
      setConfig(saved)
      setSavedConfig(saved)
      setIsDirty(false)
      setHasSavedConfig(true)
      setMaterializedThrough(saved.materializedThrough)
      setNotice('Disponibilidad guardada y publicada correctamente.')
    } catch (saveError) {
      console.error('Error al guardar la disponibilidad:', saveError)
      setError('No fue posible publicar la disponibilidad. Revisa tu conexión e inténtalo nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  const discardChanges = () => {
    setConfig(savedConfig)
    setOverrideDate('')
    setOverrideSlots([])
    setIsDirty(false)
    setNotice('Cambios descartados.')
    setError('')
  }

  if (loading) {
    return <div className="availability-loading">Cargando configuración de disponibilidad...</div>
  }

  return (
    <section className="availability-management">
      <header className="availability-header">
        <div>
          <span className="availability-eyebrow"><MdSchedule /> Control de agenda</span>
          <h2>Disponibilidad de reservas</h2>
          <p>Define el horario habitual y crea excepciones para fechas específicas.</p>
        </div>
        <div className="availability-header-actions">
          <span className={`availability-publish-status ${isDirty ? 'dirty' : ''}`}>
            {isDirty ? 'Cambios sin publicar' : 'Agenda publicada'}
          </span>
        </div>
      </header>

      {!hasSavedConfig && (
        <div className="availability-info">
          Se cargó el horario actual como configuración inicial. Presiona “Guardar y publicar” para activar el control dinámico.
        </div>
      )}
      {materializedThrough && <p className="availability-security-note">Validación activa hasta el {formatFriendlyDate(materializedThrough)}.</p>}
      {error && <div className="availability-error">{error}</div>}

      <div className="availability-card" data-tour="weekly-availability">
        <div className="availability-card-title">
          <div>
            <h3>Horario semanal habitual</h3>
            <p>Las horas marcadas quedan disponibles para reservas en ese día de la semana.</p>
          </div>
        </div>

        <div className="weekly-schedule-table availability-desktop-schedule">
          <div className="weekly-schedule-head" aria-hidden="true">
            <span>Día</span>
            {BOOKING_TIME_SLOTS.map((time) => <span key={time}>{time}</span>)}
            <span>Acción</span>
          </div>
          {WEEK_DAYS.map((day) => {
            const selectedSlots = config.weeklySchedule[day.id] || []
            return (
              <div className="weekly-schedule-row" key={day.id}>
                <strong>{day.label}</strong>
                {BOOKING_TIME_SLOTS.map((time) => (
                  <label className="availability-slot-check" key={time} title={`${day.label} ${time}`}>
                    <input
                      type="checkbox"
                      checked={selectedSlots.includes(time)}
                      onChange={() => toggleWeeklySlot(day.id, time)}
                    />
                    <span>{time}</span>
                  </label>
                ))}
                <div className="weekly-row-actions">
                  <button type="button" onClick={() => updateWeeklyDay(day.id, BOOKING_TIME_SLOTS)}>Todo</button>
                  <button type="button" onClick={() => updateWeeklyDay(day.id, [])}>Cerrar</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="availability-mobile-schedule">
          {WEEK_DAYS.map((day) => {
            const selectedSlots = config.weeklySchedule[day.id] || []
            const isExpanded = expandedDay === day.id
            return (
              <article className="availability-day-card" key={day.id}>
                <button
                  type="button"
                  className="availability-day-summary"
                  onClick={() => setExpandedDay(isExpanded ? '' : day.id)}
                  aria-expanded={isExpanded}
                >
                  <span>
                    <strong>{day.label}</strong>
                    <small>{selectedSlots.length ? `${selectedSlots.length} horas disponibles` : 'Día cerrado'}</small>
                  </span>
                  {isExpanded ? <MdExpandLess /> : <MdExpandMore />}
                </button>
                {isExpanded && (
                  <div className="availability-day-content">
                    {TIME_GROUPS.map((group) => (
                      <div className="availability-time-group" key={group.label}>
                        <span>{group.label}</span>
                        <div className="availability-chip-grid">
                          {group.slots.map((time) => (
                            <button
                              type="button"
                              key={time}
                              className={selectedSlots.includes(time) ? 'selected' : ''}
                              onClick={() => toggleWeeklySlot(day.id, time)}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="availability-day-quick-actions">
                      <button type="button" onClick={() => updateWeeklyDay(day.id, BOOKING_TIME_SLOTS)}>Habilitar todo</button>
                      <button type="button" onClick={() => updateWeeklyDay(day.id, [])}>Cerrar día</button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>

      <div className="availability-card" data-tour="availability-rules">
        <div className="availability-card-title">
          <div>
            <h3>Regla masiva semanal</h3>
            <p>Ejemplo: selecciona lunes a sábado y 09:00 para bloquear esa hora, dejando domingo fuera.</p>
          </div>
        </div>

        <div className="availability-rule-group">
          <span>Días afectados</span>
          <div className="availability-chip-grid days">
            {WEEK_DAYS.map((day) => (
              <button
                type="button"
                key={day.id}
                className={bulkDays.includes(day.id) ? 'selected' : ''}
                onClick={() => setBulkDays((current) => toggleValue(current, day.id))}
              >
                {day.short}
              </button>
            ))}
          </div>
        </div>
        <div className="availability-rule-group">
          <span>Horas afectadas</span>
          <div className="availability-chip-grid">
            {BOOKING_TIME_SLOTS.map((time) => (
              <button
                type="button"
                key={time}
                className={bulkTimes.includes(time) ? 'selected' : ''}
                onClick={() => setBulkTimes((current) => toggleValue(current, time))}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
        <div className="availability-action-row">
          <button className="availability-enable-btn" onClick={() => applyBulkRule('enable')}>
            <MdCheckCircle /> Habilitar selección
          </button>
          <button className="availability-block-btn" onClick={() => applyBulkRule('block')}>
            <MdBlock /> Bloquear selección
          </button>
        </div>
      </div>

      <div className="availability-card" id="availability-date-editor">
        <div className="availability-card-title">
          <div>
            <h3>Excepción por fecha</h3>
            <p>Una excepción reemplaza solo para esa fecha el horario semanal habitual.</p>
          </div>
          <MdCalendarMonth />
        </div>

        <div className="availability-date-editor">
          <label>
            Fecha específica
            <input
              type="date"
              min={todayKey}
              value={overrideDate}
              onChange={(event) => selectOverrideDate(event.target.value)}
            />
          </label>
          <div className="availability-date-actions">
            <button type="button" onClick={() => setOverrideSlots([])} disabled={!overrideDate}>
              <MdBlock /> Bloquear día completo
            </button>
            <button type="button" onClick={() => setOverrideSlots([...BOOKING_TIME_SLOTS])} disabled={!overrideDate}>
              <MdCheckCircle /> Habilitar todas
            </button>
          </div>
        </div>

        <div className="availability-chip-grid date-times">
          {BOOKING_TIME_SLOTS.map((time) => (
            <button
              type="button"
              key={time}
              disabled={!overrideDate}
              className={overrideSlots.includes(time) ? 'selected' : ''}
              onClick={() => setOverrideSlots((current) => toggleValue(current, time))}
            >
              {time}
            </button>
          ))}
        </div>

        <button className="availability-add-exception" onClick={saveDateOverride} disabled={!overrideDate}>
          <MdSave /> Guardar excepción en borrador
        </button>

        <div className="availability-overrides">
          <h4>Fechas con excepción ({overrides.length})</h4>
          {overrides.length === 0 ? (
            <p className="availability-empty">No hay excepciones configuradas.</p>
          ) : (
            overrides.map(([dateKey, override]) => (
              <div className="availability-override-row" key={dateKey}>
                <div>
                  <strong>{formatFriendlyDate(dateKey)}</strong>
                  <span>{override.slots.length ? override.slots.join(' · ') : 'Día completo bloqueado'}</span>
                </div>
                <div>
                  <button type="button" onClick={() => editDateOverride(dateKey)} aria-label={`Editar ${dateKey}`}>
                    <MdEdit />
                  </button>
                  <button type="button" onClick={() => removeDateOverride(dateKey)} aria-label={`Eliminar ${dateKey}`}>
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`availability-footer-actions ${isDirty ? 'has-changes' : ''}`}>
        <button className="availability-reset-btn" onClick={() => {
          setConfig(createDefaultAvailabilityConfig())
          setOverrideDate('')
          setOverrideSlots([])
          markUnsaved('Se restauró el horario original en borrador. Guarda para publicarlo.')
        }}>
          <MdRefresh /> Restaurar horario original
        </button>
        {isDirty && (
          <button className="availability-discard-btn" onClick={discardChanges} disabled={saving}>
            Descartar cambios
          </button>
        )}
        <button className="availability-save-btn" onClick={saveAllChanges} disabled={saving}>
          <MdSave /> {saving ? 'Publicando...' : 'Guardar y publicar'}
        </button>
      </div>
      <Toast message={notice} onDismiss={() => setNotice('')} type={error ? 'error' : 'success'} />
    </section>
  )
}

function formatFriendlyDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
