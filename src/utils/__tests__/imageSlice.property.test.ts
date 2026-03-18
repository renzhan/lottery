/**
 * Feature: lottery-puzzle-system, Property 3: 图片切分数量
 *
 * 对于任意有效的行数 rows 和列数 cols，sliceImage 函数应返回恰好 rows × cols 个图片片段。
 *
 * Validates: Requirements 2.1
 */
import { describe, it, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { sliceImage } from '../imageSlice';

describe('Property 3: 图片切分数量 (sliceImage)', () => {
  beforeEach(() => {
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn().mockReturnValue({ drawImage: vi.fn() }),
          toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mock'),
        } as unknown as HTMLCanvasElement;
      }
      return document.createElementNS('http://www.w3.org/1999/xhtml', tag);
    });
  });

  const mockImage = { naturalWidth: 1000, naturalHeight: 1000 } as HTMLImageElement;

  // Property 3.1: sliceImage returns exactly rows × cols data URLs
  it('should return exactly rows × cols data URLs for any valid rows and cols', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (rows, cols) => {
          const result = sliceImage(mockImage, rows, cols);
          return result.length === rows * cols;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 3.2: Each returned element is a valid data URL string
  it('should return elements that are all valid data URL strings (starting with "data:")', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (rows, cols) => {
          const result = sliceImage(mockImage, rows, cols);
          return result.every((url) => typeof url === 'string' && url.startsWith('data:'));
        },
      ),
      { numRuns: 100 },
    );
  });
});
