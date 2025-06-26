// components/ContestList.jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const fmt = (ms) =>
  new Date(ms).toLocaleString("en-GB", { hour12: false });

export default function ContestList() {
  const { query }  = useRouter();
  const platform   = (query.platform ?? "all").toString().toLowerCase();

  const [contests, setContests] = useState([]);     // ← always an array
  const [state,    setState]    = useState("loading"); // loading | ready | error
  const [message,  setMessage]  = useState("");     // optional error text

  useEffect(() => {
    setState("loading");
    fetch(`/api/contests${platform === "all" ? "" : `?platform=${platform}`}`)
      .then(async (res) => {
        const data = await res.json();

        // backend signals error via HTTP 500 or via { error: ... }
        if (!res.ok || data.error) {
          throw new Error(data.error || "Unexpected response");
        }

        setContests(Array.isArray(data.contests) ? data.contests : []);
        setState("ready");
      })
      .catch((err) => {
        setMessage(err.message);
        setContests([]);          // keep it an array ⇒ no .length crash
        setState("error");
      });
  }, [platform]);

  /* ---------- render ---------- */
  if (state === "loading") return <p>Loading contests…</p>;

  if (state === "error")
    return (
      <p className="text-red-500">
        Failed to load contests{message ? `: ${message}` : "."}
      </p>
    );

  if (!contests.length) return <p>No upcoming contests.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {contests.map((c) => (
        <a
          key={c.name + c.start_time}
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          className="
            block rounded-lg border border-white/10 p-4 transition
            hover:border-accent/50 hover:shadow-xl hover:scale-[1.03]
          "
        >
          <h3 className="font-medium mb-1">{c.name}</h3>
          <p className="text-sm text-white/60">
            {fmt(c.start_time)} • {c.platform}
          </p>
        </a>
      ))}
    </div>
  );
}
