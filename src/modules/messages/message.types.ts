/** A message sent from the website contact form. */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  /** False when the email to the club could not be sent (the message is still saved). */
  emailed: boolean;
  /** ISO date string. */
  createdAt: string;
}
