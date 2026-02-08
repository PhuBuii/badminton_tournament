import { describe, it, expect } from 'vitest';
import { areGroupMatchesComplete } from '@/lib/utils/groupCompletion';
import { Match, Team } from '@/lib/types';

describe('areGroupMatchesComplete', () => {
  const createTeam = (id: string, group: 'A' | 'B'): Team => ({
    id,
    players: [
      { id: `${id}-p1`, name: 'Player 1' },
      { id: `${id}-p2`, name: 'Player 2' },
    ],
    group,
    points: 0,
    scored: 0,
    conceded: 0,
    diff: 0,
  });

  const createMatch = (
    id: string,
    team1Id: string,
    team2Id: string,
    stage: Match['stage'],
    status: 'pending' | 'finished'
  ): Match => ({
    id,
    stage,
    team1Id,
    team2Id,
    status,
  });

  it('returns false when no matches exist', () => {
    const teams = [createTeam('t1', 'A'), createTeam('t2', 'A')];
    const matches: Match[] = [];

    const result = areGroupMatchesComplete(matches, 'A', teams);

    expect(result).toBe(false);
  });

  it('returns false when some group matches are pending', () => {
    const teams = [
      createTeam('t1', 'A'),
      createTeam('t2', 'A'),
      createTeam('t3', 'A'),
    ];
    const matches = [
      createMatch('m1', 't1', 't2', 'Group', 'finished'),
      createMatch('m2', 't1', 't3', 'Group', 'pending'),
      createMatch('m3', 't2', 't3', 'Group', 'finished'),
    ];

    const result = areGroupMatchesComplete(matches, 'A', teams);

    expect(result).toBe(false);
  });

  it('returns true when all group matches are finished', () => {
    const teams = [
      createTeam('t1', 'A'),
      createTeam('t2', 'A'),
      createTeam('t3', 'A'),
    ];
    const matches = [
      createMatch('m1', 't1', 't2', 'Group', 'finished'),
      createMatch('m2', 't1', 't3', 'Group', 'finished'),
      createMatch('m3', 't2', 't3', 'Group', 'finished'),
    ];

    const result = areGroupMatchesComplete(matches, 'A', teams);

    expect(result).toBe(true);
  });

  it('only checks matches for the specified group (ignores other group)', () => {
    const teams = [
      createTeam('t1', 'A'),
      createTeam('t2', 'A'),
      createTeam('t3', 'B'),
      createTeam('t4', 'B'),
    ];
    const matches = [
      // Group A - all finished
      createMatch('m1', 't1', 't2', 'Group', 'finished'),
      // Group B - has pending
      createMatch('m2', 't3', 't4', 'Group', 'pending'),
    ];

    const resultA = areGroupMatchesComplete(matches, 'A', teams);
    const resultB = areGroupMatchesComplete(matches, 'B', teams);

    expect(resultA).toBe(true);
    expect(resultB).toBe(false);
  });

  it('ignores non-group stage matches', () => {
    const teams = [createTeam('t1', 'A'), createTeam('t2', 'A')];
    const matches = [
      createMatch('m1', 't1', 't2', 'Group', 'finished'),
      createMatch('m2', 't1', 't2', 'Semi', 'pending'), // Should be ignored
      createMatch('m3', 't1', 't2', 'Final', 'pending'), // Should be ignored
    ];

    const result = areGroupMatchesComplete(matches, 'A', teams);

    expect(result).toBe(true);
  });
});
