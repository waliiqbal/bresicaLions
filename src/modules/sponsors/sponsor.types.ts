export interface Sponsor {
  id: string;
  name: string;
  url?: string;
  logo?: string;
  /** Cloudinary id of the logo (not set for sample sponsors). */
  logoPublicId?: string;
  order: number;
  active: boolean;
  isDemo?: boolean;
}
