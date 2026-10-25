"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import type { StaffMember } from "@/modules/staff/staff.types";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";
import { Field, Input, Notice, Panel, Textarea } from "./ui";

export function StaffForm({ staff }: { staff?: StaffMember }) {
  const router = useRouter();
  const savedImage: UploadedImage | null = staff?.image
    ? { url: staff.image, publicId: staff.imagePublicId }
    : null;

  const [name, setName] = useState(staff?.name ?? "");
  const [role, setRole] = useState(staff?.role ?? "");
  const [bio, setBio] = useState(staff?.bio ?? "");
  const [profile, setProfile] = useState(staff?.profile ?? "");
  const [experience, setExperience] = useState(staff?.experience ?? "");
  const [speciality, setSpeciality] = useState(staff?.speciality ?? "");
  const [image, setImage] = useState<UploadedImage | null>(savedImage);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setFields({});
    setSaving(true);

    const body: Record<string, unknown> = { name, role, bio, profile, experience, speciality };
    if (!staff || image?.url !== savedImage?.url) {
      body.image = image ? { url: image.url, publicId: image.publicId } : null;
    }

    const result = staff
      ? await sendJson(`/api/staff/${staff.id}`, body, "PATCH")
      : await sendJson("/api/staff", body);
    setSaving(false);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    router.push(`/admin/squad?notice=${staff ? "staff-updated" : "staff-created"}`);
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
          {saving ? "Saving..." : staff ? "Save changes" : "Add staff member"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" htmlFor="name" error={firstError("name")}>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
            </Field>
            <Field label="Role" htmlFor="role" error={firstError("role")} hint="For example Head Coach or Physiotherapist.">
              <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={60} required />
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Experience" htmlFor="experience" error={firstError("experience")} hint="For example 10 years.">
              <Input id="experience" value={experience} onChange={(e) => setExperience(e.target.value)} maxLength={40} />
            </Field>
            <Field label="Speciality" htmlFor="speciality" error={firstError("speciality")} hint="For example Death bowling.">
              <Input id="speciality" value={speciality} onChange={(e) => setSpeciality(e.target.value)} maxLength={60} />
            </Field>
          </div>
          <Field label="Short line" htmlFor="bio" error={firstError("bio")} hint={`${bio.length}/240. Shown on the card.`}>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={240} />
          </Field>
          <Field
            label="Profile"
            htmlFor="profile"
            error={firstError("profile")}
            hint={`${profile.length}/3000. Shown on the staff page. Leave a blank line between paragraphs.`}
          >
            <Textarea id="profile" value={profile} onChange={(e) => setProfile(e.target.value)} rows={8} maxLength={3000} />
          </Field>
        </Panel>

        <Panel>
          <ImageDropzone
            folder="staff"
            label="Photo"
            size="800 × 1000 px (4:5 portrait)"
            hint="Same size as the player photos."
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
      </div>
    </form>
  );
}
