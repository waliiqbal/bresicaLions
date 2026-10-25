// Static site defaults. Contact details and social links move to the
// admin Settings module in Phase 3 and override these values.

export const LOGO_SRC = "/images/logo.png";
export const HASHTAG_SRC = "/images/hashtag.png";
export const PARTNER_LOGO_SRC = "/images/afs-logo.png";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Search engines may index the site only when this is explicitly turned on. */
export const ALLOW_INDEXING = process.env.ALLOW_INDEXING === "true";

export type SocialPlatform = "instagram" | "facebook" | "x" | "youtube" | "tiktok";

export interface SocialLink {
  label: string;
  platform: SocialPlatform;
  href: string;
}

const socials: SocialLink[] = [
  { label: "Instagram", platform: "instagram", href: "https://instagram.com/brescialions" },
  { label: "Facebook", platform: "facebook", href: "https://www.facebook.com/share/1DWsyQBJLn/?mibextid=wwXIfr" },
  { label: "X", platform: "x", href: "https://x.com/brescialions" },
  { label: "TikTok", platform: "tiktok", href: "https://tiktok.com/@brescialions" },
];

export const siteConfig = {
  name: "Brescia Lions",
  tagline: "Un simbolo, una città, una famiglia",
  motto: "One City. One Identity.",
  hashtag: "#OrgoglioDiBrescia",
  contact: {
    address: "Brescia, Lombardia, Italia",
    email: "info@brescialionst10.com",
  },
  socials,
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Squad", href: "/squad" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "Results", href: "/results" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];
