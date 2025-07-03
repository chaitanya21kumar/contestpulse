// lib/firebase.js

import { initializeApp }   from "firebase/app";
import { getAuth }         from "firebase/auth";
import { getFirestore }    from "firebase/firestore";
import { getAnalytics }    from "firebase/analytics"; // optional

// ✅ Config pulls the key from an environment variable.
//    Next.js exposes any var that starts with NEXT_PUBLIC_ to the browser.
const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        "contest-pulse.firebaseapp.com",
  projectId:         "contest-pulse",
  storageBucket:     "contest-pulse.appspot.com",
  messagingSenderId: "394156920604",
  appId:             "1:394156920604:web:b04b452114a767018df4d9",
  measurementId:     "G-6WBZBNNIZG",     // harmless if Analytics disabled
};

// Initialise Firebase only once (prevents “app already initialised” errors)
const app        = initializeApp(firebaseConfig);
const auth       = getAuth(app);
const db         = getFirestore(app);
const analytics  = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, auth, db, analytics };
