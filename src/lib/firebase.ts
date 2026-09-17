import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBU5m3jUjAMqBocfAR_H94wBMYE4xGXl-E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hope3-apps.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hope3-apps",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hope3-apps.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "99307732885",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:99307732885:web:53de1b04995af68a9ec09c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-QNWH40T51R"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Override the default IndexedDB persistence with localStorage to avoid "Database is closing/hidden" locking errors
setPersistence(auth, browserLocalPersistence).catch(console.error);
export const googleProvider = new GoogleAuthProvider();

export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

