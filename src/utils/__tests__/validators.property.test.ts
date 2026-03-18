/**
 * Feature: lottery-puzzle-system, Property 1: 文件格式校验
 *
 * 对于任意文件，只有扩展名为 JPG 或 PNG 的文件才应被接受上传，
 * 其他格式应被拒绝。
 *
 * Validates: Requirements 1.2
 */

/**
 * Feature: lottery-puzzle-system, Property 2: 网格输入校验
 *
 * 对于任意输入值，若该值小于 1、为 0、为负数、为小数或非数字，
 * 则系统应拒绝该输入并提示错误。
 *
 * Validates: Requirements 1.6
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { validateGridInput, validateImageFile } from '../validators';

describe('Property 1: 文件格式校验 (validateImageFile)', () => {
  // Property 1.1: Files with .jpg, .jpeg, .png extensions (case-insensitive) → returns true
  it('should return true for files with .jpg, .jpeg, or .png extensions (case-insensitive)', () => {
    const validExtArb = fc.oneof(
      fc.constant('.jpg'),
      fc.constant('.jpeg'),
      fc.constant('.png'),
      fc.constant('.JPG'),
      fc.constant('.JPEG'),
      fc.constant('.PNG'),
      fc.constant('.Jpg'),
      fc.constant('.Jpeg'),
      fc.constant('.Png'),
    );
    const baseNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/);

    fc.assert(
      fc.property(baseNameArb, validExtArb, (baseName, ext) => {
        const file = new File([''], baseName + ext);
        return validateImageFile(file) === true;
      }),
      { numRuns: 100 },
    );
  });

  // Property 1.2: Files with other extensions → returns false
  it('should return false for files with non-JPG/PNG extensions', () => {
    const invalidExtArb = fc.oneof(
      fc.constant('.gif'),
      fc.constant('.bmp'),
      fc.constant('.svg'),
      fc.constant('.webp'),
      fc.constant('.txt'),
      fc.constant('.pdf'),
      fc.constant('.doc'),
      fc.constant('.tiff'),
      fc.constant('.ico'),
      fc.constant('.mp4'),
    );
    const baseNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,20}$/);

    fc.assert(
      fc.property(baseNameArb, invalidExtArb, (baseName, ext) => {
        const file = new File([''], baseName + ext);
        return validateImageFile(file) === false;
      }),
      { numRuns: 100 },
    );
  });

  // Property 1.3: Files without extensions → returns false
  it('should return false for files without extensions', () => {
    const noExtNameArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,30}$/).filter(
      (name) => !name.includes('.'),
    );

    fc.assert(
      fc.property(noExtNameArb, (name) => {
        const file = new File([''], name);
        return validateImageFile(file) === false;
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property 2: 网格输入校验 (validateGridInput)', () => {
  // Property 2.1: For any positive integer >= 1, validateGridInput returns true
  it('should return true for any positive integer >= 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: Number.MAX_SAFE_INTEGER }), (value) => {
        return validateGridInput(value) === true;
      }),
      { numRuns: 100 },
    );
  });

  // Property 2.2: For any number <= 0, validateGridInput returns false
  it('should return false for any number <= 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: Number.MIN_SAFE_INTEGER, max: 0 }), (value) => {
        return validateGridInput(value) === false;
      }),
      { numRuns: 100 },
    );
  });

  // Property 2.3: For any non-integer number (float/decimal), validateGridInput returns false
  it('should return false for any non-integer number (float/decimal)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -1e10, max: 1e10, noNaN: true, noDefaultInfinity: true }).filter(
          (n) => !Number.isInteger(n),
        ),
        (value) => {
          return validateGridInput(value) === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 2.4: For any non-number value, validateGridInput returns false
  it('should return false for any non-number value (string, boolean, null, undefined, object, array)', () => {
    const nonNumberArb = fc.oneof(
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.dictionary(fc.string(), fc.string()),
      fc.array(fc.anything()),
    );

    fc.assert(
      fc.property(nonNumberArb, (value) => {
        return validateGridInput(value) === false;
      }),
      { numRuns: 100 },
    );
  });
});
