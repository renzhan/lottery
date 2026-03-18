/**
 * Feature: lottery-puzzle-system, Property 7: 行标识生成
 *
 * 对于任意非负整数行索引，getRowLabel 应生成正确的字母标识：
 * 索引 0-25 对应 A-Z，索引 26 及以上使用双字母（AA, AB, AC...）
 *
 * Validates: Requirements 5.1, 5.4
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { getRowLabel, generateNumbers } from '../numberGenerator';

// The double-letter scheme covers indices 26..701 (AA..ZZ = 26*26 combinations).
// The spec only defines single-letter (0-25) and double-letter (26+) labels.
const MAX_DOUBLE_LETTER_INDEX = 26 + 26 * 26 - 1; // 701 = ZZ

describe('Property 7: 行标识生成 (getRowLabel)', () => {
  // Property 7.1: For index 0-25, result is a single uppercase letter matching String.fromCharCode(65 + index)
  it('should return the correct single uppercase letter for indices 0-25', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 25 }), (index) => {
        const result = getRowLabel(index);
        const expected = String.fromCharCode(65 + index);
        return result === expected;
      }),
      { numRuns: 100 },
    );
  });

  // Property 7.2: For index >= 26, result is a two-character string of uppercase letters
  it('should return a two-character string of uppercase letters for indices >= 26', () => {
    fc.assert(
      fc.property(fc.integer({ min: 26, max: MAX_DOUBLE_LETTER_INDEX }), (index) => {
        const result = getRowLabel(index);
        return (
          result.length === 2 &&
          result[0] >= 'A' && result[0] <= 'Z' &&
          result[1] >= 'A' && result[1] <= 'Z'
        );
      }),
      { numRuns: 100 },
    );
  });

  // Property 7.3: Result always contains only uppercase letters (A-Z)
  it('should always contain only uppercase letters (A-Z)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_DOUBLE_LETTER_INDEX }), (index) => {
        const result = getRowLabel(index);
        return /^[A-Z]+$/.test(result);
      }),
      { numRuns: 100 },
    );
  });

  // Property 7.4: The function is deterministic (same input → same output)
  it('should be deterministic: same input always produces same output', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: MAX_DOUBLE_LETTER_INDEX }), (index) => {
        return getRowLabel(index) === getRowLabel(index);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: lottery-puzzle-system, Property 5: 号码生成正确性
 *
 * 对于任意有效的行数 rows 和列数 cols，generateNumbers 应生成恰好 rows × cols 个唯一号码，
 * 每个号码格式为"行字母+列数字"，列数字从 1 到 cols。
 *
 * Validates: Requirements 2.4, 5.2, 5.3
 */
describe('Property 5: 号码生成正确性 (generateNumbers)', () => {
  const rowsArb = fc.integer({ min: 1, max: 50 });
  const colsArb = fc.integer({ min: 1, max: 50 });

  // Property 5.1: generateNumbers(rows, cols) returns exactly rows × cols numbers
  it('should return exactly rows × cols numbers', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const result = generateNumbers(rows, cols);
        return result.length === rows * cols;
      }),
      { numRuns: 100 },
    );
  });

  // Property 5.2: All numbers are unique (no duplicates)
  it('should return all unique numbers (no duplicates)', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const result = generateNumbers(rows, cols);
        const unique = new Set(result);
        return unique.size === result.length;
      }),
      { numRuns: 100 },
    );
  });

  // Property 5.3: Each number matches the format: uppercase letter(s) followed by a number from 1 to cols
  it('should produce numbers matching format: uppercase letter(s) + column number (1..cols)', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const result = generateNumbers(rows, cols);
        return result.every((num) => {
          const match = num.match(/^([A-Z]+)(\d+)$/);
          if (!match) return false;
          const colNum = parseInt(match[2], 10);
          return colNum >= 1 && colNum <= cols;
        });
      }),
      { numRuns: 100 },
    );
  });

  // Property 5.4: Column numbers range from 1 to cols for each row
  it('should have column numbers 1 through cols for every row label', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const result = generateNumbers(rows, cols);
        // Group numbers by row label
        const byRow = new Map<string, number[]>();
        for (const num of result) {
          const match = num.match(/^([A-Z]+)(\d+)$/);
          if (!match) return false;
          const rowLabel = match[1];
          const colNum = parseInt(match[2], 10);
          if (!byRow.has(rowLabel)) byRow.set(rowLabel, []);
          byRow.get(rowLabel)!.push(colNum);
        }
        // Each row should have exactly cols entries with values 1..cols
        if (byRow.size !== rows) return false;
        for (const [, colNums] of byRow) {
          if (colNums.length !== cols) return false;
          const sorted = [...colNums].sort((a, b) => a - b);
          for (let i = 0; i < cols; i++) {
            if (sorted[i] !== i + 1) return false;
          }
        }
        return true;
      }),
      { numRuns: 100 },
    );
  });
});
