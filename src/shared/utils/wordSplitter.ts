/**
 * Split a long word into chunks of specified maximum length.
 *
 * @param word - The word to split
 * @param maxChars - Maximum characters per chunk
 * @returns Array of word chunks
 */
export function splitLongWord(word: string, maxChars: number): string[] {
  if (word.length <= maxChars) {
    return [word];
  }

  const chunks: string[] = [];
  for (let i = 0; i < word.length; i += maxChars) {
    chunks.push(word.slice(i, i + maxChars));
  }
  return chunks;
}

/**
 * Preprocess an array of words by splitting long words.
 *
 * @param words - Array of words to process
 * @param maxChars - Maximum characters per word
 * @returns Array of processed words with long words split
 */
export function preprocessWords(words: string[], maxChars: number): string[] {
  return words.flatMap((word) => splitLongWord(word, maxChars));
}
