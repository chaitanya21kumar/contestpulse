// pages/api/sendReminders.js

import fetch from "node-fetch";
import SibApiV3Sdk from "sib-api-v3-sdk";

// configure Brevo from env var
const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_KEY;
const brevo = new SibApiV3Sdk.TransactionalEmailsApi();

// Replace these with your project’s settings
const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY    = process.env.FIREBASE_API_KEY;

export default async function handler(req, res) {
  const now    = Date.now();
  const cutoff = now + 60 * 60 * 1000; // next hour

  // Fetch all subscriptions under users/{uid}/subscriptions
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}`
            + `/databases/(default)/documents:runQuery?key=${API_KEY}`;

  // Firestore structured query: collectionGroup("subscriptions")
  const body = {
    structuredQuery: {
      from: [{ collectionId: "subscriptions", allDescendants: true }],
    }
  };

  const snap = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

  // For each document returned...
  await Promise.all(
    snap.map(async (row) => {
      if (!row.document) return;
      const doc = row.document;
      const data = {};
      for (let [k, v] of Object.entries(doc.fields)) {
        if (v.integerValue) data[k] = Number(v.integerValue);
        else if (v.stringValue) data[k]  = v.stringValue;
        // (we only stored start_time, name, url, platform)
      }
      if (data.start_time > now && data.start_time <= cutoff) {
        // derive UID by splitting the path: 
        // "projects/.../documents/users/{uid}/subscriptions/{id}"
        const parts = doc.name.split("/");
        const uid = parts[parts.indexOf("users") + 1];

        // fetch user email via Firebase Auth REST
        const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;
        const authRes = await fetch(authUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ localId: [uid] }),
        }).then((r) => r.json());
        const email = authRes.users?.[0]?.email;
        if (!email) return;

        // send via Brevo
        const sendReq = {
          sender: { name: "Contest Pulse", email: "no-reply@contest-pulse.com" },
          to:     [{ email }],
          subject: `Reminder: ${data.name} starts soon`,
          htmlContent: `
            <p>Your contest <strong>${data.name}</strong> on ${data.platform}
            starts at <strong>${new Date(data.start_time).toLocaleString()}</strong>.</p>
            <p><a href="${data.url}">Join the contest</a></p>
          `,
        };
        await brevo.sendTransacEmail(sendReq);

        // delete that subscription doc
        const deleteUrl = `https://firestore.googleapis.com/v1/${doc.name}?key=${API_KEY}`;
        await fetch(deleteUrl, { method: "DELETE" });
      }
    })
  );

  return res.status(200).json({ ok: true });
}
