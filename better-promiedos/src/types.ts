export interface TeamRef {
  id: string;
  name: string;
  shortName: string;
  slug: string;
}

export interface GoalEvent {
  playerName: string;
  minute: number;
  isPenalty: boolean;
  isOwnGoal: boolean;
}

export interface TvNetwork {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  slug: string;
  leagueId: string;
  leagueName: string;
  round: string | null;
  subTournament: string | null;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "suspended";
  minute: number | null;
  homeScore: number | null;
  awayScore: number | null;
  homeGoalScorers: GoalEvent[];
  awayGoalScorers: GoalEvent[];
  tvNetworks: TvNetwork[];
}

export type ZoneType =
  | "libertadores"
  | "sudamericana"
  | "relegation"
  | "promotion"
  | "playoff";

export interface LeagueTableRow {
  position: number;
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  zone: ZoneType | null;
}

export interface TopGoalscorer {
  rank: number;
  playerName: string;
  team: TeamRef;
  goals: number;
}
