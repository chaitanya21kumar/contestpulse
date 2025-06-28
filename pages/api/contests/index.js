// pages/api/contests/index.js
// -----------------------------------------------------------------------------
// ContestPulse contest-list API        ·  28 Jun 2025
//
// Platforms: Codeforces · CodeChef · LeetCode · AtCoder
//
// LeetCode fetch order (stop at first non-empty):
//   1️⃣ Official GraphQL
//   2️⃣ Alfa‐leetcode proxy
//   3️⃣ Kontests.net mirror
//   4️⃣ ICS‐feed parser   (via lccal-worker, always works)
//   5️⃣ Puppeteer scrape  (last‐ditch Cloudflare bypass)
// -----------------------------------------------------------------------------

import fetch     from "node-fetch";
import https     from "https";
import puppeteer from "puppeteer";

const agent = new https.Agent({ family: 4, timeout: 10_000 });

/* ─────────────────────── Codeforces ─────────────────────── */
const fetchCodeforces = async () => {
  const res = await fetch("https://codeforces.com/api/contest.list", { agent });
  const { result = [] } = await res.json();
  return result
    .filter((c) => c.phase === "BEFORE")
    .map((c) => ({
      name      : c.name,
      start_time: c.startTimeSeconds * 1000,
      duration  : c.durationSeconds,
      url       : `https://codeforces.com/contest/${c.id}`,
      platform  : "Codeforces",
    }));
};

/* ─────────────────────── CodeChef ──────────────────────── */
const fetchCodeChef = async () => {
  const url =
    "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&category=Future";
  const res = await fetch(url, {
    agent,
    headers: { "User-Agent": "ContestPulse/1.0" },
  });
  const { future_contests = [] } = await res.json();
  return future_contests.map((c) => ({
    name      : c.contest_name,
    start_time: Date.parse(c.contest_start_date_iso),
    duration  : Number(c.contest_duration) * 60,
    url       : `https://www.codechef.com/${c.contest_code}`,
    platform  : "CodeChef",
  }));
};

/* ─────────────────────── LeetCode ──────────────────────── */
// 1️⃣ Official GraphQL
const fetchLeetCodeOfficial = async () => {
  const res = await fetch("https://leetcode.com/graphql", {
    agent,
    method : "POST",
    headers: {
      "Content-Type": "application/json",
      Origin        : "https://leetcode.com",
      Referer       : "https://leetcode.com/contest/",
      "User-Agent"  : "Mozilla/5.0",
    },
    body: JSON.stringify({
      query: "{ contestUpcomingContests { title startTime duration link } }",
    }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const { data } = await res.json();
  return (data?.contestUpcomingContests ?? []).map((c) => ({
    name      : c.title,
    start_time: c.startTime * 1000,
    duration  : c.duration,
    url       : c.link.startsWith("http")
      ? c.link
      : `https://leetcode.com${c.link}`,
    platform  : "LeetCode",
  }));
};

// 2️⃣ Alfa‐leetcode proxy
const fetchLeetCodeAlfa = async () => {
  const res = await fetch(
    "https://alfa-leetcode-api.onrender.com/contest/upcoming",
    { agent }
  );
  if (!res.ok) throw new Error(`alfa ${res.status}`);
  const { contests = [] } = await res.json();
  return contests.map((c) => ({
    name      : c.title,
    start_time: new Date(c.start_time).getTime(),
    duration  : c.duration_seconds,
    url       : c.url,
    platform  : "LeetCode",
  }));
};

// 3️⃣ Kontests.net mirror
const fetchLeetCodeKontests = async () => {
  const res = await fetch("https://kontests.net/api/v1/leet_code", { agent });
  if (!res.ok) throw new Error(`kontests ${res.status}`);
  return (await res.json()).map((c) => ({
    name      : c.name,
    start_time: Date.parse(c.start_time),
    duration  : Number(c.duration),
    url       : c.url,
    platform  : "LeetCode",
  }));
};

// 4️⃣ ICS‐feed parser (lccal-worker)
const fetchLeetCodeICS = async () => {
  const res = await fetch("https://lccal-worker.bamboo.workers.dev/ical", {
    agent,
  });
  if (!res.ok) throw new Error(`ICS ${res.status}`);
  const ics = await res.text();
  const lines = ics.split(/\r?\n/);
  const events = [];
  let ev = null;

  for (const ln of lines) {
    if (ln === "BEGIN:VEVENT") {
      ev = {};
    } else if (ln === "END:VEVENT") {
      if (ev && ev.name && ev.start_time) events.push(ev);
      ev = null;
    } else if (ev) {
      if (ln.startsWith("SUMMARY:")) {
        ev.name = ln.slice(8);
      } else if (ln.startsWith("DTSTART:")) {
        // format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMZ
        const dt = ln.slice(8);
        // Convert to ISO: YYYY-MM-DDTHH:MM:SSZ
        const year  = dt.slice(0,4),
              mon   = dt.slice(4,6),
              day   = dt.slice(6,8),
              hour  = dt.slice(9,11),
              minute= dt.slice(11,13),
              second= dt.length >=15 ? dt.slice(13,15) : "00";
        ev.start_time = Date.parse(
          `${year}-${mon}-${day}T${hour}:${minute}:${second}Z`
        );
      } else if (ln.startsWith("DURATION:PT")) {
        const m = ln.match(/PT(\d+)M/);
        ev.duration = m ? Number(m[1]) * 60 : undefined;
      } else if (ln.startsWith("URL:")) {
        ev.url = ln.slice(4);
      }
    }
  }

  return events.map((e) => ({
    name      : e.name,
    start_time: e.start_time,
    duration  : e.duration,
    url       : e.url,
    platform  : "LeetCode",
  }));
};

// 5️⃣ Puppeteer scrape (Cloudflare bypass)
const fetchLeetCodePuppeteer = async () => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto("https://leetcode.com/contest/", {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  const data = await page.evaluate(() => {
    const s = document.getElementById("__NEXT_DATA__");
    return s ? JSON.parse(s.textContent) : null;
  });
  await browser.close();

  const list = data?.props?.pageProps?.contests?.contestUpcomingContests;
  if (!Array.isArray(list) || !list.length) {
    throw new Error("Puppeteer: no data");
  }
  return list.map((c) => ({
    name      : c.title,
    start_time: c.startTime * 1000,
    duration  : c.duration,
    url       : c.link.startsWith("http")
      ? c.link
      : `https://leetcode.com${c.link}`,
    platform  : "LeetCode",
  }));
};

// LeetCode orchestrator
const fetchLeetCode = async () => {
  const sources = [
    fetchLeetCodeOfficial,
    fetchLeetCodeAlfa,
    fetchLeetCodeKontests,
    fetchLeetCodeICS,
    fetchLeetCodePuppeteer,
  ];
  for (const fn of sources) {
    try {
      const arr = await fn();
      if (arr.length) return arr;
    } catch {
      // try next
    }
  }
  throw new Error("All LeetCode sources failed");
};

/* ─────────────────────── AtCoder ──────────────────────── */
const fetchAtCoderJSON = async () => {
  const res = await fetch(
    "https://kenkoooo.com/atcoder/resources/contests.json",
    { agent }
  );
  if (!res.ok) throw new Error(`AtCoder JSON ${res.status}`);
  const all = await res.json();
  return all
    .filter((c) => c.start_epoch_second * 1000 > Date.now())
    .map((c) => ({
      name      : c.title,
      start_time: c.start_epoch_second * 1000,
      duration  : c.duration_second,
      url       : `https://atcoder.jp/contests/${c.id}`,
      platform  : "AtCoder",
    }));
};

const fetchAtCoderHTML = async () => {
  const html = await fetch("https://atcoder.jp/contests/", {
    agent,
    headers: { "User-Agent": "Mozilla/5.0" },
  }).then((r) => r.text());

  const section = html.split("Upcoming Contests")[1]?.split("</tbody>")[0] || "";
  const rows    = section.split("<tr").slice(1);
  return rows
    .map((row) => {
      const slug   = row.match(/href="\/contests\/([^"]+)"/)?.[1];
      const title  = row.match(/\/contests\/[^"]+">([^<]+)</)?.[1]?.trim();
      const start  = row.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\+\d{4}/)?.[0];
      const durTxt = row.match(/(\d{1,3}:\d{2})/)?.[1] || "00:00";
      if (!slug || !title || !start) return null;
      const ts      = Date.parse(start.replace("+0900", " UTC+09:00"));
      const [h, m]  = durTxt.split(":").map(Number);
      return {
        name      : title,
        start_time: ts,
        duration  : h * 3600 + m * 60,
        url       : `https://atcoder.jp/contests/${slug}`,
        platform  : "AtCoder",
      };
    })
    .filter(Boolean);
};

const fetchAtCoder = async () => {
  try {
    const json = await fetchAtCoderJSON();
    if (json.length) return json;
  } catch {}
  return fetchAtCoderHTML();
};

/* ─────────────────────── API Handler ─────────────────────── */
export default async function handler(req, res) {
  const key = (req.query.platform ?? "all").toLowerCase();
  try {
    let list = [];

    if (key === "all") {
      const [cf, cc, lc, ac] = await Promise.all([
        fetchCodeforces().catch(() => []),
        fetchCodeChef   ().catch(() => []),
        fetchLeetCode   ().catch(() => []),
        fetchAtCoder    ().catch(() => []),
      ]);
      list = [...cf, ...cc, ...lc, ...ac];
    } else if (key === "codeforces") list = await fetchCodeforces();
    else if (key === "codechef")    list = await fetchCodeChef();
    else if (key === "leetcode")    list = await fetchLeetCode();
    else if (key === "atcoder")     list = await fetchAtCoder();
    else return res.status(400).json({ error: "Unsupported platform key" });

    const now = Date.now();
    list = list
      .filter((c) => c.start_time > now)
      .sort((a, b) => a.start_time - b.start_time);

    res.status(200).json({ contests: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
