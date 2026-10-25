"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { cn } from "@/lib/utils";
import { DeleteButton } from "./DeleteButton";
import { Notice, StatusPill } from "./ui";

export interface OrderedItem {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  /** Set to show the live/hidden switch. */
  active?: boolean;
  isDemo?: boolean;
}

type OrderedListProps = {
  items: OrderedItem[];
  /** REST address of the section, e.g. /api/staff. */
  apiPath: string;
  /** Admin page address of the section, e.g. /admin/squad/staff. */
  editPath: string;
  /** "Remove" text for the confirm box; {name} is replaced by the item title. */
  deleteMessage: string;
  itemName: string;
  imageFit?: "cover" | "contain";
  /** The list is filtered, so moving would mix up the real order. */
  reorderDisabled?: boolean;
};

export function OrderedList({
  items,
  apiPath,
  editPath,
  deleteMessage,
  itemName,
  imageFit = "cover",
  reorderDisabled = false,
}: OrderedListProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function run(request: Promise<{ ok: boolean; message?: string }>) {
    setBusy(true);
    setError("");
    const result = await request;
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  function move(index: number, direction: -1 | 1) {
    const ids = items.map((item) => item.id);
    const target = index + direction;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(sendJson(`${apiPath}/reorder`, { ids }));
  }

  return (
    <>
      {error && <Notice tone="error">{error}</Notice>}
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center",
              item.active === false ? "border-green-dark/10 opacity-75" : "border-green-dark/15",
            )}
          >
            {!reorderDisabled && (
              <div className="flex items-center gap-3 md:w-12 md:flex-col md:gap-1">
                <button
                  type="button"
                  aria-label={`Move “${item.title}” up`}
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded border border-green-dark/25 px-2 py-0.5 text-sm text-green-dark hover:bg-green-dark/10 disabled:opacity-30"
                >
                  ▲
                </button>
                <span className="w-6 text-center text-sm font-bold text-ink/60">{index + 1}</span>
                <button
                  type="button"
                  aria-label={`Move “${item.title}” down`}
                  disabled={busy || index === items.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded border border-green-dark/25 px-2 py-0.5 text-sm text-green-dark hover:bg-green-dark/10 disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            )}

            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-paper">
              {item.image && (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="80px"
                  className={imageFit === "cover" ? "object-cover" : "object-contain p-2"}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-ink">{item.title}</p>
              {item.subtitle && <p className="mt-0.5 line-clamp-2 text-sm text-ink/60">{item.subtitle}</p>}
              {item.isDemo && <p className="mt-1 text-xs text-ink/45">Demo content</p>}
            </div>

            {item.active !== undefined && (
              <button
                type="button"
                role="switch"
                aria-checked={item.active}
                aria-label={`${item.active ? "Hide" : "Show"} “${item.title}” on the website`}
                disabled={busy}
                onClick={() => run(sendJson(`${apiPath}/${item.id}`, { active: !item.active }, "PATCH"))}
                className="flex items-center gap-2"
              >
                <span className={cn("relative h-6 w-11 rounded-full transition-colors", item.active ? "bg-flag-green" : "bg-ink/25")}>
                  <span
                    className={cn(
                      "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                      item.active ? "left-[1.375rem]" : "left-0.5",
                    )}
                  />
                </span>
                <StatusPill tone={item.active ? "green" : "gray"}>{item.active ? "Live" : "Hidden"}</StatusPill>
              </button>
            )}

            <div className="flex gap-2">
              <ButtonLink href={`${editPath}/${item.id}`} variant="outlineDark" className="px-4 py-2">
                Edit
              </ButtonLink>
              <DeleteButton
                endpoint={`${apiPath}/${item.id}`}
                itemName={itemName}
                message={deleteMessage.replace("{name}", item.title)}
              />
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
