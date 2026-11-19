import nodemailer from "nodemailer";
export const appUrl = () => process.env.APP_URL || "http://localhost:3000";
export async function sendMail(to: string, subject: string, text: string) {
  if (!process.env.SMTP_HOST) { console.log(`\n[email to ${to}] ${subject}\n${text}\n`); return; }
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: +(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await t.sendMail({ from: process.env.MAIL_FROM || "RAASTA <no-reply@example.com>", to, subject, text });
}
