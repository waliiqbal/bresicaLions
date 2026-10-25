"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { ACCEPTED_TYPES, uploadImageFile } from "@/lib/image-client";
import { cn } from "@/lib/utils";
import type { Album } from "@/modules/gallery/gallery.types";
import { DeleteButton } from "./DeleteButton";
import { Field, Input, Notice, Panel } from "./ui";

type QueueItem = {
  key: number;
  name: string;
  status: "waiting" | "uploading" | "done" | "error";
  message?: string;
};

const CONCURRENCY = 3;

export function AlbumManager({ album }: { album: Album }) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(album.title);
  const [renaming, setRenaming] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function rename(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setRenaming(true);
    const result = await sendJson(`/api/gallery/${album.id}`, { title }, "PATCH");
    setRenaming(false);
    if (!result.ok) {
      setError(result.fields?.title?.[0] ?? result.message);
      return;
    }
    setNotice("Album name saved.");
    router.refresh();
  }

  function patchItem(key: number, patch: Partial<QueueItem>) {
    setQueue((list) => list.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0 || uploading) return;
    setError("");
    setNotice("");
    setUploading(true);

    const base = Date.now();
    setQueue(files.map((file, i) => ({ key: base + i, name: file.name, status: "waiting" })));

    const uploaded: { url: string; publicId: string }[] = [];
    let next = 0;

    async function worker() {
      while (next < files.length) {
        const index = next++;
        const key = base + index;
        patchItem(key, { status: "uploading" });
        const result = await uploadImageFile(files[index], "gallery");
        if (result.ok) {
          uploaded.push(result.image);
          patchItem(key, { status: "done" });
        } else {
          patchItem(key, { status: "error", message: result.message });
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));

    // Attach everything that uploaded (the server accepts up to 30 at a time).
    let failedToSave = false;
    for (let i = 0; i < uploaded.length; i += 30) {
      const result = await sendJson(`/api/gallery/${album.id}/photos`, {
        photos: uploaded.slice(i, i + 30),
      });
      if (!result.ok) {
        failedToSave = true;
        setError(result.message);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!failedToSave && uploaded.length > 0) {
      setNotice(
        `${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} added to the album.`,
      );
    }
    router.refresh();
  }

  async function makeCover(photoId: string) {
    setError("");
    const result = await sendJson(
      `/api/gallery/${album.id}/photos/${photoId}`,
      { cover: true },
      "PATCH",
    );
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNotice("Cover photo changed.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {notice && <Notice>{notice}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <Panel>
        <form onSubmit={rename} className="flex flex-wrap items-end gap-3">
          <Field label="Album name" htmlFor="album-title" className="min-w-0 flex-1">
            <Input
              id="album-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
            />
          </Field>
          <Button
            type="submit"
            variant="outlineDark"
            disabled={renaming || title.trim() === album.title}
          >
            {renaming ? "Saving..." : "Save name"}
          </Button>
        </form>
      </Panel>

      <Panel>
        <h2 className="mb-1 font-heading text-lg font-bold text-green-dark">Add photos</h2>
        <p className="mb-4 text-sm text-ink/60">
          Choose many photos at once. Big photos are resized automatically.
        </p>
        <p className="mb-4 rounded-lg bg-gold/20 px-3 py-2 text-xs font-semibold text-green-dark">
          Best size: 1600 × 1200 px (4:3 wide) for every photo. JPG, PNG or WEBP, up to 4 MB each.
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            "rounded-xl border-2 border-dashed p-8 text-center transition-colors",
            dragging ? "border-gold bg-gold/10" : "border-green-dark/25 bg-paper/60",
          )}
        >
          <p className="text-sm font-semibold text-ink">
            {uploading ? "Uploading..." : "Drag and drop photos here"}
          </p>
          <label
            htmlFor={inputId}
            className={cn(
              "mt-3 inline-flex cursor-pointer items-center rounded-full bg-green-dark px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cream hover:bg-green-card",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            Choose photos
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            multiple
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            disabled={uploading}
            onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
          />
        </div>

        {queue.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm" aria-live="polite">
            {queue.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-3">
                <span className="truncate text-ink/80">{item.name}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs font-bold uppercase",
                    item.status === "done" && "text-flag-green",
                    item.status === "error" && "text-flag-red",
                    item.status === "uploading" && "text-gold",
                    item.status === "waiting" && "text-ink/40",
                  )}
                >
                  {item.status === "error" ? item.message : item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-bold text-green-dark">
            Photos ({album.photos.length})
          </h2>
          <DeleteButton
            endpoint={`/api/gallery/${album.id}`}
            itemName="this album"
            label="Delete album"
            message={`The album "${album.title}" and all ${album.photos.length} of its photos will be deleted. This cannot be undone.`}
            redirectTo="/admin/gallery"
          />
        </div>

        {album.photos.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/55">
            No photos yet. Add some above. The album only shows on the website once it has a photo.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {album.photos.map((photo, index) => (
              <li key={photo.id} className="overflow-hidden rounded-lg border border-green-dark/15 bg-white">
                <div className="relative aspect-[4/3] bg-paper">
                  <Image src={photo.src} alt={photo.alt} fill sizes="240px" className="object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase text-green-deep">
                      Cover
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  {index > 0 ? (
                    <button
                      type="button"
                      onClick={() => makeCover(photo.id)}
                      className="text-xs font-semibold text-green-card hover:underline"
                    >
                      Make cover
                    </button>
                  ) : (
                    <span />
                  )}
                  <DeleteButton
                    endpoint={`/api/gallery/${album.id}/photos/${photo.id}`}
                    itemName="this photo"
                    className="px-3 py-1.5 text-[10px]"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
