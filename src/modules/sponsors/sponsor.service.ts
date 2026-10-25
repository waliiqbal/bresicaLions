import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { removeStoredImage } from "@/lib/images";
import { escapeRegExp } from "@/lib/slug";
import type { CreateSponsorInput, UpdateSponsorInput } from "./sponsor.dto";
import { SponsorModel, type SponsorDoc } from "./sponsor.schema";
import type { Sponsor } from "./sponsor.types";

const IN_ORDER = { order: 1, createdAt: 1 } as const;

export function toSponsor(doc: SponsorDoc): Sponsor {
  return {
    id: String(doc._id),
    name: doc.name,
    url: doc.url || undefined,
    logo: doc.logo?.url || undefined,
    logoPublicId: doc.logo?.publicId || undefined,
    order: doc.order,
    active: doc.active,
    isDemo: doc.isDemo,
  };
}

// ------------------------------------------------------------ public site

export async function getSponsors() {
  await connectDB();
  const docs = await SponsorModel.find({ active: true }).sort(IN_ORDER).lean<SponsorDoc[]>();
  return docs.map(toSponsor);
}

// ------------------------------------------------------------ admin panel

export async function listSponsorsForAdmin(query?: string) {
  await connectDB();
  const needle = query?.trim();
  const docs = await SponsorModel.find(
    needle ? { name: new RegExp(escapeRegExp(needle), "i") } : {},
  )
    .sort(IN_ORDER)
    .lean<SponsorDoc[]>();
  return docs.map(toSponsor);
}

export async function countSponsors() {
  await connectDB();
  const [total, active] = await Promise.all([
    SponsorModel.countDocuments(),
    SponsorModel.countDocuments({ active: true }),
  ]);
  return { total, active };
}

export async function getSponsorForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await SponsorModel.findById(id).lean<SponsorDoc>();
  return doc ? toSponsor(doc) : null;
}

export async function createSponsor(input: CreateSponsorInput) {
  await connectDB();
  const last = await SponsorModel.findOne().sort({ order: -1 }).lean<SponsorDoc>();

  const doc = await SponsorModel.create({
    name: input.name,
    url: input.url ?? "",
    logo: input.logo ?? null,
    active: input.active ?? true,
    order: (last?.order ?? 0) + 1,
  });
  return toSponsor(doc.toObject());
}

export async function updateSponsor(id: string, input: UpdateSponsorInput) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const current = await SponsorModel.findById(id).lean<SponsorDoc>();
  if (!current) return null;

  const update: Record<string, unknown> = {};
  for (const key of ["name", "url", "active"] as const) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  if (input.logo !== undefined) update.logo = input.logo;

  const saved = await SponsorModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: "after" },
  ).lean<SponsorDoc>();

  // The old logo is no longer used: free it on Cloudinary.
  if (input.logo !== undefined && current.logo?.publicId && current.logo.publicId !== input.logo?.publicId) {
    await removeStoredImage(current.logo);
  }
  return toSponsor(saved!);
}

export async function deleteSponsor(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  const doc = await SponsorModel.findByIdAndDelete(id).lean<SponsorDoc>();
  if (!doc) return false;
  await removeStoredImage(doc.logo);
  return true;
}

/** `ids` is the new order, first to last. */
export async function reorderSponsors(ids: string[]) {
  await connectDB();
  await SponsorModel.bulkWrite(
    ids
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
      })),
  );
}
