import { describe, it, expect } from 'vitest';
import { getRowLabel, generateNumbers } from './numberGenerator';

describe('getRowLabel', () => {
  it('should return A for index 0', () => {
    expect(getRowLabel(0)).toBe('A');
  });

  it('should return Z for index 25', () => {
    expect(getRowLabel(25)).toBe('Z');
  });

  it('should return single letters A-Z for indices 0-25', () => {
    const expected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 26; i++) {
      expect(getRowLabel(i)).toBe(expected[i]);
    }
  });

  it('should return AA for index 26', () => {
    expect(getRowLabel(26)).toBe('AA');
  });

  it('should return AB for index 27', () => {
    expect(getRowLabel(27)).toBe('AB');
  });

  it('should return AZ for index 51', () => {
    expect(getRowLabel(51)).toBe('AZ');
  });

  it('should return BA for index 52', () => {
    expect(getRowLabel(52)).toBe('BA');
  });

  it('should return AC for index 28', () => {
    expect(getRowLabel(28)).toBe('AC');
  });
});


describe('generateNumbers', () => {
  it('should generate rows × cols numbers for 5 rows, 20 cols', () => {
    const numbers = generateNumbers(5, 20);
    expect(numbers).toHaveLength(100);
  });

  it('should generate correct format: row letter + column number', () => {
    const numbers = generateNumbers(2, 3);
    expect(numbers).toEqual(['A1', 'A2', 'A3', 'B1', 'B2', 'B3']);
  });

  it('should generate A1-A20 through E1-E20 for 5 rows 20 cols', () => {
    const numbers = generateNumbers(5, 20);
    expect(numbers[0]).toBe('A1');
    expect(numbers[19]).toBe('A20');
    expect(numbers[20]).toBe('B1');
    expect(numbers[99]).toBe('E20');
  });

  it('should generate all unique numbers', () => {
    const numbers = generateNumbers(5, 20);
    const unique = new Set(numbers);
    expect(unique.size).toBe(numbers.length);
  });

  it('should handle single row and single column', () => {
    expect(generateNumbers(1, 1)).toEqual(['A1']);
  });

  it('should use double letters for rows beyond 26', () => {
    const numbers = generateNumbers(27, 1);
    expect(numbers[0]).toBe('A1');
    expect(numbers[25]).toBe('Z1');
    expect(numbers[26]).toBe('AA1');
  });

  it('should return empty array for 0 rows', () => {
    expect(generateNumbers(0, 5)).toEqual([]);
  });

  it('should return empty array for 0 cols', () => {
    expect(generateNumbers(5, 0)).toEqual([]);
  });
});
