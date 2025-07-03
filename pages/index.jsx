// pages/index.jsx
import { motion }    from "framer-motion";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { auth }                from "../lib/firebase";
import { onAuthStateChanged }  from "firebase/auth";

import ContestList from "../components/ContestList";
import { fadeIn }  from "../variants";
import SEO         from "../components/SEO";

export default function Home() {
  const { query }  = useRouter();
  const platform   = query.platform?.toString().toLowerCase();

  /* ── dynamic meta ───────────────────────── */
  const siteURL    = "https://contestpulse-chaitanya21kr.netlify.app/";
  const isRootPage = !platform;
  const title      = isRootPage
    ? "ContestPulse – All Coding Contests in One Timeline (CF · LC · CC · AC)"
    : platform === "all"
        ? "All Coding Contests – ContestPulse"
        : `${platform[0].toUpperCase() + platform.slice(1)} Contests – ContestPulse`;

  const description = isRootPage
    ? "Track upcoming programming contests across Codeforces, LeetCode, CodeChef & AtCoder. Set instant email alerts so you never miss a contest again."
    : `Upcoming ${platform === "all" ? "" : platform + " "}coding contests with dates, duration & links. Subscribe for instant reminders on ContestPulse.`;

  /* ── greet signed-in user ──────────────── */
  const [name, setName] = useState("");
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) =>
      setName(u ? u.displayName || u.email.split("@")[0] : "")
    );
    return unsub;
  }, []);

  /* ── ROOT / HERO ───────────────────────── */
  if (isRootPage) {
    return (
      <>
        <SEO
          title={title}
          description={description}
          url={siteURL}
          image="/homepage.png"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "ContestPulse",
            description,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            url: siteURL,
            logo: siteURL + "logo.svg"
          }}
        />

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
      </>
    );
  }

  /* ── PLATFORM / “ALL” VIEW ─────────────── */
  return (
    <>
      <SEO
        title={title}
        description={description}
        url={siteURL}
        image="/homepage.png"
      />

      <div className="min-h-screen pb-24 pt-24 bg-primary">
        <section className="relative z-10 container mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-white">
            {platform === "all"
              ? "All Contests"
              : `${platform[0].toUpperCase() + platform.slice(1)} Contests`}
          </h2>

          {/* cap at 9 cards on “All” */}
          <ContestList limit={platform === "all" ? 9 : undefined} />
        </section>
      </div>
    </>
  );
}
