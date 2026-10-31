import type { Metadata } from "next";
import CoverImage from "@/components/site/CoverImage";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NewsCard } from "@/components/site/NewsCard";
import { Section } from "@/components/site/Section";
import { ShareButtons } from "@/components/site/ShareButtons";
import {
  getArticleBySlug,
  getRelatedArticles,
} from "@/modules/articles/article.service";
import { JsonLd } from "@/components/site/JsonLd";
import { SITE_URL, siteConfig } from "@/lib/site";

export async function generateMetadata({
  params,
}: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      images: [{ url: article.image }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 3);
  const url = `${SITE_URL}/news/${article.slug}`;
  // A story that opens with its own picture does not repeat the cover on top.
  const startsWithImage = /^\s*(<p>\s*)?<img\b/i.test(article.content);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.excerpt,
          image: [`${SITE_URL}${article.image}`],
          datePublished: article.publishedAt,
          mainEntityOfPage: url,
          publisher: { "@type": "Organization", name: siteConfig.name },
        }}
      />
      <article>
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 md:pt-14">
          <ButtonLink href="/news" variant="outline" className="mb-8">
            ← All News
          </ButtonLink>

          <div className="flex items-center gap-3">
            <Badge>{article.category}</Badge>
          </div>

          <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-cream sm:text-4xl md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg text-cream/70">{article.excerpt}</p>

          {!startsWithImage && (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl border border-gold/30 shadow-card">
              <CoverImage
                src={article.image}
                priority
                sizes="(min-width: 896px) 896px, 100vw"
              />
            </div>
          )}

          <div
            className="article-content mx-auto mt-10 max-w-3xl"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="mx-auto mt-12 max-w-3xl border-t border-gold/20 py-6">
            <ShareButtons url={url} title={article.title} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <Section className="mt-6 bg-black/20">
          <SectionHeading
            white="Related"
            gold="Stories"
            subtitle="More from the den"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((item) => (
              <NewsCard key={item.id} article={item} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
