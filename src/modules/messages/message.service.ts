import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { escapeRegExp } from "@/lib/slug";
import { getSiteSettings } from "@/modules/settings/settings.service";
import type { CreateMessageInput } from "./message.dto";
import { contactEmail } from "./message.mail";
import { MessageModel, type MessageDoc } from "./message.schema";
import type { ContactMessage } from "./message.types";

export function toMessage(doc: MessageDoc): ContactMessage {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    message: doc.message,
    read: doc.read,
    emailed: doc.emailed,
    createdAt: doc.createdAt.toISOString(),
  };
}

// ------------------------------------------------------------ public site

/** Saves a contact form message. It is kept even if the email below fails. */
export async function createMessage(input: CreateMessageInput) {
  await connectDB();
  const doc = await MessageModel.create({
    name: input.name,
    email: input.email,
    message: input.message,
  });
  return toMessage(doc.toObject());
}

/** Emails the message to the club address from Settings. Never throws. */
export async function emailMessageToClub(message: ContactMessage) {
  try {
    const { contact } = await getSiteSettings();
    await sendMail({
      to: contact.email,
      replyTo: message.email,
      ...contactEmail(message),
    });
    await MessageModel.updateOne({ _id: message.id }, { $set: { emailed: true } });
  } catch (error) {
    console.error("[messages] could not email the club", error);
  }
}

// ------------------------------------------------------------ admin panel

export type MessageFilter = "all" | "unread";

export async function listMessagesForAdmin({
  query,
  filter = "all",
}: { query?: string; filter?: MessageFilter } = {}) {
  await connectDB();
  const find: Record<string, unknown> = {};
  if (filter === "unread") find.read = false;

  const needle = query?.trim();
  if (needle) {
    const pattern = new RegExp(escapeRegExp(needle), "i");
    find.$or = [{ name: pattern }, { email: pattern }, { message: pattern }];
  }
  const docs = await MessageModel.find(find).sort({ createdAt: -1 }).lean<MessageDoc[]>();
  return docs.map(toMessage);
}

export async function countMessages() {
  await connectDB();
  const [total, unread] = await Promise.all([
    MessageModel.countDocuments(),
    MessageModel.countDocuments({ read: false }),
  ]);
  return { total, unread };
}

export async function getMessageForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await MessageModel.findById(id).lean<MessageDoc>();
  return doc ? toMessage(doc) : null;
}

export async function setMessageRead(id: string, read: boolean) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await MessageModel.findByIdAndUpdate(
    id,
    { $set: { read } },
    { returnDocument: "after" },
  ).lean<MessageDoc>();
  return doc ? toMessage(doc) : null;
}

export async function deleteMessage(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  return Boolean(await MessageModel.findByIdAndDelete(id));
}
