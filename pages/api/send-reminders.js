// pages/api/send-reminders.js
import { sendEmail } from "../../lib/mailer";

const { FIREBASE_PROJECT_ID, FIREBASE_API_KEY } = process.env;

// Firestore NumberValue → JS Number
const toNum = v =>
  v?.integerValue !== undefined
    ? Number(v.integerValue)
    : v?.doubleValue !== undefined
    ? Number(v.doubleValue)
    : 0;

export default async function handler(req, res) {
  try {
    const now = Date.now();
    const sent = [];

    console.log("⏰ now:", now);

    // 1️⃣ Fetch all subscriptions via collection‐group query
    const url =
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
      `/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
    const body = {
      structuredQuery: {
        from: [{ collectionId: "subscriptions", allDescendants: true }],
      },
    };

    console.log("📥 fetching subscriptions…");
    const rows = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(r => r.json());

    const docs = rows.filter(r => r.document).map(r => r.document);
    console.log(`✅ subscriptions found: ${docs.length}`);

    for (const d of docs) {
      const f = d.fields || {};

      // skip malformed entries
      if (
        !f.name?.stringValue ||
        !f.platform?.stringValue ||
        !f.url?.stringValue ||
        !f.email?.stringValue ||
        f.start_time === undefined
      ) {
        console.warn("⚠️ skipping malformed doc:", d.name);
        continue;
      }

      // compute when to send
      const start = toNum(f.start_time);
      const before = toNum(f.notifyBefore) || 60 * 60 * 1000;
      const sendAt = start - before;

      // only send if within the window
      if (now < sendAt || now >= start) {
        console.log(`⏭️ skipping (outside window): ${f.name.stringValue}`);
        continue;
      }

      // ─── Format start time in IST ───────────────────────────────
      const formattedStart = new Date(start).toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
      });

      // 2️⃣ Send the styled email
      console.log(
        `📨 sending to ${f.email.stringValue}: ${f.name.stringValue}`
      );
      await sendEmail({
        to: f.email.stringValue,
        subject: `⏰ Reminder: ${f.name.stringValue} starts soon`,
        html: `
          <div style="
            font-family: sans-serif;
            line-height: 1.4;
            color: #333;
            padding: 20px;
          ">
            <h2 style="
              font-size: 24px;
              margin: 0 0 12px;
              color: #000; /* heading in black */
            ">
              ⏰ Reminder: ${f.name.stringValue} on ${f.platform.stringValue}
            </h2>
            <p style="
              font-size: 16px;
              margin: 4px 0 16px;
            ">
              Starts at <strong>${formattedStart}</strong>.
            </p>
            <p style="margin: 0 0 24px;">
              <a href="${f.url.stringValue}" style="
                color: #1a73e8;
                text-decoration: none;
                font-size: 16px;
              ">
                View contest page
              </a>
            </p>
            <hr style="
              border: none;
              border-top: 1px solid #eee;
              margin: 20px 0;
            "/>
            <p style="
              font-size: 14px;
              color: #666;
              margin: 0;
            ">
              Sent with ❤️ by
              <a href="https://contestpulse-chaitanya21kr.netlify.app" style="
                color: #1a73e8;
                text-decoration: none;
              ">
                ContestPulse
              </a>
            </p>
          </div>
        `,
      });
      sent.push(f.email.stringValue);

      // 3️⃣ DELETE the subscription so it never re-fires
      console.log("🗑️ deleting subscription:", d.name);
      const deleteUrl = `https://firestore.googleapis.com/v1/${encodeURI(
        d.name
      )}?key=${FIREBASE_API_KEY}`;
      const delRes = await fetch(deleteUrl, { method: "DELETE" });
      if (!delRes.ok) {
        const bodyText = await delRes.text();
        console.error(
          `❌ Failed to delete subscription at ${deleteUrl}:`,
          delRes.status,
          bodyText
        );
      } else {
        console.log(`✅ Deleted subscription ${d.name}`);
      }
    }

    console.log("✅ done – emails sent:", sent.length);
    res.status(200).json({ ok: true, sent });
  } catch (err) {
    console.error("🔥 send-reminders error:", err);
    res.status(500).json({ error: err.message });
  }
}
