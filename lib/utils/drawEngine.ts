import { Player, Team } from '../types';

/**
 * "Ao Làng" Draw Engine - Flexible Version
 * Supports any even number of players with equal group distribution
 */

export function generateTournament(players: Player[]): Team[] {
  // Validation
  if (players.length < 4 || players.length % 2 !== 0) {
    throw new Error('Số người chơi phải là số chẵn và tối thiểu 4 người');
  }

  const totalTeams = players.length / 2;
  // Allow odd number of teams (e.g. 10 players = 5 teams)

  // Step 1: Create teams based on pairing mode
  const teams = createTeams(players);

  // Step 2: Shuffle and assign groups
  // If odd, Group A gets fewer teams (e.g., 7 teams → A=3, B=4)
  const shuffledTeams = shuffleArray([...teams]);
  const halfPoint = Math.floor(totalTeams / 2);

  // Track group counters for team numbering
  const groupCounters = { A: 0, B: 0 };
  const assignedTeams = shuffledTeams.map((team, index) => {
    const group = (index < halfPoint ? 'A' : 'B') as 'A' | 'B';
    groupCounters[group]++;
    return {
      ...team,
      group,
      teamNumber: `${group}${groupCounters[group]}`,
    };
  });

  return assignedTeams;
}

function createTeams(players: Player[]): Team[] {
  const teams: Team[] = [];
  let teamCounter = 1;

  // Step 1: Handle fixed pairs first
  const fixedPairs = new Set<string>();

  // We need to process fixed pairs from the original list
  for (const player of players) {
    if (player.isFixed && player.partnerId && !fixedPairs.has(player.id)) {
      const partner = players.find(p => p.id === player.partnerId);
      // Validate the partnership is mutual and exists
      if (partner && partner.partnerId === player.id && !fixedPairs.has(partner.id)) {
        const player1 = player;
        const player2 = partner;

        teams.push({
          id: `team-${teamCounter++}-${player1.id}-${player2.id}`,
          players: [player1, player2],
          group: 'A', // Will be reassigned
          points: 0,
          scored: 0,
          conceded: 0,
          diff: 0,
        });

        fixedPairs.add(player1.id);
        fixedPairs.add(player2.id);
      }
    }
  }

  // Identify remaining players
  const remaining = players.filter(p => !fixedPairs.has(p.id));

  // Step 2: Handle Tiers (Strong vs Weak)
  // We separate remaining players by tier
  const strong = remaining.filter(p => p.tier === 'Strong');
  const weak = remaining.filter(p => p.tier === 'Weak');
  const others = remaining.filter(p => p.tier !== 'Strong' && p.tier !== 'Weak');

  const shuffledStrong = shuffleArray(strong);
  const shuffledWeak = shuffleArray(weak);

  // Pair as many Strong with Weak as possible
  const minLength = Math.min(shuffledStrong.length, shuffledWeak.length);

  for (let i = 0; i < minLength; i++) {
    const player1 = shuffledStrong[i];
    const player2 = shuffledWeak[i];

    teams.push({
      id: `team-${teamCounter++}-${player1.id}-${player2.id}`,
      players: [player1, player2],
      group: 'A',
      points: 0,
      scored: 0,
      conceded: 0,
      diff: 0,
    });
  }

  // Step 3: Handle all leftovers (unpaired Strong, unpaired Weak, and Others)
  const leftoverStrong = shuffledStrong.slice(minLength);
  const leftoverWeak = shuffledWeak.slice(minLength);

  const allLeftovers = [
    ...leftoverStrong,
    ...leftoverWeak,
    ...others
  ];

  const shuffledLeftovers = shuffleArray(allLeftovers);

  // Pair them up randomly
  for (let i = 0; i < shuffledLeftovers.length; i += 2) {
    if (i + 1 < shuffledLeftovers.length) {
      const player1 = shuffledLeftovers[i];
      const player2 = shuffledLeftovers[i + 1];

      teams.push({
        id: `team-${teamCounter++}-${player1.id}-${player2.id}`,
        players: [player1, player2],
        group: 'A',
        points: 0,
        scored: 0,
        conceded: 0,
        diff: 0,
      });
    }
  }

  return teams;
}

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
