/**
 * Feature: lottery-puzzle-system, Property 8: 边缘映射正确性
 *
 * 对于任意有效的行列数，generateEdgeMap 生成的边缘映射中，
 * 网格边界上的所有边为 flat，内部边为 tab 或 blank。
 * 水平边数组维度为 [rows+1][cols]，垂直边数组维度为 [rows][cols+1]。
 *
 * Validates: Requirements 3.1, 3.2, 3.6
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateEdgeMap, generateEdgePointsMap, generateTilePath, generateSnakeOrder } from '../jigsawPath';

describe('Property 8: 边缘映射正确性 (generateEdgeMap)', () => {
  const rowsArb = fc.integer({ min: 1, max: 20 });
  const colsArb = fc.integer({ min: 1, max: 20 });

  // Feature: lottery-puzzle-system, Property 8: 边缘映射正确性
  it('horizontal dimensions should be [rows+1][cols]', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const edgeMap = generateEdgeMap(rows, cols);
        expect(edgeMap.horizontal.length).toBe(rows + 1);
        for (const row of edgeMap.horizontal) {
          expect(row.length).toBe(cols);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: lottery-puzzle-system, Property 8: 边缘映射正确性
  it('vertical dimensions should be [rows][cols+1]', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const edgeMap = generateEdgeMap(rows, cols);
        expect(edgeMap.vertical.length).toBe(rows);
        for (const row of edgeMap.vertical) {
          expect(row.length).toBe(cols + 1);
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: lottery-puzzle-system, Property 8: 边缘映射正确性
  it('all boundary edges should be flat', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const edgeMap = generateEdgeMap(rows, cols);

        // horizontal[0][*] — top boundary
        for (let col = 0; col < cols; col++) {
          expect(edgeMap.horizontal[0][col]).toBe('flat');
        }
        // horizontal[rows][*] — bottom boundary
        for (let col = 0; col < cols; col++) {
          expect(edgeMap.horizontal[rows][col]).toBe('flat');
        }
        // vertical[*][0] — left boundary
        for (let row = 0; row < rows; row++) {
          expect(edgeMap.vertical[row][0]).toBe('flat');
        }
        // vertical[*][cols] — right boundary
        for (let row = 0; row < rows; row++) {
          expect(edgeMap.vertical[row][cols]).toBe('flat');
        }
      }),
      { numRuns: 100 },
    );
  });

  // Feature: lottery-puzzle-system, Property 8: 边缘映射正确性
  it('all internal edges should be tab or blank (not flat)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 20 }),
        fc.integer({ min: 2, max: 20 }),
        (rows, cols) => {
          const edgeMap = generateEdgeMap(rows, cols);

          // Internal horizontal edges: rows 1..rows-1, all cols
          for (let row = 1; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              expect(edgeMap.horizontal[row][col]).toSatisfy(
                (e: string) => e === 'tab' || e === 'blank',
              );
            }
          }

          // Internal vertical edges: all rows, cols 1..cols-1
          for (let row = 0; row < rows; row++) {
            for (let col = 1; col < cols; col++) {
              expect(edgeMap.vertical[row][col]).toSatisfy(
                (e: string) => e === 'tab' || e === 'blank',
              );
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: lottery-puzzle-system, Property 9: 拼图路径闭合性
 *
 * 对于任意有效的行列位置和边缘映射，generateTilePath 返回的
 * SVG path 字符串应以 "M" 开头、以 "Z" 结尾，表示路径闭合。
 *
 * Validates: Requirements 3.4
 */

describe('Property 9: 拼图路径闭合性 (generateTilePath)', () => {
  // Feature: lottery-puzzle-system, Property 9: 拼图路径闭合性
  it('should return a path starting with "M" and ending with "Z"', () => {
    const arb = fc
      .record({
        rows: fc.integer({ min: 1, max: 10 }),
        cols: fc.integer({ min: 1, max: 10 }),
        tileW: fc.integer({ min: 10, max: 500 }),
        tileH: fc.integer({ min: 10, max: 500 }),
      })
      .chain(({ rows, cols, tileW, tileH }) =>
        fc.record({
          rows: fc.constant(rows),
          cols: fc.constant(cols),
          tileW: fc.constant(tileW),
          tileH: fc.constant(tileH),
          row: fc.integer({ min: 0, max: rows - 1 }),
          col: fc.integer({ min: 0, max: cols - 1 }),
        }),
      );

    fc.assert(
      fc.property(arb, ({ rows, cols, tileW, tileH, row, col }) => {
        const edgeMap = generateEdgeMap(rows, cols);
        const pointsMap = generateEdgePointsMap(edgeMap, rows, cols, tileW, tileH);
        const path = generateTilePath(row, col, pointsMap, tileW, tileH);

        expect(path.trimStart()).toMatch(/^M/);
        expect(path.trimEnd()).toMatch(/Z$/);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: lottery-puzzle-system, Property 10: 蛇形遍历完整性
 *
 * 对于任意有效的行列数，generateSnakeOrder 返回的数组长度应为 rows × cols，
 * 且包含 0 到 rows×cols-1 的所有整数恰好一次（是一个排列）。
 *
 * Validates: Requirements 4.3
 */

describe('Property 10: 蛇形遍历完整性 (generateSnakeOrder)', () => {
  const rowsArb = fc.integer({ min: 1, max: 20 });
  const colsArb = fc.integer({ min: 1, max: 20 });

  // Feature: lottery-puzzle-system, Property 10: 蛇形遍历完整性
  it('should return an array of length rows * cols containing every integer from 0 to rows*cols-1 exactly once', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const order = generateSnakeOrder(rows, cols);
        const total = rows * cols;

        // Length must be rows * cols
        expect(order.length).toBe(total);

        // Must be a permutation of 0..total-1
        const sorted = [...order].sort((a, b) => a - b);
        const expected = Array.from({ length: total }, (_, i) => i);
        expect(sorted).toEqual(expected);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: lottery-puzzle-system, Property 11: 蛇形遍历顺序正确性
 *
 * 对于任意有效的行列数，generateSnakeOrder 中偶数行（0-indexed）的元素
 * 应从左到右递增，奇数行的元素应从右到左递增（即数组中值递减）。
 *
 * Validates: Requirements 4.1, 4.2
 */

describe('Property 11: 蛇形遍历顺序正确性 (generateSnakeOrder)', () => {
  const rowsArb = fc.integer({ min: 1, max: 20 });
  const colsArb = fc.integer({ min: 2, max: 20 });

  // Feature: lottery-puzzle-system, Property 11: 蛇形遍历顺序正确性
  it('even rows should be strictly increasing, odd rows should be strictly decreasing', () => {
    fc.assert(
      fc.property(rowsArb, colsArb, (rows, cols) => {
        const order = generateSnakeOrder(rows, cols);

        for (let row = 0; row < rows; row++) {
          const start = row * cols;
          const rowElements = order.slice(start, start + cols);

          for (let i = 1; i < rowElements.length; i++) {
            if (row % 2 === 0) {
              // Even row: strictly increasing (left to right)
              expect(rowElements[i]).toBeGreaterThan(rowElements[i - 1]);
            } else {
              // Odd row: strictly decreasing (right to left traversal)
              expect(rowElements[i]).toBeLessThan(rowElements[i - 1]);
            }
          }
        }
      }),
      { numRuns: 100 },
    );
  });
});

