"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { sendJson } from "@/lib/client-api";
import { slugify } from "@/lib/utils";
import { ARTICLE_CATEGORIES, type Article } from "@/modules/articles/article.types";
import { ImageDropzone, type UploadedImage } from "./ImageDropzone";
import { RichTextEditor } from "./RichTextEditor";
import { Checkbox, Field, Input, Notice, Panel, Select, Textarea } from "./ui";

const today = () => new Date().toISOString().slice(0, 10);

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const savedImage: UploadedImage | null = article?.image
    ? { url: article.image, publicId: article.imagePublicId }
    : null;

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [category, setCategory] = useState<string>(article?.category ?? ARTICLE_CATEGORIES[0]);
  const [publishedAt, setPublishedAt] = useState(article?.publishedAt.slice(0, 10) ?? today());
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [image, setImage] = useState<UploadedImage | null>(savedImage);

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<Record<string, string[]>>({});

  async function save(publish: boolean) {
    setError("");
    setFields({});
    setSaving(publish ? "publish" : "draft");

    const body: Record<string, unknown> = {
      title,
      slug: slug || undefined,
      excerpt,
      content,
      category,
      publishedAt,
      featured,
      published: publish,
    };
    // Send the image only when it changed (a demo image cannot be re-sent).
    if (!article || image?.url !== savedImage?.url) {
      body.image = image ? { url: image.url, publicId: image.publicId } : null;
    }

    const result = article
      ? await sendJson<{ article: Article }>(`/api/articles/${article.id}`, body, "PATCH")
      : await sendJson<{ article: Article }>("/api/articles", body);
    setSaving(null);

    if (!result.ok) {
      setFields(result.fields ?? {});
      setError(result.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const notice = publish ? (article?.published ? "updated" : "published") : "draft";
    router.push(`/admin/news?notice=${notice}`);
    router.refresh();
  }

  const firstError = (key: string) => fields[key]?.[0];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(true);
      }}
      noValidate
    >
      {error && <Notice tone="error">{error}</Notice>}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/news" className="text-sm font-semibold text-green-card hover:underline">
          ← All stories
        </Link>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outlineDark"
            disabled={saving !== null}
            onClick={() => save(false)}
          >
            {saving === "draft" ? "Saving..." : "Save draft"}
          </Button>
          <Button type="submit" variant="dark" disabled={saving !== null}>
            {saving === "publish"
              ? "Publishing..."
              : article?.published
                ? "Update story"
                : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Panel className="space-y-5">
            <Field label="Title" htmlFor="title" error={firstError("title")}>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="Lions roar to a 6-wicket win"
                maxLength={150}
                required
              />
            </Field>
            <Field
              label="Web address (slug)"
              htmlFor="slug"
              error={firstError("slug")}
              hint={`/news/${slug || "your-title"}`}
            >
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="made-from-the-title"
              />
            </Field>
            <Field
              label="Short summary"
              htmlFor="excerpt"
              error={firstError("excerpt")}
              hint={`${excerpt.length}/300. Shown on cards and when the link is shared.`}
            >
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                maxLength={300}
                required
              />
            </Field>
          </Panel>

          <Panel>
            <Field
              label="Story"
              error={firstError("content")}
              hint="Pictures added inside the story with the Image button: 1200 px wide or more, any shape. They fill the width of the story."
            >
              <RichTextEditor value={content} onChange={setContent} />
            </Field>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel>
            <ImageDropzone
              folder="news"
              label="Cover image"
              size="1600 × 900 px (16:9 wide)"
              hint="Used on the news cards, the story page and when the link is shared. A tall poster still works but shows blurred bars on the sides."
              value={image}
              onChange={(value) => {
                setImage(value);
                setError("");
                setFields({});
              }}
              persistedPublicId={savedImage?.publicId}
            />
            {firstError("image") && (
              <p role="alert" className="mt-2 text-xs text-flag-red">{firstError("image")}</p>
            )}
          </Panel>

          <Panel className="space-y-5">
            <Field label="Category" htmlFor="category" error={firstError("category")}>
              <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Publish date" htmlFor="date" error={firstError("publishedAt")}>
              <Input id="date" type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
            </Field>
            <Checkbox
              label="Show on homepage"
              hint="Every published story is already shown on the home page, newest first. This tick is not needed any more."
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
          </Panel>

          {article?.published && (
            <a
              href={`/news/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm font-semibold text-green-card hover:underline"
            >
              View on the website ↗
            </a>
          )}
        </div>
      </div>
    </form>
  );
}
