import { useState } from 'react'
import { collection, deleteDoc, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { MdDashboard, MdEvent, MdGroup, MdDocumentScanner, MdNotes, MdLogout, MdCalendarToday, MdCalendarMonth, MdClose, MdAdd, MdEdit, MdDelete } from 'react-icons/md'
import { db, auth } from '../config/firebase'
import WeeklyView from './WeeklyView'
import MonthlyView from './MonthlyView'
import PatientManagement from './PatientManagement'
import SessionHistory from './SessionHistory'
import QuickNotes from './QuickNotes'
import DashboardAnalytics from './DashboardAnalytics'
import '../styles/AdminDashboard.css'

const APPOINTMENT_TYPES = [
  { value: 'sesion', label: 'Sesión' },
  { value: 'bloqueo', label: 'Bloqueo horario' },
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'feriado', label: 'Feriado' },
]

const APPOINTMENT_STATUSES = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'realizada', label: 'Realizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
  { value: 'reagendada', label: 'Reagendada' },
]

const PAYMENT_STATUSES = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'parcial', label: 'Pago parcial' },
  { value: 'exento', label: 'Exento' },
]

const PAYMENT_METHODS = [
  { value: '', label: 'Sin registrar' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'webpay', label: 'Webpay' },
  { value: 'otro', label: 'Otro' },
]

const INITIAL_APPOINTMENT_FORM = {
  tipo_cita: 'sesion',
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  fecha: '',
  hora: '',
  duracion: '60',
  modalidad: 'presencial',
  estado: 'confirmada',
  motivo: '',
  valor_sesion: '',
  pago_estado: 'pendiente',
  pago_metodo: '',
  comprobante: '',
  recordatorio_activo: true,
  recordatorio_horas: '24',
  recordatorio_canal: 'email',
  observaciones_admin: '',
}

export default function AdminDashboard({ onLogout }) {
  const [mainTab, setMainTab] = useState('dashboard') // 'dashboard' | 'appointments' | 'patients' | 'sessions' | 'notes'
  const [view, setView] = useState('week') // 'week' | 'month'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewAppointmentForm, setShowNewAppointmentForm] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editingOriginalSlot, setEditingOriginalSlot] = useState(null)
  const [calendarRefreshKey, setCalendarRefreshKey] = useState(0)

  const [formData, setFormData] = useState(INITIAL_APPOINTMENT_FORM)

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validateForm = () => {
    if (!formData.fecha) return 'Fecha requerida'
    if (!formData.hora) return 'Hora requerida'
    if (!formData.duracion || Number(formData.duracion) < 15) return 'La duración debe ser de al menos 15 minutos'
    if (formData.tipo_cita === 'sesion') {
      if (!formData.nombre.trim()) return 'El nombre es requerido'
      if (!formData.apellido.trim()) return 'El apellido es requerido'
      if (!formData.email.trim() || !formData.email.includes('@')) return 'Email válido requerido'
      if (!formData.telefono.trim()) return 'Teléfono requerido'
      if (!formData.motivo.trim()) return 'Motivo requerido'
    }
    return null
  }

  const handleSaveAppointment = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      if (editingId) {
        // Editar cita existente
        const appointmentRef = doc(db, 'appointments', editingId)
        await updateDoc(appointmentRef, {
          ...formData,
          duracion: Number(formData.duracion),
          valor_sesion: Number(formData.valor_sesion || 0),
          updatedAt: new Date(),
        })

        if (editingOriginalSlot) {
          await deleteDoc(doc(db, 'availability_blocks', editingOriginalSlot))
        }
      } else {
        // Crear nueva cita
        await addDoc(collection(db, 'appointments'), {
          ...formData,
          duracion: Number(formData.duracion),
          valor_sesion: Number(formData.valor_sesion || 0),
          createdAt: new Date(),
        })
      }

      if (occupiesAgenda(formData)) {
        const slotId = getSlotId(formData.fecha, formData.hora)
        await setDoc(doc(db, 'availability_blocks', slotId), {
          fecha: formData.fecha,
          hora: formData.hora,
          tipo: formData.tipo_cita,
          updatedAt: new Date(),
        })
      }

      // Limpiar y recargar
      setFormData(INITIAL_APPOINTMENT_FORM)
      setEditingId(null)
      setEditingOriginalSlot(null)
      setShowNewAppointmentForm(false)
      setSelectedAppointment(null)
      setCalendarRefreshKey((prev) => prev + 1)
      setError('')
    } catch (err) {
      console.error('Error al guardar cita:', err)
      setError('Error al guardar la cita')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAppointment = (appointment) => {
    setSelectedAppointment(appointment)
  }

  const handleEditAppointment = () => {
    if (selectedAppointment) {
      setFormData({
        ...INITIAL_APPOINTMENT_FORM,
        ...selectedAppointment,
        duracion: String(selectedAppointment.duracion || 60),
        valor_sesion: selectedAppointment.valor_sesion ? String(selectedAppointment.valor_sesion) : '',
        recordatorio_horas: String(selectedAppointment.recordatorio_horas || 24),
      })
      setEditingId(selectedAppointment.id)
      setEditingOriginalSlot(getSlotId(selectedAppointment.fecha, selectedAppointment.hora))
      setShowNewAppointmentForm(true)
      setSelectedAppointment(null)
    }
  }

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return
    
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        setLoading(true)
        await deleteDoc(doc(db, 'appointments', selectedAppointment.id))
        await deleteDoc(doc(db, 'availability_blocks', getSlotId(selectedAppointment.fecha, selectedAppointment.hora)))
        setCalendarRefreshKey((prev) => prev + 1)
        setSelectedAppointment(null)
        setError('')
      } catch (err) {
        console.error('Error al eliminar cita:', err)
        setError('Error al eliminar la cita')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCancel = () => {
    setFormData(INITIAL_APPOINTMENT_FORM)
    setEditingId(null)
    setEditingOriginalSlot(null)
    setShowNewAppointmentForm(false)
    setError('')
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      onLogout()
    } catch (err) {
      console.error('Error al logout:', err)
      setError('Error al cerrar sesión')
    }
  }

  // Horas disponibles
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00',
  ]

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <h1>Panel de Administración</h1>
          <p>Natasha Silva - Consultora Psicológica</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout />
          Cerrar Sesión
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Main Navigation Tabs */}
      <div className="main-tabs-container">
        <div className="main-tabs">
          <button
            className={`main-tab-btn ${mainTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setMainTab('dashboard')}
          >
            <MdDashboard /> Dashboard
          </button>
          <button
            className={`main-tab-btn ${mainTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setMainTab('appointments')}
          >
            <MdEvent /> Citas
          </button>
          <button
            className={`main-tab-btn ${mainTab === 'patients' ? 'active' : ''}`}
            onClick={() => setMainTab('patients')}
          >
            <MdGroup /> Pacientes
          </button>
          <button
            className={`main-tab-btn ${mainTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setMainTab('sessions')}
          >
            <MdDocumentScanner /> Sesiones
          </button>
          <button
            className={`main-tab-btn ${mainTab === 'notes' ? 'active' : ''}`}
            onClick={() => setMainTab('notes')}
          >
            <MdNotes /> Notas
          </button>
        </div>
      </div>

      {/* Dashboard Section */}
      {mainTab === 'dashboard' && <DashboardAnalytics />}

      {/* Appointments Section */}
      {mainTab === 'appointments' && (
        <>
          <div className="admin-controls">
            <div className="view-tabs">
              <button
                className={`tab-btn ${view === 'week' ? 'active' : ''}`}
                onClick={() => setView('week')}
              >
                <MdCalendarToday /> Semanal
              </button>
              <button
                className={`tab-btn ${view === 'month' ? 'active' : ''}`}
                onClick={() => setView('month')}
              >
                <MdCalendarMonth /> Mensual
              </button>
            </div>

            <button
              className="new-appointment-btn"
              onClick={() => setShowNewAppointmentForm(!showNewAppointmentForm)}
            >
              {showNewAppointmentForm ? <><MdClose /> Cancelar</> : <><MdAdd /> Nueva Cita</>}
            </button>
          </div>

          {showNewAppointmentForm && (
            <div className="appointment-form-container">
              <h3>{editingId ? 'Editar Cita' : 'Nueva Cita'}</h3>

              <div className="form-grid">
                <div className="form-group">
                  <label>Tipo *</label>
                  <select name="tipo_cita" value={formData.tipo_cita} onChange={handleFormChange}>
                    {APPOINTMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado *</label>
                  <select name="estado" value={formData.estado} onChange={handleFormChange}>
                    {APPOINTMENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    placeholder="Nombre del paciente"
                  />
                </div>

                <div className="form-group">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleFormChange}
                    placeholder="Apellido del paciente"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleFormChange}
                    placeholder="+56 9 ..."
                  />
                </div>

                <div className="form-group">
                  <label>Fecha *</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Hora *</label>
                  <select
                    name="hora"
                    value={formData.hora}
                    onChange={handleFormChange}
                  >
                    <option value="">Seleccionar hora</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time} hrs
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duración *</label>
                  <input
                    type="number"
                    name="duracion"
                    min="15"
                    step="15"
                    value={formData.duracion}
                    onChange={handleFormChange}
                    placeholder="60"
                  />
                </div>

                <div className="form-group">
                  <label>Modalidad</label>
                  <select name="modalidad" value={formData.modalidad} onChange={handleFormChange}>
                    <option value="presencial">Presencial</option>
                    <option value="online">Online</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Valor sesión</label>
                  <input
                    type="number"
                    name="valor_sesion"
                    min="0"
                    value={formData.valor_sesion}
                    onChange={handleFormChange}
                    placeholder="35000"
                  />
                </div>

                <div className="form-group">
                  <label>Estado de pago</label>
                  <select name="pago_estado" value={formData.pago_estado} onChange={handleFormChange}>
                    {PAYMENT_STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Método de pago</label>
                  <select name="pago_metodo" value={formData.pago_metodo} onChange={handleFormChange}>
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Comprobante</label>
                  <input
                    type="text"
                    name="comprobante"
                    value={formData.comprobante}
                    onChange={handleFormChange}
                    placeholder="Folio, enlace o nota"
                  />
                </div>

                <div className="form-group">
                  <label>Recordatorio</label>
                  <label className="inline-check-field">
                    <input
                      type="checkbox"
                      name="recordatorio_activo"
                      checked={formData.recordatorio_activo}
                      onChange={handleFormChange}
                    />
                    <span>Activar aviso</span>
                  </label>
                </div>

                <div className="form-group">
                  <label>Horas antes</label>
                  <input
                    type="number"
                    name="recordatorio_horas"
                    min="1"
                    value={formData.recordatorio_horas}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Canal</label>
                  <select name="recordatorio_canal" value={formData.recordatorio_canal} onChange={handleFormChange}>
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="ambos">Email y WhatsApp</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Motivo de la consulta *</label>
                  <textarea
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleFormChange}
                    placeholder="Describe el motivo de la consulta"
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Observaciones administrativas</label>
                  <textarea
                    name="observaciones_admin"
                    value={formData.observaciones_admin}
                    onChange={handleFormChange}
                    placeholder="Notas internas: reagendada, confirmar pago, enviar link, etc."
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button className="save-btn" onClick={handleSaveAppointment} disabled={loading}>
                  {loading ? 'Guardando...' : editingId ? 'Actualizar Cita' : 'Crear Cita'}
                </button>
                <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="view-container">
            {view === 'week' ? (
              <WeeklyView key={`week-${calendarRefreshKey}`} onSelectAppointment={handleSelectAppointment} />
            ) : (
              <MonthlyView key={`month-${calendarRefreshKey}`} onSelectDate={() => {}} />
            )}
          </div>

          {/* Modal de detalles de cita */}
          {selectedAppointment && (
            <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedAppointment(null)}>
                  <MdClose />
                </button>

                <h2>Detalles de la Cita</h2>

                <div className="appointment-details-grid">
                  <div className="detail-item">
                    <label>Tipo</label>
                    <p>{getOptionLabel(APPOINTMENT_TYPES, selectedAppointment.tipo_cita || 'sesion')}</p>
                  </div>

                  <div className="detail-item">
                    <label>Estado</label>
                    <p>{getOptionLabel(APPOINTMENT_STATUSES, selectedAppointment.estado || 'confirmada')}</p>
                  </div>

                  <div className="detail-item">
                    <label>Paciente</label>
                    <p>{selectedAppointment.nombre} {selectedAppointment.apellido}</p>
                  </div>

                  <div className="detail-item">
                    <label>Email</label>
                    <p>{selectedAppointment.email}</p>
                  </div>

                  <div className="detail-item">
                    <label>Teléfono</label>
                    <p>{selectedAppointment.telefono}</p>
                  </div>

                  <div className="detail-item">
                    <label>Fecha</label>
                    <p>
                      {new Date(selectedAppointment.fecha).toLocaleDateString('es-CL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="detail-item">
                    <label>Hora</label>
                    <p>{selectedAppointment.hora} hrs · {selectedAppointment.duracion || 60} min</p>
                  </div>

                  <div className="detail-item">
                    <label>Modalidad</label>
                    <p>{selectedAppointment.modalidad || 'presencial'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Pago</label>
                    <p>{formatCurrency(selectedAppointment.valor_sesion)} · {getOptionLabel(PAYMENT_STATUSES, selectedAppointment.pago_estado || 'pendiente')}</p>
                  </div>

                  <div className="detail-item">
                    <label>Método / comprobante</label>
                    <p>{getOptionLabel(PAYMENT_METHODS, selectedAppointment.pago_metodo || '')} · {selectedAppointment.comprobante || 'Sin comprobante'}</p>
                  </div>

                  <div className="detail-item">
                    <label>Recordatorio</label>
                    <p>{selectedAppointment.recordatorio_activo === false ? 'Desactivado' : `${selectedAppointment.recordatorio_horas || 24}h antes por ${selectedAppointment.recordatorio_canal || 'email'}`}</p>
                  </div>

                  <div className="detail-item full-width">
                    <label>Motivo</label>
                    <p>{selectedAppointment.motivo || 'Sin motivo registrado'}</p>
                  </div>

                  <div className="detail-item full-width">
                    <label>Observaciones internas</label>
                    <p>{selectedAppointment.observaciones_admin || 'Sin observaciones'}</p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="edit-btn" onClick={handleEditAppointment}>
                    <MdEdit /> Editar
                  </button>
                  <button className="delete-btn" onClick={handleDeleteAppointment}>
                    <MdDelete /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Patients Section */}
      {mainTab === 'patients' && <PatientManagement />}

      {/* Sessions Section */}
      {mainTab === 'sessions' && <SessionHistory />}

      {/* Notes Section */}
      {mainTab === 'notes' && <QuickNotes />}
    </div>
  )
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || 'Sin registrar'
}

function formatCurrency(value) {
  const amount = Number(value || 0)
  if (!amount) return '$0'
  return amount.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}

function getSlotId(date, time) {
  return `${date}_${String(time || '').replace(':', '')}`
}

function occupiesAgenda(appointment) {
  return !['cancelada', 'reagendada'].includes(appointment.estado)
}
