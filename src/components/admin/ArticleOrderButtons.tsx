"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { sendJson } from "@/lib/client-api";

type ArticleOrderButtonsProps = {
  /** Every story id in the order shown on the page. */
  ids: string[];
  index: number;
  title: string;
};

/** Up/down arrows: the order here is the order on the home page and the News page. */
export function ArticleOrderButtons({ ids, index, title }: ArticleOrderButtonsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function move(direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    const next = [...ids];
    [next[index], next[target]] = [next[target], next[index]];

    setBusy(true);
    setError("");
    const result = await sendJson("/api/articles/reorder", { ids: next });
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.refresh();
  }

  const arrow =
    "rounded border border-green-dark/25 px-2 py-0.5 text-sm text-green-dark hover:bg-green-dark/10 disabled:opacity-30";

  return (
    <div className="flex items-center gap-3 sm:w-12 sm:flex-col sm:gap-1">
      <button
        type="button"
        aria-label={`Move “${title}” up`}
        disabled={busy || index === 0}
        onClick={() => move(-1)}
        className={arrow}
      >
        ▲
      </button>
      <span className="w-6 text-center text-sm font-bold text-ink/60">{index + 1}</span>
      <button
        type="button"
        aria-label={`Move “${title}” down`}
        disabled={busy || index === ids.length - 1}
        onClick={() => move(1)}
        className={arrow}
      >
        ▼
      </button>
      {error && (
        <span role="alert" className="text-xs text-flag-red">
          {error}
        </span>
      )}
    </div>
  );
}
