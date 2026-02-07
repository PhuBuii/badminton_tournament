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
  // Check if we have tier information
  const hasTiers = players.some(p => p.tier !== undefined);
  
  if (!hasTiers) {
    // Simple mode: random pairing
    return simpleRandomPairing(players);
  }

  // Smart pairing mode with tiers
  return smartTierPairing(players);
}

function simpleRandomPairing(players: Player[]): Team[] {
  const shuffled = shuffleArray([...players]);
  const teams: Team[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    const player1 = shuffled[i];
    const player2 = shuffled[i + 1];
    const teamName = `${player1.name} & ${player2.name}`;
    
    teams.push({
      id: `team-${i / 2 + 1}-${player1.id}-${player2.id}`, // Unique stable ID
      players: [player1, player2],
      group: 'A', // Will be reassigned later
      points: 0,
      scored: 0,
      conceded: 0,
      diff: 0,
    });
  }

  return teams;
}

function smartTierPairing(players: Player[]): Team[] {
  const teams: Team[] = [];
  let teamCounter = 1;

  // Step 1: Handle fixed pairs first
  const fixedPairs = new Set<string>();
  const remaining = [...players];

  for (const player of players) {
    if (player.isFixed && player.partnerId && !fixedPairs.has(player.id)) {
      const partner = players.find(p => p.id === player.partnerId);
      if (partner && player.partnerId === partner.id && partner.partnerId === player.id) {
        const player1 = player;
        const player2 = partner;
        
        teams.push({
          id: `team-${teamCounter++}-${player1.id}-${player2.id}`,
          players: [player1, player2],
          group: 'A',
          points: 0,
          scored: 0,
          conceded: 0,
          diff: 0,
        });
        fixedPairs.add(player.id);
        fixedPairs.add(partner.id);
        
        // Remove from remaining
        const idx1 = remaining.findIndex(p => p.id === player.id);
        const idx2 = remaining.findIndex(p => p.id === partner.id);
        if (idx1 > -1) remaining.splice(idx1, 1);
        if (idx2 > -1) remaining.splice(idx2 > idx1 ? idx2 - 1 : idx2, 1);
      }
    }
  }

  // Step 2: Pair remaining Strong with Weak
  const strong = shuffleArray(remaining.filter(p => p.tier === 'Strong'));
  const weak = shuffleArray(remaining.filter(p => p.tier === 'Weak'));

  const minLength = Math.min(strong.length, weak.length);
  
  for (let i = 0; i < minLength; i++) {
    const player1 = strong[i];
    const player2 = weak[i];
    
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

  // Step 3: Handle remaining unpaired players (if any)
  const unpaired = [
    ...strong.slice(minLength),
    ...weak.slice(minLength),
  ];

  for (let i = 0; i < unpaired.length; i += 2) {
    if (i + 1 < unpaired.length) {
      const player1 = unpaired[i];
      const player2 = unpaired[i + 1];
      
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
