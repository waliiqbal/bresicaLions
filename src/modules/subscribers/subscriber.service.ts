import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { escapeRegExp } from "@/lib/slug";
import { SubscriberModel, type SubscriberDoc } from "./subscriber.schema";
import type { Subscriber } from "./subscriber.types";

export function toSubscriber(doc: SubscriberDoc): Subscriber {
  return {
    id: String(doc._id),
    email: doc.email,
    createdAt: doc.createdAt.toISOString(),
  };
}

// ------------------------------------------------------------ public site

/**
 * Adds an email to the list. Subscribing twice is fine and looks the same to
 * the visitor, so nobody can use the form to find out who is subscribed.
 */
export async function subscribe(email: string) {
  await connectDB();
  await SubscriberModel.updateOne({ email }, { $setOnInsert: { email } }, { upsert: true });
}

// ------------------------------------------------------------ admin panel

export async function listSubscribersForAdmin(query?: string) {
  await connectDB();
  const needle = query?.trim();
  const docs = await SubscriberModel.find(
    needle ? { email: new RegExp(escapeRegExp(needle), "i") } : {},
  )
    .sort({ createdAt: -1 })
    .lean<SubscriberDoc[]>();
  return docs.map(toSubscriber);
}

export async function countSubscribers() {
  await connectDB();
  return SubscriberModel.countDocuments();
}

export async function deleteSubscriber(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  return Boolean(await SubscriberModel.findByIdAndDelete(id));
}

/** CSV text of every subscriber. Cells that start with = + - @ are defused so a spreadsheet never runs them as formulas. */
export async function subscribersCsv() {
  const subscribers = await listSubscribersForAdmin();
  const cell = (value: string) => {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows = subscribers.map((s) => `${cell(s.email)},${cell(s.createdAt)}`);
  return ["email,subscribed_at", ...rows].join("\r\n") + "\r\n";
}
