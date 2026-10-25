"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import type {
  AboutForAdmin,
  AboutImageKey,
  AboutStat,
  CrestElement,
} from "@/modules/about/about.types";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";
import { Field, Input, Notice, Panel, Textarea } from "./ui";

// Paragraphs are typed with a blank line between them, short lines one per line.
const splitParagraphs = (text: string) =>
  text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const splitLines = (text: string) =>
  text.split("\n").map((p) => p.trim()).filter(Boolean);

const imageBody = (now: UploadedImage | null, before: UploadedImage | null) =>
  now?.url === before?.url
    ? undefined
    : now
      ? { url: now.url, publicId: now.publicId }
      : null;

export function AboutForm({ about }: { about: AboutForAdmin }) {
  const router = useRouter();
  const { content, publicIds } = about;

  const initialImage = (key: AboutImageKey, url?: string): UploadedImage | null =>
    url ? { url, publicId: publicIds[key] } : null;
  const saved = {
    image: initialImage("image", content.image),
    historyImage: initialImage("historyImage", content.historyImage),
    ownerImage: initialImage("ownerImage", content.owner.image),
  };

  const [heading, setHeading] = useState(content.heading);
  const [paragraphs, setParagraphs] = useState(content.paragraphs.join("\n\n"));
  const [image, setImage] = useState(saved.image);
  const [stats, setStats] = useState<AboutStat[]>(content.stats);

  const [history, setHistory] = useState(content.history.join("\n\n"));
  const [historyClosing, setHistoryClosing] = useState(content.historyClosing.join("\n"));
  const [historyImage, setHistoryImage] = useState(saved.historyImage);

  const [ownerName, setOwnerName] = useState(content.owner.name);
  const [ownerKicker, setOwnerKicker] = useState(content.owner.kicker);
  const [ownerParagraphs, setOwnerParagraphs] = useState(content.owner.paragraphs.join("\n\n"));
  const [ownerClosing, setOwnerClosing] = useState(content.owner.closing.join("\n"));
  const [ownerSignature, setOwnerSignature] = useState(content.owner.signature);
  const [ownerImage, setOwnerImage] = useState(saved.ownerImage);

  const [crestIntro, setCrestIntro] = useState(content.crestIntro);
  const [crestElements, setCrestElements] = useState<CrestElement[]>(
    content.crestElements.map((e) => ({ ...e, subtitle: e.subtitle ?? "" })),
  );
  const [mission, setMission] = useState(content.mission);
  const [vision, setVision] = useState(content.vision);

  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const touch = () => {
    setDone(false);
    setError("");
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setDone(false);
    setSaving(true);

    const body: Record<string, unknown> = {
      heading,
      paragraphs: splitParagraphs(paragraphs),
      stats,
      history: splitParagraphs(history),
      historyClosing: splitLines(historyClosing),
      ownerName,
      ownerKicker,
      ownerParagraphs: splitParagraphs(ownerParagraphs),
      ownerClosing: splitLines(ownerClosing),
      ownerSignature,
      crestIntro,
      crestElements: crestElements.map((e) => ({
        title: e.title,
        subtitle: e.subtitle || undefined,
        text: e.text,
      })),
      mission,
      vision,
    };
    const pictures = {
      image: imageBody(image, saved.image),
      historyImage: imageBody(historyImage, saved.historyImage),
      ownerImage: imageBody(ownerImage, saved.ownerImage),
    };
    for (const [key, value] of Object.entries(pictures)) {
      if (value !== undefined) body[key] = value;
    }

    const result = await sendJson("/api/about", body, "PATCH");
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
  }

  const setStat = (index: number, patch: Partial<AboutStat>) => {
    setStats((list) => list.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    touch();
  };
  const setCrest = (index: number, patch: Partial<CrestElement>) => {
    setCrestElements((list) => list.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    touch();
  };
  const moveCrest = (index: number, direction: -1 | 1) => {
    setCrestElements((list) => {
      const next = [...list];
      const target = index + direction;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    touch();
  };

  const onText =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      touch();
    };
  const onImage = (setter: (value: UploadedImage | null) => void) => (value: UploadedImage | null) => {
    setter(value);
    touch();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {error && <Notice tone="error">{error}</Notice>}
      {done && <Notice>About Us saved. The website is updated.</Notice>}

      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={saving}>
          {saving ? "Saving..." : "Save About Us"}
        </Button>
      </div>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Home page intro</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-5">
            <Field label="Heading" htmlFor="heading" hint="Shown as the section title, for example “About the Lions”.">
              <Input id="heading" value={heading} onChange={onText(setHeading)} maxLength={60} />
            </Field>
            <Field label="Text" htmlFor="paragraphs" hint="Leave a blank line between paragraphs.">
              <Textarea id="paragraphs" value={paragraphs} onChange={onText(setParagraphs)} rows={8} />
            </Field>
          </div>
          <ImageDropzone
            folder="about"
            label="Picture"
            size="1200 × 900 px (4:3 wide)"
            hint="Remove it to go back to the default picture."
            value={image}
            onChange={onImage(setImage)}
            persistedPublicId={publicIds.image}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/70">Key numbers</p>
          <div className="space-y-3">
            {stats.map((stat, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-3">
                <Field label={i === 0 ? "Label" : ""} htmlFor={`stat-label-${i}`}>
                  <Input id={`stat-label-${i}`} value={stat.label} onChange={(e) => setStat(i, { label: e.target.value })} maxLength={30} placeholder="Players" />
                </Field>
                <Field label={i === 0 ? "Value" : ""} htmlFor={`stat-value-${i}`}>
                  <Input id={`stat-value-${i}`} value={stat.value} onChange={(e) => setStat(i, { value: e.target.value })} maxLength={20} placeholder="15" />
                </Field>
                <button
                  type="button"
                  aria-label={`Remove ${stat.label || "this number"}`}
                  onClick={() => {
                    setStats((list) => list.filter((_, n) => n !== i));
                    touch();
                  }}
                  className="mb-0.5 rounded-lg border border-flag-red/40 px-3 py-2.5 text-sm font-semibold text-flag-red hover:bg-flag-red/10"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {stats.length < 6 && (
            <button
              type="button"
              onClick={() => {
                setStats((list) => [...list, { label: "", value: "" }]);
                touch();
              }}
              className="mt-3 text-sm font-semibold text-green-card hover:underline"
            >
              + Add a number
            </button>
          )}
        </div>
      </Panel>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Our story (About Us page)</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-5">
            <Field label="Story" htmlFor="history" hint="Leave a blank line between paragraphs.">
              <Textarea id="history" value={history} onChange={onText(setHistory)} rows={12} />
            </Field>
            <Field label="Closing lines" htmlFor="history-closing" hint="One line per row. Shown in large gold text under the story.">
              <Textarea id="history-closing" value={historyClosing} onChange={onText(setHistoryClosing)} rows={3} />
            </Field>
          </div>
          <ImageDropzone
            folder="about"
            label="Story picture"
            size="1200 × 900 px (4:3 wide)"
            hint="Remove it to go back to the default picture."
            value={historyImage}
            onChange={onImage(setHistoryImage)}
            persistedPublicId={publicIds.historyImage}
          />
        </div>
      </Panel>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Owner</h2>
        <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="owner-name">
                <Input id="owner-name" value={ownerName} onChange={onText(setOwnerName)} maxLength={60} />
              </Field>
              <Field label="Small line above the name" htmlFor="owner-kicker">
                <Input id="owner-kicker" value={ownerKicker} onChange={onText(setOwnerKicker)} maxLength={120} />
              </Field>
            </div>
            <Field label="Text" htmlFor="owner-paragraphs" hint="Leave a blank line between paragraphs.">
              <Textarea id="owner-paragraphs" value={ownerParagraphs} onChange={onText(setOwnerParagraphs)} rows={8} />
            </Field>
            <Field label="Closing lines" htmlFor="owner-closing" hint="One line per row. Shown in large gold text.">
              <Textarea id="owner-closing" value={ownerClosing} onChange={onText(setOwnerClosing)} rows={3} />
            </Field>
            <Field label="Sign-off" htmlFor="owner-signature">
              <Input id="owner-signature" value={ownerSignature} onChange={onText(setOwnerSignature)} maxLength={120} />
            </Field>
          </div>
          <ImageDropzone
            folder="about"
            label="Owner photo"
            size="800 × 1000 px (4:5 tall portrait)"
            hint="Remove it to go back to the default picture."
            value={ownerImage}
            onChange={onImage(setOwnerImage)}
            persistedPublicId={publicIds.ownerImage}
          />
        </div>
      </Panel>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Story behind the crest</h2>
        <Field label="Intro" htmlFor="crest-intro">
          <Textarea id="crest-intro" value={crestIntro} onChange={onText(setCrestIntro)} rows={3} />
        </Field>
        <div className="space-y-4">
          {crestElements.map((element, i) => (
            <div key={i} className="rounded-lg border border-green-dark/15 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-ink/60">Card {i + 1}</p>
                <div className="flex gap-2">
                  <button type="button" aria-label="Move card up" disabled={i === 0} onClick={() => moveCrest(i, -1)} className="rounded border border-green-dark/25 px-2 py-0.5 text-sm text-green-dark hover:bg-green-dark/10 disabled:opacity-30">▲</button>
                  <button type="button" aria-label="Move card down" disabled={i === crestElements.length - 1} onClick={() => moveCrest(i, 1)} className="rounded border border-green-dark/25 px-2 py-0.5 text-sm text-green-dark hover:bg-green-dark/10 disabled:opacity-30">▼</button>
                  <button
                    type="button"
                    onClick={() => {
                      setCrestElements((list) => list.filter((_, n) => n !== i));
                      touch();
                    }}
                    className="rounded border border-flag-red/40 px-3 py-0.5 text-sm font-semibold text-flag-red hover:bg-flag-red/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Title" htmlFor={`crest-title-${i}`}>
                  <Input id={`crest-title-${i}`} value={element.title} onChange={(e) => setCrest(i, { title: e.target.value })} maxLength={60} />
                </Field>
                <Field label="Sub-title (optional)" htmlFor={`crest-sub-${i}`}>
                  <Input id={`crest-sub-${i}`} value={element.subtitle ?? ""} onChange={(e) => setCrest(i, { subtitle: e.target.value })} maxLength={120} />
                </Field>
              </div>
              <Field
                label="Text"
                htmlFor={`crest-text-${i}`}
                className="mt-4"
                hint="One line per row. Start a line with “LABEL: ” to show the label in gold."
              >
                <Textarea id={`crest-text-${i}`} value={element.text} onChange={(e) => setCrest(i, { text: e.target.value })} rows={4} maxLength={1200} />
              </Field>
            </div>
          ))}
        </div>
        {crestElements.length < 10 && (
          <button
            type="button"
            onClick={() => {
              setCrestElements((list) => [...list, { title: "", subtitle: "", text: "" }]);
              touch();
            }}
            className="text-sm font-semibold text-green-card hover:underline"
          >
            + Add a crest card
          </button>
        )}
      </Panel>

      <Panel className="space-y-5">
        <h2 className="font-heading text-lg font-bold text-green-dark">Mission & vision</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Our mission" htmlFor="mission">
            <Textarea id="mission" value={mission} onChange={onText(setMission)} rows={5} maxLength={800} />
          </Field>
          <Field label="Our vision" htmlFor="vision">
            <Textarea id="vision" value={vision} onChange={onText(setVision)} rows={5} maxLength={800} />
          </Field>
        </div>
      </Panel>

      <Button type="submit" variant="dark" disabled={saving}>
        {saving ? "Saving..." : "Save About Us"}
      </Button>
    </form>
  );
}
