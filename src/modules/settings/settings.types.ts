import type { SocialLink, SocialPlatform } from "@/lib/site";

export const SOCIAL_PLATFORMS = [
  { platform: "instagram", label: "Instagram" },
  { platform: "facebook", label: "Facebook" },
  { platform: "x", label: "X (Twitter)" },
  { platform: "youtube", label: "YouTube" },
  { platform: "tiktok", label: "TikTok" },
] as const satisfies readonly { platform: SocialPlatform; label: string }[];

/** What the admin Settings form edits. An empty social link is hidden on the site. */
export interface SettingsForAdmin {
  email: string;
  phone: string;
  address: string;
  socials: Record<SocialPlatform, string>;
  footerText: string;
}

/** What the public pages (footer, contact page) use. */
export interface SiteSettings {
  contact: { address: string; email: string; phone?: string };
  /** Only the links that are filled in. */
  socials: SocialLink[];
  footerText: string;
}
