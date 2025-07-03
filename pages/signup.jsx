// pages/signup.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FcGoogle } from "react-icons/fc";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";

import { auth, signInWithGoogle } from "../lib/firebase";

export default function SignUp() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const router                  = useRouter();

  /* Redirect away if already logged in */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => u && router.replace("/"));
    return unsub;
  }, [router]);

  /* ── e-mail / password create ────────────────────────────── */
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: email.split("@")[0] });
      router.replace("/");
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── Google popup ────────────────────────────────────────── */
  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
      router.replace("/");
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── UI ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <form
        onSubmit={handleEmailSignup}
        className="bg-secondary p-6 rounded-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-white text-2xl">Sign Up</h2>

        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" className="btn w-full bg-accent text-white">
          Create Account
        </button>

        {/* divider */}
        <div className="flex items-center gap-2">
          <span className="flex-grow h-px bg-white/20" />
          <span className="text-xs text-white/60">or</span>
          <span className="flex-grow h-px bg-white/20" />
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3
                     border border-white/30 py-3 rounded hover:bg-white/10"
        >
          <FcGoogle className="text-xl" />
          Continue with Google
        </button>
      </form>
    </div>
  );
}
