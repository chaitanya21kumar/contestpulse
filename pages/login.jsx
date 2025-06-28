// pages/login.jsx

import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";                     // your Firebase client
import { signInWithEmailAndPassword } from "firebase/auth"; // the login fn

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const router                  = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // on success, go home
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <form
        onSubmit={handleSubmit}
        className="bg-secondary p-6 rounded-lg w-full max-w-sm"
      >
        <h2 className="text-white text-2xl mb-4">Log In</h2>

        <input
          type="email"
          placeholder="Email"
          className="input mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-sm mb-3">{error}</p>
        )}

        <button
          type="submit"
          className="btn w-full bg-accent text-white"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
