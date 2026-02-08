import { describe, it, expect } from 'vitest';
import { validateMatchScore } from '@/lib/utils/validateMatchScore';

describe('validateMatchScore', () => {
  describe('Valid scores', () => {
    it('accepts 0-21 (score 0 is valid)', () => {
      const result = validateMatchScore('0', '21');
      expect(result.valid).toBe(true);
      expect(result.s1).toBe(0);
      expect(result.s2).toBe(21);
      expect(result.error).toBeUndefined();
    });

    it('accepts 21-0 (score 0 is valid)', () => {
      const result = validateMatchScore('21', '0');
      expect(result.valid).toBe(true);
      expect(result.s1).toBe(21);
      expect(result.s2).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('accepts 15-21', () => {
      const result = validateMatchScore('15', '21');
      expect(result.valid).toBe(true);
      expect(result.s1).toBe(15);
      expect(result.s2).toBe(21);
      expect(result.error).toBeUndefined();
    });

    it('accepts 21-19', () => {
      const result = validateMatchScore('21', '19');
      expect(result.valid).toBe(true);
      expect(result.s1).toBe(21);
      expect(result.s2).toBe(19);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid scores - empty inputs', () => {
    it('rejects empty string for score1', () => {
      const result = validateMatchScore('', '21');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });

    it('rejects empty string for score2', () => {
      const result = validateMatchScore('21', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });

    it('rejects both empty strings', () => {
      const result = validateMatchScore('', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });
  });

  describe('Invalid scores - draws', () => {
    it('rejects 0-0 draw', () => {
      const result = validateMatchScore('0', '0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hòa');
    });

    it('rejects 15-15 draw', () => {
      const result = validateMatchScore('15', '15');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hòa');
    });

    it('rejects 21-21 draw', () => {
      const result = validateMatchScore('21', '21');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hòa');
    });
  });

  describe('Invalid scores - negative numbers', () => {
    it('rejects negative score1', () => {
      const result = validateMatchScore('-5', '21');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });

    it('rejects negative score2', () => {
      const result = validateMatchScore('21', '-3');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });

    it('rejects both negative scores', () => {
      const result = validateMatchScore('-10', '-5');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });
  });

  describe('Invalid scores - non-numeric inputs', () => {
    it('rejects non-numeric score1', () => {
      const result = validateMatchScore('abc', '21');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });

    it('rejects non-numeric score2', () => {
      const result = validateMatchScore('21', 'xyz');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });

    it('rejects floating point numbers', () => {
      const result = validateMatchScore('21.5', '19');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('hợp lệ');
    });
  });
});
