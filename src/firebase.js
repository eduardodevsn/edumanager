import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Reemplazá estos valores con los de tu proyecto en Firebase Console
// https://console.firebase.google.com → Configuración del proyecto → Tu app web
const firebaseConfig = {
  apiKey:            "AIzaSyB0yc8Np6formSBpGkM31ML-an3vVed49s",
  authDomain:        "edumanager-d2531.firebaseapp.com",
  projectId:         "edumanager-d2531",
  storageBucket:     "edumanager-d2531.firebasestorage.app",
  messagingSenderId: "1002788880578",
  appId:             "1:1002788880578:web:e716e2926647e96df9fb5b",
}

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
