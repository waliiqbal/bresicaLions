import mongoose, { Schema, type Model } from "mongoose";
import { connectDB } from "@/lib/db";

interface RateLimitDoc {
  key: string;
  count: number;
  expiresAt: Date;
}

const rateLimitSchema = new Schema<RateLimitDoc>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  // MongoDB deletes the document by itself once this time has passed.
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const RateLimitModel: Model<RateLimitDoc> =
  (mongoose.models.RateLimit as Model<RateLimitDoc> | undefined) ??
  mongoose.model<RateLimitDoc>("RateLimit", rateLimitSchema);

/**
 * Counts one attempt for `key` and tells if it is still allowed. The counter
 * lives in the database, so it works on serverless hosts where memory is not
 * shared between requests.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  await connectDB();
  const now = new Date();

  // An expired counter may not be cleaned up yet: start fresh.
  await RateLimitModel.deleteOne({ key, expiresAt: { $lte: now } });

  const hit = () =>
    RateLimitModel.findOneAndUpdate(
      { key },
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(now.getTime() + windowSeconds * 1000) },
      },
      { upsert: true, returnDocument: "after" },
    ).lean<RateLimitDoc>();

  let doc: RateLimitDoc | null;
  try {
    doc = await hit();
  } catch (error) {
    // Two first requests at once: the second one finds the counter now.
    if ((error as { code?: number }).code !== 11000) throw error;
    doc = await hit();
  }

  const retryAfter = Math.max(1, Math.ceil((doc!.expiresAt.getTime() - now.getTime()) / 1000));
  return { allowed: doc!.count <= limit, retryAfter };
}
