// lib/mailer.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, text = "", html = "" }) {
  return transporter.sendMail({
    from: `"ContestPulse" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
