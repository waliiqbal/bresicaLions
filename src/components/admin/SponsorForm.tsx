"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import type { Sponsor } from "@/modules/sponsors/sponsor.types";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";
import { Checkbox, Field, Input, Notice, Panel } from "./ui";

export function SponsorForm({ sponsor }: { sponsor?: Sponsor }) {
  const router = useRouter();
  const savedLogo: UploadedImage | null = sponsor?.logo
    ? { url: sponsor.logo, publicId: sponsor.logoPublicId }
    : null;

  const [name, setName] = useState(sponsor?.name ?? "");
  const [url, setUrl] = useState(sponsor?.url ?? "");
  const [logo, setLogo] = useState<UploadedImage | null>(savedLogo);
  const [active, setActive] = useState(sponsor?.active ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFields({});
    setSaving(true);

    const body: Record<string, unknown> = { name, url, active };
    if (!sponsor || logo?.url !== savedLogo?.url) {
      body.logo = logo ? { url: logo.url, publicId: logo.publicId } : null;
    }

    const result = sponsor
      ? await sendJson(`/api/sponsors/${sponsor.id}`, body, "PATCH")
      : await sendJson("/api/sponsors", body);
    setSaving(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/admin/sponsors?notice=${sponsor ? "updated" : "created"}`);
    router.refresh();
  }

  const firstError = (key: string) => fields[key]?.[0];

  return (
    <form onSubmit={submit} noValidate>
      {error && <Notice tone="error">{error}</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/sponsors" className="text-sm font-semibold text-green-card hover:underline">
          ← All sponsors
        </Link>
        <Button type="submit" variant="dark" disabled={saving}>
          {saving ? "Saving..." : sponsor ? "Save changes" : "Add sponsor"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Panel className="space-y-5">
            <Field label="Sponsor name" htmlFor="name" error={firstError("name")}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
            </Field>
            <Field
              label="Website link (optional)"
              htmlFor="url"
              error={firstError("url")}
              hint="Clicking the logo opens this address. It must start with https://"
            >
              <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" maxLength={300} />
            </Field>
          </Panel>
          <Panel>
            <Checkbox
              label="Show on the website"
              hint="Turn off to hide this sponsor without deleting it."
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
          </Panel>
        </div>

        <Panel>
          <ImageDropzone
            folder="sponsors"
            label="Logo"
            size="600 × 240 px (wide logo, PNG)"
            hint="A PNG with a transparent or plain background looks best. Without a logo the sponsor name is shown as text."
            value={logo}
            onChange={(value) => {
              setLogo(value);
              setError("");
              setFields({});
            }}
            persistedPublicId={savedLogo?.publicId}
          />
          {firstError("logo") && <p role="alert" className="mt-2 text-xs text-flag-red">{firstError("logo")}</p>}
        </Panel>
      </div>
    </form>
  );
}
