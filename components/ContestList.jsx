// components/ContestList.jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import {
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtDate = (ms) =>
  new Date(ms).toLocaleString("en-GB", { hour12: false });
const fmtLeft = (ms) => {
  if (ms <= 0) return "starts now";
  const s = Math.floor(ms / 1000),
    d = Math.floor(s / 86400),
    h = Math.floor((s % 86400) / 3600),
    m = Math.floor((s % 3600) / 60);
  return [d ? `${d}d` : "", h ? `${h}h` : "", `${m}m`]
    .filter(Boolean)
    .join(" ");
};

/* ─── NotificationModal ───────────────────────────────────── */
function NotificationModal({ defaultMinutes, onCancel, onConfirm }) {
  const [mins, setMins] = useState(defaultMinutes);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-secondary p-6 rounded-lg w-full max-w-sm">
        <h3 className="text-white text-xl mb-2">Set Email Reminder</h3>
        <p className="text-white/80 mb-4 text-sm">
          How many <strong>minutes before</strong> the contest should we ping you?
        </p>
        <input
          type="number"
          min="1"
          value={mins}
          onChange={e => setMins(e.target.value)}
          className="input w-full mb-4"
          placeholder="e.g. 60"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="btn bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Number(mins))}
            className="btn bg-accent hover:brightness-110 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── ContestCard ─────────────────────────────────────────── */
function ContestCard({ contest, user }) {
  const router = useRouter();
  const id = encodeURIComponent(contest.url);
  const ref =
    user &&
    doc(db, "users", user.uid, "subscriptions", id);

  const [subscribed, setSubscribed] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);

  // listen for existence → subscribed = doc.exists()
  useEffect(() => {
    if (!ref) {
      setSubscribed(false);
      return;
    }
    const unsub = onSnapshot(ref, snap => {
      setSubscribed(snap.exists());
    });
    return () => unsub();
  }, [ref]);

  const unsubscribe = async () => {
    if (!ref) return;
    await deleteDoc(ref);
  };

  const confirm = async minutes => {
    if (!ref) return;
    const m = Number(minutes);
    const before = isNaN(m) || m <= 0
      ? 60 * 60 * 1000
      : m * 60 * 1000;
    await setDoc(ref, {
      ...contest,
      email: user.email,
      notifyBefore: before,
    });
    setModalOpen(false);
  };

  return (
    <>
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

        <div className="relative w-full group">
          <button
            onClick={() => {
              if (!user) return router.push("/login");
              subscribed ? unsubscribe() : setModalOpen(true);
            }}
            className={`mt-4 btn w-full ${
              subscribed
                ? "bg-red-600 hover:bg-red-700"
                : "bg-accent hover:brightness-110"
            }`}
          >
            {subscribed ? "Unsubscribe" : "Notify me"}
          </button>
          <span className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-secondary text-white rounded">
            {subscribed
              ? "Click to cancel your reminder"
              : "Click to choose when to be reminded"}
          </span>
        </div>
      </div>

      {modalOpen && (
        <NotificationModal
          defaultMinutes={60}
          onCancel={() => setModalOpen(false)}
          onConfirm={confirm}
        />
      )}
    </>
  );
}

/* ─── ContestList ───────────────────────────────────────────── */
export default function ContestList({ limit }) {
  const router = useRouter();
  const platform = (router.query.platform ?? "all").toLowerCase();

  const [contests, setContests] = useState([]);
  const [state, setState]       = useState("loading");
  const [msg, setMsg]           = useState("");
  const [user, setUser]         = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    setState("loading");
    fetch(
      `/api/contests${
        platform === "all" ? "" : `?platform=${platform}`
      }`
    )
      .then(async r => {
        const d = await r.json();
        if (!r.ok || d.error) throw new Error(d.error || "Bad response");
        const now = Date.now();
        setContests(
          d.contests.map(c => ({
            ...c,
            timeLeft: c.start_time - now,
          }))
        );
        setState("ready");
      })
      .catch(e => {
        setState("error");
        setMsg(e.message);
      });
  }, [platform]);

  useEffect(() => {
    if (state !== "ready") return;
    const id = setInterval(() => {
      setContests(list =>
        list.map(c => ({ ...c, timeLeft: c.start_time - Date.now() }))
      );
    }, 60_000);
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

  const shown =
    typeof limit === "number" ? contests.slice(0, limit) : contests;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {shown.map(c => (
        <div key={c.url} className="h-full">
          <ContestCard contest={c} user={user} />
        </div>
      ))}
    </div>
  );
}
