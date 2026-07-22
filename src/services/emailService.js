import emailjs from '@emailjs/browser'

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const CLIENT_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_CLIENT_TEMPLATE_ID
const THERAPIST_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_THERAPIST_TEMPLATE_ID

const hasEmailConfig = () =>
  EMAILJS_PUBLIC_KEY &&
  EMAILJS_SERVICE_ID &&
  CLIENT_TEMPLATE_ID &&
  THERAPIST_TEMPLATE_ID

const escapeEmailText = (value) =>
  String(value ?? '').replace(/[<>&]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
  })[character])

// Correo al cliente confirmando su cita
const sendClientEmail = (bookingData) => {
  const safeName = escapeEmailText(bookingData.nombre)
  const safeLastName = escapeEmailText(bookingData.apellido)
  const safeDate = escapeEmailText(bookingData.fechaFormato)
  const safeTime = escapeEmailText(bookingData.hora)
  const safeService = escapeEmailText(bookingData.servicioLabel || 'No indicado')
  const params = {
    to_email: bookingData.email,
    to_name: `${safeName} ${safeLastName}`,
    subject: 'Confirmación de tu cita - Kimberly López Psicología',
    message: `Hola ${safeName}, tu cita ha sido confirmada para el ${safeDate} a las ${safeTime} hrs. Servicio: ${safeService}. Te esperamos. — Kimberly López`,
  }
  return emailjs.send(EMAILJS_SERVICE_ID, CLIENT_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
}

// Correo a la psicóloga notificando nueva reserva
export const sendTherapistEmail = (bookingData) => {
  const safe = Object.fromEntries(
    Object.entries(bookingData).map(([key, value]) => [key, escapeEmailText(value)]),
  )
  const params = {
    to_email: 'terapiaconkimberlylopez@gmail.com',
    to_name: 'Kimberly López',
    subject: 'Nueva reserva de cita',
    message:
      `Nueva cita agendada:\n\n` +
      `Paciente: ${safe.nombre} ${safe.apellido}\n` +
      `RUT: ${safe.rut}\n` +
      `Edad: ${safe.edad}\n` +
      `Teléfono: ${safe.telefono}\n` +
      `Email: ${safe.email}\n` +
      `Servicio: ${safe.servicioLabel || 'No indicado'}\n` +
      `Valor: ${safe.servicioValor || 'No indicado'}\n` +
      `Fecha: ${safe.fechaFormato}\n` +
      `Hora: ${safe.hora} hrs\n` +
      `Motivo: ${safe.motivo || 'No indicado'}`,
  }
  return emailjs.send(EMAILJS_SERVICE_ID, THERAPIST_TEMPLATE_ID, params, EMAILJS_PUBLIC_KEY)
}

export const sendBookingEmails = async (bookingData) => {
  if (!hasEmailConfig()) {
    console.warn('EmailJS no está configurado. La reserva se guardó sin enviar correos.')
    return { success: false, error: 'Servicio de correo no configurado' }
  }

  try {
    await Promise.all([
      sendClientEmail(bookingData),
      sendTherapistEmail(bookingData),
    ])
    return { success: true }
  } catch (error) {
    console.error('Error al enviar correos:', error)
    return {
      success: false,
      error: error?.text || error?.message || String(error),
    }
  }
}

// Guardar la cita en Firestore
export const saveBookingToFirestore = async (db, bookingData) => {
  try {
    const {
      collection,
      doc,
      runTransaction,
      serverTimestamp,
    } = await import('firebase/firestore')
    const appointmentsRef = collection(db, 'appointments')
    const slotId = `${bookingData.fecha}_${bookingData.hora.replace(':', '')}`
    const appointmentRef = doc(appointmentsRef, slotId)
    const availabilityRef = doc(db, 'availability_blocks', slotId)

    const appointmentData = {
      nombre: bookingData.nombre,
      apellido: bookingData.apellido,
      edad: Number(bookingData.edad),
      rut: bookingData.rut,
      telefono: bookingData.telefono,
      email: bookingData.email,
      servicio: bookingData.servicio,
      servicioLabel: bookingData.servicioLabel,
      servicioValor: bookingData.servicioValor,
      motivo: bookingData.motivo,
      fecha: bookingData.fecha,
      hora: bookingData.hora,
      createdAt: serverTimestamp(),
      estado: 'confirmada',
    }

    await runTransaction(db, async (transaction) => {
      const existingSlot = await transaction.get(availabilityRef)

      if (existingSlot.exists()) {
        throw new Error('Ese horario ya no está disponible. Elige otra hora.')
      }

      transaction.set(appointmentRef, appointmentData)
      transaction.set(availabilityRef, {
        fecha: bookingData.fecha,
        hora: bookingData.hora,
        tipo: 'sesion',
        createdAt: serverTimestamp(),
      })
    })

    return { success: true, id: appointmentRef.id }
  } catch (error) {
    console.error('Error al guardar en Firestore:', error)
    return { success: false, error: error?.message || String(error) }
  }
}
