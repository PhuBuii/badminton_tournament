export interface ScoreValidationResult {
  valid: boolean;
  s1: number;
  s2: number;
  error?: string;
}

/**
 * Helper function to validate if a badminton score is valid according to international 21-point rules
 * @param winner - The winning team's score
 * @param loser - The losing team's score
 * @returns true if the score is valid, false otherwise
 * 
 * International Badminton Rules (21-point system):
 * 1. Win at 21 points minimum
 * 2. Must win by at least 2 points
 * 3. At 20-20 (deuce), play continues until one side leads by 2 points
 * 4. At 29-29 (golden point), the next point wins (max score is 30)
 * 
 * Valid scores examples:
 * - 21-0 to 21-19 (normal win)
 * - 22-20, 23-21, ..., 29-27 (deuce win with 2-point gap)
 * - 30-28, 30-29 (golden point scenarios)
 */
function isValidBadmintonScore(winner: number, loser: number): boolean {
  // Winner must have more points than loser (this should already be checked, but defensive)
  if (winner <= loser) return false;

  // Maximum score is 30 (golden point at 29-29)
  if (winner > 30 || loser > 30) return false;

  // Winner must have at least 21 points
  if (winner < 21) return false;

  // Loser cannot have negative points
  if (loser < 0) return false;

  // Normal win: 21 points with loser having 0-19 points
  if (winner === 21 && loser < 20) return true;

  // Deuce scenarios: winner 21-29, must have 2-point gap
  if (winner >= 21 && winner <= 29) {
    return (winner - loser) >= 2;
  }

  // Golden point: 30-29 or 30-28 are the only valid 30-point scores
  if (winner === 30) {
    return loser === 29 || loser === 28;
  }

  return false;
}

/**
 * Validates badminton match scores according to international 21-point rules.
 * 
 * Rules enforced:
 * - Both scores must be non-negative integers
 * - Scores cannot be equal (no draws allowed)
 * - Empty strings are invalid
 * - Winner must have at least 21 points
 * - Winner must win by at least 2 points (except at golden point 30-29)
 * - Maximum score is 30 points
 * - Score "0" is explicitly allowed (e.g., 0-21 for withdrawals)
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
      error: 'Vui lòng nhập điểm số hợp lệ (chỉ số nguyên)'
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
  if (s1 < 0 || s2 < 0) {
    return {
      valid: false,
      s1: 0,
      s2: 0,
      error: 'Điểm số không thể âm'
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

  // Check for scores exceeding maximum (30 points)
  if (s1 > 30 || s2 > 30) {
    return {
      valid: false,
      s1,
      s2,
      error: 'Điểm số không được vượt quá 30 (theo luật cầu lông quốc tế)'
    };
  }

  // Determine winner and loser
  const winner = Math.max(s1, s2);
  const loser = Math.min(s1, s2);

  // Check if the score is valid according to badminton rules
  if (!isValidBadmintonScore(winner, loser)) {
    // Provide specific error messages based on the violation
    if (winner < 21) {
      return {
        valid: false,
        s1,
        s2,
        error: 'Điểm thắng phải đạt tối thiểu 21 điểm'
      };
    }

    if (winner - loser < 2) {
      return {
        valid: false,
        s1,
        s2,
        error: 'Phải thắng cách biệt ít nhất 2 điểm (VD: 21-19, 22-20, 30-29)'
      };
    }

    if (winner === 30 && loser < 28) {
      return {
        valid: false,
        s1,
        s2,
        error: 'Điểm 30 chỉ hợp lệ với tỷ số 30-28 hoặc 30-29'
      };
    }

    // Generic error for other invalid scores
    return {
      valid: false,
      s1,
      s2,
      error: 'Tỷ số không hợp lệ theo luật cầu lông quốc tế 21 điểm'
    };
  }

  // All validations passed
  return {
    valid: true,
    s1,
    s2
  };
}
