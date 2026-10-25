"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { isoToRomeLocal, romeLocalToIso } from "@/lib/datetime";
import type { Match, MatchResult } from "@/modules/matches/match.types";
import type { TeamRecord } from "@/modules/teams/team.types";
import { Field, Input, Notice, Panel, Select } from "./ui";

const RESULTS: { value: MatchResult; label: string }[] = [
  { value: "won", label: "Brescia Lions won" },
  { value: "lost", label: "Brescia Lions lost" },
  { value: "tie", label: "Tie" },
  { value: "no-result", label: "No result" },
];

export function MatchForm({
  teams,
  match,
}: {
  teams: TeamRecord[];
  match?: Match;
}) {
  const router = useRouter();
  const lions = teams.find((t) => t.isLions);

  const [homeTeamId, setHomeTeamId] = useState(match?.homeTeamId ?? lions?.id ?? "");
  const [awayTeamId, setAwayTeamId] = useState(match?.awayTeamId ?? "");
  const [date, setDate] = useState(match ? isoToRomeLocal(match.date) : "");
  const [ground, setGround] = useState(match?.ground ?? "Brescia Cricket Ground");
  const [status, setStatus] = useState<Match["status"]>(match?.status ?? "upcoming");
  const [homeScore, setHomeScore] = useState(match?.homeScore ?? "");
  const [awayScore, setAwayScore] = useState(match?.awayScore ?? "");
  const [result, setResult] = useState<MatchResult | "">(match?.result ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  const homeName = teams.find((t) => t.id === homeTeamId)?.name ?? "Home team";
  const awayName = teams.find((t) => t.id === awayTeamId)?.name ?? "Away team";
  const lionsPlay = Boolean(lions && (homeTeamId === lions.id || awayTeamId === lions.id));
  const completed = status === "completed";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFields({});

    const iso = romeLocalToIso(date);
    if (!iso) {
      setFields({ date: ["Choose the match date and time."] });
      return;
    }

    setSaving(true);
    const body = {
      homeTeamId,
      awayTeamId,
      date: iso,
      ground,
      status,
      ...(completed && {
        homeScore,
        awayScore,
        result: lionsPlay ? result || null : null,
      }),
    };
    const saved = match
      ? await sendJson(`/api/matches/${match.id}`, body, "PATCH")
      : await sendJson("/api/matches", body);
    setSaving(false);

    if (!saved.ok) {
      setFields(saved.fields ?? {});
      setError(saved.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/admin/matches?notice=${match ? "updated" : "created"}${completed ? "&tab=results" : ""}`);
    router.refresh();
  }

  const firstError = (key: string) => fields[key]?.[0];
  const teamOptions = (
    <>
      <option value="">Choose a team...</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </>
  );

  return (
    <form onSubmit={submit} noValidate>
      {error && <Notice tone="error">{error}</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/matches" className="text-sm font-semibold text-green-card hover:underline">
          ← All matches
        </Link>
        <Button type="submit" variant="dark" disabled={saving}>
          {saving ? "Saving..." : match ? "Save changes" : "Add match"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Home team" htmlFor="home" error={firstError("homeTeamId")}>
                <Select id="home" value={homeTeamId} onChange={(e) => setHomeTeamId(e.target.value)}>
                  {teamOptions}
                </Select>
              </Field>
              <Field label="Away team" htmlFor="away" error={firstError("awayTeamId")}>
                <Select id="away" value={awayTeamId} onChange={(e) => setAwayTeamId(e.target.value)}>
                  {teamOptions}
                </Select>
              </Field>
            </div>
            {teams.length < 2 && (
              <p className="text-sm text-ink/70">
                You need at least two teams.{" "}
                <Link href="/admin/points-table" className="font-semibold text-green-card underline">
                  Add the other teams in the Points Table
                </Link>{" "}
                first.
              </p>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Date and time"
                htmlFor="date"
                error={firstError("date")}
                hint="Italian time (Brescia)."
              >
                <Input id="date" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
              </Field>
              <Field label="Ground" htmlFor="ground" error={firstError("ground")}>
                <Input id="ground" value={ground} onChange={(e) => setGround(e.target.value)} maxLength={80} required />
              </Field>
            </div>
          </Panel>

          {completed && (
            <Panel className="space-y-5">
              <h2 className="font-heading text-lg font-bold text-green-dark">Result</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={`${homeName} score`} htmlFor="home-score" error={firstError("homeScore")} hint="For example 112/4">
                  <Input id="home-score" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} maxLength={20} />
                </Field>
                <Field label={`${awayName} score`} htmlFor="away-score" error={firstError("awayScore")} hint="For example 108/7">
                  <Input id="away-score" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} maxLength={20} />
                </Field>
              </div>
              {lionsPlay ? (
                <Field label="Result" htmlFor="result" error={firstError("result")}>
                  <Select id="result" value={result} onChange={(e) => setResult(e.target.value as MatchResult | "")}>
                    <option value="">Choose the result...</option>
                    {RESULTS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : (
                <p className="text-sm text-ink/60">
                  The Won/Lost label is only shown for matches played by the Brescia Lions.
                </p>
              )}
              <p className="text-xs text-ink/55">
                Remember to update the{" "}
                <Link href="/admin/points-table" className="font-semibold text-green-card underline">
                  Points Table
                </Link>{" "}
                too. It is not changed automatically.
              </p>
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel>
            <Field label="Match status" htmlFor="status">
              <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as Match["status"])}>
                <option value="upcoming">Upcoming (not played yet)</option>
                <option value="completed">Finished (add the result)</option>
              </Select>
            </Field>
            <p className="mt-3 text-xs text-ink/55">
              Upcoming matches appear under Fixtures. Finished matches appear under Results with their score.
            </p>
          </Panel>
        </div>
      </div>
    </form>
  );
}
