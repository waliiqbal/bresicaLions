import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { removeStoredImage } from "@/lib/images";
import { fail, type Failure } from "@/lib/result";
import { escapeRegExp, uniqueSlug } from "@/lib/slug";
import type { CreateStaffInput, UpdateStaffInput } from "./staff.dto";
import { StaffModel, type StaffDoc } from "./staff.schema";
import type { StaffMember } from "./staff.types";

const IN_ORDER = { order: 1, createdAt: 1 } as const;

export function toStaff(doc: StaffDoc): StaffMember {
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    role: doc.role,
    bio: doc.bio || undefined,
    profile: doc.profile || undefined,
    experience: doc.experience || undefined,
    speciality: doc.speciality || undefined,
    image: doc.image?.url || undefined,
    imagePublicId: doc.image?.publicId || undefined,
    order: doc.order,
    isDemo: doc.isDemo,
  };
}

// ------------------------------------------------------------ public site

/** Coaching and support staff shown under the squad and on /about. */
export async function getSupportStaff() {
  await connectDB();
  const docs = await StaffModel.find().sort(IN_ORDER).lean<StaffDoc[]>();
  return docs.map(toStaff);
}

export async function getStaffBySlug(slug: string) {
  await connectDB();
  const doc = await StaffModel.findOne({ slug }).lean<StaffDoc>();
  return doc ? toStaff(doc) : null;
}

export async function getStaffSlugs() {
  await connectDB();
  const docs = await StaffModel.find().select("slug").lean<StaffDoc[]>();
  return docs.map((d) => d.slug);
}

// ------------------------------------------------------------ admin panel

export async function listStaffForAdmin(query?: string) {
  await connectDB();
  const needle = query?.trim();
  const filter = needle
    ? {
        $or: [
          { name: new RegExp(escapeRegExp(needle), "i") },
          { role: new RegExp(escapeRegExp(needle), "i") },
        ],
      }
    : {};
  const docs = await StaffModel.find(filter).sort(IN_ORDER).lean<StaffDoc[]>();
  return docs.map(toStaff);
}

export async function countStaff() {
  await connectDB();
  return StaffModel.countDocuments();
}

export async function getStaffForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await StaffModel.findById(id).lean<StaffDoc>();
  return doc ? toStaff(doc) : null;
}

const slugTaken = async (slug: string) => Boolean(await StaffModel.exists({ slug }));

export async function createStaff(
  input: CreateStaffInput,
): Promise<{ ok: true; staff: StaffMember } | Failure> {
  await connectDB();
  const slug = await uniqueSlug(input.name, slugTaken, "staff");
  const last = await StaffModel.findOne().sort({ order: -1 }).lean<StaffDoc>();

  const doc = await StaffModel.create({
    name: input.name,
    slug,
    role: input.role,
    bio: input.bio ?? "",
    profile: input.profile ?? "",
    experience: input.experience ?? "",
    speciality: input.speciality ?? "",
    image: input.image ?? null,
    order: (last?.order ?? 0) + 1,
  });
  return { ok: true, staff: toStaff(doc.toObject()) };
}

export async function updateStaff(
  id: string,
  input: UpdateStaffInput,
): Promise<{ ok: true; staff: StaffMember } | Failure> {
  if (!mongoose.isValidObjectId(id)) return fail("not_found", "Staff member not found.");
  await connectDB();
  const current = await StaffModel.findById(id).lean<StaffDoc>();
  if (!current) return fail("not_found", "Staff member not found.");

  // The web address (slug) stays the same when someone is renamed.
  const update: Record<string, unknown> = {};
  for (const key of ["name", "role", "bio", "profile", "experience", "speciality"] as const) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  if (input.image !== undefined) update.image = input.image;

  const saved = await StaffModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: "after" },
  ).lean<StaffDoc>();

  if (input.image !== undefined && current.image?.publicId && current.image.publicId !== input.image?.publicId) {
    await removeStoredImage(current.image);
  }
  return { ok: true, staff: toStaff(saved!) };
}

export async function deleteStaff(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  const doc = await StaffModel.findByIdAndDelete(id).lean<StaffDoc>();
  if (!doc) return false;
  await removeStoredImage(doc.image);
  return true;
}

/** `ids` is the new order, first to last. */
export async function reorderStaff(ids: string[]) {
  await connectDB();
  await StaffModel.bulkWrite(
    ids
      .filter((id) => mongoose.isValidObjectId(id))
      .map((id, index) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index + 1 } } },
      })),
  );
}
