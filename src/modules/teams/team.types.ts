import type { Team } from "@/modules/matches/match.types";

/** A team as the admin sees it: the badge details plus its points-table row. */
export interface TeamRecord extends Team {
  played: number;
  won: number;
  lost: number;
  points: number;
}
