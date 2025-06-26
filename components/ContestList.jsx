// components/ContestList.jsx

import { useEffect, useState } from "react";

const ContestList = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await fetch("/api/contests/codeforces");
        const data = await response.json();
        setContests(data.contests);
      } catch (error) {
        console.error("Error fetching contests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="mt-12 text-white">
      <h2 className="text-3xl font-bold text-accent mb-6 text-center">Upcoming Codeforces Contests</h2>

      {loading ? (
        <p className="text-center text-lg text-gray-400">Loading contests...</p>
      ) : contests.length === 0 ? (
        <p className="text-center text-lg text-red-400">No upcoming contests found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4">
          {contests.map((contest) => (
            <div
              key={contest.id}
              className="border border-accent rounded-xl p-4 shadow-lg bg-black/30 backdrop-blur"
            >
              <h3 className="text-xl font-semibold mb-2">{contest.name}</h3>
              <p className="text-sm text-gray-300">
                ⏰ <strong>Starts:</strong> {formatTime(contest.startTimeSeconds)}
              </p>
              <p className="text-sm text-gray-300">
                ⏳ <strong>Duration:</strong> {formatDuration(contest.durationSeconds)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContestList;
