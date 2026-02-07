import { describe, it, expect, vi } from 'vitest';
import { generateTournament } from '@/lib/utils/drawEngine';
import { Player } from '@/lib/types';

// Helper to create N players with unique IDs
function createPlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
  }));
}

describe('drawEngine - group distribution', () => {
  it('7 teams (14 players): Group A has 3, Group B has 4', () => {
    const players = createPlayers(14);
    const teams = generateTournament(players);

    const groupA = teams.filter(t => t.group === 'A');
    const groupB = teams.filter(t => t.group === 'B');

    expect(teams).toHaveLength(7);
    expect(groupA).toHaveLength(3);
    expect(groupB).toHaveLength(4);
  });

  it('6 teams (12 players): Group A has 3, Group B has 3 (unchanged)', () => {
    const players = createPlayers(12);
    const teams = generateTournament(players);

    const groupA = teams.filter(t => t.group === 'A');
    const groupB = teams.filter(t => t.group === 'B');

    expect(teams).toHaveLength(6);
    expect(groupA).toHaveLength(3);
    expect(groupB).toHaveLength(3);
  });

  it('5 teams (10 players): Group A has 2, Group B has 3', () => {
    const players = createPlayers(10);
    const teams = generateTournament(players);

    const groupA = teams.filter(t => t.group === 'A');
    const groupB = teams.filter(t => t.group === 'B');

    expect(teams).toHaveLength(5);
    expect(groupA).toHaveLength(2);
    expect(groupB).toHaveLength(3);
  });
});

describe('drawEngine - team numbering', () => {
  it('assigns teamNumber like A1, A2, B1, B2, etc.', () => {
    const players = createPlayers(12); // 6 teams
    const teams = generateTournament(players);

    // Every team should have a teamNumber
    teams.forEach(team => {
      expect(team.teamNumber).toBeDefined();
      expect(team.teamNumber).toMatch(/^[AB]\d+$/);
    });

    // Group A teams should be A1, A2, A3
    const groupA = teams.filter(t => t.group === 'A');
    const aNums = groupA.map(t => t.teamNumber).sort();
    expect(aNums).toEqual(['A1', 'A2', 'A3']);

    // Group B teams should be B1, B2, B3
    const groupB = teams.filter(t => t.group === 'B');
    const bNums = groupB.map(t => t.teamNumber).sort();
    expect(bNums).toEqual(['B1', 'B2', 'B3']);
  });

  it('7 teams: A has A1-A3, B has B1-B4', () => {
    const players = createPlayers(14);
    const teams = generateTournament(players);

    const groupA = teams.filter(t => t.group === 'A');
    const groupB = teams.filter(t => t.group === 'B');

    const aNums = groupA.map(t => t.teamNumber).sort();
    const bNums = groupB.map(t => t.teamNumber).sort();

    expect(aNums).toEqual(['A1', 'A2', 'A3']);
    expect(bNums).toEqual(['B1', 'B2', 'B3', 'B4']);
  });
});
