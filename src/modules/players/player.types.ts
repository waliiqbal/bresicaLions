export const PLAYER_ROLES = [
  "Batter",
  "Bowler",
  "All-rounder",
  "Wicketkeeper",
] as const;

export type PlayerRole = (typeof PLAYER_ROLES)[number];

export interface Player {
  id: string;
  slug: string;
  name: string;
  number: number;
  role: PlayerRole;
  isCaptain: boolean;
  battingStyle: string;
  bowlingStyle: string;
  bio: string;
  image?: string;
  /** Cloudinary id of the photo (not set for demo photos). */
  imagePublicId?: string;
  isDemo?: boolean;
}
