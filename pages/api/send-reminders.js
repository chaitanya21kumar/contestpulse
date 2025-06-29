// pages/api/send-reminders.js
import { sendEmail } from "../../lib/mailer";

const { FIREBASE_PROJECT_ID, FIREBASE_API_KEY } = process.env;

/* helper – convert Firestore number */
const toNum = (v) =>
  v?.integerValue !== undefined
    ? Number(v.integerValue)
    : v?.doubleValue !== undefined
    ? Number(v.doubleValue)
    : 0;

export default async function handler(req, res) {
  try {
    const now = Date.now();
    const cutoff = now + 60 * 60 * 1000; // 1 hour ahead
    const sent = [];

    console.log("⏰ now:", now, "| cutoff:", cutoff);

    /* 1️⃣  collection-group query for *all* subscriptions */
    const queryUrl =
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
      `/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

    const body = {
      structuredQuery: {
        from: [{ collectionId: "subscriptions", allDescendants: true }],
      },
    };

    console.log("📥 runQuery for subscriptions …");
    const rows = await fetch(queryUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json());

    const docs = rows.filter((r) => r.document);
    console.log(`✅ subscriptions found: ${docs.length}`);

    for (const row of docs) {
      const doc = row.document;
      const f = doc.fields;

      const start = toNum(f.start_time);
      const name = f.name?.stringValue || "Contest";
      const url = f.url?.stringValue || "#";
      const platform = f.platform?.stringValue || "";
      const email = f.email?.stringValue;            // <- NEW

      console.log(`→ ${name} | start ${start}`);

      if (start <= now || start > cutoff) {
        console.log("  ⏭️ skipped (outside 1-hour window)");
        continue;
      }
      if (!email) {
        console.log("  🚫 email missing on doc – skipping");
        continue;
      }

      console.log(`  📨 send to ${email}`);

      /* 2️⃣  send email */
      await sendEmail({
        to: email,
        subject: `⏰ Reminder: ${name} starts soon`,
        html: `
          <p>Your contest <strong>${name}</strong> on <strong>${platform}</strong>
          starts at <strong>${new Date(start).toLocaleString()}</strong>.</p>
          <p><a href="${url}">Open contest page</a></p>
        `,
      });
      sent.push(email);

      /* 3️⃣  delete sub-doc */
      console.log("  🗑️ delete", doc.name);
      await fetch(
        `https://firestore.googleapis.com/v1/${doc.name}?key=${FIREBASE_API_KEY}`,
        { method: "DELETE" }
      );
    }

    console.log("✅ done – emails sent:", sent.length);
    res.status(200).json({ ok: true, sent });
  } catch (err) {
    console.error("🔥 send-reminders error:", err);
    res.status(500).json({ error: err.message });
  }
}
