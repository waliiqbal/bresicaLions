/** Coaching and support staff (head coach, physio...). */
export interface StaffMember {
  id: string;
  /** Used in the profile page address (/squad/staff/<slug>). */
  slug?: string;
  name: string;
  role: string;
  /** Short line shown on the card. */
  bio?: string;
  /** Longer profile text shown on the staff page. */
  profile?: string;
  experience?: string;
  speciality?: string;
  image?: string;
  /** Cloudinary id of the photo (not set for demo photos). */
  imagePublicId?: string;
  order?: number;
  isDemo?: boolean;
}
