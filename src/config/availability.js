export const BOOKING_TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
]

export const WEEK_DAYS = [
  { id: '1', short: 'Lun', label: 'Lunes' },
  { id: '2', short: 'Mar', label: 'Martes' },
  { id: '3', short: 'Mié', label: 'Miércoles' },
  { id: '4', short: 'Jue', label: 'Jueves' },
  { id: '5', short: 'Vie', label: 'Viernes' },
  { id: '6', short: 'Sáb', label: 'Sábado' },
  { id: '0', short: 'Dom', label: 'Domingo' },
]

const DEFAULT_WEEKLY_SCHEDULE = {
  0: [],
  1: ['18:00', '19:00', '20:00', '21:00'],
  2: ['18:00', '19:00', '20:00', '21:00'],
  3: ['18:00', '19:00', '20:00', '21:00'],
  4: ['18:00', '19:00', '20:00', '21:00'],
  5: ['18:00', '19:00', '20:00', '21:00'],
  6: ['09:00', '10:00', '11:00', '12:00', '13:00'],
}

export const sortTimeSlots = (slots = []) =>
  BOOKING_TIME_SLOTS.filter((time) => slots.includes(time))

export const createDefaultAvailabilityConfig = () => ({
  schemaVersion: 1,
  weeklySchedule: Object.fromEntries(
    Object.entries(DEFAULT_WEEKLY_SCHEDULE).map(([day, slots]) => [day, [...slots]]),
  ),
  dateOverrides: {},
})

export const normalizeAvailabilityConfig = (data = {}) => {
  const defaults = createDefaultAvailabilityConfig()
  const weeklySchedule = {}

  for (let day = 0; day <= 6; day += 1) {
    const configuredSlots = data.weeklySchedule?.[String(day)]
    weeklySchedule[String(day)] = Array.isArray(configuredSlots)
      ? sortTimeSlots(configuredSlots)
      : defaults.weeklySchedule[String(day)]
  }

  const dateOverrides = {}
  Object.entries(data.dateOverrides || {}).forEach(([date, override]) => {
    if (!/^20\d{2}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(date)) return

    const slots = Array.isArray(override) ? override : override?.slots
    if (!Array.isArray(slots)) return

    dateOverrides[date] = { slots: sortTimeSlots(slots) }
  })

  return {
    schemaVersion: 1,
    weeklySchedule,
    dateOverrides,
  }
}

export const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const parseDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export const getWeeklySlotsForDate = (date, config) =>
  sortTimeSlots(config.weeklySchedule?.[String(date.getDay())] || [])

export const getAvailableSlotsForDate = (date, config) => {
  if (!date) return []

  const dateKey = formatDateKey(date)
  const override = config.dateOverrides?.[dateKey]
  if (override) return sortTimeSlots(override.slots || [])

  return getWeeklySlotsForDate(date, config)
}

export const getCalendarDates = (numberOfDays, startDate = new Date()) => {
  const dates = []
  const start = new Date(startDate)
  start.setHours(12, 0, 0, 0)

  for (let offset = 0; offset < numberOfDays; offset += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + offset)
    dates.push(date)
  }

  return dates
}
