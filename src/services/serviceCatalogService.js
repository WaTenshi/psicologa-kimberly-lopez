import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import {
  formatServicePrice,
  normalizeService,
  sortServices,
} from '../config/services'

const SERVICES_COLLECTION = 'services'
const CATALOG_SETTINGS_PATH = ['service_settings', 'default']

const createStoredService = (service, id) => {
  const normalized = normalizeService({ ...service, id })
  const hasDiscount = normalized.discountEnabled
    && normalized.discountPrice > 0
    && normalized.discountPrice < normalized.price
  const discountEndsAt = hasDiscount && normalized.discountEndsAt
    ? normalized.discountEndsAt
    : Timestamp.fromMillis(0)

  return {
    id,
    title: normalized.title,
    meta: normalized.meta,
    description: normalized.description,
    bookingLabel: normalized.bookingLabel,
    price: normalized.price,
    priceLabel: formatServicePrice(normalized.price),
    icon: normalized.icon,
    order: normalized.order,
    active: normalized.active,
    discountEnabled: hasDiscount,
    discountPrice: hasDiscount ? normalized.discountPrice : 0,
    discountPriceLabel: hasDiscount ? formatServicePrice(normalized.discountPrice) : '$0',
    discountEndsAt,
  }
}

export function subscribeToServiceCatalog(onChange, onError) {
  let catalogInitialized
  let storedServices

  const emit = () => {
    if (catalogInitialized === undefined || storedServices === undefined) return
    onChange(
      sortServices(storedServices.map(normalizeService)),
      { initialized: catalogInitialized },
    )
  }

  const handleError = (error) => {
    console.error('Error al cargar servicios:', error)
    onError?.(error)
  }

  const unsubscribeSettings = onSnapshot(
    doc(db, ...CATALOG_SETTINGS_PATH),
    (snapshot) => {
      catalogInitialized = snapshot.exists() && snapshot.data().initialized === true
      emit()
    },
    handleError,
  )

  const unsubscribeServices = onSnapshot(
    collection(db, SERVICES_COLLECTION),
    (snapshot) => {
      storedServices = snapshot.docs.map((serviceDoc) => normalizeService({
        ...serviceDoc.data(),
        id: serviceDoc.id,
      }))
      emit()
    },
    handleError,
  )

  return () => {
    unsubscribeSettings()
    unsubscribeServices()
  }
}

export async function saveService(service) {
  const isNew = !service.id
  const serviceRef = isNew
    ? doc(collection(db, SERVICES_COLLECTION))
    : doc(db, SERVICES_COLLECTION, service.id)
  const payload = {
    ...createStoredService(service, serviceRef.id),
    updatedAt: serverTimestamp(),
  }

  if (isNew) {
    await setDoc(serviceRef, { ...payload, createdAt: serverTimestamp() })
  } else {
    await updateDoc(serviceRef, payload)
  }

  return serviceRef.id
}

export async function setServiceActive(serviceId, active) {
  await updateDoc(doc(db, SERVICES_COLLECTION, serviceId), {
    active,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteService(serviceId) {
  await deleteDoc(doc(db, SERVICES_COLLECTION, serviceId))
}

export function createDiscountEndTimestamp(dateValue) {
  if (!dateValue) return Timestamp.fromMillis(0)
  const [year, month, day] = dateValue.split('-').map(Number)
  return Timestamp.fromDate(new Date(year, month - 1, day, 23, 59, 59, 999))
}
