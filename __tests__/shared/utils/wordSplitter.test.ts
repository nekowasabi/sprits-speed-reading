import { splitLongWord, preprocessWords } from '@shared/utils/wordSplitter';

describe('wordSplitter', () => {
  describe('splitLongWord', () => {
    it('should return word as-is if shorter than maxChars', () => {
      expect(splitLongWord('hello', 10)).toEqual(['hello']);
    });

    it('should return word as-is if equal to maxChars', () => {
      expect(splitLongWord('hello', 5)).toEqual(['hello']);
    });

    it('should split word into chunks if longer than maxChars', () => {
      expect(splitLongWord('programming', 4)).toEqual(['prog', 'ramm', 'ing']);
    });

    it('should split word evenly when length is multiple of maxChars', () => {
      expect(splitLongWord('abcdef', 3)).toEqual(['abc', 'def']);
    });

    it('should handle single character maxChars', () => {
      expect(splitLongWord('hello', 1)).toEqual(['h', 'e', 'l', 'l', 'o']);
    });

    it('should handle empty string', () => {
      expect(splitLongWord('', 5)).toEqual(['']);
    });
  });

  describe('preprocessWords', () => {
    it('should not modify words shorter than maxChars', () => {
      const words = ['the', 'quick', 'brown', 'fox'];
      expect(preprocessWords(words, 10)).toEqual(['the', 'quick', 'brown', 'fox']);
    });

    it('should split long words and flatten result', () => {
      const words = ['hello', 'supercalifragilistic'];
      expect(preprocessWords(words, 5)).toEqual([
        'hello',
        'super',
        'calif',
        'ragil',
        'istic',
      ]);
    });

    it('should handle mixed short and long words', () => {
      const words = ['a', 'programming', 'is', 'fun'];
      expect(preprocessWords(words, 4)).toEqual([
        'a',
        'prog',
        'ramm',
        'ing',
        'is',
        'fun',
      ]);
    });

    it('should handle empty array', () => {
      expect(preprocessWords([], 5)).toEqual([]);
    });
  });
});
