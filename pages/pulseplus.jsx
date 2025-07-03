// pages/pulseplus.jsx
import SEO from "../components/SEO";

export default function PulsePlus() {
  const url   = "https://contestpulse-chaitanya21kr.netlify.app/pulseplus";
  const image = "/pulseplus.png";          // keep or swap; must live in /public

  return (
    <>
      {/* ── SEO + FAQ schema ───────────────────────────────────── */}
      <SEO
        title="Pulse+ – Upcoming Features | ContestPulse"
        description="Preview of Pulse+: WhatsApp contest notifications and CP profile analysis coming soon."
        url={url}
        image={image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type":   "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name:  "Is ContestPulse free?",
              acceptedAnswer: {
                "@type": "Answer",
                text:  "Yes — all current features are free and will remain free."
              }
            },
            {
              "@type": "Question",
              name:  "When will WhatsApp contest alerts launch?",
              acceptedAnswer: {
                "@type": "Answer",
                text:  "We’re targeting a public release by Q4 2025."
              }
            },
            {
              "@type": "Question",
              name:  "What analytics will Pulse+ include?",
              acceptedAnswer: {
                "@type": "Answer",
                text:  "Pulse+ will visualize your Codeforces, LeetCode and other CP profiles with rating graphs, solved-problem heat-maps and more."
              }
            }
          ]
        }}
      />

      {/* ── existing UI (unchanged) ───────────────────────────── */}
      <div className="min-h-screen pb-24 pt-24 bg-primary text-white">
        <section className="relative z-10 container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-6 text-accent">
            🚀 Pulse+ Features Coming Soon
          </h2>

          <ul className="list-disc ml-6 space-y-4 text-lg text-white/90">
            <li>
              📱 <strong>WhatsApp Notifications</strong>: Get instant pings for
              upcoming contests directly on WhatsApp.
            </li>
            <li>
              📊 <strong>CP Profile Analysis</strong>: Visualize your performance
              with smart analytics from Codeforces, LeetCode and more.
            </li>
          </ul>

          <p className="mt-8 text-white/60 italic">
            We’re just getting started. More power tools for competitive
            programmers are in the pipeline!
          </p>
        </section>
      </div>
    </>
  );
}
