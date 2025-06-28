// pages/signup.jsx

import { useState } from "react";
import { useRouter } from "next/router";
import { auth } from "../lib/firebase";               // your Firebase client
import {
  createUserWithEmailAndPassword, // creates the user
  updateProfile                  // lets us set displayName
} from "firebase/auth";

export default function SignUp() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const router                  = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // 1️⃣ create the user
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2️⃣ set their displayName to the “local part” of their email
      const name = email.split("@")[0];
      await updateProfile(cred.user, { displayName: name });

      router.push("/"); // on success, send them home
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
        <h2 className="text-white text-2xl mb-4">Sign Up</h2>

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
          Create Account
        </button>
      </form>
    </div>
  );
}
