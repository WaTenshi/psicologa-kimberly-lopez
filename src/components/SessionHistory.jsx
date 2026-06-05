import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore'
import { MdAdd, MdClose, MdDelete, MdEdit, MdSearch } from 'react-icons/md'
import { db } from '../config/firebase'

const SESSION_STATUSES = [
  { value: 'realizada', label: 'Realizada', color: '#10b981' },
  { value: 'pendiente', label: 'Pendiente', color: '#3b82f6' },
  { value: 'cancelada', label: 'Cancelada', color: '#ef4444' },
  { value: 'no_asiste', label: 'No asistió', color: '#f59e0b' },
]

const INITIAL_SESSION_FORM = {
  paciente_id: '',
  paciente_nombre: '',
  paciente_estado: '',
  modalidad: '',
  fecha: '',
  hora: '',
  estado_sesion: 'realizada',
  motivo_sesion: '',
  objetivos_trabajados: '',
  evolucion: '',
  acuerdos: '',
  tareas: '',
  proximas_acciones: '',
  proxima_sesion: '',
  observaciones_clinicas: '',
}

const SESSION_FORM_SECTIONS = [
  {
    title: 'Datos de la sesión',
    description: 'Vincula el registro a una ficha clínica y define fecha, hora y estado.',
    fields: [
      { name: 'paciente_id', label: 'Paciente *', type: 'patient' },
      { name: 'fecha', label: 'Fecha *', type: 'date' },
      { name: 'hora', label: 'Hora', type: 'time' },
      { name: 'estado_sesion', label: 'Estado de sesión', type: 'select', options: SESSION_STATUSES },
      { name: 'modalidad', label: 'Modalidad', type: 'select', options: [
        { value: '', label: 'Usar modalidad de ficha' },
        { value: 'presencial', label: 'Presencial' },
        { value: 'online', label: 'Online' },
        { value: 'hibrida', label: 'Híbrida' },
      ] },
    ],
  },
  {
    title: 'Trabajo clínico',
    description: 'Registra el foco de la sesión, evolución observada y objetivos trabajados.',
    fields: [
      { name: 'motivo_sesion', label: 'Foco / tema principal *', type: 'textarea', rows: 2, placeholder: 'Ej: Seguimiento de ansiedad laboral, autoestima, duelo, regulación emocional', fullWidth: true },
      { name: 'objetivos_trabajados', label: 'Objetivos trabajados', type: 'textarea', rows: 3, placeholder: 'Objetivos terapéuticos abordados durante la sesión', fullWidth: true },
      { name: 'evolucion', label: 'Evolución clínica', type: 'textarea', rows: 4, placeholder: 'Cambios observados, avances, dificultades, adherencia, estado emocional reportado', fullWidth: true },
      { name: 'observaciones_clinicas', label: 'Observaciones clínicas', type: 'textarea', rows: 3, placeholder: 'Notas clínicas relevantes para continuidad del proceso', fullWidth: true },
    ],
  },
  {
    title: 'Continuidad terapéutica',
    description: 'Deja claro qué se acordó y qué hacer antes o después de la próxima sesión.',
    fields: [
      { name: 'acuerdos', label: 'Acuerdos de sesión', type: 'textarea', rows: 3, placeholder: 'Acuerdos, decisiones o estrategias definidas en conjunto', fullWidth: true },
      { name: 'tareas', label: 'Tareas entre sesiones', type: 'textarea', rows: 3, placeholder: 'Ejercicios, registros, lecturas o acciones para realizar entre sesiones', fullWidth: true },
      { name: 'proximas_acciones', label: 'Próximas acciones', type: 'textarea', rows: 3, placeholder: 'Qué revisar, reforzar o preparar para la siguiente sesión', fullWidth: true },
      { name: 'proxima_sesion', label: 'Próxima sesión sugerida', type: 'text', placeholder: 'Ej: Confirmar lunes 10:00 / revisar disponibilidad', fullWidth: true },
    ],
  },
]

const normalizeSessionForForm = (session) => ({
  ...INITIAL_SESSION_FORM,
  ...session,
  motivo_sesion: session?.motivo_sesion || session?.tema || '',
  evolucion: session?.evolucion || session?.notas || '',
})

const getSessionTitle = (session) => session.motivo_sesion || session.tema || 'Sesión clínica'
const getSessionEvolution = (session) => session.evolucion || session.notas || ''

const formatEmpty = (value) => value || 'No registrado'

export default function SessionHistory() {
  const [sessions, setSessions] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [filterPatient, setFilterPatient] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSessionId, setExpandedSessionId] = useState(null)
  const [formData, setFormData] = useState(INITIAL_SESSION_FORM)

  const loadData = async () => {
    try {
      setLoading(true)

      const sessionsRef = collection(db, 'sessions')
      const qSessions = query(sessionsRef, orderBy('fecha', 'desc'))
      const snapshotSessions = await getDocs(qSessions)
      const sessionData = snapshotSessions.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setSessions(sessionData)

      const patientsRef = collection(db, 'patients')
      const qPatients = query(patientsRef, orderBy('nombre', 'asc'))
      const snapshotPatients = await getDocs(qPatients)
      const patientData = snapshotPatients.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPatients(patientData)

      setError('')
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadData)
  }, [])

  const handleFormChange = (e) => {
    const { name, value } = e.target

    if (name === 'paciente_id') {
      const selectedPatient = patients.find((patient) => patient.id === value)
      setFormData((prev) => ({
        ...prev,
        paciente_id: value,
        paciente_nombre: selectedPatient?.nombre || '',
        paciente_estado: selectedPatient?.estado || '',
        modalidad: prev.modalidad || selectedPatient?.modalidad || '',
      }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.paciente_id) return 'Selecciona un paciente'
    if (!formData.fecha) return 'La fecha es requerida'
    if (!formData.motivo_sesion.trim()) return 'El foco o tema principal es requerido'
    return null
  }

  const resetForm = () => {
    setFormData(INITIAL_SESSION_FORM)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const handleSaveSession = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...formData,
        tema: formData.motivo_sesion,
        notas: formData.evolucion,
        updatedAt: new Date(),
      }

      if (editingId) {
        const sessionRef = doc(db, 'sessions', editingId)
        await updateDoc(sessionRef, payload)
      } else {
        await addDoc(collection(db, 'sessions'), {
          ...payload,
          createdAt: new Date(),
        })
      }

      resetForm()
      await loadData()
      setError('')
    } catch (err) {
      console.error('Error al guardar sesión:', err)
      setError('Error al guardar la sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSession = (session) => {
    setFormData(normalizeSessionForForm(session))
    setEditingId(session.id)
    setShowForm(true)
    setExpandedSessionId(null)
  }

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta sesión?')) {
      try {
        setLoading(true)
        await deleteDoc(doc(db, 'sessions', sessionId))
        await loadData()
        setError('')
      } catch (err) {
        console.error('Error al eliminar sesión:', err)
        setError('Error al eliminar la sesión')
      } finally {
        setLoading(false)
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getStatusConfig = (status) =>
    SESSION_STATUSES.find((item) => item.value === status) || SESSION_STATUSES[0]

  const renderField = (field) => {
    if (field.type === 'patient') {
      return (
        <select name="paciente_id" value={formData.paciente_id} onChange={handleFormChange}>
          <option value="">Seleccionar paciente</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.nombre} {patient.rut ? `· ${patient.rut}` : ''}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'select') {
      return (
        <select name={field.name} value={formData[field.name]} onChange={handleFormChange}>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          name={field.name}
          value={formData[field.name]}
          onChange={handleFormChange}
          placeholder={field.placeholder}
          rows={field.rows || 2}
        />
      )
    }

    return (
      <input
        type={field.type}
        name={field.name}
        value={formData[field.name]}
        onChange={handleFormChange}
        placeholder={field.placeholder}
      />
    )
  }

  const selectedFilterPatient = patients.find((patient) => patient.id === filterPatient)
  const filteredSessions = sessions.filter((session) => {
    if (filterPatient && session.paciente_id !== filterPatient) return false

    const searchValue = searchTerm.toLowerCase()
    const searchableText = [
      session.paciente_nombre,
      session.fecha,
      session.hora,
      session.estado_sesion,
      session.motivo_sesion,
      session.tema,
      session.objetivos_trabajados,
      session.evolucion,
      session.notas,
      session.acuerdos,
      session.tareas,
      session.proximas_acciones,
      session.proxima_sesion,
      session.observaciones_clinicas,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(searchValue)
  })

  const sessionsByPatient = filterPatient
    ? filteredSessions
    : filteredSessions.sort((a, b) => (a.paciente_nombre || '').localeCompare(b.paciente_nombre || ''))

  return (
    <div className="session-history clinical-session-history">
      <div className="session-header">
        <div>
          <h2>Historial clínico</h2>
          <p>Sesiones vinculadas a cada ficha, evolución, acuerdos y próximas acciones.</p>
        </div>
        <button
          className="new-session-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><MdClose /> Cerrar registro</> : <><MdAdd /> Nueva sesión clínica</>}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="session-form-container clinical-form-container session-clinical-form">
          <div className="clinical-form-heading">
            <div>
              <span>{editingId ? 'Edición de sesión' : 'Nuevo registro clínico'}</span>
              <h3>{editingId ? 'Actualizar sesión clínica' : 'Registrar sesión clínica'}</h3>
            </div>
            {formData.paciente_nombre && (
              <div className="session-linked-patient">
                <span>Ficha vinculada</span>
                <strong>{formData.paciente_nombre}</strong>
              </div>
            )}
          </div>

          {SESSION_FORM_SECTIONS.map((section) => (
            <section key={section.title} className="clinical-form-section">
              <div className="clinical-section-copy">
                <h4>{section.title}</h4>
                <p>{section.description}</p>
              </div>
              <div className="form-grid clinical-form-grid">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className={`form-group ${field.fullWidth ? 'full-width' : ''}`}
                  >
                    <label>{field.label}</label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="form-actions sticky-form-actions">
            <button className="cancel-btn" onClick={resetForm} disabled={loading}>
              Cancelar
            </button>
            <button className="save-btn" onClick={handleSaveSession} disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar sesión' : 'Guardar sesión'}
            </button>
          </div>
        </div>
      )}

      <div className="session-toolbar">
        <div className="session-filters">
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
          >
            <option value="">Todos los pacientes</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="session-search">
          <MdSearch />
          <input
            type="text"
            placeholder="Buscar por evolución, acuerdos, tareas o próxima acción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <span className="session-count">{filteredSessions.length} sesiones</span>
      </div>

      {selectedFilterPatient && (
        <div className="session-patient-summary">
          <div>
            <span>Ficha seleccionada</span>
            <strong>{selectedFilterPatient.nombre}</strong>
            <p>{selectedFilterPatient.motivo_general || 'Motivo general no registrado'}</p>
          </div>
          <div>
            <span>Objetivos terapéuticos</span>
            <p>{selectedFilterPatient.objetivos_terapeuticos || 'No registrados'}</p>
          </div>
        </div>
      )}

      <div className="sessions-container clinical-sessions-container">
        {loading ? (
          <p className="loading">Cargando sesiones...</p>
        ) : sessionsByPatient.length === 0 ? (
          <p className="no-sessions">No hay sesiones registradas</p>
        ) : (
          <div className="sessions-timeline">
            {sessionsByPatient.map((session) => {
              const status = getStatusConfig(session.estado_sesion)
              const isExpanded = expandedSessionId === session.id

              return (
                <article key={session.id} className="clinical-session-card">
                  <div className="session-timeline-marker"></div>
                  <div className="session-card-main">
                    <button
                      className="session-card-header"
                      onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                    >
                      <div>
                        <span className="session-date">{formatDate(session.fecha)} {session.hora ? `· ${session.hora}` : ''}</span>
                        <h3>{getSessionTitle(session)}</h3>
                        <p>{session.paciente_nombre || 'Paciente no vinculado'} · {session.modalidad || 'Sin modalidad'}</p>
                      </div>
                      <span
                        className="session-status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.label}
                      </span>
                    </button>

                    <div className="session-card-preview">
                      <div>
                        <label>Evolución</label>
                        <p>{getSessionEvolution(session) || 'Sin evolución registrada'}</p>
                      </div>
                      <div>
                        <label>Próximas acciones</label>
                        <p>{session.proximas_acciones || session.proxima_sesion || 'Sin próximas acciones registradas'}</p>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="session-expanded-detail">
                        <div>
                          <label>Objetivos trabajados</label>
                          <p>{formatEmpty(session.objetivos_trabajados)}</p>
                        </div>
                        <div>
                          <label>Acuerdos</label>
                          <p>{formatEmpty(session.acuerdos)}</p>
                        </div>
                        <div>
                          <label>Tareas entre sesiones</label>
                          <p>{formatEmpty(session.tareas)}</p>
                        </div>
                        <div>
                          <label>Próxima sesión sugerida</label>
                          <p>{formatEmpty(session.proxima_sesion)}</p>
                        </div>
                        <div className="full-width">
                          <label>Observaciones clínicas</label>
                          <p>{formatEmpty(session.observaciones_clinicas)}</p>
                        </div>
                      </div>
                    )}

                    <div className="session-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEditSession(session)}
                        title="Editar"
                      >
                        <MdEdit /> Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteSession(session.id)}
                        title="Eliminar"
                      >
                        <MdDelete /> Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
