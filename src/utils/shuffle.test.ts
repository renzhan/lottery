import { describe, it, expect } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('should return a new array, not mutate the original', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    const result = shuffle(original);
    expect(original).toEqual(originalCopy);
    expect(result).not.toBe(original);
  });

  it('should return an array with the same length', () => {
    const input = [1, 2, 3, 4, 5];
    expect(shuffle(input)).toHaveLength(input.length);
  });

  it('should contain the same elements as the original', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result.sort((a, b) => a - b)).toEqual(input.sort((a, b) => a - b));
  });

  it('should handle an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('should handle a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('should preserve duplicate elements', () => {
    const input = [1, 1, 2, 2, 3];
    const result = shuffle(input);
    expect(result.sort((a, b) => a - b)).toEqual([1, 1, 2, 2, 3]);
  });

  it('should work with string arrays', () => {
    const input = ['A1', 'B2', 'C3'];
    const result = shuffle(input);
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual(['A1', 'B2', 'C3']);
  });
});
