import { describe, it, expect } from 'vitest';
import { validateGridInput, validateImageFile } from './validators';

describe('validateGridInput', () => {
  it('should return true for positive integers', () => {
    expect(validateGridInput(1)).toBe(true);
    expect(validateGridInput(5)).toBe(true);
    expect(validateGridInput(20)).toBe(true);
    expect(validateGridInput(100)).toBe(true);
  });

  it('should return false for 0', () => {
    expect(validateGridInput(0)).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(validateGridInput(-1)).toBe(false);
    expect(validateGridInput(-100)).toBe(false);
  });

  it('should return false for decimals/floats', () => {
    expect(validateGridInput(1.5)).toBe(false);
    expect(validateGridInput(0.1)).toBe(false);
    expect(validateGridInput(3.14)).toBe(false);
  });

  it('should return false for Infinity and -Infinity', () => {
    expect(validateGridInput(Infinity)).toBe(false);
    expect(validateGridInput(-Infinity)).toBe(false);
  });

  it('should return false for NaN', () => {
    expect(validateGridInput(NaN)).toBe(false);
  });

  it('should return false for null and undefined', () => {
    expect(validateGridInput(null)).toBe(false);
    expect(validateGridInput(undefined)).toBe(false);
  });

  it('should return false for strings', () => {
    expect(validateGridInput('5')).toBe(false);
    expect(validateGridInput('')).toBe(false);
    expect(validateGridInput('abc')).toBe(false);
  });

  it('should return false for booleans', () => {
    expect(validateGridInput(true)).toBe(false);
    expect(validateGridInput(false)).toBe(false);
  });

  it('should return false for objects and arrays', () => {
    expect(validateGridInput({})).toBe(false);
    expect(validateGridInput([])).toBe(false);
    expect(validateGridInput([1])).toBe(false);
  });
});

describe('validateImageFile', () => {
  const makeFile = (name: string) => new File([''], name, { type: '' });

  it('should accept .jpg files', () => {
    expect(validateImageFile(makeFile('photo.jpg'))).toBe(true);
  });

  it('should accept .jpeg files', () => {
    expect(validateImageFile(makeFile('photo.jpeg'))).toBe(true);
  });

  it('should accept .png files', () => {
    expect(validateImageFile(makeFile('image.png'))).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(validateImageFile(makeFile('PHOTO.JPG'))).toBe(true);
    expect(validateImageFile(makeFile('Image.PNG'))).toBe(true);
    expect(validateImageFile(makeFile('test.JpEg'))).toBe(true);
  });

  it('should reject .gif files', () => {
    expect(validateImageFile(makeFile('anim.gif'))).toBe(false);
  });

  it('should reject .bmp files', () => {
    expect(validateImageFile(makeFile('bitmap.bmp'))).toBe(false);
  });

  it('should reject .svg files', () => {
    expect(validateImageFile(makeFile('icon.svg'))).toBe(false);
  });

  it('should reject .webp files', () => {
    expect(validateImageFile(makeFile('photo.webp'))).toBe(false);
  });

  it('should reject files without extensions', () => {
    expect(validateImageFile(makeFile('noextension'))).toBe(false);
  });

  it('should reject files with only a dot', () => {
    expect(validateImageFile(makeFile('file.'))).toBe(false);
  });
});

