import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player, Team, Match, TournamentState, TournamentConfig } from '../types';
import { generateTournament } from '../utils/drawEngine';
import { generateGroupMatches, generateKnockoutMatches, generateFinalMatches } from '../utils/matchScheduler';
import { calculateRanking } from '../utils/rankingCalculator';

interface TournamentStore {
  // State
  players: Player[];
  teams: Team[];
  matches: Match[];
  currentStage: TournamentState;
  config: TournamentConfig | null;
  useTiers: boolean;
  useFixedPairs: boolean;

  // Actions
  addPlayer: (name: string) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  addPlayers: (count: number) => void;
  removePlayers: (count: number) => void;
  setUseTiers: (use: boolean) => void;
  setUseFixedPairs: (use: boolean) => void;
  
  generateDraw: () => void;
  updateMatchScore: (matchId: string, score1: number, score2: number) => void;
  disqualifyTeam: (teamId: string) => void; // New action
  advanceToKnockout: () => void;
  completeKnockout: () => void;
  resetTournament: () => void;
  
  // Computed
  getRankedTeams: (group?: 'A' | 'B') => Team[];
  getMatchesByStage: (stage: Match['stage']) => Match[];
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      // Initial state
      players: Array.from({ length: 8 }, (_, i) => ({
        id: `player-${i + 1}`,
        name: '',
      })),
      teams: [],
      matches: [],
      currentStage: 'setup',
      config: null,
      useTiers: false,
      useFixedPairs: false,

      // Player management
      addPlayer: (name) => {
        const newId = `player-${Date.now()}`;
        set(state => ({
          players: [...state.players, { id: newId, name }],
        }));
      },

      updatePlayer: (id, updates) => {
        set(state => ({
          players: state.players.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removePlayer: (id) => {
        set(state => ({
          players: state.players.filter(p => p.id !== id),
        }));
      },

      addPlayers: (count) => {
        set(state => {
          const newPlayers = Array.from({ length: count }, (_, i) => ({
            id: `player-${Date.now()}-${i}`,
            name: '',
          }));
          return { players: [...state.players, ...newPlayers] };
        });
      },

      removePlayers: (count) => {
        set(state => ({
          players: state.players.slice(0, -count),
        }));
      },

      setUseTiers: (use) => {
        set({ useTiers: use });
        if (!use) {
          // Clear tier data
          set(state => ({
            players: state.players.map(p => ({ ...p, tier: undefined })),
          }));
        }
      },

      setUseFixedPairs: (use) => {
        set({ useFixedPairs: use });
        if (!use) {
          // Clear fixed pair data
          set(state => ({
            players: state.players.map(p => ({
              ...p,
              isFixed: undefined,
              partnerId: undefined,
            })),
          }));
        }
      },

      // Generate tournament
      generateDraw: () => {
        const { players } = get();
        
        // Validate
        const validPlayers = players.filter(p => p.name.trim() !== '');
        if (validPlayers.length < 4 || validPlayers.length % 2 !== 0) {
          throw new Error('Cần số chẵn người chơi (tối thiểu 4) và tất cả phải có tên');
        }

        try {
          // Generate teams and groups
          const teams = generateTournament(validPlayers);
          
          // Generate group stage matches
          const matches = generateGroupMatches(teams);

          const config: TournamentConfig = {
            totalPlayers: validPlayers.length,
            totalTeams: teams.length,
            teamsPerGroup: teams.length / 2,
          };

          set({
            teams,
            matches,
            config,
            currentStage: 'drawn',
          });
        } catch (error) {
          console.error('Draw error:', error);
          throw error;
        }
      },

      // Update match score
      updateMatchScore: (matchId, score1, score2) => {
        set(state => {
          const updatedMatches = state.matches.map(m =>
            m.id === matchId
              ? { ...m, score1, score2, status: 'finished' as const }
              : m
          );

          // Recalculate team rankings
          const updatedTeams = calculateRanking(state.teams, updatedMatches);

          return {
            matches: updatedMatches,
            teams: updatedTeams,
          };
        });

        // Check if all group matches are finished
        const { matches } = get();
        const groupMatches = matches.filter(m => m.stage === 'Group');
        const allGroupFinished = groupMatches.every(m => m.status === 'finished');

        if (allGroupFinished) {
          set({ currentStage: 'group_stage' });
        }
      },

      // Disqualify team (Withdrawal handling)
      disqualifyTeam: (teamId) => {
        if (!confirm('Bạn có chắc chắn muốn loại đội này? Tất cả các trận đấu của họ sẽ bị xử thua 0-21.')) {
          return;
        }

        set(state => {
          // 1. Mark team as disqualified
          const updatedTeams = state.teams.map(t => 
            t.id === teamId ? { ...t, isDisqualified: true } : t
          );

          // 2. Update all matches involving this team (both Group and Knockout)
          const updatedMatches = state.matches.map(m => {
            if (m.team1Id === teamId) {
              return { ...m, score1: 0, score2: 21, status: 'finished' as const };
            }
            if (m.team2Id === teamId) {
              return { ...m, score1: 21, score2: 0, status: 'finished' as const };
            }
            return m;
          });

          // 3. Recalculate rankings
          const recalculatedTeams = calculateRanking(updatedTeams, updatedMatches);

          return {
            teams: recalculatedTeams,
            matches: updatedMatches,
          };
        });
      },

      // Advance to knockout stage
      advanceToKnockout: () => {
        const { teams, matches } = get();
        
        try {
          const knockoutMatches = generateKnockoutMatches(teams);
          
          set(state => ({
            matches: [...state.matches, ...knockoutMatches],
            currentStage: 'knockout',
          }));
        } catch (error) {
          console.error('Knockout generation error:', error);
          throw error;
        }
      },

      // Complete knockout and generate finals
      completeKnockout: () => {
        const { matches, teams } = get();
        
        const semiMatches = matches.filter(m => m.stage === 'Semi');
        const allSemiFinished = semiMatches.every(m => m.status === 'finished');

        if (!allSemiFinished) {
          throw new Error('Cả 2 trận bán kết phải hoàn thành');
        }

        try {
          const finalMatches = generateFinalMatches(semiMatches, teams);
          
          set(state => ({
            matches: [...state.matches, ...finalMatches],
          }));
        } catch (error) {
          console.error('Final generation error:', error);
          throw error;
        }

        // Check if all matches are finished
        const { matches: allMatches } = get();
        const finalMatch = allMatches.find(m => m.stage === 'Final');
        if (finalMatch && finalMatch.status === 'finished') {
          set({ currentStage: 'completed' });
        }
      },

      // Reset tournament
      resetTournament: () => {
        set({
          players: Array.from({ length: 8 }, (_, i) => ({
            id: `player-${i + 1}`,
            name: '',
          })),
          teams: [],
          matches: [],
          currentStage: 'setup',
          config: null,
          useTiers: false,
          useFixedPairs: false,
        });
      },

      // Computed functions
      getRankedTeams: (group) => {
        const { teams, matches } = get();
        let filteredTeams = teams;
        
        if (group) {
          filteredTeams = teams.filter(t => t.group === group);
        }
        
        return calculateRanking(filteredTeams, matches);
      },

      getMatchesByStage: (stage) => {
        const { matches } = get();
        return matches.filter(m => m.stage === stage);
      },
    }),
    {
      name: 'ao-lang-tournament',
    }
  )
);
