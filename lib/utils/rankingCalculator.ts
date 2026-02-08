import { Team, Match } from '../types';

/**
 * Calculate ranking for teams in a group
 * Football-style scoring: Win = +3 points, Loss = -3 points
 * Sort criteria: 1. Points DESC -> 2. Point Difference DESC -> 3. Total Scored DESC
 */

export function calculateRanking(teams: Team[], matches: Match[]): Team[] {
  // Reset team stats
  const updatedTeams = teams.map(team => ({
    ...team,
    points: 0,
    scored: 0,
    conceded: 0,
    diff: 0,
  }));

  // Calculate stats from finished matches
  const finishedMatches = matches.filter(
    m => m.status === 'finished' && m.stage === 'Group'
  );

  for (const match of finishedMatches) {
    const team1 = updatedTeams.find(t => t.id === match.team1Id);
    const team2 = updatedTeams.find(t => t.id === match.team2Id);

    if (!team1 || !team2 || match.score1 === undefined || match.score2 === undefined) {
      continue;
    }

    // Update scores
    team1.scored += match.score1;
    team1.conceded += match.score2;
    team2.scored += match.score2;
    team2.conceded += match.score1;

    // Football-style points: Winner gets +3, Loser gets -3
    if (match.score1 > match.score2) {
      team1.points += 3;
      team2.points -= 3;
    } else if (match.score2 > match.score1) {
      team2.points += 3;
      team1.points -= 3;
    }
    // Note: Draws not expected in badminton, but if equal scores, no points change
  }

  // Calculate diff
  updatedTeams.forEach(team => {
    team.diff = team.scored - team.conceded;
  });

  // Sort by: 1. Points DESC -> 2. Diff DESC -> 3. Scored DESC
  // Disqualified teams always at bottom
  return updatedTeams.sort((a, b) => {
    if (a.isDisqualified && !b.isDisqualified) return 1;
    if (!a.isDisqualified && b.isDisqualified) return -1;

    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.scored - a.scored;
  });
}

/**
 * Get top 2 teams from each group for knockout stage
 */
export function getQualifiedTeams(teams: Team[]): {
  groupA: Team[];
  groupB: Team[];
} {
  const groupATeams = teams.filter(t => t.group === 'A');
  const groupBTeams = teams.filter(t => t.group === 'B');

  return {
    groupA: groupATeams.slice(0, 2),
    groupB: groupBTeams.slice(0, 2),
  };
}

/**
 * Determine tournament awards based on final standings
 */
export interface Award {
  teamId: string;
  prize: string;
  rank: number;
}

export function calculateAwards(
  allTeams: Team[],
  allMatches: Match[]
): Award[] {
  const awards: Award[] = [];

  // Group stage awards: 3rd and 4th in each group
  const groupATeams = calculateRanking(
    allTeams.filter(t => t.group === 'A'),
    allMatches
  );
  const groupBTeams = calculateRanking(
    allTeams.filter(t => t.group === 'B'),
    allMatches
  );

  // All semi-finalists get Revive drink
  const semiFinalists = [
    ...groupATeams.slice(0, 2),
    ...groupBTeams.slice(0, 2),
  ];

  // Find final match
  const finalMatch = allMatches.find(m => m.stage === 'Final' && m.status === 'finished');

  if (finalMatch && finalMatch.score1 !== undefined && finalMatch.score2 !== undefined) {
    const championId = finalMatch.score1 > finalMatch.score2
      ? finalMatch.team1Id
      : finalMatch.team2Id;
    const runnerUpId = finalMatch.score1 > finalMatch.score2
      ? finalMatch.team2Id
      : finalMatch.team1Id;

    awards.push({ teamId: championId, prize: '300,000 VND 🏆', rank: 1 });
    awards.push({ teamId: runnerUpId, prize: '100,000 VND 🥈', rank: 2 });
  }

  // Semi-finalists (all top 4)
  semiFinalists.forEach(team => {
    if (!awards.find(a => a.teamId === team.id)) {
      awards.push({ teamId: team.id, prize: 'Chai Revive 💪', rank: 3 });
    }
  });

  // 3rd-4th in group stage
  if (groupATeams[2]) {
    awards.push({ teamId: groupATeams[2].id, prize: '💛', rank: 5 });
  }
  if (groupATeams[3]) {
    awards.push({ teamId: groupATeams[3].id, prize: '💛', rank: 6 });
  }
  if (groupBTeams[2]) {
    awards.push({ teamId: groupBTeams[2].id, prize: '💛', rank: 5 });
  }
  if (groupBTeams[3]) {
    awards.push({ teamId: groupBTeams[3].id, prize: '💛', rank: 6 });
  }

  return awards;
}
