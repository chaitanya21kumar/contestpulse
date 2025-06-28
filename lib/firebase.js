// lib/firebase.js

import { initializeApp }  from "firebase/app";        // core SDK
import { getAuth }        from "firebase/auth";       // Auth client
import { getFirestore }   from "firebase/firestore";  // Firestore client

// ←— your config copied from Firebase console:
const firebaseConfig = {
  apiKey:            "AIzaSyAeAM5KkbDv7kWKr6nqT3JS2k8BkEtVmvw",
  authDomain:        "contest-pulse.firebaseapp.com",
  projectId:         "contest-pulse",
  storageBucket:     "contest-pulse.firebasestorage.app",
  messagingSenderId: "394156920604",
  appId:              "1:394156920604:web:b04b452114a767018df4d9"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export ready-made clients:
export const auth = getAuth(app);      // for sign-up & sign-in
export const db   = getFirestore(app); // for reading/writing user data
