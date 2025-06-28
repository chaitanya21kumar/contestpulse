// pages/index.jsx
import { motion }    from "framer-motion";
import { useRouter } from "next/router";

import ContestList from "../components/ContestList";
import { fadeIn }   from "../variants";

export default function Home() {
  const { query } = useRouter();
  const platform  = query.platform?.toString().toLowerCase();

  /* ───────────────────── HERO (landing, no ?platform) ─────────────────── */
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
          {/* 🔵 Green radial glow + subtle vignette — landing ONLY */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_#14b869_0%,_transparent_70%)]" />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/0 via-black/20 to-black/50 mix-blend-overlay" />

          {/* Hero Text */}
          <div className="relative z-10 container mx-auto px-4 xl:px-0">
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

  /* ───────────────────── PLATFORM / “ALL” VIEW ─────────────────────────── */
  const title =
    platform === "all"
      ? "All Contests"
      : `${platform[0].toUpperCase() + platform.slice(1)} Contests`;

  return (
    <div className="min-h-screen pb-24 pt-24">
      <section className="relative z-10 container mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6 text-white">{title}</h2>
        <ContestList />
      </section>
    </div>
  );
}
