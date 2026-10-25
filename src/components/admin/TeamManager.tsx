"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import type { TeamRecord } from "@/modules/teams/team.types";
import { DeleteButton } from "./DeleteButton";
import { Field, Input, Notice, Panel } from "./ui";

type Draft = {
  name: string;
  short: string;
  color: string;
  played: string;
  won: string;
  lost: string;
  points: string;
};

const NEW_TEAM: Draft = {
  name: "",
  short: "",
  color: "#1e4fa0",
  played: "0",
  won: "0",
  lost: "0",
  points: "0",
};

const toDraft = (team: TeamRecord): Draft => ({
  name: team.name,
  short: team.short,
  color: team.color,
  played: String(team.played),
  won: String(team.won),
  lost: String(team.lost),
  points: String(team.points),
});

const toBody = (draft: Draft) => ({
  name: draft.name,
  short: draft.short,
  color: draft.color,
  played: Number(draft.played || 0),
  won: Number(draft.won || 0),
  lost: Number(draft.lost || 0),
  points: Number(draft.points || 0),
});

function TeamCard({ team }: { team?: TeamRecord }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(team ? toDraft(team) : NEW_TEAM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const isLions = Boolean(team?.isLions);
  const set = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSaved(false);
  };

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const body = toBody(draft);
    const result = team
      ? await sendJson(`/api/teams/${team.id}`, body, "PATCH")
      : await sendJson("/api/teams", body);
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    if (team) {
      setSaved(true);
    } else {
      setDraft(NEW_TEAM);
    }
    router.refresh();
  }

  const number = (key: "played" | "won" | "lost" | "points", label: string) => (
    <Field label={label} htmlFor={`${team?.id ?? "new"}-${key}`}>
      <Input
        id={`${team?.id ?? "new"}-${key}`}
        type="number"
        inputMode="numeric"
        min={0}
        max={999}
        value={draft[key]}
        onChange={(e) => set({ [key]: e.target.value })}
      />
    </Field>
  );

  return (
    <form onSubmit={save} noValidate className="rounded-xl border border-green-dark/15 bg-white p-4 shadow-sm">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem_5rem]">
        <Field label="Team name" htmlFor={`${team?.id ?? "new"}-name`}>
          <Input
            id={`${team?.id ?? "new"}-name`}
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            maxLength={40}
            placeholder="For example Milano XI"
            required
          />
        </Field>
        <Field label="Badge letters" htmlFor={`${team?.id ?? "new"}-short`}>
          <Input
            id={`${team?.id ?? "new"}-short`}
            value={draft.short}
            onChange={(e) => set({ short: e.target.value.toUpperCase() })}
            maxLength={3}
            placeholder="ML"
            disabled={isLions}
            required
          />
        </Field>
        <Field label="Colour" htmlFor={`${team?.id ?? "new"}-color`}>
          <input
            id={`${team?.id ?? "new"}-color`}
            type="color"
            value={draft.color}
            onChange={(e) => set({ color: e.target.value })}
            disabled={isLions}
            className="h-[2.65rem] w-full cursor-pointer rounded-lg border border-green-dark/25 bg-white p-1 disabled:opacity-50"
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {number("played", "Played")}
        {number("won", "Won")}
        {number("lost", "Lost")}
        {number("points", "Points")}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="dark" disabled={saving} className="px-5 py-2">
          {saving ? "Saving..." : team ? "Save row" : "Add team"}
        </Button>
        {saved && <span className="text-sm font-semibold text-flag-green">Saved</span>}
        {isLions && (
          <span className="text-xs text-ink/55">
            The Lions use the crest as their badge and can not be deleted.
          </span>
        )}
        {team && !isLions && (
          <DeleteButton
            endpoint={`/api/teams/${team.id}`}
            itemName={team.name}
            message={`${team.name} will be removed from the points table. A team that has matches can not be deleted.`}
          />
        )}
      </div>
    </form>
  );
}

export function TeamManager({ teams }: { teams: TeamRecord[] }) {
  return (
    <div className="space-y-6">
      <ol className="space-y-3">
        {teams.map((team, index) => (
          <li key={team.id} className="flex gap-3">
            <span className="mt-4 w-6 shrink-0 text-center text-sm font-bold text-ink/50">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <TeamCard team={team} />
            </div>
          </li>
        ))}
      </ol>

      <Panel>
        <h2 className="font-heading text-lg font-bold text-green-dark">Add a team</h2>
        <p className="mb-4 mt-1 text-sm text-ink/60">
          Add each team of the league here. Then you can pick it when adding a match.
        </p>
        <TeamCard />
      </Panel>
    </div>
  );
}
