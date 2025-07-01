// invokeReminders.js
// Node 18+ has fetch built-in. If you need, install node-fetch and import it.

const ENDPOINT = "http://localhost:3000/api/send-reminders";

(async () => {
  try {
    const r = await fetch(ENDPOINT);
    const json = await r.json();
    console.log("✅ send-reminders response:", json);
  } catch (e) {
    console.error("❌ invocation error:", e);
  }
})();
