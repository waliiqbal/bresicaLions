import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/site/PageHeader";
import { PhotoGrid } from "@/components/site/PhotoGrid";
import { Section } from "@/components/site/Section";
import {
  getAlbumBySlug,
} from "@/modules/gallery/gallery.service";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) return {};

  return {
    title: album.title,
    description: `${album.photos.length} photos: ${album.title}`,
    openGraph: { images: [{ url: album.photos[0].src }] },
  };
}

export default async function AlbumPage({
  params,
}: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <>
      <PageHeader
        eyebrow={`${album.photos.length} photos · ${formatDate(album.createdAt)}`}
        gold={album.title}
      />

      <Section>
        <ButtonLink href="/gallery" variant="outline" className="mb-8">
          ← All Albums
        </ButtonLink>
        <PhotoGrid photos={album.photos} albumTitle={album.title} />
      </Section>
    </>
  );
}
