// functions/index.js
const functions  = require("firebase-functions");
const admin      = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();
const db = admin.firestore();

// grab your Gmail creds from functions.config()
const gmailUser = functions.config().gmail.user;
const gmailPass = functions.config().gmail.pass;

// create a transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

exports.sendReminders = functions
  .runWith({ memory: "256MB", timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    try {
      const now    = Date.now();
      const cutoff = now + 2 * 60 * 1000; // 2 min for testing
      const snap   = await db
        .collectionGroup("subscriptions")
        .where("start_time", ">=", now)
        .where("start_time", "<=", cutoff)
        .get();

      let sent = 0;
      await Promise.all(snap.docs.map(async (sub) => {
        const { name, platform, start_time, url } = sub.data();
        const uid     = sub.ref.parent.parent.id;
        const { email, displayName } = await admin.auth().getUser(uid);

        // send email
        await transporter.sendMail({
          from: `"ContestPulse" <${gmailUser}>`,
          to: email,
          subject: `Reminder: ${name} starts soon`,
          html: `
            <p>Hello ${displayName || email.split("@")[0]},</p>
            <p>Your contest <strong>${name}</strong> on ${platform} starts at  
               ${new Date(start_time).toLocaleString()}.</p>
            <p><a href="${url}">View contest</a></p>
          `,
        });

        // remove subscription so we don’t resend
        await sub.ref.delete();
        sent++;
      }));

      res.json({ ok: true, sent });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
