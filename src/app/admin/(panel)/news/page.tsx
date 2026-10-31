import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AdminHeader, EmptyState, Notice, StatusPill } from "@/components/admin/ui";
import { ArticleOrderButtons } from "@/components/admin/ArticleOrderButtons";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ButtonLink } from "@/components/ui/Button";
import {
  listArticlesForAdmin,
  type ArticleStatusFilter,
} from "@/modules/articles/article.service";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "News" };

const notices: Record<string, string> = {
  published: "Story published. It is now live on the website.",
  updated: "Story updated.",
  draft: "Draft saved. It is not shown on the website.",
};

const statusTabs: { id: ArticleStatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
];

export default async function NewsAdminPage({
  searchParams,
}: PageProps<"/admin/news">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const status = (
    ["published", "draft"].includes(String(params.status)) ? params.status : "all"
  ) as ArticleStatusFilter;
  const notice = typeof params.notice === "string" ? notices[params.notice] : undefined;

  const articles = await listArticlesForAdmin({ query: q, status });
  // Moving only makes sense in the full list (a filtered list would hide neighbours).
  const canReorder = status === "all" && !q;
  const ids = articles.map((a) => a.id);

  const tabHref = (s: ArticleStatusFilter) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (s !== "all") search.set("status", s);
    const qs = search.toString();
    return qs ? `/admin/news?${qs}` : "/admin/news";
  };

  return (
    <div className="mx-auto max-w-6xl">
      <AdminHeader
        eyebrow="News"
        title="News & articles"
        description="Write match reports and announcements. Drafts stay hidden until you publish them. The order below (use ▲ ▼) is the order on the home page and the News page; a new story starts at the top."
        action={
          <ButtonLink href="/admin/news/new" variant="dark">
            + Add new article
          </ButtonLink>
        }
      />

      {notice && <Notice>{notice}</Notice>}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filter by status" className="flex gap-2">
          {statusTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tabHref(tab.id)}
              aria-current={status === tab.id ? "true" : undefined}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider",
                status === tab.id
                  ? "border-green-dark bg-green-dark text-cream"
                  : "border-green-dark/30 text-green-dark hover:bg-green-dark/10",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/news" role="search" className="flex gap-2">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search stories..."
            aria-label="Search stories"
            className="w-full rounded-lg border border-green-dark/25 bg-white px-3.5 py-2 text-sm sm:w-64"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-dark px-4 text-xs font-bold uppercase tracking-wider text-cream"
          >
            Search
          </button>
        </form>
      </div>

      {articles.length === 0 ? (
        <EmptyState
          title={q || status !== "all" ? "No stories found" : "No stories yet"}
          text={
            q || status !== "all"
              ? "Try a different search or filter."
              : "Write your first story. You can also load demo content from the Dashboard."
          }
          href="/admin/news/new"
          actionLabel="Add new article"
        />
      ) : (
        <ul className="space-y-3">
          {articles.map((article, index) => (
            <li
              key={article.id}
              className="flex flex-col gap-4 rounded-xl border border-green-dark/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              {canReorder && (
                <ArticleOrderButtons ids={ids} index={index} title={article.title} />
              )}
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-paper sm:h-16 sm:w-24">
                {article.image && (
                  <Image src={article.image} alt="" fill sizes="96px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{article.title}</p>
                <p className="mt-1 text-xs text-ink/55">
                  {article.category}
                  {article.published && ` · ${formatDate(article.publishedAt)}`}
                  {article.featured && " · On homepage"}
                  {article.isDemo && " · Demo"}
                </p>
              </div>
              <StatusPill tone={article.published ? "green" : "gold"}>
                {article.published ? "Published" : "Draft"}
              </StatusPill>
              <div className="flex gap-2">
                <ButtonLink href={`/admin/news/${article.id}`} variant="outlineDark" className="px-4 py-2">
                  Edit
                </ButtonLink>
                <DeleteButton
                  endpoint={`/api/articles/${article.id}`}
                  itemName="this story"
                  message={`"${article.title}" will be removed from the website and its cover image deleted.`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
