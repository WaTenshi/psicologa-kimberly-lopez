import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import '../styles/MonthlyView.css'

export default function MonthlyView({ onSelectDate }) {
  const [appointments, setAppointments] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMonthAppointments = async () => {
      try {
        setLoading(true)
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()

        // Primer día del mes
        const firstDay = new Date(year, month, 1)
        // Último día del mes
        const lastDay = new Date(year, month + 1, 0)

        const startDateStr = firstDay.toISOString().split('T')[0]
        const endDateStr = lastDay.toISOString().split('T')[0]

        const appointmentsRef = collection(db, 'appointments')
        const q = query(
          appointmentsRef,
          where('fecha', '>=', startDateStr),
          where('fecha', '<=', endDateStr)
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

    loadMonthAppointments()
  }, [currentDate])

  const getDaysInMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = () => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  }

  const getAppointmentsForDay = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0]

    return appointments.filter((apt) => apt.fecha === dateStr)
  }

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    )
  }

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    )
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const daysInMonth = getDaysInMonth()
  const firstDay = getFirstDayOfMonth()
  const monthName = currentDate.toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  })

  const days = []
  // Espacios vacíos para los días de otros meses
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="monthly-view">
      <div className="month-navigation">
        <button onClick={handlePreviousMonth} className="nav-btn">
          ← Anterior
        </button>
        <span className="month-info">{monthName.toUpperCase()}</span>
        <button onClick={handleToday} className="nav-btn">
          Hoy
        </button>
        <button onClick={handleNextMonth} className="nav-btn">
          Siguiente →
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando citas...</div>
      ) : (
        <div className="calendar">
          <div className="calendar-header">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
              <div key={day} className="weekday-header">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-body">
            {days.map((day, idx) => {
              const dayAppointments = day ? getAppointmentsForDay(day) : []
              const isToday =
                day &&
                new Date().toDateString() ===
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  ).toDateString()

              return (
                <div
                  key={idx}
                  className={`calendar-day ${day ? 'active' : 'inactive'} ${isToday ? 'today' : ''}`}
                  onClick={() => day && onSelectDate(day)}
                >
                  {day && (
                    <>
                      <div className="day-number">{day}</div>
                      {dayAppointments.length > 0 && (
                        <div className="day-appointments">
                          <div className="appointment-count">
                            {dayAppointments.length}{' '}
                            {dayAppointments.length === 1 ? 'cita' : 'citas'}
                          </div>
                          <div className="appointment-list">
                            {dayAppointments.map((apt, i) => (
                              <div
                                key={i}
                                className={`appointment-badge status-${apt.estado || 'confirmada'} type-${apt.tipo_cita || 'sesion'}`}
                              >
                                {apt.hora} · {apt.tipo_cita === 'sesion' ? (apt.nombre || 'Cita') : getTypeLabel(apt.tipo_cita)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
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
