// components/ContestList.jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/* ---------- helpers ---------- */
const fmtDate = (ms) =>
  new Date(ms).toLocaleString("en-GB", { hour12: false });

const fmtLeft = (ms) => {
  if (ms <= 0) return "starts now";

  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  return [
    d ? `${d}d` : "",
    h ? `${h}h` : "",
    `${m}m`,
  ]
    .filter(Boolean)
    .join(" ");
};

/* ---------- component ---------- */
export default function ContestList() {
  const platform = (useRouter().query.platform ?? "all")
    .toString()
    .toLowerCase();

  const [contests, setContests] = useState([]);
  const [state, setState]       = useState("loading"); // loading | ready | error
  const [msg,   setMsg]         = useState("");

  /* fetch on mount + when platform changes */
  useEffect(() => {
    setState("loading");
    fetch(`/api/contests${platform === "all" ? "" : `?platform=${platform}`}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || d.error) throw new Error(d.error || "Bad response");

        // attach initial timeLeft
        const now = Date.now();
        setContests(
          (Array.isArray(d.contests) ? d.contests : []).map((c) => ({
            ...c,
            timeLeft: c.start_time - now,
          }))
        );
        setState("ready");
      })
      .catch((e) => {
        setState("error");
        setMsg(e.message);
      });
  }, [platform]);

  /* tick every minute */
  useEffect(() => {
    if (state !== "ready") return;

    const id = setInterval(() => {
      setContests((list) =>
        list.map((c) => ({ ...c, timeLeft: c.start_time - Date.now() }))
      );
    }, 60 * 1000); // once per minute is enough accuracy

    return () => clearInterval(id);
  }, [state]);

  /* ---------- render ---------- */
  if (state === "loading") return <p>Loading contests…</p>;
  if (state === "error")
    return (
      <p className="text-red-500">
        Failed to load contests{msg ? `: ${msg}` : "."}
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
            group block rounded-lg border border-white/10 p-4 transition
            hover:border-accent/60 hover:shadow-xl hover:-translate-y-[2px]
          "
        >
          {/* name */}
          <h3 className="font-medium mb-1 group-hover:text-accent">{c.name}</h3>

          {/* date & platform */}
          <p className="text-sm text-white/60 mb-1">
            {fmtDate(c.start_time)} • {c.platform}
          </p>

          {/* countdown */}
          <p
            className="
              text-sm font-medium text-accent/90
              group-hover:animate-pulse
            "
          >
            {fmtLeft(c.timeLeft)}
          </p>
        </a>
      ))}
    </div>
  );
}
