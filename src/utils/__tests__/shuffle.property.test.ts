/**
 * Feature: lottery-puzzle-system, Property 6: 洗牌是排列
 *
 * 对于任意数组，shuffle 函数返回的结果应包含与原数组完全相同的元素（相同元素、相同数量），且长度不变。
 *
 * Validates: Requirements 2.5
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { shuffle } from '../shuffle';

describe('Property 6: 洗牌是排列 (shuffle)', () => {
  // Property 6.1: shuffle(arr) has the same length as arr
  it('should return an array with the same length as the input', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const result = shuffle(arr);
        return result.length === arr.length;
      }),
      { numRuns: 100 },
    );
  });

  // Property 6.2: shuffle(arr) sorted equals arr sorted (same elements, same counts)
  it('should contain the same elements with the same counts as the input', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const result = shuffle(arr);
        const sortedInput = [...arr].sort((a, b) => a - b);
        const sortedResult = [...result].sort((a, b) => a - b);
        return (
          sortedInput.length === sortedResult.length &&
          sortedInput.every((val, idx) => val === sortedResult[idx])
        );
      }),
      { numRuns: 100 },
    );
  });

  // Property 6.3: shuffle does not mutate the original array
  it('should not mutate the original array', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const copy = [...arr];
        shuffle(arr);
        return (
          arr.length === copy.length &&
          arr.every((val, idx) => val === copy[idx])
        );
      }),
      { numRuns: 100 },
    );
  });

  // Property 6.4: shuffle returns a new array reference (not the same object)
  it('should return a new array reference, not the same object', () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (arr) => {
        const result = shuffle(arr);
        return result !== arr;
      }),
      { numRuns: 100 },
    );
  });
});
