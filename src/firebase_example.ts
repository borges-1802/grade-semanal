import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "key",
  authDomain: "key",
  projectId: "key",
  storageBucket: "key",
  messagingSenderId: "key",
  appId: "key",
  measurementId: "key"
};

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

export const ALLOWED_EMAILS: string[] = [
  'emails autorizados por jvborges18',
]