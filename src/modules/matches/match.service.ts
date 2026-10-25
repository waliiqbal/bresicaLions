import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { fail, type Failure } from "@/lib/result";
import { TeamModel, type TeamDoc } from "@/modules/teams/team.schema";
import { toTeam } from "@/modules/teams/team.service";
import type { CreateMatchInput, UpdateMatchInput } from "./match.dto";
import { MatchModel, type MatchDoc } from "./match.schema";
import type { Match, MatchWithTeams } from "./match.types";

function toMatch(doc: MatchDoc): Match {
  return {
    id: String(doc._id),
    homeTeamId: String(doc.homeTeam),
    awayTeamId: String(doc.awayTeam),
    date: doc.date.toISOString(),
    ground: doc.ground,
    status: doc.status,
    homeScore: doc.homeScore || undefined,
    awayScore: doc.awayScore || undefined,
    result: doc.result || undefined,
  };
}

async function withTeams(docs: MatchDoc[]): Promise<MatchWithTeams[]> {
  if (docs.length === 0) return [];
  const teamDocs = await TeamModel.find().lean<TeamDoc[]>();
  const teams = new Map(teamDocs.map((t) => [String(t._id), toTeam(t)]));

  return docs.flatMap((doc) => {
    const home = teams.get(String(doc.homeTeam));
    const away = teams.get(String(doc.awayTeam));
    return home && away ? [{ ...toMatch(doc), home, away }] : [];
  });
}

// ------------------------------------------------------------ public site

/** Soonest first. */
export async function getUpcomingMatches(limit?: number) {
  await connectDB();
  const query = MatchModel.find({ status: "upcoming", date: { $gte: new Date() } }).sort({ date: 1 });
  if (limit) query.limit(limit);
  return withTeams(await query.lean<MatchDoc[]>());
}

/** Latest first. */
export async function getResults(limit?: number) {
  await connectDB();
  const query = MatchModel.find({ status: "completed" }).sort({ date: -1 });
  if (limit) query.limit(limit);
  return withTeams(await query.lean<MatchDoc[]>());
}

/** Upcoming matches (soonest first) followed by results (latest first). */
export async function getAllMatches() {
  const [upcoming, results] = await Promise.all([
    getUpcomingMatches(),
    getResults(),
  ]);
  return [...upcoming, ...results];
}

// ------------------------------------------------------------ admin panel

export type MatchTabFilter = "all" | "upcoming" | "results";

export async function listMatchesForAdmin({
  tab = "all",
  query,
}: { tab?: MatchTabFilter; query?: string } = {}) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (tab === "upcoming") filter.status = "upcoming";
  if (tab === "results") filter.status = "completed";

  const docs = await MatchModel.find(filter).lean<MatchDoc[]>();
  let matches = await withTeams(docs);

  const needle = query?.trim().toLowerCase();
  if (needle) {
    matches = matches.filter((m) =>
      [m.home.name, m.away.name, m.ground].some((text) => text.toLowerCase().includes(needle)),
    );
  }

  const time = (m: Match) => new Date(m.date).getTime();
  const upcoming = matches.filter((m) => m.status === "upcoming").sort((a, b) => time(a) - time(b));
  const results = matches.filter((m) => m.status === "completed").sort((a, b) => time(b) - time(a));
  return [...upcoming, ...results];
}

/** A match that was not marked finished although its time has passed. */
export function needsResult(match: Match) {
  return match.status === "upcoming" && new Date(match.date).getTime() < Date.now();
}

export async function countMatches() {
  await connectDB();
  const [upcoming, results] = await Promise.all([
    MatchModel.countDocuments({ status: "upcoming", date: { $gte: new Date() } }),
    MatchModel.countDocuments({ status: "completed" }),
  ]);
  return { upcoming, results };
}

export async function getMatchForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await MatchModel.findById(id).lean<MatchDoc>();
  return doc ? toMatch(doc) : null;
}

interface MatchFields {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  ground: string;
  status: "upcoming" | "completed";
  homeScore?: string;
  awayScore?: string;
  result?: Match["result"] | null;
}

/** Checks the whole match and works out what to save and what to clear. */
async function prepare(
  fields: MatchFields,
): Promise<{ ok: true; set: Record<string, unknown>; unset: string[] } | Failure> {
  if (fields.homeTeamId === fields.awayTeamId) {
    return fail("invalid", "Choose two different teams.");
  }
  if (!mongoose.isValidObjectId(fields.homeTeamId) || !mongoose.isValidObjectId(fields.awayTeamId)) {
    return fail("invalid", "Choose the teams from the list.");
  }
  const teams = await TeamModel.find({
    _id: { $in: [fields.homeTeamId, fields.awayTeamId] },
  }).lean<TeamDoc[]>();
  if (teams.length !== 2) return fail("invalid", "Choose the teams from the list.");

  const set: Record<string, unknown> = {
    homeTeam: fields.homeTeamId,
    awayTeam: fields.awayTeamId,
    date: new Date(fields.date),
    ground: fields.ground,
    status: fields.status,
  };
  const unset: string[] = [];

  if (fields.status === "upcoming") {
    unset.push("homeScore", "awayScore", "result");
    return { ok: true, set, unset };
  }

  if (!fields.homeScore || !fields.awayScore) {
    return fail("invalid", "Write the score of both teams for a finished match.");
  }
  set.homeScore = fields.homeScore;
  set.awayScore = fields.awayScore;

  // The result is shown from the Lions' point of view.
  if (teams.some((t) => t.isLions)) {
    if (!fields.result) return fail("invalid", "Choose the result: Won, Lost, Tie or No result.");
    set.result = fields.result;
  } else {
    unset.push("result");
  }
  return { ok: true, set, unset };
}

export async function createMatch(
  input: CreateMatchInput,
): Promise<{ ok: true; match: Match } | Failure> {
  await connectDB();
  const prepared = await prepare(input);
  if (!prepared.ok) return prepared;

  const doc = await MatchModel.create(prepared.set);
  return { ok: true, match: toMatch(doc.toObject()) };
}

export async function updateMatch(
  id: string,
  input: UpdateMatchInput,
): Promise<{ ok: true; match: Match } | Failure> {
  if (!mongoose.isValidObjectId(id)) return fail("not_found", "Match not found.");
  await connectDB();
  const current = await MatchModel.findById(id).lean<MatchDoc>();
  if (!current) return fail("not_found", "Match not found.");

  const prepared = await prepare({
    homeTeamId: input.homeTeamId ?? String(current.homeTeam),
    awayTeamId: input.awayTeamId ?? String(current.awayTeam),
    date: input.date ?? current.date.toISOString(),
    ground: input.ground ?? current.ground,
    status: input.status ?? current.status,
    homeScore: input.homeScore ?? current.homeScore,
    awayScore: input.awayScore ?? current.awayScore,
    result: input.result !== undefined ? input.result : current.result,
  });
  if (!prepared.ok) return prepared;

  const saved = await MatchModel.findByIdAndUpdate(
    id,
    {
      $set: prepared.set,
      ...(prepared.unset.length && {
        $unset: Object.fromEntries(prepared.unset.map((key) => [key, ""])),
      }),
    },
    { returnDocument: "after" },
  ).lean<MatchDoc>();
  return { ok: true, match: toMatch(saved!) };
}

export async function deleteMatch(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  return Boolean(await MatchModel.findByIdAndDelete(id));
}
