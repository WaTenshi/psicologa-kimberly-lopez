import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { browserSessionPersistence, initializeAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => key !== 'measurementId' && !value)
  .map(([key]) => key)

if (missingConfig.length > 0) {
  throw new Error(`Faltan variables de Firebase: ${missingConfig.join(', ')}`)
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
// Evita dejar una sesión administrativa persistente al cerrar el navegador.
const auth = initializeAuth(app, { persistence: browserSessionPersistence })

export { app, db, auth }
