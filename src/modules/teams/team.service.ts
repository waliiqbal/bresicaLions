import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, type Failure } from "@/lib/result";
import { escapeRegExp } from "@/lib/slug";
import { MatchModel } from "@/modules/matches/match.schema";
import type { StandingRow, Team } from "@/modules/matches/match.types";
import type { CreateTeamInput, UpdateTeamInput } from "./team.dto";
import { TeamModel, type TeamDoc } from "./team.schema";
import type { TeamRecord } from "./team.types";

const LIONS = {
  name: "Brescia Lions",
  short: "BL",
  color: "#0b3d22",
  isLions: true,
};

export function toTeam(doc: TeamDoc): Team {
  return {
    id: String(doc._id),
    name: doc.name,
    short: doc.short,
    color: doc.color,
    isLions: doc.isLions || undefined,
  };
}

export function toTeamRecord(doc: TeamDoc): TeamRecord {
  return {
    ...toTeam(doc),
    played: doc.played,
    won: doc.won,
    lost: doc.lost,
    points: doc.points,
  };
}

/** The Lions are always a team: created on first use, never deletable. */
export async function ensureLionsTeam() {
  await connectDB();
  const doc = await TeamModel.findOneAndUpdate(
    { isLions: true },
    { $setOnInsert: LIONS },
    { upsert: true, returnDocument: "after" },
  ).lean<TeamDoc>();
  return toTeamRecord(doc!);
}

// ------------------------------------------------------------ public site

const byRank = (a: TeamDoc, b: TeamDoc) =>
  b.points - a.points || b.won - a.won || a.name.localeCompare(b.name);

export async function getStandings(): Promise<StandingRow[]> {
  await connectDB();
  const docs = await TeamModel.find().lean<TeamDoc[]>();

  // Before any team is added the table shows the Lions on zero.
  if (docs.length === 0) {
    return [
      {
        teamId: "lions",
        played: 0,
        won: 0,
        lost: 0,
        points: 0,
        position: 1,
        team: { id: "lions", ...LIONS },
      },
    ];
  }
  return docs.sort(byRank).map((doc, index) => ({
    teamId: String(doc._id),
    played: doc.played,
    won: doc.won,
    lost: doc.lost,
    points: doc.points,
    position: index + 1,
    team: toTeam(doc),
  }));
}

// ------------------------------------------------------------ admin panel

export async function listTeamsForAdmin() {
  await ensureLionsTeam();
  const docs = await TeamModel.find().lean<TeamDoc[]>();
  return docs.sort(byRank).map(toTeamRecord);
}

const nameTaken = async (name: string, exceptId?: string) =>
  Boolean(
    await TeamModel.exists({
      name: new RegExp(`^${escapeRegExp(name)}$`, "i"),
      ...(exceptId ? { _id: { $ne: exceptId } } : {}),
    }),
  );

const NAME_TAKEN = fail("name_taken", "A team with this name already exists.");
const BAD_STATS = fail(
  "invalid",
  "Won plus lost cannot be more than the matches played.",
);

export async function createTeam(
  input: CreateTeamInput,
): Promise<{ ok: true; team: TeamRecord } | Failure> {
  await connectDB();
  if (await nameTaken(input.name)) return NAME_TAKEN;

  const played = input.played ?? 0;
  if ((input.won ?? 0) + (input.lost ?? 0) > played) return BAD_STATS;

  const doc = await TeamModel.create({
    name: input.name,
    short: input.short,
    color: input.color,
    played,
    won: input.won ?? 0,
    lost: input.lost ?? 0,
    points: input.points ?? 0,
  });
  return { ok: true, team: toTeamRecord(doc.toObject()) };
}

export async function updateTeam(
  id: string,
  input: UpdateTeamInput,
): Promise<{ ok: true; team: TeamRecord } | Failure> {
  if (!mongoose.isValidObjectId(id)) return fail("not_found", "Team not found.");
  await connectDB();
  const current = await TeamModel.findById(id).lean<TeamDoc>();
  if (!current) return fail("not_found", "Team not found.");

  if (input.name && (await nameTaken(input.name, id))) return NAME_TAKEN;

  const played = input.played ?? current.played;
  const won = input.won ?? current.won;
  const lost = input.lost ?? current.lost;
  if (won + lost > played) return BAD_STATS;

  const update: Record<string, unknown> = {};
  for (const key of ["name", "short", "color", "played", "won", "lost", "points"] as const) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  const saved = await TeamModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: "after" },
  ).lean<TeamDoc>();
  return { ok: true, team: toTeamRecord(saved!) };
}

export async function deleteTeam(id: string): Promise<{ ok: true } | Failure> {
  if (!mongoose.isValidObjectId(id)) return fail("not_found", "Team not found.");
  await connectDB();
  const team = await TeamModel.findById(id).lean<TeamDoc>();
  if (!team) return fail("not_found", "Team not found.");
  if (team.isLions) {
    return fail("not_allowed", "The Brescia Lions team cannot be deleted.");
  }

  if (await MatchModel.exists({ $or: [{ homeTeam: id }, { awayTeam: id }] })) {
    return fail("in_use", "This team has matches. Delete or change those matches first.");
  }
  await TeamModel.findByIdAndDelete(id);
  return { ok: true };
}
