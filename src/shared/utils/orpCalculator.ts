/**
 * Calculate Optimal Recognition Point (ORP) for a word.
 * The ORP is the optimal letter position for the eye to focus on when speed reading.
 *
 * @param word - The word to calculate ORP for
 * @returns The index of the ORP character (0-based)
 */
export function calculateORP(word: string): number {
  if (word.length === 0) return 0;

  const orp = Math.ceil((word.length - 1) / 4);

  // Adjust if ORP lands on a non-letter character
  if (orp < word.length && /\W/.test(word[orp])) {
    return Math.max(0, orp - 1);
  }

  return orp;
}

/**
 * Split a word into parts based on ORP position.
 *
 * @param word - The word to split
 * @returns Object with before, orp (highlighted char), and after parts
 */
export function splitWordByORP(word: string): {
  before: string;
  orp: string;
  after: string;
} {
  if (word.length === 0) {
    return { before: '', orp: '', after: '' };
  }

  const orpIndex = calculateORP(word);

  return {
    before: word.slice(0, orpIndex),
    orp: word[orpIndex] || '',
    after: word.slice(orpIndex + 1),
  };
}
