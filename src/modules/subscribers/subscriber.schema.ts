import mongoose, { Schema, type Model } from "mongoose";

export interface SubscriberDoc {
  _id: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriberSchema = new Schema<SubscriberDoc>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  },
  { timestamps: true },
);

export const SubscriberModel: Model<SubscriberDoc> =
  (mongoose.models.Subscriber as Model<SubscriberDoc> | undefined) ??
  mongoose.model<SubscriberDoc>("Subscriber", subscriberSchema);
