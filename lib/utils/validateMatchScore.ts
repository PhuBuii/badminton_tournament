export interface ScoreValidationResult {
  valid: boolean;
  s1: number;
  s2: number;
  error?: string;
}

/**
 * Validates badminton match scores.
 * Rules:
 * - Both scores must be non-negative integers
 * - Scores cannot be equal (no draws allowed)
 * - Empty strings are invalid
 * - Score "0" is explicitly allowed (e.g., 0-21)
 */
export function validateMatchScore(score1: string, score2: string): ScoreValidationResult {
  // Handle empty strings explicitly BEFORE parseInt
  // parseInt("") returns NaN, but we want to be explicit
  if (score1.trim() === '' || score2.trim() === '') {
    return {
      valid: false,
      s1: 0,
      s2: 0,
      error: 'Vui lòng nhập điểm số hợp lệ'
    };
  }

  // Check for floating point numbers by verifying the input contains only digits
  // This catches "21.5", "10.0", etc. before parseInt truncates them
  const isInteger1 = /^-?\d+$/.test(score1.trim());
  const isInteger2 = /^-?\d+$/.test(score2.trim());

  if (!isInteger1 || !isInteger2) {
    return {
      valid: false,
      s1: 0,
      s2: 0,
      error: 'Vui lòng nhập điểm số hợp lệ'
    };
  }

  const s1 = parseInt(score1);
  const s2 = parseInt(score2);

  // Check for non-numeric inputs (NaN) - defensive check even after regex
  if (isNaN(s1) || isNaN(s2)) {
    return {
      valid: false,
      s1: 0,
      s2: 0,
      error: 'Vui lòng nhập điểm số hợp lệ'
    };
  }

  // Check for negative scores
  // This explicitly allows 0 (0 >= 0 is true)
  if (s1 < 0 || s2 < 0) {
    return {
      valid: false,
      s1: 0,
      s2: 0,
      error: 'Vui lòng nhập điểm số hợp lệ'
    };
  }

  // Check for draw (equal scores)
  // This catches 0-0, 15-15, 21-21, etc.
  if (s1 === s2) {
    return {
      valid: false,
      s1,
      s2,
      error: 'Điểm số không thể hòa trong cầu lông. Vui lòng kiểm tra lại.'
    };
  }

  // All validations passed
  return {
    valid: true,
    s1,
    s2
  };
}
