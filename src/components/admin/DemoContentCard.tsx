"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { sendJson } from "@/lib/client-api";
import { Notice, Panel } from "./ui";

type Counts = {
  articles: number;
  banners: number;
  albums: number;
  sponsors: number;
  players: number;
  staff: number;
};

const labels: [keyof Counts, string][] = [
  ["articles", "stories"],
  ["banners", "banners"],
  ["albums", "albums"],
  ["sponsors", "sponsors"],
  ["players", "players"],
  ["staff", "coaches"],
];

/** "3 stories, 2 banners" - sections with nothing are left out. */
const describe = (counts: Counts) =>
  labels
    .filter(([key]) => counts[key] > 0)
    .map(([key, label]) => `${counts[key]} ${label}`)
    .join(", ") || "nothing";

export function DemoContentCard({
  demo,
  canLoad,
}: {
  demo: Counts;
  canLoad: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"load" | "remove" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const hasDemo = labels.some(([key]) => demo[key] > 0);

  async function run(action: "load" | "remove") {
    setBusy(action);
    setError("");
    setMessage("");
    const result = await sendJson<{ result: Counts }>("/api/seed", { action });
    setBusy(null);
    setConfirming(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    const r = result.data.result;
    setMessage(`${action === "load" ? "Added" : "Removed"}: ${describe(r)}.`);
    router.refresh();
  }

  return (
    <Panel>
      <h2 className="font-heading text-xl font-bold text-green-dark">Demo content</h2>
      <p className="mt-1 text-sm text-ink/60">
        Sample stories, banners, albums, players, coaches and sponsors so the website
        looks complete while you get started. Removing demo content never touches
        anything you wrote.
      </p>

      {message && <div className="mt-4"><Notice>{message}</Notice></div>}
      {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}

      <p className="mt-4 text-sm text-ink/70">
        {hasDemo
          ? `Currently on the site: ${describe(demo)}.`
          : "No demo content is on the site."}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          type="button"
          variant="dark"
          disabled={busy !== null || !canLoad}
          onClick={() => run("load")}
        >
          {busy === "load" ? "Loading..." : "Load demo content"}
        </Button>
        <Button
          type="button"
          variant="outlineDark"
          disabled={busy !== null || !hasDemo}
          onClick={() => setConfirming(true)}
        >
          Remove demo content
        </Button>
      </div>
      {!canLoad && !hasDemo && (
        <p className="mt-3 text-xs text-ink/50">
          Demo content can only be added to sections that are still empty.
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={() => run("remove")}
        loading={busy === "remove"}
        title="Remove all demo content?"
        message="Only the sample content is deleted. Content you added yourself stays."
        confirmLabel="Remove"
      />
    </Panel>
  );
}
