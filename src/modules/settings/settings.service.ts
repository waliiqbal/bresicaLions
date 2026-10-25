import { connectDB } from "@/lib/db";
import { siteConfig, type SocialLink, type SocialPlatform } from "@/lib/site";
import type { UpdateSettingsInput } from "./settings.dto";
import { SettingsModel, type SettingsDoc } from "./settings.schema";
import {
  SOCIAL_PLATFORMS,
  type SettingsForAdmin,
  type SiteSettings,
} from "./settings.types";

const KEY = { key: "settings" } as const;

const defaultSocial = (platform: SocialPlatform) =>
  siteConfig.socials.find((s) => s.platform === platform)?.href ?? "";

function merge(doc: SettingsDoc | null): SettingsForAdmin {
  const socials = {} as Record<SocialPlatform, string>;
  for (const { platform } of SOCIAL_PLATFORMS) {
    // An empty saved link means "hide it", so only a missing one uses the default.
    socials[platform] = doc?.socials?.[platform] ?? defaultSocial(platform);
  }
  return {
    email: doc?.email || siteConfig.contact.email,
    phone: doc?.phone ?? "",
    address: doc?.address || siteConfig.contact.address,
    socials,
    footerText: doc?.footerText || `${siteConfig.tagline}.`,
  };
}

async function findSettings() {
  await connectDB();
  return SettingsModel.findOne(KEY).lean<SettingsDoc>();
}

// ------------------------------------------------------------ public site

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = merge(await findSettings());
  const socials: SocialLink[] = SOCIAL_PLATFORMS.flatMap(({ platform, label }) =>
    settings.socials[platform]
      ? [{ platform, label: label.replace(" (Twitter)", ""), href: settings.socials[platform] }]
      : [],
  );
  return {
    contact: {
      address: settings.address,
      email: settings.email,
      phone: settings.phone || undefined,
    },
    socials,
    footerText: settings.footerText,
  };
}

// ------------------------------------------------------------ admin panel

export async function getSettingsForAdmin() {
  return merge(await findSettings());
}

export async function updateSettings(input: UpdateSettingsInput) {
  const set: Record<string, string> = {};
  for (const key of ["email", "phone", "address", "footerText"] as const) {
    if (input[key] !== undefined) set[key] = input[key];
  }
  for (const [platform, href] of Object.entries(input.socials ?? {})) {
    if (href !== undefined) set[`socials.${platform}`] = href;
  }

  await connectDB();
  if (Object.keys(set).length > 0) {
    await SettingsModel.updateOne(KEY, { $set: set }, { upsert: true });
  }
  return getSettingsForAdmin();
}
