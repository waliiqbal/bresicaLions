"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { SOCIAL_PLATFORMS, type SettingsForAdmin } from "@/modules/settings/settings.types";
import { Field, Input, Notice, Panel } from "./ui";

export function SettingsForm({ settings }: { settings: SettingsForAdmin }) {
  const router = useRouter();
  const [values, setValues] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  const change = (patch: Partial<SettingsForAdmin>) => {
    setValues((v) => ({ ...v, ...patch }));
    setSaved(false);
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFields({});
    setSaved(false);
    setSaving(true);

    const result = await sendJson("/api/settings", values, "PATCH");
    setSaving(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaved(true);
    router.refresh();
  }

  const firstError = (key: string) => fields[key]?.[0];

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice>Settings saved. The website is updated.</Notice>}

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Contact details</h2>
        <p className="-mt-3 text-sm text-ink/60">Shown in the footer and on the Contact page.</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Club email" htmlFor="email" error={firstError("email")}>
            <Input id="email" type="email" value={values.email} onChange={(e) => change({ email: e.target.value })} maxLength={120} required />
          </Field>
          <Field label="Phone (optional)" htmlFor="phone" error={firstError("phone")} hint="Leave empty to hide it.">
            <Input id="phone" type="tel" value={values.phone} onChange={(e) => change({ phone: e.target.value })} maxLength={40} />
          </Field>
        </div>
        <Field label="Address" htmlFor="address" error={firstError("address")} hint="The map on the Contact page shows this address.">
          <Input id="address" value={values.address} onChange={(e) => change({ address: e.target.value })} maxLength={200} required />
        </Field>
      </Panel>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Social media</h2>
        <p className="-mt-3 text-sm text-ink/60">
          Paste the full link starting with https://. A platform with an empty link is hidden.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          {SOCIAL_PLATFORMS.map(({ platform, label }) => (
            <Field key={platform} label={label} htmlFor={`social-${platform}`} error={firstError("socials")}>
              <Input
                id={`social-${platform}`}
                value={values.socials[platform]}
                onChange={(e) => change({ socials: { ...values.socials, [platform]: e.target.value } })}
                placeholder="https://"
                maxLength={300}
              />
            </Field>
          ))}
        </div>
      </Panel>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Footer</h2>
        <Field label="Footer line" htmlFor="footer" error={firstError("footerText")} hint="The short line under the crest at the bottom of every page.">
          <Input id="footer" value={values.footerText} onChange={(e) => change({ footerText: e.target.value })} maxLength={160} required />
        </Field>
      </Panel>

      <Button type="submit" variant="dark" disabled={saving}>
        {saving ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
