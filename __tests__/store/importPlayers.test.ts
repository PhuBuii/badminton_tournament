import { describe, it, expect, beforeEach } from 'vitest';
import { useTournamentStore } from '@/lib/store/useTournamentStore';

describe('importPlayers store action', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useTournamentStore.getState().resetTournament();
  });

  it('imports 14 players correctly', () => {
    const store = useTournamentStore.getState();
    const testNames = ["Thư", "Thuận", "Lộc", "Phú", "Meo", "Kiệt", "Triển", "Nghĩa", "Phát", "Phúc", "Hậu", "Tân", "Ngọc", "Thanh"];
    
    store.importPlayers(testNames);
    
    const players = useTournamentStore.getState().players;
    expect(players).toHaveLength(14);
    
    // Verify all names are imported correctly
    players.forEach((player, index) => {
      expect(player.name).toBe(testNames[index]);
    });
  });

  it('preserves existing settings (useTiers, useFixedPairs)', () => {
    const store = useTournamentStore.getState();
    
    // Set some settings
    store.setUseTiers(true);
    store.setUseFixedPairs(true);
    
    const testNames = ["Thư", "Thuận", "Lộc", "Phú"];
    store.importPlayers(testNames);
    
    // Verify settings are unchanged
    const state = useTournamentStore.getState();
    expect(state.useTiers).toBe(true);
    expect(state.useFixedPairs).toBe(true);
  });

  it('generates unique IDs for imported players', () => {
    const store = useTournamentStore.getState();
    const testNames = ["Thư", "Thuận", "Lộc", "Phú", "Meo", "Kiệt"];
    
    store.importPlayers(testNames);
    
    const players = useTournamentStore.getState().players;
    const ids = players.map(p => p.id);
    const uniqueIds = new Set(ids);
    
    // All IDs should be unique
    expect(uniqueIds.size).toBe(ids.length);
    
    // IDs should follow pattern
    ids.forEach(id => {
      expect(id).toMatch(/^player-\d+-\d+$/);
    });
  });

  it('rejects empty array and does not change state', () => {
    const store = useTournamentStore.getState();
    const initialPlayers = [...store.players];
    
    store.importPlayers([]);
    
    const players = useTournamentStore.getState().players;
    expect(players).toEqual(initialPlayers);
  });

  it('resets previous players when importing', () => {
    const store = useTournamentStore.getState();
    
    // Add some players first
    store.updatePlayer('player-1', { name: 'OldPlayer1' });
    store.updatePlayer('player-2', { name: 'OldPlayer2' });
    
    const oldPlayers = [...useTournamentStore.getState().players];
    expect(oldPlayers.some(p => p.name === 'OldPlayer1')).toBe(true);
    
    // Import new players
    const testNames = ["Thư", "Thuận", "Lộc", "Phú"];
    store.importPlayers(testNames);
    
    // Verify old players are replaced
    const newPlayers = useTournamentStore.getState().players;
    expect(newPlayers).toHaveLength(4);
    expect(newPlayers.some(p => p.name === 'OldPlayer1')).toBe(false);
    expect(newPlayers.every(p => testNames.includes(p.name))).toBe(true);
  });

  it('imported players have no tier or partner data initially', () => {
    const store = useTournamentStore.getState();
    const testNames = ["Thư", "Thuận", "Lộc", "Phú"];
    
    store.importPlayers(testNames);
    
    const players = useTournamentStore.getState().players;
    players.forEach(player => {
      expect(player.tier).toBeUndefined();
      expect(player.partnerId).toBeUndefined();
      expect(player.isFixed).toBeUndefined();
    });
  });
});
