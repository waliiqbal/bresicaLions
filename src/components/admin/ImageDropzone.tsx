"use client";

import Image from "next/image";
import { useId, useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { sendJson } from "@/lib/client-api";
import {
  ACCEPTED_TYPES,
  uploadImageFile,
  type UploadFolderName,
  type UploadedImage,
} from "@/lib/image-client";
import { cn } from "@/lib/utils";

export type { UploadedImage };

type ImageDropzoneProps = {
  folder: UploadFolderName;
  value: UploadedImage | null;
  onChange: (value: UploadedImage | null) => void;
  label?: string;
  hint?: string;
  /** Best size to upload, shown in a highlighted line, e.g. "1600 x 900 px (wide)". */
  size?: string;
  className?: string;
  /**
   * Cloudinary id of the image already saved in the database. Removing that
   * one only clears the form; it is deleted from the server when the form is
   * saved. Images uploaded in this session are deleted straight away.
   */
  persistedPublicId?: string | null;
};

export function ImageDropzone({
  folder,
  value,
  onChange,
  label = "Image",
  hint = "JPG, PNG or WEBP, up to 4 MB. Bigger photos are shrunk automatically.",
  size,
  className,
  persistedPublicId,
}: ImageDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    const result = await uploadImageFile(file, folder);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";

    if (!result.ok) {
      setError(result.message);
      return;
    }
    // The old image (if any) is freed on the server when the form is saved.
    onChange(result.image);
  }

  async function remove() {
    if (!value) return;
    setBusy(true);
    // Nothing to delete now for demo images (no id) or the saved image
    // (the server removes it when the form is saved).
    if (value.publicId && value.publicId !== persistedPublicId) {
      const result = await sendJson(
        "/api/upload",
        { publicId: value.publicId },
        "DELETE",
      );
      if (!result.ok) {
        setBusy(false);
        setConfirming(false);
        setError(result.message);
        return;
      }
    }
    setBusy(false);
    setConfirming(false);
    onChange(null);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    upload(event.dataTransfer.files?.[0]);
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/70">
        {label}
      </p>
      {size && (
        <p className="mb-3 rounded-lg bg-gold/20 px-3 py-2 text-xs font-semibold text-green-dark">
          Best size: {size}
        </p>
      )}

      {value ? (
        <div className="overflow-hidden rounded-xl border border-green-dark/20 bg-white">
          <div className="relative aspect-video bg-paper">
            <Image
              src={value.url}
              alt="Uploaded image preview"
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-3">
            <p className="truncate text-xs text-ink/60">
              {value.publicId ?? "Demo image"}
            </p>
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={() => setConfirming(true)}
              className="px-4 py-2"
            >
              Remove image
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "rounded-xl border-2 border-dashed bg-white p-8 text-center transition-colors",
            dragging ? "border-gold bg-gold/10" : "border-green-dark/25",
          )}
        >
          <p className="text-sm font-semibold text-ink">
            {busy ? "Uploading..." : "Drag and drop an image here"}
          </p>
          <p className="mt-1 text-xs text-ink/60">or</p>
          <label
            htmlFor={inputId}
            className={cn(
              "mt-3 inline-flex cursor-pointer items-center rounded-full bg-green-dark px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cream transition-colors hover:bg-green-card focus-within:outline-2",
              busy && "pointer-events-none opacity-60",
            )}
          >
            Choose image
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="sr-only"
            disabled={busy}
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <p className="mt-4 text-xs text-ink/50">{hint}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-flag-red">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        onCancel={() => setConfirming(false)}
        onConfirm={remove}
        loading={busy}
        title="Remove this image?"
        message="The image will be removed. This cannot be undone once you save."
        confirmLabel="Remove"
      />
    </div>
  );
}
