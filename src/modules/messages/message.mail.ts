import type { ContactMessage } from "./message.types";

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** The email the club receives for every contact form message. */
export function contactEmail(message: Pick<ContactMessage, "name" | "email" | "message">) {
  // No line breaks in the subject, so a visitor can not add mail headers.
  const subject = `New message from ${message.name.replace(/[\r\n]+/g, " ")} (website)`;

  const text = `You have a new message from the Brescia Lions website.

Name: ${message.name}
Email: ${message.email}

${message.message}

Reply to this email to answer ${message.name}. The message is also saved in the admin panel under Messages.`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f1e8;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      <tr><td align="center">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #d4a73a;border-radius:12px;">
          <tr><td style="padding:24px 28px 8px;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:#0b3d22;">New website message</td></tr>
          <tr><td style="padding:8px 28px;font-size:15px;line-height:1.6;">
            <strong>${escapeHtml(message.name)}</strong><br>
            <a href="mailto:${escapeHtml(message.email)}" style="color:#0b3d22;">${escapeHtml(message.email)}</a>
          </td></tr>
          <tr><td style="padding:8px 28px 24px;font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message.message)}</td></tr>
          <tr><td style="padding:0 28px 24px;font-size:12px;color:#777;">Reply to this email to answer. The message is also saved in the admin panel under Messages.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
