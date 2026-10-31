import { coaching } from "@/data/about";
import { articles } from "@/data/articles";
import { banners } from "@/data/banners";
import { albums } from "@/data/gallery";
import { players } from "@/data/players";
import { sponsors } from "@/data/sponsors";
import { connectDB } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { ArticleModel } from "@/modules/articles/article.schema";
import { BannerModel } from "@/modules/banners/banner.schema";
import { AlbumModel } from "@/modules/gallery/gallery.schema";
import { PlayerModel } from "@/modules/players/player.schema";
import { SponsorModel } from "@/modules/sponsors/sponsor.schema";
import { StaffModel } from "@/modules/staff/staff.schema";
import { ensureLionsTeam } from "@/modules/teams/team.service";

/**
 * Demo content lets the website look complete before the club adds its own.
 * Content that is real club material (the crest banner, the MOU photos...) is
 * saved as normal records. The made-up sponsors, players and coaches are
 * flagged `isDemo`, so "Remove demo content" deletes only those and never
 * anything the admin wrote.
 */

export interface DemoCounts {
  articles: number;
  banners: number;
  albums: number;
  sponsors: number;
  players: number;
  staff: number;
}

export async function countDemoContent(): Promise<DemoCounts> {
  await connectDB();
  const [articleCount, bannerCount, albumCount, sponsorCount, playerCount, staffCount] =
    await Promise.all([
      ArticleModel.countDocuments({ isDemo: true }),
      BannerModel.countDocuments({ isDemo: true }),
      AlbumModel.countDocuments({ isDemo: true }),
      SponsorModel.countDocuments({ isDemo: true }),
      PlayerModel.countDocuments({ isDemo: true }),
      StaffModel.countDocuments({ isDemo: true }),
    ]);
  return {
    articles: articleCount,
    banners: bannerCount,
    albums: albumCount,
    sponsors: sponsorCount,
    players: playerCount,
    staff: staffCount,
  };
}

/** Adds the demo content for each section that has nothing in it yet. */
export async function loadDemoContent(): Promise<DemoCounts> {
  await connectDB();
  const added: DemoCounts = {
    articles: 0,
    banners: 0,
    albums: 0,
    sponsors: 0,
    players: 0,
    staff: 0,
  };

  if ((await ArticleModel.estimatedDocumentCount()) === 0) {
    const docs = await ArticleModel.insertMany(
      [...articles]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .map((a, index) => ({
        order: index + 1,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        category: a.category,
        image: a.image ? { url: a.image } : null,
        publishedAt: new Date(a.publishedAt),
        published: a.published,
        featured: a.featured,
        isDemo: false, // real story, kept by "Remove demo content"
      })),
    );
    added.articles = docs.length;
  }

  if ((await BannerModel.estimatedDocumentCount()) === 0) {
    const docs = await BannerModel.insertMany(
      banners.map((b) => ({
        eyebrow: b.eyebrow ?? "",
        title: b.title,
        text: b.text,
        image: b.image ? { url: b.image } : null,
        buttons: b.buttons.map((button) => ({
          label: button.label,
          href: button.href,
          variant: button.variant ?? "gold",
        })),
        order: b.order,
        active: b.active,
        isDemo: false, // the crest banner is real, kept by "Remove demo content"
      })),
    );
    added.banners = docs.length;
  }

  if ((await AlbumModel.estimatedDocumentCount()) === 0) {
    const docs = await AlbumModel.insertMany(
      albums.map((a) => ({
        title: a.title,
        slug: a.slug,
        createdAt: new Date(a.createdAt),
        photos: a.photos.map((p) => ({ url: p.src, alt: p.alt })),
        isDemo: false, // real MOU photos, kept by "Remove demo content"
      })),
    );
    added.albums = docs.length;
  }

  if ((await SponsorModel.estimatedDocumentCount()) === 0) {
    const docs = await SponsorModel.insertMany(
      sponsors.map((s) => ({
        name: s.name,
        url: "",
        order: s.order,
        active: s.active,
        isDemo: true,
      })),
    );
    added.sponsors = docs.length;
  }

  if ((await PlayerModel.estimatedDocumentCount()) === 0) {
    const docs = await PlayerModel.insertMany(
      players.map((p) => ({
        name: p.name,
        slug: p.slug,
        number: p.number,
        role: p.role,
        isCaptain: p.isCaptain,
        battingStyle: p.battingStyle,
        bowlingStyle: p.bowlingStyle,
        bio: p.bio,
        image: p.image ? { url: p.image } : null,
        isDemo: true,
      })),
    );
    added.players = docs.length;
  }

  if ((await StaffModel.estimatedDocumentCount()) === 0) {
    const docs = await StaffModel.insertMany(
      coaching.map((member, index) => ({
        name: member.name,
        slug: member.slug ?? slugify(member.name),
        role: member.role,
        bio: member.bio ?? "",
        profile: member.profile ?? "",
        experience: member.experience ?? "",
        speciality: member.speciality ?? "",
        image: member.image ? { url: member.image } : null,
        order: index + 1,
        isDemo: true,
      })),
    );
    added.staff = docs.length;
  }

  // The points table always has the Lions row to start from.
  await ensureLionsTeam();

  return added;
}

export async function removeDemoContent(): Promise<DemoCounts> {
  await connectDB();
  const [a, b, c, d, e, f] = await Promise.all([
    ArticleModel.deleteMany({ isDemo: true }),
    BannerModel.deleteMany({ isDemo: true }),
    AlbumModel.deleteMany({ isDemo: true }),
    SponsorModel.deleteMany({ isDemo: true }),
    PlayerModel.deleteMany({ isDemo: true }),
    StaffModel.deleteMany({ isDemo: true }),
  ]);
  return {
    articles: a.deletedCount,
    banners: b.deletedCount,
    albums: c.deletedCount,
    sponsors: d.deletedCount,
    players: e.deletedCount,
    staff: f.deletedCount,
  };
}
