// components/SEO.jsx
import Head from "next/head";

/* ------------------------------------------------------------------
   <SEO>  —  Centralised metadata for every page
   ------------------------------------------------------------------
   Props (all optional):
     • title        ← <title> tag + OG / Twitter titles
     • description  ← <meta name="description">
     • url          ← canonical + OG url
     • image        ← social preview (path under /public or full URL)
     • type         ← OG type (website, article, etc.)
     • keywords     ← additional signals for non-Google engines
     • noIndex      ← true  → adds  <meta name="robots" content="noindex">
     • jsonLd       ← JS object → injected as <script type="application/ld+json">
-------------------------------------------------------------------*/
export default function SEO({
  title = "ContestPulse – Smart CP Contest Tracker & Reminders",
  description =
    "Track upcoming programming contests across Codeforces, LeetCode, CodeChef & AtCoder, and get instant email alerts. Never miss a contest again.",
  url = "https://contestpulse-chaitanya21kr.netlify.app/",
  image = "/homepage.png",
  type = "website",
  keywords =
    "ContestPulse, coding contest tracker, Codeforces contests, LeetCode contests, CodeChef contests, AtCoder contests, competitive programming reminders, CP notifier",
  noIndex = false,
  jsonLd = null,
}) {
  return (
    <Head>
      {/* Primary tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Optionally block indexing */}
      {noIndex && <meta name="robots" content="noindex" />}

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={url} />
      <meta property="og:image"       content={image} />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />

      {/* Structured-data JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          // minified to keep <head> small
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}
