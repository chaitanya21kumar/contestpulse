// lib/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics"; // optional

/* ── Firebase config (env vars keep secrets out of the repo) ─────────────── */
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        "contest-pulse.firebaseapp.com",
  projectId:         "contest-pulse",
  storageBucket:     "contest-pulse.appspot.com",
  messagingSenderId: "394156920604",
  appId:             "1:394156920604:web:b04b452114a767018df4d9",
  measurementId:     "G-6WBZBNNIZG",
};

/* ── Initialize once ─────────────────────────────────────────────────────── */
const app  = initializeApp(firebaseConfig);
export const auth  = getAuth(app);
export const db    = getFirestore(app);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

/* ── Google-sign-in helpers (NEW) ─────────────────────────────────────────── */
export const googleProvider     = new GoogleAuthProvider();
export const signInWithGoogle   = () => signInWithPopup(auth, googleProvider);
