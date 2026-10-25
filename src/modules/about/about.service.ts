import { connectDB } from "@/lib/db";
import { removeStoredImage } from "@/lib/images";
import type { UpdateAboutInput } from "./about.dto";
import { defaultAbout } from "./about.defaults";
import { AboutModel, type AboutDoc } from "./about.schema";
import type { AboutContent, AboutForAdmin } from "./about.types";

const KEY = { key: "about" } as const;

const list = <T>(saved: T[] | undefined, fallback: T[]) =>
  saved && saved.length > 0 ? saved : fallback;

/** The saved text wins field by field; anything not saved uses the default. */
function mergeAbout(doc: AboutDoc | null): AboutContent {
  const d = defaultAbout;
  return {
    heading: doc?.heading || d.heading,
    paragraphs: list(doc?.paragraphs, d.paragraphs),
    image: doc?.image?.url || d.image,
    stats: list(doc?.stats, d.stats),
    history: list(doc?.history, d.history),
    historyClosing: list(doc?.historyClosing, d.historyClosing),
    historyImage: doc?.historyImage?.url || d.historyImage,
    owner: {
      name: doc?.owner?.name || d.owner.name,
      kicker: doc?.owner?.kicker ?? d.owner.kicker,
      paragraphs: list(doc?.owner?.paragraphs, d.owner.paragraphs),
      closing: list(doc?.owner?.closing, d.owner.closing),
      signature: doc?.owner?.signature ?? d.owner.signature,
      image: doc?.owner?.image?.url || d.owner.image,
    },
    crestIntro: doc?.crestIntro || d.crestIntro,
    crestElements: list(doc?.crestElements, d.crestElements).map((item) => ({
      title: item.title,
      subtitle: item.subtitle || undefined,
      text: item.text,
    })),
    mission: doc?.mission || d.mission,
    vision: doc?.vision || d.vision,
  };
}

async function findAbout() {
  await connectDB();
  return AboutModel.findOne(KEY).lean<AboutDoc>();
}

// ------------------------------------------------------------ public site

export async function getAbout(): Promise<AboutContent> {
  return mergeAbout(await findAbout());
}

// ------------------------------------------------------------ admin panel

export async function getAboutForAdmin(): Promise<AboutForAdmin> {
  const doc = await findAbout();
  return {
    content: mergeAbout(doc),
    publicIds: {
      image: doc?.image?.publicId || undefined,
      historyImage: doc?.historyImage?.publicId || undefined,
      ownerImage: doc?.owner?.image?.publicId || undefined,
    },
    customized: Boolean(doc),
  };
}

type Picture = { url: string; publicId?: string } | null | undefined;

export async function updateAbout(input: UpdateAboutInput) {
  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  const assign = (path: string, value: unknown) => {
    if (value !== undefined) set[path] = value;
  };
  const assignPicture = (path: string, value: UpdateAboutInput["image"]) => {
    if (value === undefined) return;
    if (value === null) unset[path] = "";
    else set[path] = value;
  };

  assign("heading", input.heading);
  assign("paragraphs", input.paragraphs);
  assignPicture("image", input.image);
  assign("stats", input.stats);
  assign("history", input.history);
  assign("historyClosing", input.historyClosing);
  assignPicture("historyImage", input.historyImage);
  assign("owner.name", input.ownerName);
  assign("owner.kicker", input.ownerKicker);
  assign("owner.paragraphs", input.ownerParagraphs);
  assign("owner.closing", input.ownerClosing);
  assign("owner.signature", input.ownerSignature);
  assignPicture("owner.image", input.ownerImage);
  assign("crestIntro", input.crestIntro);
  assign("crestElements", input.crestElements);
  assign("mission", input.mission);
  assign("vision", input.vision);

  await connectDB();
  if (Object.keys(set).length + Object.keys(unset).length === 0) return;

  const before = await AboutModel.findOneAndUpdate(
    KEY,
    {
      ...(Object.keys(set).length && { $set: set }),
      ...(Object.keys(unset).length && { $unset: unset }),
    },
    { upsert: true, returnDocument: "before" },
  ).lean<AboutDoc>();

  // Pictures that were replaced or reset are no longer used: free them.
  const replaced: [Picture, Picture][] = [
    [before?.image, input.image],
    [before?.historyImage, input.historyImage],
    [before?.owner?.image, input.ownerImage],
  ];
  for (const [old, next] of replaced) {
    if (next !== undefined && old?.publicId && old.publicId !== next?.publicId) {
      await removeStoredImage({ url: old.url, publicId: old.publicId });
    }
  }
}
