import { describe, it, expect } from 'vitest';
import { getDefault7TeamSchedule, resolveSchedule, hasCustomSchedule } from '@/lib/utils/scheduleEngine';
import { Team } from '@/lib/types';

// Helper to create teams with teamNumbers matching 3A + 4B
function create7Teams(): Team[] {
  const labels = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'B4'];
  return labels.map((label, i) => ({
    id: `team-${i + 1}`,
    players: [
      { id: `p-${i * 2 + 1}`, name: `Player ${i * 2 + 1}` },
      { id: `p-${i * 2 + 2}`, name: `Player ${i * 2 + 2}` },
    ] as [{ id: string; name: string }, { id: string; name: string }],
    group: (label.startsWith('A') ? 'A' : 'B') as 'A' | 'B',
    teamNumber: label,
    points: 0,
    scored: 0,
    conceded: 0,
    diff: 0,
  }));
}

describe('scheduleEngine - getDefault7TeamSchedule', () => {
  it('has 5 rounds', () => {
    const schedule = getDefault7TeamSchedule();
    expect(schedule).toHaveLength(5);
  });

  it('Round 1 has 2 court matches', () => {
    const schedule = getDefault7TeamSchedule();
    expect(schedule[0].round).toBe(1);
    expect(schedule[0].slots).toHaveLength(2);
  });

  it('Round 4 has 1 court match (rest round)', () => {
    const schedule = getDefault7TeamSchedule();
    expect(schedule[3].round).toBe(4);
    expect(schedule[3].slots).toHaveLength(1);
  });

  it('all rounds have correct round numbers', () => {
    const schedule = getDefault7TeamSchedule();
    const rounds = schedule.map(r => r.round);
    expect(rounds).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('scheduleEngine - resolveSchedule', () => {
  it('all team labels resolve to actual teams', () => {
    const teams = create7Teams();
    const schedule = getDefault7TeamSchedule();
    const matches = resolveSchedule(schedule, teams);

    // Every match should have valid team IDs
    matches.forEach(match => {
      expect(match.team1Id).toBeTruthy();
      expect(match.team2Id).toBeTruthy();
      expect(match.team1Id).not.toBe(match.team2Id);
    });
  });

  it('total matches = 9 (3 group A round-robin + 6 group B round-robin)', () => {
    const teams = create7Teams();
    const schedule = getDefault7TeamSchedule();
    const matches = resolveSchedule(schedule, teams);

    // 3 teams round-robin: 3*(3-1)/2 = 3 matches
    // 4 teams round-robin: 4*(4-1)/2 = 6 matches
    // Total: 9
    expect(matches).toHaveLength(9);
  });

  it('every match has round and court numbers', () => {
    const teams = create7Teams();
    const schedule = getDefault7TeamSchedule();
    const matches = resolveSchedule(schedule, teams);

    matches.forEach(match => {
      expect(match.round).toBeGreaterThanOrEqual(1);
      expect(match.round).toBeLessThanOrEqual(5);
      expect(match.court).toBeGreaterThanOrEqual(1);
      expect(match.court).toBeLessThanOrEqual(2);
    });
  });

  it('all matches have Group stage', () => {
    const teams = create7Teams();
    const schedule = getDefault7TeamSchedule();
    const matches = resolveSchedule(schedule, teams);

    matches.forEach(match => {
      expect(match.stage).toBe('Group');
    });
  });

  it('matches have sequential IDs', () => {
    const teams = create7Teams();
    const schedule = getDefault7TeamSchedule();
    const matches = resolveSchedule(schedule, teams);

    matches.forEach((match, i) => {
      expect(match.id).toBe(`match-${i + 1}`);
    });
  });
});

describe('scheduleEngine - hasCustomSchedule', () => {
  it('returns true for 3A + 4B', () => {
    expect(hasCustomSchedule(3, 4)).toBe(true);
  });

  it('returns false for 3A + 3B', () => {
    expect(hasCustomSchedule(3, 3)).toBe(false);
  });

  it('returns false for 4A + 4B', () => {
    expect(hasCustomSchedule(4, 4)).toBe(false);
  });
});
