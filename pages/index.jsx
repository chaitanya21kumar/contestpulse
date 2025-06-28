// pages/index.jsx

import { motion }    from "framer-motion";
import { useRouter } from "next/router";
import { useState, useEffect }        from "react";             // ← for auth state
import { auth }                       from "../lib/firebase";   // ← your Firebase client
import { onAuthStateChanged }         from "firebase/auth";     // ← to watch sign-in
import ContestList                    from "../components/ContestList";
import { fadeIn }                     from "../variants";

export default function Home() {
  const { query } = useRouter();
  const platform  = query.platform?.toString().toLowerCase();

  // ─── track signed-in user’s name ────────────────────────────────────
  const [name, setName] = useState("");
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        // use displayName if set, else fall back to email local-part
        setName(u.displayName || u.email.split("@")[0]);
      } else {
        setName("");
      }
    });
    return unsub;
  }, []);
  // ───────────────────────────────────────────────────────────────────

  /* ─── HERO (no ?platform) ─────────────────────────── */
  if (!platform) {
    return (
      <div className="min-h-screen pb-24">
        <section
          className="
            relative flex flex-col justify-center items-center
            text-center xl:text-left
            h-screen w-full overflow-hidden
          "
        >
          {/* Emerald radial glow */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_#14b869_0%,_transparent_70%)]" />
          {/* Subtle vignette */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/0 via-black/20 to-black/50 mix-blend-overlay" />

          <div className="relative z-10 container mx-auto px-4 xl:px-0">
            {/* ←─ NEW GREETING */}
            {name && (
              <motion.h3
                variants={fadeIn("down", 0.1)}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="text-lg text-white/80 mb-4"
              >
                Hello, {name}!
              </motion.h3>
            )}

            <motion.h1
              variants={fadeIn("down", 0.2)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="h1"
            >
              Track Coding Contests <br />
              <span className="text-accent">Across All Platforms</span>
            </motion.h1>

            <motion.p
              variants={fadeIn("down", 0.3)}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="max-w-sm xl:max-w-xl mx-auto xl:mx-0 mt-6"
            >
              Discover, filter and get notified about upcoming contests on&nbsp;
              Codeforces, CodeChef, LeetCode and more — stay ahead in your
              competitive-programming journey.
            </motion.p>
          </div>
        </section>
      </div>
    );
  }

  /* ─── PLATFORM / “ALL” View ───────────────────────── */
  const title =
    platform === "all"
      ? "All Contests"
      : `${platform[0].toUpperCase() + platform.slice(1)} Contests`;

  return (
    <div className="min-h-screen pb-24 pt-24 bg-primary">
      <section className="relative z-10 container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-white">{title}</h2>
        {/* cap at 12 cards on “All” */}
        <ContestList limit={platform === "all" ? 12 : undefined} />
      </section>
    </div>
  );
}
