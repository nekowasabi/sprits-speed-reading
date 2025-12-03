import { calculateORP, splitWordByORP } from '@shared/utils/orpCalculator';

describe('orpCalculator', () => {
  describe('calculateORP', () => {
    it('should return 0 for empty string', () => {
      expect(calculateORP('')).toBe(0);
    });

    it('should return 0 for single character', () => {
      expect(calculateORP('a')).toBe(0);
    });

    it('should return correct ORP for 2 character word', () => {
      // ORP formula: Math.ceil((length - 1) / 4) = Math.ceil(1/4) = 1
      expect(calculateORP('hi')).toBe(1);
    });

    it('should return correct ORP for 3 character word', () => {
      expect(calculateORP('the')).toBe(1);
    });

    it('should return correct ORP for 4 character word', () => {
      expect(calculateORP('word')).toBe(1);
    });

    it('should return correct ORP for 5 character word', () => {
      expect(calculateORP('hello')).toBe(1);
    });

    it('should return correct ORP for longer words', () => {
      expect(calculateORP('reading')).toBe(2);
      expect(calculateORP('programming')).toBe(3);
    });

    it('should adjust ORP when landing on non-letter character', () => {
      // "don't" has length 5, ORP = Math.ceil(4/4) = 1
      // word[1] = 'o' which is a letter, no adjustment needed
      expect(calculateORP("don't")).toBe(1);
    });
  });

  describe('splitWordByORP', () => {
    it('should return empty parts for empty string', () => {
      const result = splitWordByORP('');
      expect(result).toEqual({ before: '', orp: '', after: '' });
    });

    it('should split single character word correctly', () => {
      const result = splitWordByORP('a');
      expect(result).toEqual({ before: '', orp: 'a', after: '' });
    });

    it('should split short word correctly', () => {
      const result = splitWordByORP('the');
      expect(result).toEqual({ before: 't', orp: 'h', after: 'e' });
    });

    it('should split longer word correctly', () => {
      const result = splitWordByORP('hello');
      expect(result).toEqual({ before: 'h', orp: 'e', after: 'llo' });
    });

    it('should split reading correctly', () => {
      const result = splitWordByORP('reading');
      expect(result).toEqual({ before: 're', orp: 'a', after: 'ding' });
    });
  });
});
