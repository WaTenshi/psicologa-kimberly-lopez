import { useState, useEffect } from 'react'
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc, query, orderBy } from 'firebase/firestore'
import { MdAdd, MdClose, MdDelete, MdEdit, MdSearch, MdAssignment, MdCalendarToday, MdDescription, MdNotes, MdPayment } from 'react-icons/md'
import { db } from '../config/firebase'

const PATIENT_STATUSES = [
  { label: 'Nuevo', value: 'nuevo', color: '#3b82f6' },
  { label: 'Primera sesión agendada', value: 'primera_sesion_agendada', color: '#14b8a6' },
  { label: 'En seguimiento', value: 'en_seguimiento', color: '#10b981' },
  { label: 'Pausado', value: 'pausado', color: '#f59e0b' },
  { label: 'Inactivo', value: 'inactivo', color: '#6b7280' },
  { label: 'Esperando respuesta', value: 'esperando_respuesta', color: '#f59e0b' },
  { label: 'Alta terapéutica', value: 'alta_terapeutica', color: '#8b5cf6' },
]

const PATIENT_TABS = [
  { id: 'resumen', label: 'Resumen', icon: MdAssignment },
  { id: 'sesiones', label: 'Sesiones', icon: MdDescription },
  { id: 'citas', label: 'Citas', icon: MdCalendarToday },
  { id: 'pagos', label: 'Pagos', icon: MdPayment },
  { id: 'documentos', label: 'Documentos', icon: MdDescription },
  { id: 'notas', label: 'Notas', icon: MdNotes },
]

const INITIAL_PATIENT_FORM = {
  nombre: '',
  rut: '',
  edad: '',
  fecha_nacimiento: '',
  telefono: '',
  correo: '',
  direccion: '',
  contacto_emergencia_nombre: '',
  contacto_emergencia_telefono: '',
  contacto_emergencia_vinculo: '',
  modalidad: 'presencial',
  estado: 'nuevo',
  motivo_general: '',
  antecedentes_relevantes: '',
  objetivos_terapeuticos: '',
  derivacion: '',
  consentimiento_informado: false,
  etiquetas: '',
  observaciones: '',
  proximas_sesiones: '',
}

const FORM_SECTIONS = [
  {
    title: 'Identificación y contacto',
    description: 'Datos básicos para reconocer y contactar a la persona.',
    fields: [
      { name: 'nombre', label: 'Nombre completo *', type: 'text', placeholder: 'Nombre del paciente' },
      { name: 'rut', label: 'RUT', type: 'text', placeholder: '12.345.678-9' },
      { name: 'edad', label: 'Edad *', type: 'number', placeholder: '25' },
      { name: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
      { name: 'telefono', label: 'Teléfono *', type: 'tel', placeholder: '+56 9 ...' },
      { name: 'correo', label: 'Correo *', type: 'email', placeholder: 'correo@ejemplo.com' },
      { name: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Comuna o dirección de referencia', fullWidth: true },
    ],
  },
  {
    title: 'Contacto de emergencia',
    description: 'Información útil ante una urgencia administrativa o clínica.',
    fields: [
      { name: 'contacto_emergencia_nombre', label: 'Nombre contacto', type: 'text', placeholder: 'Nombre y apellido' },
      { name: 'contacto_emergencia_telefono', label: 'Teléfono contacto', type: 'tel', placeholder: '+56 9 ...' },
      { name: 'contacto_emergencia_vinculo', label: 'Vínculo', type: 'text', placeholder: 'Madre, pareja, familiar, etc.' },
    ],
  },
  {
    title: 'Contexto clínico',
    description: 'Motivo, antecedentes y foco inicial del proceso terapéutico.',
    fields: [
      { name: 'modalidad', label: 'Modalidad', type: 'select', options: [
        { value: 'presencial', label: 'Presencial' },
        { value: 'online', label: 'Online' },
        { value: 'hibrida', label: 'Híbrida' },
      ] },
      { name: 'estado', label: 'Estado del proceso', type: 'select', options: PATIENT_STATUSES },
      { name: 'motivo_general', label: 'Motivo general *', type: 'textarea', placeholder: 'Describe el motivo principal de consulta', rows: 3, fullWidth: true },
      { name: 'antecedentes_relevantes', label: 'Antecedentes relevantes', type: 'textarea', placeholder: 'Antecedentes personales, familiares, médicos o contextuales relevantes', rows: 3, fullWidth: true },
      { name: 'objetivos_terapeuticos', label: 'Objetivos terapéuticos', type: 'textarea', placeholder: 'Objetivos acordados o hipótesis inicial de trabajo', rows: 3, fullWidth: true },
      { name: 'derivacion', label: 'Derivación / fuente de contacto', type: 'text', placeholder: 'Particular, médico, colegio, familiar, redes sociales', fullWidth: true },
    ],
  },
  {
    title: 'Gestión y seguimiento',
    description: 'Datos administrativos para ordenar continuidad y prioridades.',
    fields: [
      { name: 'etiquetas', label: 'Etiquetas', type: 'text', placeholder: 'ansiedad, online, prioridad alta' },
      { name: 'proximas_sesiones', label: 'Próximas sesiones', type: 'textarea', placeholder: 'Ej: Lunes 10:00, confirmar disponibilidad', rows: 2 },
      { name: 'observaciones', label: 'Observaciones administrativas', type: 'textarea', placeholder: 'Notas administrativas importantes', rows: 3, fullWidth: true },
    ],
  },
]

const normalizePatientForForm = (patient) =>
  Object.keys(INITIAL_PATIENT_FORM).reduce((acc, key) => {
    acc[key] = patient?.[key] ?? INITIAL_PATIENT_FORM[key]
    return acc
  }, {})

const buildPatientPayload = (formData) =>
  Object.keys(INITIAL_PATIENT_FORM).reduce((acc, key) => {
    acc[key] = formData[key]
    return acc
  }, {})

const formatEmpty = (value) => {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  return value || 'No registrado'
}

const getTags = (tags = '') =>
  tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

export default function PatientManagement() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activePatientTab, setActivePatientTab] = useState('resumen')
  const [sessions, setSessions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState(INITIAL_PATIENT_FORM)

  const loadPatients = async () => {
    try {
      setLoading(true)
      const patientsRef = collection(db, 'patients')
      const q = query(patientsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      const sessionsSnapshot = await getDocs(query(collection(db, 'sessions'), orderBy('fecha', 'desc')))
      const appointmentsSnapshot = await getDocs(query(collection(db, 'appointments'), orderBy('fecha', 'desc')))
      setPatients(data)
      setSessions(sessionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setAppointments(appointmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setError('')
    } catch (err) {
      console.error('Error al cargar pacientes:', err)
      setError('Error al cargar los pacientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadPatients)
  }, [])

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const validateForm = () => {
    if (!formData.nombre.trim()) return 'El nombre es requerido'
    if (!formData.edad) return 'La edad es requerida'
    if (!formData.correo.trim() || !formData.correo.includes('@')) return 'Email válido requerido'
    if (!formData.telefono.trim()) return 'Teléfono requerido'
    if (!formData.motivo_general.trim()) return 'Motivo general es requerido'
    return null
  }

  const resetForm = () => {
    setFormData(INITIAL_PATIENT_FORM)
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const handleSavePatient = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)
      const payload = {
        ...buildPatientPayload(formData),
        updatedAt: new Date(),
      }

      if (editingId) {
        const patientRef = doc(db, 'patients', editingId)
        await updateDoc(patientRef, payload)
      } else {
        await addDoc(collection(db, 'patients'), {
          ...payload,
          createdAt: new Date(),
        })
      }

      resetForm()
      setSelectedPatient(null)
      await loadPatients()
      setError('')
    } catch (err) {
      console.error('Error al guardar paciente:', err)
      setError('Error al guardar el paciente')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPatient = (patient) => {
    setActivePatientTab('resumen')
    setSelectedPatient(patient)
  }

  const handleEditPatient = () => {
    if (selectedPatient) {
      setFormData(normalizePatientForForm(selectedPatient))
      setEditingId(selectedPatient.id)
      setShowForm(true)
      setSelectedPatient(null)
    }
  }

  const handleDeletePatient = async () => {
    if (!selectedPatient) return

    if (window.confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
      try {
        setLoading(true)
        await deleteDoc(doc(db, 'patients', selectedPatient.id))
        await loadPatients()
        setSelectedPatient(null)
        setError('')
      } catch (err) {
        console.error('Error al eliminar paciente:', err)
        setError('Error al eliminar el paciente')
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status) => {
    const statusObj = PATIENT_STATUSES.find((s) => s.value === status)
    return statusObj ? statusObj.color : '#6b7280'
  }

  const getStatusLabel = (status) => {
    const statusObj = PATIENT_STATUSES.find((s) => s.value === status)
    return statusObj ? statusObj.label : status || 'Sin estado'
  }

  const renderField = (field) => {
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

  const filteredPatients = patients.filter((patient) => {
    const searchValue = searchTerm.toLowerCase()
    const searchableText = [
      patient.nombre,
      patient.rut,
      patient.correo,
      patient.telefono,
      patient.modalidad,
      patient.estado,
      patient.motivo_general,
      patient.etiquetas,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(searchValue)
  })

  const getPatientSessions = (patient) =>
    sessions.filter((session) =>
      session.paciente_id === patient.id ||
      normalizeText(session.paciente_nombre) === normalizeText(patient.nombre)
    )

  const getPatientAppointments = (patient) =>
    appointments.filter((appointment) => {
      const appointmentName = `${appointment.nombre || ''} ${appointment.apellido || ''}`.trim()
      return (
        normalizeText(appointment.paciente_id) === normalizeText(patient.id) ||
        normalizeText(appointment.email) === normalizeText(patient.correo) ||
        normalizeText(appointment.correo) === normalizeText(patient.correo) ||
        normalizeText(appointmentName) === normalizeText(patient.nombre)
      )
    })

  const selectedSessions = selectedPatient ? getPatientSessions(selectedPatient) : []
  const selectedAppointments = selectedPatient ? getPatientAppointments(selectedPatient) : []
  const selectedPayments = selectedAppointments.filter((apt) => Number(apt.valor_sesion || 0) > 0)
  const selectedDebt = selectedPayments
    .filter((apt) => !['pagado', 'exento'].includes(apt.pago_estado))
    .reduce((sum, apt) => sum + Number(apt.valor_sesion || 0), 0)

  const pipelineGroups = PATIENT_STATUSES.map((status) => ({
    ...status,
    patients: filteredPatients.filter((patient) => patient.estado === status.value),
  })).filter((group) => group.patients.length > 0 || ['nuevo', 'primera_sesion_agendada', 'en_seguimiento', 'pausado', 'alta_terapeutica', 'inactivo'].includes(group.value))

  return (
    <div className="patient-management">
      <div className="patient-header">
        <div>
          <h2>Fichas clínicas</h2>
          <p>Registro integral de pacientes, contacto, contexto clínico y seguimiento.</p>
        </div>
        <button
          className="new-patient-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><MdClose /> Cerrar ficha</> : <><MdAdd /> Nueva ficha</>}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="patient-form-container clinical-form-container">
          <div className="clinical-form-heading">
            <div>
              <span>{editingId ? 'Edición de ficha' : 'Nueva ficha clínica'}</span>
              <h3>{editingId ? 'Actualizar información del paciente' : 'Registrar paciente'}</h3>
            </div>
            <label className="consent-toggle">
              <input
                type="checkbox"
                name="consentimiento_informado"
                checked={formData.consentimiento_informado}
                onChange={handleFormChange}
              />
              Consentimiento informado registrado
            </label>
          </div>

          {FORM_SECTIONS.map((section) => (
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
            <button className="save-btn" onClick={handleSavePatient} disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar ficha' : 'Crear ficha'}
            </button>
          </div>
        </div>
      )}

      <div className="patient-pipeline">
        <div className="pipeline-header">
          <div>
            <span>Pipeline clínico</span>
            <h3>Estado de pacientes</h3>
          </div>
          <p>{filteredPatients.length} fichas en vista</p>
        </div>
        <div className="pipeline-columns">
          {pipelineGroups.map((group) => (
            <section key={group.value} className="pipeline-column">
              <div className="pipeline-column-title">
                <span style={{ backgroundColor: group.color }} />
                <strong>{group.label}</strong>
                <small>{group.patients.length}</small>
              </div>
              <div className="pipeline-cards">
                {group.patients.length === 0 ? (
                  <p>Sin pacientes</p>
                ) : (
                  group.patients.slice(0, 4).map((patient) => (
                    <button key={patient.id} onClick={() => handleSelectPatient(patient)}>
                      <strong>{patient.nombre}</strong>
                      <small>{patient.modalidad || 'Sin modalidad'} · {patient.telefono || patient.correo || 'Sin contacto'}</small>
                    </button>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="patient-toolbar">
        <div className="patient-search">
          <MdSearch />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, correo, teléfono, motivo o etiqueta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="patient-count">{filteredPatients.length} fichas</span>
      </div>

      <div className="patients-container">
        {loading ? (
          <p className="loading">Cargando pacientes...</p>
        ) : filteredPatients.length === 0 ? (
          <p className="no-patients">No hay pacientes registrados</p>
        ) : (
          <div className="patients-grid">
            {filteredPatients.map((patient) => {
              const tags = getTags(patient.etiquetas)

              return (
                <button
                  key={patient.id}
                  className="patient-card clinical-patient-card"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="patient-card-header">
                    <div>
                      <h4>{patient.nombre}</h4>
                      <p>{patient.rut || 'RUT no registrado'}</p>
                    </div>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(patient.estado) }}
                    >
                      {getStatusLabel(patient.estado)}
                    </span>
                  </div>

                  <div className="patient-card-meta">
                    <span>{patient.edad || '-'} años</span>
                    <span>{patient.modalidad || 'Sin modalidad'}</span>
                    <span>{patient.consentimiento_informado ? 'Consentimiento OK' : 'Consentimiento pendiente'}</span>
                  </div>

                  <div className="patient-card-info">
                    <p><strong>Teléfono:</strong> {formatEmpty(patient.telefono)}</p>
                    <p><strong>Correo:</strong> {formatEmpty(patient.correo)}</p>
                    <p><strong>Motivo:</strong> {formatEmpty(patient.motivo_general)}</p>
                  </div>

                  {tags.length > 0 && (
                    <div className="patient-tags">
                      {tags.slice(0, 4).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content clinical-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedPatient(null)}>
              <MdClose />
            </button>

            <div className="clinical-profile-hero">
              <div>
                <span>Ficha clínica</span>
                <h2>{selectedPatient.nombre}</h2>
                <p>{selectedPatient.rut || 'RUT no registrado'} · {selectedPatient.edad || '-'} años · {selectedPatient.modalidad || 'Sin modalidad'}</p>
              </div>
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(selectedPatient.estado) }}
              >
                {getStatusLabel(selectedPatient.estado)}
              </span>
            </div>

            <div className="clinical-summary-grid">
              <div>
                <label>Consentimiento</label>
                <strong>{selectedPatient.consentimiento_informado ? 'Registrado' : 'Pendiente'}</strong>
              </div>
              <div>
                <label>Teléfono</label>
                <strong>{formatEmpty(selectedPatient.telefono)}</strong>
              </div>
              <div>
                <label>Correo</label>
                <strong>{formatEmpty(selectedPatient.correo)}</strong>
              </div>
            </div>

            <div className="patient-profile-tabs">
              {PATIENT_TABS.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    className={activePatientTab === tab.id ? 'active' : ''}
                    onClick={() => setActivePatientTab(tab.id)}
                  >
                    <Icon /> {tab.label}
                  </button>
                )
              })}
            </div>

            {activePatientTab === 'resumen' && (
            <div className="patient-details clinical-details">
              <div className="detail-section">
                <h3>Identificación y contacto</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nombre</label>
                    <p>{formatEmpty(selectedPatient.nombre)}</p>
                  </div>
                  <div className="detail-item">
                    <label>RUT</label>
                    <p>{formatEmpty(selectedPatient.rut)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Edad</label>
                    <p>{selectedPatient.edad ? `${selectedPatient.edad} años` : 'No registrada'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Fecha nacimiento</label>
                    <p>{formatEmpty(selectedPatient.fecha_nacimiento)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Teléfono</label>
                    <p>{formatEmpty(selectedPatient.telefono)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Correo</label>
                    <p>{formatEmpty(selectedPatient.correo)}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Dirección</label>
                    <p>{formatEmpty(selectedPatient.direccion)}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contacto de emergencia</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nombre</label>
                    <p>{formatEmpty(selectedPatient.contacto_emergencia_nombre)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Teléfono</label>
                    <p>{formatEmpty(selectedPatient.contacto_emergencia_telefono)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Vínculo</label>
                    <p>{formatEmpty(selectedPatient.contacto_emergencia_vinculo)}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contexto clínico</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Modalidad</label>
                    <p>{formatEmpty(selectedPatient.modalidad)}</p>
                  </div>
                  <div className="detail-item">
                    <label>Derivación</label>
                    <p>{formatEmpty(selectedPatient.derivacion)}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Motivo general</label>
                    <p>{formatEmpty(selectedPatient.motivo_general)}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Antecedentes relevantes</label>
                    <p>{formatEmpty(selectedPatient.antecedentes_relevantes)}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Objetivos terapéuticos</label>
                    <p>{formatEmpty(selectedPatient.objetivos_terapeuticos)}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Gestión y seguimiento</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <label>Etiquetas</label>
                    {getTags(selectedPatient.etiquetas).length > 0 ? (
                      <div className="patient-tags detail-tags">
                        {getTags(selectedPatient.etiquetas).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    ) : (
                      <p>No registradas</p>
                    )}
                  </div>
                  <div className="detail-item full-width">
                    <label>Próximas sesiones</label>
                    <p>{formatEmpty(selectedPatient.proximas_sesiones)}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Observaciones administrativas</label>
                    <p>{formatEmpty(selectedPatient.observaciones)}</p>
                  </div>
                </div>
              </div>
            </div>
            )}

            {activePatientTab === 'sesiones' && (
              <PatientTimeline
                items={selectedSessions}
                emptyText="No hay sesiones vinculadas a esta ficha."
                renderItem={(session) => (
                  <>
                    <strong>{session.fecha || 'Sin fecha'} · {session.hora || 'Sin hora'}</strong>
                    <span>{session.motivo_sesion || session.tema || 'Sesión clínica'}</span>
                    <p>{session.evolucion || session.notas || 'Sin evolución registrada'}</p>
                  </>
                )}
              />
            )}

            {activePatientTab === 'citas' && (
              <PatientTimeline
                items={selectedAppointments}
                emptyText="No hay citas vinculadas a esta ficha."
                renderItem={(appointment) => (
                  <>
                    <strong>{appointment.fecha || 'Sin fecha'} · {appointment.hora || 'Sin hora'}</strong>
                    <span>{appointment.estado || 'confirmada'} · {appointment.duracion || 60} min · {appointment.modalidad || 'presencial'}</span>
                    <p>{appointment.motivo || appointment.observaciones_admin || 'Sin motivo registrado'}</p>
                  </>
                )}
              />
            )}

            {activePatientTab === 'pagos' && (
              <div className="patient-tab-panel">
                <div className="payment-summary-strip">
                  <div>
                    <label>Deuda acumulada</label>
                    <strong>{formatCurrency(selectedDebt)}</strong>
                  </div>
                  <div>
                    <label>Registros de pago</label>
                    <strong>{selectedPayments.length}</strong>
                  </div>
                </div>
                <PatientTimeline
                  items={selectedPayments}
                  emptyText="No hay pagos registrados desde citas."
                  renderItem={(payment) => (
                    <>
                      <strong>{formatCurrency(payment.valor_sesion)} · {payment.pago_estado || 'pendiente'}</strong>
                      <span>{payment.fecha || 'Sin fecha'} · {payment.pago_metodo || 'Sin método'}</span>
                      <p>{payment.comprobante || 'Sin comprobante'}</p>
                    </>
                  )}
                />
              </div>
            )}

            {activePatientTab === 'documentos' && (
              <div className="patient-tab-panel empty-tab-panel">
                <MdDescription />
                <h3>Documentos clínicos</h3>
                <p>Espacio reservado para consentimiento informado, certificados, informes y adjuntos. La estructura ya está en la ficha; falta conectar almacenamiento seguro.</p>
              </div>
            )}

            {activePatientTab === 'notas' && (
              <div className="patient-tab-panel notes-tab-panel">
                <div className="detail-item full-width">
                  <label>Observaciones administrativas</label>
                  <p>{formatEmpty(selectedPatient.observaciones)}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Próximas sesiones / acciones</label>
                  <p>{formatEmpty(selectedPatient.proximas_sesiones)}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Etiquetas</label>
                  <p>{getTags(selectedPatient.etiquetas).join(', ') || 'No registradas'}</p>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="edit-btn" onClick={handleEditPatient}>
                <MdEdit /> Editar ficha
              </button>
              <button className="delete-btn" onClick={handleDeletePatient}>
                <MdDelete /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PatientTimeline({ items, emptyText, renderItem }) {
  return (
    <div className="patient-tab-panel patient-timeline-panel">
      {items.length === 0 ? (
        <p className="no-data">{emptyText}</p>
      ) : (
        items.map((item) => (
          <article key={item.id} className="patient-timeline-item">
            {renderItem(item)}
          </article>
        ))
      )}
    </div>
  )
}

function normalizeText(value = '') {
  return String(value).trim().toLowerCase()
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}
