import { Team, Match } from '../types';

interface ScheduleSlot {
  court: number;
  team1Label: string; // e.g., "A1", "B2"
  team2Label: string;
}

interface ScheduleRound {
  round: number;
  slots: ScheduleSlot[];
}

/**
 * Hardcoded schedule for 3A + 4B (7 teams total)
 * 
 * Lượt 1: Sân 1: A1–A2, Sân 2: B1–B2
 * Lượt 2: Sân 1: A1–A3, Sân 2: B3–B4
 * Lượt 3: Sân 1: B1–B3, Sân 2: B2–B4
 * Lượt 4: Sân 1: A2–A3, (Nghỉ)
 * Lượt 5: Sân 1: B2–B3, Sân 2: B1–B4
 */
export function getDefault7TeamSchedule(): ScheduleRound[] {
  return [
    { round: 1, slots: [
      { court: 1, team1Label: 'A1', team2Label: 'A2' },
      { court: 2, team1Label: 'B1', team2Label: 'B2' },
    ]},
    { round: 2, slots: [
      { court: 1, team1Label: 'A1', team2Label: 'A3' },
      { court: 2, team1Label: 'B3', team2Label: 'B4' },
    ]},
    { round: 3, slots: [
      { court: 1, team1Label: 'B1', team2Label: 'B3' },
      { court: 2, team1Label: 'B2', team2Label: 'B4' },
    ]},
    { round: 4, slots: [
      { court: 1, team1Label: 'A2', team2Label: 'A3' },
    ]},
    { round: 5, slots: [
      { court: 1, team1Label: 'B2', team2Label: 'B3' },
      { court: 2, team1Label: 'B1', team2Label: 'B4' },
    ]},
  ];
}

/**
 * Resolve schedule labels to actual team IDs
 */
export function resolveSchedule(
  schedule: ScheduleRound[],
  teams: Team[]
): Match[] {
  const teamMap = new Map<string, string>();
  teams.forEach(t => {
    if (t.teamNumber) teamMap.set(t.teamNumber, t.id);
  });

  const matches: Match[] = [];
  let matchId = 1;

  for (const round of schedule) {
    for (const slot of round.slots) {
      const team1Id = teamMap.get(slot.team1Label);
      const team2Id = teamMap.get(slot.team2Label);
      if (team1Id && team2Id) {
        matches.push({
          id: `match-${matchId++}`,
          stage: 'Group',
          round: round.round,
          court: slot.court,
          team1Id,
          team2Id,
          status: 'pending',
        });
      }
    }
  }

  return matches;
}

/**
 * Check if a custom schedule is available for this team configuration
 */
export function hasCustomSchedule(teamsA: number, teamsB: number): boolean {
  return teamsA === 3 && teamsB === 4;
}
