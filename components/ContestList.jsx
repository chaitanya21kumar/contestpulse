// components/ContestList.jsx

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { auth, db } from "../lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/* ---------- helpers ---------- */
const fmtDate = (ms) =>
  new Date(ms).toLocaleString("en-GB", { hour12: false });

const fmtLeft = (ms) => {
  if (ms <= 0) return "starts now";

  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  return [d ? `${d}d` : "", h ? `${h}h` : "", `${m}m`]
    .filter(Boolean)
    .join(" ");
};

/* ─── ContestCard subcomponent ─────────────────────────────────── */
function ContestCard({ contest, user }) {
  const router = useRouter();
  const contestId = encodeURIComponent(contest.url);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscribed(false);
      return;
    }
    const ref = doc(db, "users", user.uid, "subscriptions", contestId);
    getDoc(ref).then((snap) => {
      setSubscribed(snap.exists());
    });
  }, [user, contestId]);

  const toggleNotify = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    const ref = doc(db, "users", user.uid, "subscriptions", contestId);
    if (subscribed) {
      await deleteDoc(ref);
      setSubscribed(false);
    } else {
      await setDoc(ref, { ...contest });
      setSubscribed(true);
    }
  };

  return (
    <div className="flex flex-col justify-between h-full p-4 rounded-lg border border-white/10 hover:border-accent/60 hover:shadow-xl hover:-translate-y-[2px] transition">
      <a
        href={contest.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex-1"
      >
        <h3 className="font-medium mb-1 group-hover:text-accent break-words">
          {contest.name}
        </h3>
        <p className="text-sm text-white/60 mb-1">
          {fmtDate(contest.start_time)} • {contest.platform}
        </p>
        <p className="text-sm font-medium text-accent group-hover:animate-pulse">
          {fmtLeft(contest.timeLeft)}
        </p>
      </a>

      <button
        onClick={toggleNotify}
        className={`mt-4 btn w-full ${
          subscribed
            ? "bg-red-600 hover:bg-red-700"
            : "bg-accent hover:brightness-110"
        }`}
      >
        {subscribed ? "Unsubscribe" : "Notify me"}
      </button>
    </div>
  );
}

/* ─── Main ContestList component ───────────────────────────────── */
export default function ContestList({ limit }) {
  const router = useRouter();
  const platform = (router.query.platform ?? "all")
    .toString()
    .toLowerCase();

  const [contests, setContests] = useState([]);
  const [state, setState] = useState("loading");
  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    setState("loading");
    fetch(`/api/contests${platform === "all" ? "" : `?platform=${platform}`}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || d.error) throw new Error(d.error || "Bad response");

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

  useEffect(() => {
    if (state !== "ready") return;
    const id = setInterval(() => {
      setContests((list) =>
        list.map((c) => ({ ...c, timeLeft: c.start_time - Date.now() }))
      );
    }, 60 * 1000);
    return () => clearInterval(id);
  }, [state]);

  if (state === "loading") return <p>Loading contests…</p>;
  if (state === "error")
    return (
      <p className="text-red-500">
        Failed to load contests{msg ? `: ${msg}` : "."}
      </p>
    );
  if (!contests.length) return <p>No upcoming contests.</p>;

  const displayed =
    typeof limit === "number" ? contests.slice(0, limit) : contests;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {displayed.map((c) => (
        <div key={c.url} className="h-full">
          <ContestCard contest={c} user={user} />
        </div>
      ))}
    </div>
  );
}
