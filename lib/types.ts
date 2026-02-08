export interface Player {
  id: string;
  name: string;
  tier?: 'Strong' | 'Weak';
  isFixed?: boolean;
  partnerId?: string;
}

export interface Team {
  id: string;
  players: [Player, Player];
  group: 'A' | 'B';
  teamNumber?: string; // "A1", "B3" etc.
  points: number;
  scored: number;
  conceded: number;
  diff: number;
  isDisqualified?: boolean;
}

export interface Match {
  id: string;
  stage: 'Group' | 'Semi' | 'Final' | 'ThirdPlace' | 'Placement';
  round?: number;
  court?: number;
  team1Id: string;
  team2Id: string;
  score1?: number;
  score2?: number;
  status: 'pending' | 'finished';
}

export type TournamentState = 'setup' | 'drawn' | 'group_stage' | 'knockout' | 'completed';

export interface TournamentConfig {
  totalPlayers: number;
  totalTeams: number;
  teamsPerGroup: number;
}
