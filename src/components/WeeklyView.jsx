import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import '../styles/WeeklyView.css'

export default function WeeklyView({ onSelectAppointment }) {
  const [appointments, setAppointments] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // Horas disponibles
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00',
  ]

  // Obtener lunes de la semana actual
  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  // Obtener los 6 días de la semana (lunes a sábado)
  const getWeekDays = () => {
    const start = getWeekStart(currentDate)
    const days = []
    for (let i = 0; i < 6; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  // Cargar citas de la semana
  useEffect(() => {
    const loadWeekAppointments = async () => {
      try {
        setLoading(true)
        const start = getWeekStart(currentDate)
        const weekDays = []

        for (let i = 0; i < 6; i++) {
          const date = new Date(start)
          date.setDate(date.getDate() + i)
          weekDays.push(date)
        }

        const startDate = weekDays[0].toISOString().split('T')[0]
        const endDate = weekDays[5].toISOString().split('T')[0]

        const appointmentsRef = collection(db, 'appointments')
        const q = query(
          appointmentsRef,
          where('fecha', '>=', startDate),
          where('fecha', '<=', endDate)
        )

        const snapshot = await getDocs(q)
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setAppointments(data)
      } catch (err) {
        console.error('Error al cargar citas:', err)
      } finally {
        setLoading(false)
      }
    }

    loadWeekAppointments()
  }, [currentDate])

  const getAppointmentsForSlot = (date, time) => {
    const dateStr = date.toISOString().split('T')[0]
    return appointments.filter((apt) => apt.fecha === dateStr && apt.hora === time)
  }

  const weekDays = getWeekDays()

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const handleNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="weekly-view">
      <div className="week-navigation">
        <button onClick={handlePreviousWeek} className="nav-btn">
          ← Anterior
        </button>
        <span className="week-info">
          Semana del {weekDays[0].toLocaleDateString('es-CL')} al{' '}
          {weekDays[5].toLocaleDateString('es-CL')}
        </span>
        <button onClick={handleToday} className="nav-btn">
          Hoy
        </button>
        <button onClick={handleNextWeek} className="nav-btn">
          Siguiente →
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando citas...</div>
      ) : (
        <div className="schedule-table">
          <div className="schedule-header">
            <div className="hour-column">Hora</div>
            {weekDays.map((date, idx) => (
              <div key={idx} className="day-column">
                <div className="day-name">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][idx]}
                </div>
                <div className="day-number">{date.getDate()}</div>
              </div>
            ))}
          </div>

          <div className="schedule-body">
            {timeSlots.map((time) => (
              <div key={time} className="time-row">
                <div className="time-slot">{time}</div>
                {weekDays.map((date, dayIdx) => {
                  const slotAppointments = getAppointmentsForSlot(date, time)
                  const appointment = slotAppointments[0]
                  const statusClass = appointment ? `status-${appointment.estado || 'confirmada'}` : ''
                  const typeClass = appointment ? `type-${appointment.tipo_cita || 'sesion'}` : ''
                  return (
                    <div
                      key={`${dayIdx}-${time}`}
                      className={`appointment-cell ${appointment ? 'booked' : 'empty'} ${statusClass} ${typeClass}`}
                      onClick={() => appointment && onSelectAppointment(appointment)}
                    >
                      {appointment && (
                        <div className="appointment-slot">
                          <div className="appointment-name">
                            {appointment.tipo_cita === 'sesion'
                              ? `${appointment.nombre || ''} ${appointment.apellido || ''}`.trim()
                              : getTypeLabel(appointment.tipo_cita)}
                          </div>
                          <div className="appointment-phone">
                            {appointment.tipo_cita === 'sesion'
                              ? `${appointment.duracion || 60} min · ${getStatusLabel(appointment.estado)}`
                              : appointment.motivo || appointment.observaciones_admin || 'No disponible'}
                          </div>
                          {slotAppointments.length > 1 && (
                            <div className="appointment-stack-count">+{slotAppointments.length - 1}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusLabel(status = 'confirmada') {
  const labels = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    cancelada: 'Cancelada',
    no_asistio: 'No asistió',
    reagendada: 'Reagendada',
  }
  return labels[status] || status
}

function getTypeLabel(type = 'sesion') {
  const labels = {
    sesion: 'Sesión',
    bloqueo: 'Bloqueo',
    vacaciones: 'Vacaciones',
    feriado: 'Feriado',
  }
  return labels[type] || type
}
