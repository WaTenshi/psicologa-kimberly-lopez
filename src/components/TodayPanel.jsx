import { useEffect, useMemo, useState } from 'react'
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore'
import { MdArrowForward, MdCalendarToday, MdNotifications, MdPayment, MdPersonSearch, MdNotes } from 'react-icons/md'
import { db } from '../config/firebase'

const todayKey = () => new Date().toISOString().split('T')[0]

const addDaysKey = (days) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export default function TodayPanel({ onNavigate }) {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadToday = async () => {
      try {
        setLoading(true)
        const today = todayKey()
        const nextWeek = addDaysKey(7)

        const appointmentsSnapshot = await getDocs(
          query(
            collection(db, 'appointments'),
            where('fecha', '>=', today),
            where('fecha', '<=', nextWeek),
            orderBy('fecha', 'asc')
          )
        )
        const patientsSnapshot = await getDocs(query(collection(db, 'patients'), orderBy('createdAt', 'desc')))
        const notesSnapshot = await getDocs(
          query(collection(db, 'quick_notes'), orderBy('createdAt', 'desc'), limit(4))
        )

        setAppointments(appointmentsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setPatients(patientsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setNotes(notesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      } catch (err) {
        console.error('Error al cargar panel de hoy:', err)
      } finally {
        setLoading(false)
      }
    }

    loadToday()
  }, [])

  const data = useMemo(() => {
    const today = todayKey()
    const tomorrow = addDaysKey(1)
    const todayAppointments = appointments
      .filter((apt) => apt.fecha === today)
      .sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))

    const remindersDue = appointments
      .filter((apt) => apt.recordatorio_activo !== false && apt.fecha === tomorrow)
      .filter((apt) => ['pendiente', 'confirmada', undefined].includes(apt.estado))
      .slice(0, 5)

    const pendingPayments = appointments
      .filter((apt) => apt.tipo_cita !== 'bloqueo')
      .filter((apt) => Number(apt.valor_sesion || 0) > 0 && !['pagado', 'exento'].includes(apt.pago_estado))
      .slice(0, 5)

    const patientsToContact = patients
      .filter((patient) => ['nuevo', 'esperando_respuesta'].includes(patient.estado))
      .slice(0, 5)

    return { todayAppointments, remindersDue, pendingPayments, patientsToContact }
  }, [appointments, patients])

  if (loading) {
    return <div className="today-panel loading-dashboard">Cargando panel del día...</div>
  }

  return (
    <section className="today-panel">
      <div className="today-panel-header">
        <div>
          <span>Prioridades</span>
          <h2>Panel de hoy</h2>
          <p>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="today-panel-kpis">
          <strong>{data.todayAppointments.length}</strong>
          <span>eventos</span>
        </div>
      </div>

      <div className="today-grid">
        <TodayBlock icon={<MdCalendarToday />} title="Próximas sesiones" onOpen={() => onNavigate?.('appointments')}>
          {data.todayAppointments.length === 0 ? (
            <p className="no-data">No hay sesiones para hoy</p>
          ) : (
            data.todayAppointments.map((apt) => (
              <div key={apt.id} className={`today-row status-${apt.estado || 'confirmada'}`}>
                <strong>{apt.hora}</strong>
                <span>{apt.tipo_cita === 'sesion' ? `${apt.nombre || ''} ${apt.apellido || ''}`.trim() : getTypeLabel(apt.tipo_cita)}</span>
                <small>{apt.duracion || 60} min · {getStatusLabel(apt.estado)}</small>
              </div>
            ))
          )}
        </TodayBlock>

        <TodayBlock icon={<MdNotifications />} title="Recordatorios 24h" onOpen={() => onNavigate?.('appointments')}>
          {data.remindersDue.length === 0 ? (
            <p className="no-data">Sin recordatorios pendientes</p>
          ) : (
            data.remindersDue.map((apt) => (
              <div key={apt.id} className="today-row">
                <strong>{apt.hora}</strong>
                <span>{apt.nombre} {apt.apellido}</span>
                <small>{apt.recordatorio_canal || 'email'} · {apt.email || apt.telefono}</small>
              </div>
            ))
          )}
        </TodayBlock>

        <TodayBlock icon={<MdPayment />} title="Pagos pendientes" onOpen={() => onNavigate?.('appointments')}>
          {data.pendingPayments.length === 0 ? (
            <p className="no-data">No hay pagos pendientes</p>
          ) : (
            data.pendingPayments.map((apt) => (
              <div key={apt.id} className="today-row payment-row">
                <strong>{formatCurrency(apt.valor_sesion)}</strong>
                <span>{apt.nombre} {apt.apellido}</span>
                <small>{apt.fecha} · {getPaymentLabel(apt.pago_estado)}</small>
              </div>
            ))
          )}
        </TodayBlock>

        <TodayBlock icon={<MdPersonSearch />} title="Pacientes por contactar" onOpen={() => onNavigate?.('patients')}>
          {data.patientsToContact.length === 0 ? (
            <p className="no-data">Sin contactos urgentes</p>
          ) : (
            data.patientsToContact.map((patient) => (
              <div key={patient.id} className="today-row">
                <strong>{getPatientStatus(patient.estado)}</strong>
                <span>{patient.nombre}</span>
                <small>{patient.telefono || patient.correo || 'Sin contacto'}</small>
              </div>
            ))
          )}
        </TodayBlock>

        <TodayBlock icon={<MdNotes />} title="Notas rápidas" onOpen={() => onNavigate?.('notes')}>
          {notes.length === 0 ? (
            <p className="no-data">Sin notas recientes</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="today-row note-row">
                <span>{note.contenido}</span>
              </div>
            ))
          )}
        </TodayBlock>
      </div>
    </section>
  )
}

function TodayBlock({ icon, title, children, onOpen }) {
  return (
    <article className="today-block">
      <div className="today-block-heading">
        <h3>{icon} {title}</h3>
        <button onClick={onOpen} aria-label={`Abrir ${title}`}><MdArrowForward /></button>
      </div>
      <div className="today-block-list">{children}</div>
    </article>
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

function getPaymentLabel(status = 'pendiente') {
  const labels = {
    pendiente: 'Pendiente',
    pagado: 'Pagado',
    parcial: 'Pago parcial',
    exento: 'Exento',
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

function getPatientStatus(status = 'nuevo') {
  const labels = {
    nuevo: 'Nuevo',
    esperando_respuesta: 'Contactar',
  }
  return labels[status] || status
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}
