import { initializeApp, getApps } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app
let auth

if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
}

export function getFirebaseAuth() {
  if (!auth && isFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
  }
  return auth
}

/**
 * Initializes invisible reCAPTCHA verifier attached to a DOM container
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  const authInstance = getFirebaseAuth()
  if (!authInstance) {
    throw new Error('Firebase is not configured. Please set your VITE_FIREBASE_* environment variables.')
  }

  // Reuse existing verifier if it's still valid
  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier
  }

  // Clear the container DOM to avoid "already rendered" errors
  const container = document.getElementById(containerId)
  if (container) {
    container.innerHTML = ''
  }

  window.recaptchaVerifier = new RecaptchaVerifier(authInstance, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      // Response expired — clear so next attempt creates a fresh one
      window.recaptchaVerifier = null
    },
  })

  return window.recaptchaVerifier
}

/**
 * Dispatches an SMS verification code to the phone number via Firebase
 */
export async function sendFirebaseOtp(phoneNumber, appVerifier) {
  const authInstance = getFirebaseAuth()
  if (!authInstance) {
    throw new Error('Firebase credentials not configured.')
  }
  return await signInWithPhoneNumber(authInstance, phoneNumber, appVerifier)
}

/**
 * Confirms the OTP code and returns the Firebase ID token and User info
 */
export async function confirmFirebaseOtp(confirmationResult, code) {
  if (!confirmationResult) {
    throw new Error('No pending OTP verification found.')
  }
  const result = await confirmationResult.confirm(code)
  const user = result.user
  const idToken = await user.getIdToken()
  return { user, idToken }
}
