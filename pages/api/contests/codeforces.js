// pages/api/contests/codeforces.js

export default async function handler(req, res) {
    try {
      const response = await fetch("https://codeforces.com/api/contest.list");
  
      if (!response.ok) {
        return res.status(500).json({ error: "Failed to fetch contests from Codeforces" });
      }
  
      const data = await response.json();
  
      // Filter out past contests and keep only upcoming ones
      const upcomingContests = data.result.filter(contest => contest.phase === "BEFORE");
  
      res.status(200).json({ contests: upcomingContests });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong", details: error.message });
    }
  }
  