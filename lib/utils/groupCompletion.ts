import { Match, Team } from '../types';

export function areGroupMatchesComplete(
  matches: Match[],
  group: 'A' | 'B',
  teams: Team[]
): boolean {
  // Get team IDs for this group
  const groupTeamIds = new Set(
    teams.filter(t => t.group === group).map(t => t.id)
  );

  // Get group stage matches for this group's teams
  const groupMatches = matches.filter(
    m => m.stage === 'Group' && 
         groupTeamIds.has(m.team1Id) && 
         groupTeamIds.has(m.team2Id)
  );

  // Must have at least 1 match and all must be finished
  return groupMatches.length > 0 && 
         groupMatches.every(m => m.status === 'finished');
}
