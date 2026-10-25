"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import type { Banner } from "@/modules/banners/banner.types";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";
import { Checkbox, Field, Input, Notice, Panel, Select, Textarea } from "./ui";

type ButtonState = { label: string; href: string; variant: "gold" | "outline" };

const emptyButton = (variant: ButtonState["variant"]): ButtonState => ({
  label: "",
  href: "",
  variant,
});

export function BannerForm({ banner }: { banner?: Banner }) {
  const router = useRouter();
  const savedImage: UploadedImage | null = banner?.image
    ? { url: banner.image, publicId: banner.imagePublicId }
    : null;

  const [eyebrow, setEyebrow] = useState(banner?.eyebrow ?? "");
  const [title, setTitle] = useState(banner?.title ?? "");
  const [text, setText] = useState(banner?.text ?? "");
  const [image, setImage] = useState<UploadedImage | null>(savedImage);
  const [buttons, setButtons] = useState<ButtonState[]>([
    { ...emptyButton("gold"), ...banner?.buttons[0], variant: banner?.buttons[0]?.variant ?? "gold" },
    { ...emptyButton("outline"), ...banner?.buttons[1], variant: banner?.buttons[1]?.variant ?? "outline" },
  ]);
  const [active, setActive] = useState(banner?.active ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  function setButton(index: number, patch: Partial<ButtonState>) {
    setButtons((list) => list.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFields({});
    setSaving(true);

    const body: Record<string, unknown> = {
      eyebrow,
      title,
      text,
      active,
      buttons: buttons.filter((b) => b.label.trim() || b.href.trim()),
    };
    if (!banner || image?.url !== savedImage?.url) {
      body.image = image ? { url: image.url, publicId: image.publicId } : null;
    }

    const result = banner
      ? await sendJson(`/api/banners/${banner.id}`, body, "PATCH")
      : await sendJson("/api/banners", body);
    setSaving(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/admin/banners?notice=${banner ? "updated" : "created"}`);
    router.refresh();
  }

  const firstError = (key: string) => fields[key]?.[0];

  return (
    <form onSubmit={submit} noValidate>
      {error && <Notice tone="error">{error}</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/banners" className="text-sm font-semibold text-green-card hover:underline">
          ← All banners
        </Link>
        <Button type="submit" variant="dark" disabled={saving}>
          {saving ? "Saving..." : banner ? "Save changes" : "Add banner"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel className="space-y-5">
            <Field label="Small label (optional)" htmlFor="eyebrow" error={firstError("eyebrow")} hint="Shown above the title, for example “Match Day”.">
              <Input id="eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} maxLength={40} />
            </Field>
            <Field label="Title" htmlFor="title" error={firstError("title")}>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
            </Field>
            <Field label="Text" htmlFor="text" error={firstError("text")} hint={`${text.length}/240. One or two short lines.`}>
              <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={240} required />
            </Field>
          </Panel>

          <Panel className="space-y-5">
            <h2 className="font-heading text-lg font-bold text-green-dark">Buttons</h2>
            <p className="-mt-3 text-sm text-ink/60">
              Up to two buttons. Leave the text empty to hide a button. The link can be a page
              like <code>/fixtures</code> or a full <code>https://</code> address.
            </p>
            {buttons.map((button, i) => (
              <div key={i} className="grid gap-3 rounded-lg border border-green-dark/15 p-4 sm:grid-cols-[1fr_1fr_8rem]">
                <Field label={`Button ${i + 1} text`} htmlFor={`b-label-${i}`}>
                  <Input id={`b-label-${i}`} value={button.label} onChange={(e) => setButton(i, { label: e.target.value })} maxLength={30} />
                </Field>
                <Field label="Link" htmlFor={`b-href-${i}`} error={firstError("buttons")}>
                  <Input id={`b-href-${i}`} value={button.href} onChange={(e) => setButton(i, { href: e.target.value })} placeholder="/fixtures" />
                </Field>
                <Field label="Style" htmlFor={`b-style-${i}`}>
                  <Select id={`b-style-${i}`} value={button.variant} onChange={(e) => setButton(i, { variant: e.target.value as ButtonState["variant"] })}>
                    <option value="gold">Gold</option>
                    <option value="outline">Outline</option>
                  </Select>
                </Field>
              </div>
            ))}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <ImageDropzone
              folder="banners"
              label="Banner picture"
              size="1920 × 800 px (very wide)"
              hint="Keep the main person or subject in the middle or on the right: the sides are cut on phones. Without a picture the slide shows the crest."
              value={image}
              onChange={(value) => {
                setImage(value);
                setError("");
                setFields({});
              }}
              persistedPublicId={savedImage?.publicId}
            />
            {firstError("image") && (
              <p role="alert" className="mt-2 text-xs text-flag-red">{firstError("image")}</p>
            )}
          </Panel>
          <Panel>
            <Checkbox
              label="Show on the website"
              hint="Turn off to hide this banner without deleting it."
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          </Panel>
        </div>
      </div>
    </form>
  );
}
