import mongoose from "mongoose";
// import { albums } from "@/data/gallery"; // only used by the old static version below
import { connectDB } from "@/lib/db";
import { removeStoredImage } from "@/lib/images";
import { uniqueSlug } from "@/lib/slug";
import type {
  AddPhotosInput,
  CreateAlbumInput,
  UpdateAlbumInput,
} from "./gallery.dto";
import { AlbumModel, type AlbumDoc } from "./gallery.schema";
import type { Album, GalleryItem } from "./gallery.types";

export function toAlbum(doc: AlbumDoc): Album {
  const albumId = String(doc._id);
  return {
    id: albumId,
    slug: doc.slug,
    title: doc.title,
    createdAt: doc.createdAt.toISOString(),
    isDemo: doc.isDemo,
    photos: doc.photos.map((photo, i) => ({
      id: String(photo._id),
      albumId,
      src: photo.url,
      alt: photo.alt || `${doc.title} photo ${i + 1}`,
      publicId: photo.publicId || undefined,
    })),
  };
}

// ------------------------------------------------------------ public site
// ------------------------------------------------------------ public site
// The public gallery reads the albums saved in MongoDB (added in the admin panel).
// Albums without photos are hidden.

/** Albums that have at least one photo, newest first. */
export async function getAlbums() {
  await connectDB();
  const docs = await AlbumModel.find({ "photos.0": { $exists: true } })
    .sort({ createdAt: -1 })
    .lean<AlbumDoc[]>();
  return docs.map(toAlbum);
}

/**
 * Photos for the home page gallery: the cover of each of the newest albums,
 * then, if there are fewer albums than `limit`, more photos from those albums.
 */
export async function getLatestGalleryItems(limit = 5): Promise<GalleryItem[]> {
  const albums = await getAlbums();
  const items: GalleryItem[] = [];
  for (let round = 0; items.length < limit; round++) {
    const before = items.length;
    for (const album of albums) {
      const photo = album.photos[round];
      if (photo && items.length < limit) {
        items.push({ ...photo, albumTitle: album.title, albumSlug: album.slug });
      }
    }
    if (items.length === before) break;
  }
  return items;
}

export async function getAlbumBySlug(slug: string) {
  await connectDB();
  const doc = await AlbumModel.findOne({ slug, "photos.0": { $exists: true } }).lean<AlbumDoc>();
  return doc ? toAlbum(doc) : null;
}

export async function getAlbumSlugs() {
  return (await getAlbums()).map((album) => album.slug);
}

// ---- Old static version (sample photos from src/data/gallery.ts), kept for reference:
// // The public gallery is static for now: it reads the albums in
// // `src/data/gallery.ts` (photos in `public/images/sample/`), not MongoDB.
// // The admin functions below still use the database.
//
// const staticAlbums: Album[] = [...albums]
//   .map((album) => ({ ...album, isDemo: false }))
//   .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
//
// /** Albums that have at least one photo, newest first. */
// export async function getAlbums() {
//   return staticAlbums.filter((album) => album.photos.length > 0);
// }
//
// /**
//  * Photos for the home page gallery: the cover of each of the newest albums,
//  * then, if there are fewer albums than `limit`, more photos from those albums.
//  */
// export async function getLatestGalleryItems(limit = 5): Promise<GalleryItem[]> {
//   const albums = await getAlbums();
//   const items: GalleryItem[] = [];
//   for (let round = 0; items.length < limit; round++) {
//     const before = items.length;
//     for (const album of albums) {
//       const photo = album.photos[round];
//       if (photo && items.length < limit) {
//         items.push({ ...photo, albumTitle: album.title, albumSlug: album.slug });
//       }
//     }
//     if (items.length === before) break;
//   }
//   return items;
// }
//
// export async function getAlbumBySlug(slug: string) {
//   return (await getAlbums()).find((album) => album.slug === slug) ?? null;
// }
//
// export async function getAlbumSlugs() {
//   return (await getAlbums()).map((album) => album.slug);
// }

// ------------------------------------------------------------ admin panel

export async function listAlbumsForAdmin() {
  await connectDB();
  const docs = await AlbumModel.find().sort({ createdAt: -1 }).lean<AlbumDoc[]>();
  return docs.map(toAlbum);
}

export async function countAlbums() {
  await connectDB();
  const docs = await AlbumModel.find().select("photos").lean<AlbumDoc[]>();
  return {
    albums: docs.length,
    photos: docs.reduce((sum, d) => sum + d.photos.length, 0),
  };
}

export async function getAlbumForAdmin(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectDB();
  const doc = await AlbumModel.findById(id).lean<AlbumDoc>();
  return doc ? toAlbum(doc) : null;
}

type AlbumResult =
  | { ok: true; album: Album }
  | { ok: false; code: "not_found" | "slug_taken"; message: string };

const NOT_FOUND: AlbumResult = { ok: false, code: "not_found", message: "Album not found." };
const SLUG_TAKEN: AlbumResult = {
  ok: false,
  code: "slug_taken",
  message: "This web address is already used by another album.",
};

const slugTaken = async (slug: string, exceptId?: string) =>
  Boolean(
    await AlbumModel.exists({
      slug,
      ...(exceptId ? { _id: { $ne: exceptId } } : {}),
    }),
  );

export async function createAlbum(input: CreateAlbumInput): Promise<AlbumResult> {
  await connectDB();
  let slug = input.slug;
  if (slug) {
    if (await slugTaken(slug)) return SLUG_TAKEN;
  } else {
    slug = await uniqueSlug(input.title, (s) => slugTaken(s), "album");
  }
  const doc = await AlbumModel.create({ title: input.title, slug });
  return { ok: true, album: toAlbum(doc.toObject()) };
}

export async function updateAlbum(
  id: string,
  input: UpdateAlbumInput,
): Promise<AlbumResult> {
  if (!mongoose.isValidObjectId(id)) return NOT_FOUND;
  await connectDB();
  if (input.slug && (await slugTaken(input.slug, id))) return SLUG_TAKEN;

  const update: Record<string, unknown> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.slug !== undefined) update.slug = input.slug;

  const doc = await AlbumModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean<AlbumDoc>();
  return doc ? { ok: true, album: toAlbum(doc) } : NOT_FOUND;
}

/** Deletes the album and every photo in it (also from Cloudinary). */
export async function deleteAlbum(id: string) {
  if (!mongoose.isValidObjectId(id)) return false;
  await connectDB();
  const doc = await AlbumModel.findByIdAndDelete(id).lean<AlbumDoc>();
  if (!doc) return false;
  await Promise.all(
    doc.photos.map((photo) =>
      removeStoredImage({ url: photo.url, publicId: photo.publicId }),
    ),
  );
  return true;
}

export async function addPhotos(
  id: string,
  { photos }: AddPhotosInput,
): Promise<AlbumResult> {
  if (!mongoose.isValidObjectId(id)) return NOT_FOUND;
  await connectDB();
  const doc = await AlbumModel.findByIdAndUpdate(
    id,
    { $push: { photos: { $each: photos.map((p) => ({ url: p.url, publicId: p.publicId })) } } },
    { new: true },
  ).lean<AlbumDoc>();
  return doc ? { ok: true, album: toAlbum(doc) } : NOT_FOUND;
}

export async function removePhoto(albumId: string, photoId: string) {
  if (!mongoose.isValidObjectId(albumId) || !mongoose.isValidObjectId(photoId)) {
    return false;
  }
  await connectDB();
  const doc = await AlbumModel.findOneAndUpdate(
    { _id: albumId, "photos._id": photoId },
    { $pull: { photos: { _id: photoId } } },
    { new: false },
  ).lean<AlbumDoc>();
  if (!doc) return false;

  const removed = doc.photos.find((p) => String(p._id) === photoId);
  if (removed) {
    await removeStoredImage({ url: removed.url, publicId: removed.publicId });
  }
  return true;
}

/** The first photo is the cover: move this one to the front. */
export async function setCover(albumId: string, photoId: string) {
  if (!mongoose.isValidObjectId(albumId) || !mongoose.isValidObjectId(photoId)) {
    return null;
  }
  await connectDB();
  const doc = await AlbumModel.findById(albumId);
  if (!doc) return null;

  const index = doc.photos.findIndex((p) => String(p._id) === photoId);
  if (index < 0) return null;
  if (index > 0) {
    const [photo] = doc.photos.splice(index, 1);
    doc.photos.unshift(photo);
    await doc.save();
  }
  return toAlbum(doc.toObject());
}
