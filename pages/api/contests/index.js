// pages/api/contests/index.js
export default async function handler(req, res) {
    const { platform = "all" } = req.query;
    const key = platform.toLowerCase();
  
    // external endpoints
    const endpoints = {
      all        : "https://kontests.net/api/v1/all",
      codeforces : "https://codeforces.com/api/contest.list",
      codechef   : "https://kontests.net/api/v1/code_chef",
      leetcode   : "https://kontests.net/api/v1/leet_code",
      atcoder    : "https://kontests.net/api/v1/at_coder",
      hackerrank : "https://kontests.net/api/v1/hacker_rank",
      hackerearth: "https://kontests.net/api/v1/hacker_earth",
    };
  
    const url = endpoints[key] ?? endpoints.all;
  
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch contests");
  
      let list = await response.json();
  
      // Codeforces JSON shape differs
      if (key === "codeforces" || (key !== "all" && url.includes("codeforces"))) {
        list = list.result
          .filter((c) => c.phase === "BEFORE")
          .map((c) => ({
            name      : c.name,
            start_time: c.startTimeSeconds * 1000,
            duration  : c.durationSeconds,
            url       : `https://codeforces.com/contest/${c.id}`,
            platform  : "Codeforces",
          }));
      } else {
        // Kontests already returns future contests only
        list = list.map((c) => ({
          name      : c.name,
          start_time: Date.parse(c.start_time),
          duration  : (Date.parse(c.end_time) - Date.parse(c.start_time)) / 1000,
          url       : c.url,
          platform  : c.site || key,
        }));
      }
  
      // future only & sorted
      const now = Date.now();
      list = list.filter((c) => c.start_time > now).sort((a, b) => a.start_time - b.start_time);
  
      res.status(200).json({ contests: list });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  