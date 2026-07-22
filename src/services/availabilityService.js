import { doc, getDoc, Timestamp, writeBatch } from 'firebase/firestore'
import { db } from '../config/firebase'
import {
  formatDateKey,
  getAvailableSlotsForDate,
  getCalendarDates,
  normalizeAvailabilityConfig,
} from '../config/availability'

const SETTINGS_DOCUMENT = 'default'
const MATERIALIZED_DAYS = 400

export const loadAvailabilityConfig = async () => {
  const snapshot = await getDoc(doc(db, 'availability_settings', SETTINGS_DOCUMENT))

  return {
    config: normalizeAvailabilityConfig(snapshot.exists() ? snapshot.data() : {}),
    exists: snapshot.exists(),
    materializedThrough: snapshot.data()?.materializedThrough || '',
  }
}

export const saveAvailabilityConfig = async (config) => {
  const normalized = normalizeAvailabilityConfig(config)
  const dates = getCalendarDates(MATERIALIZED_DAYS)
  const materializedThrough = formatDateKey(dates.at(-1))
  const updatedAt = Timestamp.now()
  const batch = writeBatch(db)

  batch.set(doc(db, 'availability_settings', SETTINGS_DOCUMENT), {
    ...normalized,
    materializedThrough,
    updatedAt,
  })

  dates.forEach((date) => {
    const fecha = formatDateKey(date)
    batch.set(doc(db, 'availability_calendar', fecha), {
      fecha,
      availableTimes: getAvailableSlotsForDate(date, normalized),
      updatedAt,
    })
  })

  await batch.commit()

  return { ...normalized, materializedThrough }
}
