import nodemailer, { type Transporter } from "nodemailer";

interface MailMessage {
  to: string;
  subject: string;
  /** Where a reply goes (the visitor's address for contact messages). */
  replyTo?: string;
  text: string;
  html: string;
}

let transporter: Transporter | null = null;

export function isMailConfigured() {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS,
  );
}

function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.EMAIL_PORT);
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  return transporter;
}

function fromAddress() {
  return (
    process.env.EMAIL_FROM ??
    `"Brescia Lions" <${process.env.EMAIL_USER ?? "no-reply@localhost"}>`
  );
}

/**
 * Sends an email through SMTP. For local testing only, `MAIL_MODE=console`
 * prints the message to the server log instead (ignored in production).
 */
export async function sendMail(message: MailMessage) {
  if (
    process.env.MAIL_MODE === "console" &&
    process.env.NODE_ENV !== "production"
  ) {
    console.log(
      `[mail:console] to=${message.to} subject="${message.subject}"\n${message.text}`,
    );
    return;
  }
  if (!isMailConfigured()) {
    throw new Error("Email is not configured (EMAIL_HOST/PORT/USER/PASS).");
  }
  await getTransporter().sendMail({ from: fromAddress(), ...message });
}
