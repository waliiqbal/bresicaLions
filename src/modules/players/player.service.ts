import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { removeStoredImage } from "@/lib/images";
import { fail, type Failure } from "@/lib/result";
import { escapeRegExp, uniqueSlug } from "@/lib/slug";
import type { CreatePlayerInput, UpdatePlayerInput } from "./player.dto";
import { PlayerModel, type PlayerDoc } from "./player.schema";
import { PLAYER_ROLES, type Player, type PlayerRole } from "./player.types";

export function isPlayerRole(value: unknown): value is PlayerRole {
  return PLAYER_ROLES.includes(value as PlayerRole);
}

export function toPlayer(doc: PlayerDoc): Player {
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    number: doc.number,
    role: doc.role,
    isCaptain: doc.isCaptain,
    battingStyle: doc.battingStyle,
    bowlingStyle: doc.bowlingStyle,
    bio: doc.bio,
    image: doc.image?.url || undefined,
    imagePublicId: doc.image?.publicId || undefined,
    isDemo: doc.isDemo,
  };
}

// ------------------------------------------------------------ public site

const BY_NUMBER = { number: 1, name: 1 } as const;

export async function getPlayers(role?: PlayerRole): Promise<Player[]> {
  await connectDB();
  const docs = await PlayerModel.find(role ? { role } : {})
    .sort(BY_NUMBER)
    .lean<PlayerDoc[]>();
  return docs.map(toPlayer);
}

export async function getPlayerBySlug(slug: string) {
  await connectDB();
  const doc = await PlayerModel.findOne({ slug }).lean<PlayerDoc>();
  return doc ? toPlayer(doc) : null;
}

export async function getPlayerSlugs() {
  await connectDB();
  const docs = await PlayerModel.find().select("slug").lean<PlayerDoc[]>();
  return docs.map((d) => d.slug);
}

/** Players with the same role first, then the rest of the squad. */
export async function getRelatedPlayers(player: Player, limit = 4) {
  await connectDB();
  const docs = await PlayerModel.find({ _id: { $ne: player.id } })
    .sort(BY_NUMBER)
    .lean<PlayerDoc[]>();
  const others = docs.map(toPlayer);
  const sameRole = others.filter((p) => p.role === player.role);
  const rest = others.filter((p) => p.role !== player.role);
  return [...sameRole, ...rest].slice(0, limit);
}

// ------------------------------------------------------------ admin panel

export async function listPlayersForAdmin({
  query,
  role,
}: { query?: string; role?: PlayerRole } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;

  const needle = query?.trim();
  if (needle) {
    const pattern = new RegExp(escapeRegExp(needle), "i");
    filter.$or = [{ name: pattern }, { role: pattern }];
  }
  const docs = await PlayerModel.find(filter).sort(BY_NUMBER).lean<PlayerDoc[]>();
  return docs.map(toPlayer);
}

export async function countPlayers() {
  await connectDB();
  return PlayerModel.countDocuments();
}

export async function getPlayerForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await PlayerModel.findById(id).lean<PlayerDoc>();
  return doc ? toPlayer(doc) : null;
}

const slugTaken = async (slug: string) => Boolean(await PlayerModel.exists({ slug }));

/** A squad has one captain: naming a new one removes the badge from the old one. */
async function clearOtherCaptains(exceptId?: string) {
  await PlayerModel.updateMany(
    { isCaptain: true, ...(exceptId ? { _id: { $ne: exceptId } } : {}) },
    { $set: { isCaptain: false } },
  );
}

export async function createPlayer(
  input: CreatePlayerInput,
): Promise<{ ok: true; player: Player } | Failure> {
  await connectDB();
  const slug = await uniqueSlug(input.name, slugTaken, "player");
  if (input.isCaptain) await clearOtherCaptains();

  const doc = await PlayerModel.create({
    name: input.name,
    slug,
    number: input.number,
    role: input.role,
    isCaptain: input.isCaptain ?? false,
    battingStyle: input.battingStyle ?? "",
    bowlingStyle: input.bowlingStyle ?? "",
    bio: input.bio ?? "",
    image: input.image ?? null,
  });
  return { ok: true, player: toPlayer(doc.toObject()) };
}

export async function updatePlayer(
  id: string,
  input: UpdatePlayerInput,
): Promise<{ ok: true; player: Player } | Failure> {
  if (!mongoose.isValidObjectId(id)) return fail("not_found", "Player not found.");
  await connectDB();
  const current = await PlayerModel.findById(id).lean<PlayerDoc>();
  if (!current) return fail("not_found", "Player not found.");

  // The web address (slug) stays the same when a player is renamed, so
  // shared links keep working.
  const update: Record<string, unknown> = {};
  for (const key of ["name", "number", "role", "isCaptain", "battingStyle", "bowlingStyle", "bio"] as const) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  if (input.image !== undefined) update.image = input.image;
  if (input.isCaptain) await clearOtherCaptains(id);

  const saved = await PlayerModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: "after" },
  ).lean<PlayerDoc>();

  // The old photo is no longer used: free it on Cloudinary.
  if (input.image !== undefined && current.image?.publicId && current.image.publicId !== input.image?.publicId) {
    await removeStoredImage(current.image);
  }
  return { ok: true, player: toPlayer(saved!) };
}

export async function deletePlayer(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  const doc = await PlayerModel.findByIdAndDelete(id).lean<PlayerDoc>();
  if (!doc) return false;
  await removeStoredImage(doc.image);
  return true;
}
