import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), 'VITE_')
  const getEnv = (name) => process.env[name] || fileEnv[name]
  const requiredVariables = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_EMAILJS_PUBLIC_KEY',
    'VITE_EMAILJS_SERVICE_ID',
    'VITE_EMAILJS_CLIENT_TEMPLATE_ID',
    'VITE_EMAILJS_THERAPIST_TEMPLATE_ID',
  ]
  const missingVariables = requiredVariables.filter((name) => !getEnv(name))
  const forbiddenClientVariables = Object.keys({ ...fileEnv, ...process.env })
    .filter((name) => name.startsWith('VITE_'))
    .filter((name) => /(SECRET|PRIVATE_KEY|PASSWORD|TOKEN|CREDENTIAL|SERVICE_ACCOUNT)/i.test(name))

  if (missingVariables.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missingVariables.join(', ')}`)
  }

  if (forbiddenClientVariables.length > 0) {
    throw new Error(
      `Variables privadas no permitidas con prefijo VITE_: ${forbiddenClientVariables.join(', ')}`,
    )
  }

  return {
    base: process.env.GITHUB_ACTIONS === 'true' ? '/psicologa-kimberly-lopez/' : '/',
    build: {
      sourcemap: false,
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
  }
})
