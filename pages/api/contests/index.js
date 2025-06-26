import fetch from "node-fetch";
import https from "https";

/* Force IPv4 and cap fetches at 10 s */
const agent = new https.Agent({ family: 4, timeout: 10_000 });

/* ---------------- Source-specific fetchers ---------------- */

const fetchCodeforces = async () => {
  const r = await fetch("https://codeforces.com/api/contest.list", { agent });
  const { result = [] } = await r.json();
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

const fetchCodeChef = async () => {
  const url =
    "https://www.codechef.com/api/list/contests/all?sort_by=START&sorting_order=asc&category=Future";
  const r = await fetch(url, {
    agent,
    headers: { "User-Agent": "ContestPulse/1.0" },
  });
  const { future_contests = [] } = await r.json();
  return future_contests.map((c) => ({
    name      : c.contest_name,
    start_time: Date.parse(c.contest_start_date_iso),
    duration  : Number(c.contest_duration) * 60,           // minutes → seconds
    url       : `https://www.codechef.com/${c.contest_code}`,
    platform  : "CodeChef",
  }));
};

const fetchLeetCode = async () => {
  const q =
    encodeURIComponent("{ contestUpcomingContests { title startTime duration link } }");
  const r = await fetch(`https://leetcode.com/graphql?query=${q}`, { agent });
  const { data } = await r.json();
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

/* ---------------- Main handler ---------------- */

export default async function handler(req, res) {
  const key = (req.query.platform ?? "all").toLowerCase();

  try {
    let list = [];

    if (key === "all") {
      const [cf, cc, lc] = await Promise.all([
        fetchCodeforces().catch(() => []),
        fetchCodeChef().catch(() => []),
        fetchLeetCode().catch(() => []),
      ]);
      list = [...cf, ...cc, ...lc];
    } else if (key === "codeforces") list = await fetchCodeforces();
    else if (key === "codechef")    list = await fetchCodeChef();
    else if (key === "leetcode")    list = await fetchLeetCode();
    else
      return res.status(400).json({ error: "Unsupported platform key" });

    /* future-only & chronological */
    const now = Date.now();
    list = list
      .filter((c) => c.start_time > now)
      .sort((a, b) => a.start_time - b.start_time);

    return res.status(200).json({ contests: list });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
