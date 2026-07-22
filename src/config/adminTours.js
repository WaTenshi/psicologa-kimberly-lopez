const popover = (title, description, side = 'bottom', align = 'start') => ({
  title,
  description,
  side,
  align,
})

export const ADMIN_TOURS = {
  dashboard: [
    {
      element: '.dashboard-analytics .admin-page-header',
      popover: popover('Resumen de la consulta', 'Aquí encuentras la fecha y una vista general de la actividad de tu consulta.'),
    },
    {
      element: '.dashboard-analytics .analytics-cards',
      popover: popover('Indicadores principales', 'Revisa rápidamente sesiones, pacientes, ingresos y pagos pendientes.'),
    },
    {
      element: '.dashboard-analytics .today-panel',
      popover: popover('Prioridades del día', 'Este bloque reúne citas, recordatorios, pagos y contactos que necesitan atención.', 'top'),
    },
    {
      element: '.dashboard-analytics .dashboard-grid',
      popover: popover('Seguimiento reciente', 'Consulta próximas citas, pacientes, sesiones y el resumen mensual.', 'top'),
    },
  ],
  appointments: [
    {
      element: '.admin-appointments-module .admin-page-header',
      popover: popover('Agenda clínica', 'Desde aquí puedes revisar, crear y administrar las citas y bloqueos de agenda.'),
    },
    {
      element: '.admin-appointments-module .admin-section-toolbar',
      popover: popover('Controles de la agenda', 'Cambia entre la vista semanal y mensual o crea una nueva cita.'),
    },
    {
      element: '.admin-appointments-module .view-container',
      popover: popover('Calendario', 'Navega por las fechas y selecciona una cita para ver, editar o eliminar sus detalles.', 'top'),
    },
  ],
  availability: [
    {
      element: '.availability-management .availability-header',
      popover: popover('Control de disponibilidad', 'Configura cuándo pueden reservar tus pacientes y revisa si tienes cambios pendientes.'),
    },
    {
      element: '[data-tour="weekly-availability"]',
      popover: popover('Horario semanal', 'Marca las horas habituales disponibles para cada día. En móvil, abre cada día para editarlo.', 'top'),
    },
    {
      element: '[data-tour="availability-rules"]',
      popover: popover('Cambios recurrentes', 'Aplica un bloqueo o una habilitación a varios días y horas de una sola vez.', 'top'),
    },
    {
      element: '#availability-date-editor',
      popover: popover('Excepciones por fecha', 'Cierra un día completo o define horas especiales para una fecha concreta.', 'top'),
    },
  ],
  services: [
    {
      element: '.service-management .admin-page-header',
      popover: popover('Catálogo de servicios', 'Agrega servicios y administra la información que se muestra en la página pública.'),
    },
    {
      element: '.service-management .services-admin-stats',
      popover: popover('Estado del catálogo', 'Consulta cuántos servicios están publicados y cuántas ofertas siguen vigentes.'),
    },
    {
      element: '.service-management .services-admin-list',
      popover: popover('Servicios y precios', 'Edita, publica, oculta o elimina cada servicio. Los cambios se reflejan automáticamente en el sitio.', 'top'),
    },
  ],
  patients: [
    {
      element: '.patient-management .admin-page-header',
      popover: popover('Fichas de pacientes', 'Crea nuevas fichas y abre las existentes para consultar o actualizar su información clínica.'),
    },
    {
      element: '.patient-management .patient-pipeline',
      popover: popover('Estado de los procesos', 'Visualiza cómo se distribuyen tus pacientes según la etapa de su proceso.'),
    },
    {
      element: '.patient-management .patient-toolbar',
      popover: popover('Búsqueda rápida', 'Encuentra una ficha por nombre, RUT, contacto, motivo o etiqueta.', 'top'),
    },
    {
      element: '.patient-management .patients-container',
      popover: popover('Listado de pacientes', 'Selecciona una ficha para revisar detalles, sesiones, pagos y notas.', 'top'),
    },
  ],
  sessions: [
    {
      element: '.clinical-session-history .admin-page-header',
      popover: popover('Registro de sesiones', 'Documenta la evolución clínica y mantén la continuidad de cada proceso terapéutico.'),
    },
    {
      element: '.clinical-session-history .session-toolbar',
      popover: popover('Filtros y búsqueda', 'Filtra por paciente o busca dentro de la evolución, acuerdos y próximas acciones.'),
    },
    {
      element: '.clinical-session-history .sessions-container',
      popover: popover('Historial clínico', 'Abre una sesión para consultar su detalle o usar sus acciones de edición.', 'top'),
    },
  ],
  notes: [
    {
      element: '.quick-notes .admin-page-header',
      popover: popover('Notas rápidas', 'Guarda recordatorios administrativos breves sin mezclarlos con el registro clínico.'),
    },
    {
      element: '.quick-notes .notes-input-container',
      popover: popover('Crear una nota', 'Escribe una tarea o recordatorio y agrégalo a tu lista.'),
    },
    {
      element: '.quick-notes .notes-container',
      popover: popover('Tus recordatorios', 'Aquí aparecen las notas guardadas; puedes eliminarlas cuando ya no sean necesarias.', 'top'),
    },
  ],
}

export const getAdminTour = (panel) => ADMIN_TOURS[panel] || ADMIN_TOURS.dashboard
