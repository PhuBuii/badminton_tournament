import { Team, Match } from '../types';

/**
 * Generate dynamic round-robin matches for each group
 * Formula: n teams = n*(n-1)/2 matches
 */

export function generateGroupMatches(teams: Team[]): Match[] {
  const matches: Match[] = [];
  let matchId = 1;

  // Generate matches for Group A
  const groupATeams = teams.filter(t => t.group === 'A');
  const groupAMatches = generateRoundRobin(groupATeams, 'Group', matchId);
  matches.push(...groupAMatches);
  matchId += groupAMatches.length;

  // Generate matches for Group B
  const groupBTeams = teams.filter(t => t.group === 'B');
  const groupBMatches = generateRoundRobin(groupBTeams, 'Group', matchId);
  matches.push(...groupBMatches);

  return matches;
}

function generateRoundRobin(
  teams: Team[],
  stage: 'Group' | 'Semi' | 'Final' | 'ThirdPlace',
  startId: number
): Match[] {
  const matches: Match[] = [];
  let roundCounter = 1;

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `match-${startId + matches.length}`,
        stage,
        round: roundCounter++,
        team1Id: teams[i].id,
        team2Id: teams[j].id,
        status: 'pending',
      });
    }
  }

  return matches;
}

/**
 * Generate knockout stage matches (Semi-finals + Final + Third Place)
 */
export function generateKnockoutMatches(teams: Team[]): Match[] {
  const matches: Match[] = [];

  // Get top 2 from each group
  const groupA = teams.filter(t => t.group === 'A').slice(0, 2);
  const groupB = teams.filter(t => t.group === 'B').slice(0, 2);

  if (groupA.length < 2 || groupB.length < 2) {
    throw new Error('Không đủ đội để tạo vòng knockout');
  }

  // Semi-final 1: 1st A vs 2nd B
  matches.push({
    id: 'semi-1',
    stage: 'Semi',
    team1Id: groupA[0].id,
    team2Id: groupB[1].id,
    status: 'pending',
  });

  // Semi-final 2: 1st B vs 2nd A
  matches.push({
    id: 'semi-2',
    stage: 'Semi',
    team1Id: groupB[0].id,
    team2Id: groupA[1].id,
    status: 'pending',
  });

  // Placement matches (Rank 3 vs Rank 3, Rank 4 vs Rank 4, etc.)
  const groupARest = teams.filter(t => t.group === 'A').slice(2);
  const groupBRest = teams.filter(t => t.group === 'B').slice(2);
  
  const maxLength = Math.min(groupARest.length, groupBRest.length);

  for (let i = 0; i < maxLength; i++) {
    const rank = i + 3; // 3rd, 4th, etc.
    const actualRank = (rank - 1) * 2 + 1; // 5th, 7th... roughly
    matches.push({
      id: `placement-${rank}`,
      stage: 'Placement' as any, // We need to add 'Placement' to Match stage type
      round: rank,
      team1Id: groupARest[i].id,
      team2Id: groupBRest[i].id,
      status: 'pending',
    });
  }

  return matches;
}

/**
 * Generate final matches after semi-finals are completed
 */
export function generateFinalMatches(
  semiMatches: Match[],
  teams: Team[]
): Match[] {
  const matches: Match[] = [];

  const semi1 = semiMatches.find(m => m.id === 'semi-1');
  const semi2 = semiMatches.find(m => m.id === 'semi-2');

  if (!semi1 || !semi2 || semi1.status !== 'finished' || semi2.status !== 'finished') {
    throw new Error('Cả 2 trận bán kết phải hoàn thành trước');
  }

  // Determine winners and losers
  const semi1Winner = (semi1.score1 ?? 0) > (semi1.score2 ?? 0) ? semi1.team1Id : semi1.team2Id;
  const semi1Loser = (semi1.score1 ?? 0) > (semi1.score2 ?? 0) ? semi1.team2Id : semi1.team1Id;
  
  const semi2Winner = (semi2.score1 ?? 0) > (semi2.score2 ?? 0) ? semi2.team1Id : semi2.team2Id;
  const semi2Loser = (semi2.score1 ?? 0) > (semi2.score2 ?? 0) ? semi2.team2Id : semi2.team1Id;

  // Third place match
  matches.push({
    id: 'third-place',
    stage: 'ThirdPlace',
    team1Id: semi1Loser,
    team2Id: semi2Loser,
    status: 'pending',
  });

  // Final match
  matches.push({
    id: 'final',
    stage: 'Final',
    team1Id: semi1Winner,
    team2Id: semi2Winner,
    status: 'pending',
  });

  return matches;
}
