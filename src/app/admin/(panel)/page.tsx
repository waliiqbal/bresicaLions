import type { Metadata } from "next";
import Link from "next/link";
import { DemoContentCard } from "@/components/admin/DemoContentCard";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { isMailConfigured } from "@/lib/mail";
import { ALLOW_INDEXING, SITE_URL } from "@/lib/site";
import { isCloudinaryConfigured } from "@/lib/upload";
import { countArticles } from "@/modules/articles/article.service";
import { countBanners } from "@/modules/banners/banner.service";
import { countAlbums } from "@/modules/gallery/gallery.service";
import { countMatches } from "@/modules/matches/match.service";
import { countMessages } from "@/modules/messages/message.service";
import { countPlayers } from "@/modules/players/player.service";
import { countDemoContent } from "@/modules/seed/seed.service";
import { countSponsors } from "@/modules/sponsors/sponsor.service";
import { countStaff } from "@/modules/staff/staff.service";
import { countSubscribers } from "@/modules/subscribers/subscriber.service";

export const metadata: Metadata = { title: "Dashboard" };

async function checkDatabase() {
  try {
    const mongoose = await connectDB();
    return mongoose.connection.readyState === 1
      ? { ok: true, detail: `Connected (${mongoose.connection.name})` }
      : { ok: false, detail: "Not connected" };
  } catch {
    return { ok: false, detail: "Could not connect" };
  }
}

function Row({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-3 text-sm font-semibold">
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${ok ? "bg-flag-green" : "bg-flag-red"}`}
        />
        {label}
      </span>
      <span className="text-right text-sm text-ink/60">{detail}</span>
    </li>
  );
}

function Stat({
  label,
  value,
  note,
  href,
}: {
  label: string;
  value: number;
  note: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-green-dark/15 border-l-4 border-l-gold bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="font-heading text-4xl font-bold text-green-dark">{value}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{label}</p>
      <p className="text-xs text-ink/55">{note}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const admin = await requireAdminPage();
  const database = await checkDatabase();

  const [articles, banners, gallery, matches, players, staff, sponsors, messages, subscribers, demo] = database.ok
    ? await Promise.all([
        countArticles(),
        countBanners(),
        countAlbums(),
        countMatches(),
        countPlayers(),
        countStaff(),
        countSponsors(),
        countMessages(),
        countSubscribers(),
        countDemoContent(),
      ])
    : [
        { published: 0, drafts: 0 },
        { total: 0, active: 0 },
        { albums: 0, photos: 0 },
        { upcoming: 0, results: 0 },
        0,
        0,
        { total: 0, active: 0 },
        { total: 0, unread: 0 },
        0,
        { articles: 0, banners: 0, albums: 0, sponsors: 0, players: 0, staff: 0 },
      ];

  const anyEmpty =
    articles.published + articles.drafts === 0 ||
    banners.total === 0 ||
    gallery.albums === 0 ||
    players === 0 ||
    staff === 0 ||
    sponsors.total === 0;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader
        eyebrow="Dashboard"
        title="Welcome back"
        description={`Logged in as ${admin.email}. Use the menu to manage every part of the website.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published stories" value={articles.published} note={`${articles.drafts} draft${articles.drafts === 1 ? "" : "s"}`} href="/admin/news" />
        <Stat label="Live banners" value={banners.active} note={`${banners.total} in total`} href="/admin/banners" />
        <Stat label="Photo albums" value={gallery.albums} note="On the gallery page" href="/admin/gallery" />
        <Stat label="Photos" value={gallery.photos} note="Across all albums" href="/admin/gallery" />
        <Stat label="Upcoming matches" value={matches.upcoming} note={`${matches.results} result${matches.results === 1 ? "" : "s"} entered`} href="/admin/matches" />
        <Stat label="Players" value={players} note={`${staff} coaching staff`} href="/admin/squad" />
        <Stat label="Sponsors" value={sponsors.active} note={`${sponsors.total} in total`} href="/admin/sponsors" />
        <Stat label="Unread messages" value={messages.unread} note={`${messages.total} in total`} href="/admin/messages" />
        <Stat label="Subscribers" value={subscribers} note="Newsletter list" href="/admin/subscribers" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-heading text-xl font-bold text-green-dark">System status</h2>
          <ul className="mt-3 divide-y divide-green-dark/10">
            <Row label="Database" ok={database.ok} detail={database.detail} />
            <Row label="Email (OTP codes)" ok={isMailConfigured()} detail={isMailConfigured() ? "Configured" : "Not configured"} />
            <Row label="Image storage" ok={isCloudinaryConfigured()} detail={isCloudinaryConfigured() ? "Cloudinary ready" : "Not configured"} />
            <Row label="Admin account" ok detail={admin.email} />
            <Row
              label="Website address"
              ok={!SITE_URL.includes("localhost")}
              detail={SITE_URL.includes("localhost") ? "Not set (NEXT_PUBLIC_SITE_URL)" : SITE_URL}
            />
            <Row label="Search engines" ok detail={ALLOW_INDEXING ? "Site can be indexed" : "Hidden (demo mode)"} />
          </ul>
        </Panel>

        <DemoContentCard demo={demo} canLoad={anyEmpty} />
      </div>
    </div>
  );
}
