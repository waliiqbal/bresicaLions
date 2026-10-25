import type { MetadataRoute } from "next";
import { getArticles } from "@/modules/articles/article.service";
import { getAlbums } from "@/modules/gallery/gallery.service";
import { getPlayers } from "@/modules/players/player.service";
import { getSupportStaff } from "@/modules/staff/staff.service";
import { SITE_URL } from "@/lib/site";

const pages = [
  { path: "", priority: 1 },
  { path: "/about", priority: 0.7 },
  { path: "/squad", priority: 0.8 },
  { path: "/fixtures", priority: 0.9 },
  { path: "/results", priority: 0.8 },
  { path: "/news", priority: 0.9 },
  { path: "/gallery", priority: 0.6 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy", priority: 0.2 },
  { path: "/terms", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, players, staff, albums] = await Promise.all([
    getArticles(),
    getPlayers(),
    getSupportStaff(),
    getAlbums(),
  ]);

  return [
    ...pages.map(({ path, priority }) => ({
      url: `${SITE_URL}${path}`,
      priority,
    })),
    ...articles.map((a) => ({
      url: `${SITE_URL}/news/${a.slug}`,
      lastModified: new Date(a.publishedAt),
      priority: 0.7,
    })),
    ...players.map((p) => ({
      url: `${SITE_URL}/squad/${p.slug}`,
      priority: 0.6,
    })),
    ...staff.map((s) => ({
      url: `${SITE_URL}/squad/staff/${s.slug}`,
      priority: 0.5,
    })),
    ...albums.map((a) => ({
      url: `${SITE_URL}/gallery/${a.slug}`,
      lastModified: new Date(a.createdAt),
      priority: 0.5,
    })),
  ];
}
