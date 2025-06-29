import { sendEmail } from "../../lib/mailer";

export default async function handler(req, res) {
  try {
    await sendEmail({
      to: "multiversesyndrome@gmail.com",
      subject: "🎯 Test from ContestPulse",
      html: "<h1>If you see this, SMTP is working!</h1>",
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
