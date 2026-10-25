"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { PLAYER_ROLES, type Player, type PlayerRole } from "@/modules/players/player.types";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";
import { Checkbox, Field, Input, Notice, Panel, Select, Textarea } from "./ui";

export function PlayerForm({ player }: { player?: Player }) {
  const router = useRouter();
  const savedImage: UploadedImage | null = player?.image
    ? { url: player.image, publicId: player.imagePublicId }
    : null;

  const [name, setName] = useState(player?.name ?? "");
  const [number, setNumber] = useState(player ? String(player.number) : "");
  const [role, setRole] = useState<PlayerRole>(player?.role ?? "Batter");
  const [isCaptain, setIsCaptain] = useState(player?.isCaptain ?? false);
  const [battingStyle, setBattingStyle] = useState(player?.battingStyle ?? "");
  const [bowlingStyle, setBowlingStyle] = useState(player?.bowlingStyle ?? "");
  const [bio, setBio] = useState(player?.bio ?? "");
  const [image, setImage] = useState<UploadedImage | null>(savedImage);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFields({});
    setSaving(true);

    const body: Record<string, unknown> = {
      name,
      number: number.trim() === "" ? undefined : Number(number),
      role,
      isCaptain,
      battingStyle,
      bowlingStyle,
      bio,
    };
    if (!player || image?.url !== savedImage?.url) {
      body.image = image ? { url: image.url, publicId: image.publicId } : null;
    }

    const result = player
      ? await sendJson(`/api/players/${player.id}`, body, "PATCH")
      : await sendJson("/api/players", body);
    setSaving(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/admin/squad?notice=${player ? "player-updated" : "player-created"}`);
    router.refresh();
  }

  const firstError = (key: string) => fields[key]?.[0];

  return (
    <form onSubmit={submit} noValidate>
      {error && <Notice tone="error">{error}</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/squad" className="text-sm font-semibold text-green-card hover:underline">
          ← Squad
        </Link>
        <Button type="submit" variant="dark" disabled={saving}>
          {saving ? "Saving..." : player ? "Save changes" : "Add player"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel className="space-y-5">
            <Field label="Player name" htmlFor="name" error={firstError("name")}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Shirt number" htmlFor="number" error={firstError("number")}>
                <Input
                  id="number"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={999}
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </Field>
              <Field label="Role" htmlFor="role" error={firstError("role")}>
                <Select id="role" value={role} onChange={(e) => setRole(e.target.value as PlayerRole)}>
                  {PLAYER_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Batting style" htmlFor="batting" error={firstError("battingStyle")} hint="For example Right-hand bat">
                <Input id="batting" value={battingStyle} onChange={(e) => setBattingStyle(e.target.value)} maxLength={60} />
              </Field>
              <Field label="Bowling style" htmlFor="bowling" error={firstError("bowlingStyle")} hint="For example Right-arm fast">
                <Input id="bowling" value={bowlingStyle} onChange={(e) => setBowlingStyle(e.target.value)} maxLength={60} />
              </Field>
            </div>
            <Field label="Profile" htmlFor="bio" error={firstError("bio")} hint={`${bio.length}/2000. Shown on the player page.`}>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={6} maxLength={2000} />
            </Field>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <ImageDropzone
              folder="players"
              label="Player photo"
              size="800 × 1000 px (4:5 portrait)"
              hint="Face and shoulders in the upper middle. Without a photo the card shows the green background."
              value={image}
              onChange={(value) => {
                setImage(value);
                setError("");
                setFields({});
              }}
              persistedPublicId={savedImage?.publicId}
            />
            {firstError("image") && <p role="alert" className="mt-2 text-xs text-flag-red">{firstError("image")}</p>}
          </Panel>
          <Panel>
            <Checkbox
              label="Team captain"
              hint="Shows the Captain badge. Only one player can be captain, the old captain loses the badge."
              checked={isCaptain}
              onChange={(e) => setIsCaptain(e.target.checked)}
            />
          </Panel>
        </div>
      </div>
    </form>
  );
}
