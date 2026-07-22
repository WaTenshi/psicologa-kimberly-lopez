import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { MdBarChart, MdGroup, MdCalendarToday, MdDocumentScanner, MdPayment } from 'react-icons/md'
import { db } from '../config/firebase'
import TodayPanel from './TodayPanel'
import { EmptyState, PageHeader, StatCard } from './AdminUI'

export default function DashboardAnalytics({ onNavigate }) {
  const [upcomingAppointments, setUpcomingAppointments] = useState([])
  const [recentPatients, setRecentPatients] = useState([])
  const [recentSessions, setRecentSessions] = useState([])
  const [analytics, setAnalytics] = useState({
    sessionsThisMonth: 0,
    activePatients: 0,
    newPatients: 0,
    onlineSessions: 0,
    presentialSessions: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    cancellationsThisMonth: 0,
    attendanceThisMonth: 0,
    patientsWithoutNextAppointment: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Cargar próximas citas
        const appointmentsRef = collection(db, 'appointments')
        const today = new Date().toISOString().split('T')[0]
        const qAppointments = query(
          appointmentsRef,
          where('fecha', '>=', today),
          orderBy('fecha', 'asc'),
          limit(5)
        )
        const snapshotAppointments = await getDocs(qAppointments)
        setUpcomingAppointments(
          snapshotAppointments.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        )

        // Cargar últimos pacientes modificados
        const patientsRef = collection(db, 'patients')
        const qPatients = query(patientsRef, orderBy('createdAt', 'desc'), limit(5))
        const snapshotPatients = await getDocs(qPatients)
        const patientsList = snapshotPatients.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentPatients(patientsList)

        // Cargar últimas sesiones
        const sessionsRef = collection(db, 'sessions')
        const qSessions = query(sessionsRef, orderBy('createdAt', 'desc'), limit(5))
        const snapshotSessions = await getDocs(qSessions)
        const sessionsList = snapshotSessions.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setRecentSessions(sessionsList)

        // Calcular analytics
        const allSessions = await getDocs(sessionsRef)
        const allPatients = await getDocs(patientsRef)
        const allAppointments = await getDocs(appointmentsRef)

        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()

        const sessionsThisMonth = allSessions.docs.filter((doc) => {
          const date = doc.data().fecha ? new Date(doc.data().fecha) : null
          return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear
        }).length

        const appointmentsThisMonth = allAppointments.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((apt) => {
            const date = apt.fecha ? new Date(apt.fecha) : null
            return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear
          })

        const monthlyRevenue = appointmentsThisMonth
          .filter((apt) => apt.pago_estado === 'pagado')
          .reduce((sum, apt) => sum + Number(apt.valor_sesion || 0), 0)

        const pendingPayments = allAppointments.docs
          .map((doc) => doc.data())
          .filter((apt) => Number(apt.valor_sesion || 0) > 0 && !['pagado', 'exento'].includes(apt.pago_estado))
          .reduce((sum, apt) => sum + Number(apt.valor_sesion || 0), 0)

        const cancellationsThisMonth = appointmentsThisMonth.filter((apt) =>
          ['cancelada', 'no_asistio'].includes(apt.estado)
        ).length

        const attendanceThisMonth = appointmentsThisMonth.filter((apt) => apt.estado === 'realizada').length

        const upcomingPatientNames = new Set(
          allAppointments.docs
            .map((doc) => doc.data())
            .filter((apt) => apt.fecha >= today && ['pendiente', 'confirmada', undefined].includes(apt.estado))
            .map((apt) => `${apt.nombre || ''} ${apt.apellido || ''}`.trim().toLowerCase())
            .filter(Boolean)
        )

        const activePatients = allPatients.docs.filter(
          (doc) => doc.data().estado === 'en_seguimiento'
        ).length

        const newPatients = allPatients.docs.filter(
          (doc) => doc.data().estado === 'nuevo'
        ).length

        const patientsWithoutNextAppointment = allPatients.docs.filter((doc) => {
          const patient = doc.data()
          return patient.estado === 'en_seguimiento' && !upcomingPatientNames.has((patient.nombre || '').trim().toLowerCase())
        }).length

        // Contar sesiones por modalidad (basado en pacientes)
        let onlineSessions = 0
        let presentialSessions = 0

        sessionsList.forEach((session) => {
          const patientId = session.paciente_id
          const patient = patientsList.find((p) => p.id === patientId)
          if (patient) {
            if (patient.modalidad === 'online') {
              onlineSessions++
            } else if (patient.modalidad === 'presencial') {
              presentialSessions++
            }
          }
        })

        setAnalytics({
          sessionsThisMonth,
          activePatients,
          newPatients,
          onlineSessions,
          presentialSessions,
          monthlyRevenue,
          pendingPayments,
          cancellationsThisMonth,
          attendanceThisMonth,
          patientsWithoutNextAppointment,
        })

        setError('')
      } catch (err) {
        console.error('Error al cargar dashboard:', err)
        setError('Error al cargar los datos del dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }

  const formatDateFull = (dateObj) => {
    if (!dateObj) return ''
    const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj)
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="dashboard-analytics">
        <div className="loading-dashboard">Cargando dashboard...</div>
      </div>
    )
  }

  const totalSessions = analytics.onlineSessions + analytics.presentialSessions
  const onlinePercent = totalSessions > 0 ? (analytics.onlineSessions / totalSessions) * 100 : 0
  const presentialPercent =
    totalSessions > 0 ? (analytics.presentialSessions / totalSessions) * 100 : 0

  return (
    <div className="dashboard-analytics">
      <PageHeader
        eyebrow="Resumen operativo"
        title="Tu consulta, de un vistazo"
        description={new Date().toLocaleDateString('es-CL', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      />
      {error && <div className="error-banner">{error}</div>}

      {/* Analytics Cards */}
      <div className="analytics-cards">
        <StatCard icon={<MdBarChart />} value={analytics.sessionsThisMonth} label="Sesiones este mes" tone="brown" />
        <StatCard icon={<MdGroup />} value={analytics.activePatients} label="Pacientes activos" tone="blue" />
        <StatCard icon={<MdPayment />} value={formatCurrency(analytics.monthlyRevenue)} label="Ingresos pagados" tone="green" />
        <StatCard icon={<MdPayment />} value={formatCurrency(analytics.pendingPayments)} label="Pagos pendientes" tone="amber" />
      </div>

      <TodayPanel onNavigate={onNavigate} />

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Upcoming Appointments */}
        <div className="dashboard-block">
          <h3><MdCalendarToday /> Próximas Citas</h3>
          <div className="block-content">
            {upcomingAppointments.length === 0 ? (
              <EmptyState title="No hay citas próximas" description="Cuando se agende una cita aparecerá aquí." />
            ) : (
              <div className="appointments-list">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="appointment-item">
                    <div className="appointment-date">
                      <span className="date-badge">{formatDate(apt.fecha)}</span>
                      <span className="time-badge">{apt.hora}</span>
                    </div>
                    <div className="appointment-info">
                      <p className="patient-name">{apt.nombre} {apt.apellido}</p>
                      <p className="appointment-motivo">{(apt.motivo || 'Sin motivo registrado').substring(0, 50)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="dashboard-block">
          <h3><MdGroup /> Últimos Pacientes</h3>
          <div className="block-content">
            {recentPatients.length === 0 ? (
              <EmptyState title="Aún no hay pacientes" description="Las fichas nuevas aparecerán en este bloque." />
            ) : (
              <div className="patients-list">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="patient-item">
                    <div className="patient-header">
                      <p className="patient-name">{patient.nombre}</p>
                      <span
                        className="patient-status-mini"
                        style={{
                          backgroundColor: getStatusColor(patient.estado),
                        }}
                      >
                        {getStatusLabel(patient.estado)}
                      </span>
                    </div>
                    <p className="patient-info">
                      {patient.edad} años • {patient.modalidad}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="dashboard-block">
          <h3><MdDocumentScanner /> Últimas Sesiones</h3>
          <div className="block-content">
            {recentSessions.length === 0 ? (
              <EmptyState title="Sin sesiones registradas" description="Registra una sesión clínica para comenzar el historial." />
            ) : (
              <div className="sessions-list">
                {recentSessions.map((session) => (
                  <div key={session.id} className="session-item-mini">
                    <p className="session-date">{formatDateFull(session.createdAt)}</p>
                    <p className="session-patient">{session.paciente_nombre}</p>
                    <p className="session-topic">
                      {(session.motivo_sesion || session.tema || 'Sesión clínica').substring(0, 50)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-block monthly-summary-block">
          <h3><MdBarChart /> Resumen mensual</h3>
          <div className="monthly-summary-grid">
            <SummaryItem label="Pacientes nuevos" value={analytics.newPatients} />
            <SummaryItem label="Canceladas / no asistió" value={analytics.cancellationsThisMonth} />
            <SummaryItem label="Sin próxima hora" value={analytics.patientsWithoutNextAppointment} />
            <SummaryItem label="Sesiones realizadas" value={analytics.attendanceThisMonth} />
            <SummaryItem label="Online" value={`${analytics.onlineSessions} · ${Math.round(onlinePercent)}%`} />
            <SummaryItem label="Presencial" value={`${analytics.presentialSessions} · ${Math.round(presentialPercent)}%`} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getStatusColor(status) {
  const colors = {
    nuevo: '#3b82f6',
    en_seguimiento: '#10b981',
    inactivo: '#6b7280',
    esperando_respuesta: '#f59e0b',
    alta_terapeutica: '#8b5cf6',
  }
  return colors[status] || '#6b7280'
}

function getStatusLabel(status) {
  const labels = {
    nuevo: 'Nuevo',
    en_seguimiento: 'En seguimiento',
    inactivo: 'Inactivo',
    esperando_respuesta: 'Esperando',
    alta_terapeutica: 'Alta',
  }
  return labels[status] || status
}

function SummaryItem({ label, value }) {
  return (
    <div className="monthly-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  })
}
