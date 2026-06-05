import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { useState } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  IdCard,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  UserRound,
  X,
} from 'lucide-react'
import { db } from '../config/firebase'
import { sendBookingEmails, saveBookingToFirestore } from '../services/emailService'
import '../styles/BookingModal.css'

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
]

const initialFormData = {
  nombre: '',
  apellido: '',
  edad: '',
  rut: '',
  telefono: '',
  email: '',
  motivo: '',
}

const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function BookingModal({ isOpen, onClose }) {
  const [step, setStep] = useState('form') // 'form' | 'calendar'
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  // Genera fechas de lunes a sábado para los próximos `days` días
  const getDaysFromNow = (days) => {
    const result = []
    const today = new Date()

    for (let i = 1; i <= days; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayOfWeek = date.getDay()

      if (dayOfWeek >= 1 && dayOfWeek <= 6) {
        result.push(date)
      }
    }

    return result
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) return setError('El nombre es requerido'), false
    if (!formData.apellido.trim()) return setError('El apellido es requerido'), false
    if (!formData.edad || Number(formData.edad) < 1) return setError('La edad es requerida'), false
    if (!formData.rut.trim()) return setError('El RUT es requerido'), false
    if (!formData.telefono.trim()) return setError('El teléfono es requerido'), false
    if (!formData.email.trim() || !formData.email.includes('@'))
      return setError('El correo electrónico es inválido'), false
    if (!formData.motivo.trim()) return setError('El motivo de la consulta es requerido'), false
    return true
  }

  const handleNextStep = () => {
    setError('')
    if (!validateForm()) return

    setStep('calendar')

    if (!selectedDate) {
      const [firstAvailableDate] = getDaysFromNow(90)
      if (firstAvailableDate) {
        handleDateSelect(firstAvailableDate)
      }
    }
  }

  const checkAvailableSlots = async (date) => {
    try {
      setLoadingSlots(true)
      const dateString = formatDateKey(date)

      const availabilityRef = collection(db, 'availability_blocks')
      const q = query(
        availabilityRef,
        where('fecha', '==', dateString)
      )

      const snapshot = await getDocs(q)
      const bookedTimes = snapshot.docs.map((doc) => doc.data().hora)
      const available = timeSlots.filter((time) => !bookedTimes.includes(time))
      setAvailableSlots(available)
    } catch (err) {
      console.error('Error al verificar horarios:', err)
      setAvailableSlots([])
      setError('No pudimos cargar la disponibilidad. Intenta nuevamente en unos segundos.')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date) => {
    setError('')
    setSelectedDate(date)
    setSelectedTime(null)
    checkAvailableSlots(date)
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
  }

  const isSlotStillAvailable = async (dateString, time) => {
    const slotId = `${dateString}_${time.replace(':', '')}`
    const snapshot = await getDoc(doc(db, 'availability_blocks', slotId))
    return !snapshot.exists()
  }

  const handleSubmitBooking = async () => {
    setError('')

    if (!selectedDate || !selectedTime) {
      setError('Debes seleccionar fecha y hora')
      return
    }

    setLoading(true)

    try {
      const dateString = formatDateKey(selectedDate)
      const dateFormatted = selectedDate.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const bookingData = {
        ...formData,
        fecha: dateString,
        fechaFormato: dateFormatted,
        hora: selectedTime,
      }

      const stillAvailable = await isSlotStillAvailable(dateString, selectedTime)

      if (!stillAvailable) {
        setError('Ese horario se acaba de ocupar. Elige otra hora disponible.')
        await checkAvailableSlots(selectedDate)
        return
      }

      const firestoreResult = await saveBookingToFirestore(db, bookingData)

      if (!firestoreResult.success) {
        throw new Error('No se pudo guardar la cita. Por favor intenta nuevamente.')
      }

      const emailResult = await sendBookingEmails(bookingData)

      if (!emailResult.success) {
        console.warn('Correo no enviado:', emailResult.error)
        setError('Tu cita fue agendada, pero hubo un problema al enviar el correo de confirmación. Guarda tu fecha y hora.')
      }

      setSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 3000)
    } catch (err) {
      setError(err.message || 'Error al agendar la cita. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToForm = () => {
    setError('')
    setStep('form')
  }

  const handleClose = () => {
    onClose()
    setStep('form')
    setFormData(initialFormData)
    setSelectedDate(null)
    setSelectedTime(null)
    setAvailableSlots([])
    setCurrentWeekIndex(0)
    setError('')
    setSuccess(false)
    setLoading(false)
    setLoadingSlots(false)
  }

  const availableDates = getDaysFromNow(90)

  const getWeeks = (dates) => {
    const weeks = []
    let currentWeek = []

    dates.forEach(date => {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      currentWeek.push(date)
    })

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }

  const weeks = getWeeks(availableDates)
  const currentWeek = weeks[currentWeekIndex] || []
  const selectedDateLabel = selectedDate
    ? selectedDate.toLocaleDateString('es-CL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  if (!isOpen) return null

  return (
    <div className="booking-modal-overlay" onClick={handleClose}>
      <div className="booking-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal-close" onClick={handleClose} aria-label="Cerrar reserva">
          <X size={20} />
        </button>

        {success ? (
          <div className="booking-modal-success-message">
            <div className="booking-modal-success-icon">
              <CheckCircle2 size={42} />
            </div>
            <h3>¡Cita Agendada Exitosamente!</h3>
            <p>Se ha enviado una confirmación a tu correo</p>
          </div>
        ) : step === 'form' ? (
          <div className="booking-modal-form-step">
            <div className="booking-modal-header">
              <span className="booking-modal-step-indicator">Paso 1 de 2</span>
              <h2>Cuéntanos sobre ti</h2>
              <p>Con estos datos podremos confirmar tu hora y contactarte si hace falta ajustar algo.</p>
            </div>

            {error && <div className="booking-modal-error-message">{error}</div>}

            <div className="booking-modal-form-grid">
              <div className="booking-modal-form-group">
                <label>Nombre *</label>
                <div className="booking-modal-input-shell">
                  <UserRound size={18} />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    placeholder="Tu nombre"
                  />
                </div>
              </div>

              <div className="booking-modal-form-group">
                <label>Apellido *</label>
                <div className="booking-modal-input-shell">
                  <UserRound size={18} />
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleFormChange}
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
            </div>

            <div className="booking-modal-form-grid">
              <div className="booking-modal-form-group">
                <label>Edad *</label>
                <div className="booking-modal-input-shell">
                  <CalendarDays size={18} />
                  <input
                    type="number"
                    name="edad"
                    value={formData.edad}
                    onChange={handleFormChange}
                    placeholder="Ej: 25"
                    min="1"
                    max="120"
                  />
                </div>
              </div>

              <div className="booking-modal-form-group">
                <label>RUT *</label>
                <div className="booking-modal-input-shell">
                  <IdCard size={18} />
                  <input
                    type="text"
                    name="rut"
                    value={formData.rut}
                    onChange={handleFormChange}
                    placeholder="Ej: 12.345.678-9"
                  />
                </div>
              </div>
            </div>

            <div className="booking-modal-form-grid">
              <div className="booking-modal-form-group">
                <label>Teléfono *</label>
                <div className="booking-modal-input-shell">
                  <Phone size={18} />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleFormChange}
                    placeholder="Ej: +56 9 1234 5678"
                  />
                </div>
              </div>

              <div className="booking-modal-form-group">
                <label>Correo electrónico *</label>
                <div className="booking-modal-input-shell">
                  <Mail size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="tu@correo.com"
                  />
                </div>
              </div>
            </div>

            <div className="booking-modal-form-group">
              <label>Motivo de la Consulta *</label>
              <div className="booking-modal-input-shell textarea">
                <MessageSquare size={18} />
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleFormChange}
                  placeholder="Cuéntame brevemente sobre tu consulta..."
                  rows="4"
                />
              </div>
            </div>

            <button className="booking-modal-btn-next" onClick={handleNextStep} disabled={loading}>
              <CalendarDays size={18} />
              Elegir fecha y hora
            </button>
          </div>
        ) : (
          <div className="booking-modal-calendar-step">
            <div className="booking-modal-header">
              <span className="booking-modal-step-indicator">Paso 2 de 2</span>
              <h2>Elige tu fecha y hora</h2>
              <p>Primero selecciona un día. Luego verás las horas disponibles para confirmar tu reserva.</p>
            </div>

            {error && <div className="booking-modal-error-message">{error}</div>}

            <div className="booking-modal-week-navigation">
              <button
                className="booking-modal-nav-btn"
                onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                disabled={currentWeekIndex === 0}
                aria-label="Semana anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="booking-modal-week-info">
                {currentWeek.length > 0
                  ? `${currentWeek[0].toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })} - ${currentWeek[currentWeek.length - 1].toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}`
                  : 'Selecciona una semana'
                }
              </span>
              <button
                className="booking-modal-nav-btn"
                onClick={() => setCurrentWeekIndex(Math.min(weeks.length - 1, currentWeekIndex + 1))}
                disabled={currentWeekIndex === weeks.length - 1}
                aria-label="Semana siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="booking-modal-date-grid">
              {currentWeek.map((date) => {
                const isSelected = selectedDate?.toDateString() === date.toDateString()

                return (
                  <button
                    key={formatDateKey(date)}
                    className={`booking-modal-date-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <span>{date.toLocaleDateString('es-CL', { weekday: 'short' })}</span>
                    <strong>{date.getDate()}</strong>
                    <small>{date.toLocaleDateString('es-CL', { month: 'short' })}</small>
                  </button>
                )
              })}
            </div>

            <div className="booking-modal-time-panel">
              <div className="booking-modal-time-title">
                <Clock size={18} />
                <span>{selectedDateLabel || 'Selecciona un día'}</span>
              </div>

              {loadingSlots ? (
                <div className="booking-modal-loading-slots">
                  <Loader2 className="booking-modal-spinner" size={20} />
                  Cargando horarios disponibles...
                </div>
              ) : (
                <div className="booking-modal-time-grid">
                  {timeSlots.map((time) => {
                    const isAvailable = availableSlots.includes(time)
                    const isSelected = selectedTime === time

                    return (
                      <button
                        key={time}
                        className={`booking-modal-slot ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                        onClick={() => isAvailable && handleTimeSelect(time)}
                        disabled={!selectedDate || !isAvailable}
                      >
                        {time}
                        <span>{isAvailable ? 'Disponible' : 'Ocupado'}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="booking-modal-summary">
              <div>
                <span>Fecha</span>
                <strong>{selectedDateLabel || 'Sin seleccionar'}</strong>
              </div>
              <div>
                <span>Hora</span>
                <strong>{selectedTime ? `${selectedTime} hrs` : 'Sin seleccionar'}</strong>
              </div>
            </div>

            <div className="booking-modal-button-group">
              <button
                className="booking-modal-btn-back"
                onClick={handleBackToForm}
                disabled={loading}
              >
                <ChevronLeft size={18} />
                Atrás
              </button>
              <button
                className="booking-modal-btn-submit"
                onClick={handleSubmitBooking}
                disabled={loading || loadingSlots || !selectedTime}
              >
                {loading ? (
                  <>
                    <Loader2 className="booking-modal-spinner" size={18} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Confirmar cita
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
