/**
 * Feature: lottery-puzzle-system, Property 4: 初始状态全部未翻转
 *
 * 对于任意有效的网格配置，初始化后所有 TileData 的 isFlipped 属性应为 false。
 *
 * Validates: Requirements 2.3
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { lotteryReducer, initialState } from '../lotteryReducer';
import type { TileData, LotteryState } from '../../types';

const tileArb = fc.record({
  index: fc.nat(),
  imageDataUrl: fc.string(),
  lotteryNumber: fc.string(),
  isFlipped: fc.boolean(),
});

describe('Property 4: 初始状态全部未翻转 (lotteryReducer INIT_TILES)', () => {
  // Property 4.1: After INIT_TILES, all tiles have isFlipped === false
  it('should set all tiles isFlipped to false after INIT_TILES', () => {
    fc.assert(
      fc.property(fc.array(tileArb, { minLength: 1, maxLength: 50 }), (tiles: TileData[]) => {
        const state = lotteryReducer(initialState, { type: 'INIT_TILES', tiles });
        return state.tiles.every((tile) => tile.isFlipped === false);
      }),
      { numRuns: 100 },
    );
  });

  // Property 4.2: After INIT_TILES, isAnimating is false
  it('should set isAnimating to false after INIT_TILES', () => {
    fc.assert(
      fc.property(fc.array(tileArb, { minLength: 0, maxLength: 50 }), (tiles: TileData[]) => {
        const state = lotteryReducer(initialState, { type: 'INIT_TILES', tiles });
        return state.isAnimating === false;
      }),
      { numRuns: 100 },
    );
  });

  // Property 4.3: After INIT_TILES, activeNumber is null
  it('should set activeNumber to null after INIT_TILES', () => {
    fc.assert(
      fc.property(fc.array(tileArb, { minLength: 0, maxLength: 50 }), (tiles: TileData[]) => {
        const state = lotteryReducer(initialState, { type: 'INIT_TILES', tiles });
        return state.activeNumber === null;
      }),
      { numRuns: 100 },
    );
  });

  // Property 4.4: After INIT_TILES, allFlipped is false
  it('should set allFlipped to false after INIT_TILES', () => {
    fc.assert(
      fc.property(fc.array(tileArb, { minLength: 0, maxLength: 50 }), (tiles: TileData[]) => {
        const state = lotteryReducer(initialState, { type: 'INIT_TILES', tiles });
        return state.allFlipped === false;
      }),
      { numRuns: 100 },
    );
  });

  // Property 4.5: After INIT_TILES, tiles array length matches input
  it('should have tiles array length matching input length after INIT_TILES', () => {
    fc.assert(
      fc.property(fc.array(tileArb, { minLength: 0, maxLength: 50 }), (tiles: TileData[]) => {
        const state = lotteryReducer(initialState, { type: 'INIT_TILES', tiles });
        return state.tiles.length === tiles.length;
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: lottery-puzzle-system, Property 8: 点击翻转状态变更
 *
 * 对于任意未翻转的拼图块，点击后其 isFlipped 状态应变为 true，且其他拼图块的状态不受影响。
 *
 * Validates: Requirements 3.1
 */
describe('Property 8: 点击翻转状态变更 (FLIP_TILE / FLIP_COMPLETE)', () => {
  /**
   * Arbitrary: generates a LotteryState with at least one unflipped tile,
   * plus the index of an unflipped tile to target.
   */
  const stateWithUnflippedTileArb = fc
    .array(tileArb, { minLength: 2, maxLength: 30 })
    .chain((tiles) => {
      // Assign unique indices and ensure at least one unflipped tile
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      // Force at least the first tile to be unflipped
      indexedTiles[0] = { ...indexedTiles[0], isFlipped: false };

      const unflippedIndices = indexedTiles
        .filter((t) => !t.isFlipped)
        .map((t) => t.index);

      return fc.record({
        tiles: fc.constant(indexedTiles),
        targetIndex: fc.constantFrom(...unflippedIndices),
      });
    });

  // Property 8.1: After FLIP_COMPLETE on an unflipped tile, that tile's isFlipped becomes true
  it('should set isFlipped to true for the targeted unflipped tile after FLIP_COMPLETE', () => {
    fc.assert(
      fc.property(stateWithUnflippedTileArb, ({ tiles, targetIndex }) => {
        const state: LotteryState = {
          tiles,
          isAnimating: true,
          activeNumber: null,
          allFlipped: false,
        };

        const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: targetIndex });
        const flippedTile = result.tiles.find((t) => t.index === targetIndex);

        return flippedTile !== undefined && flippedTile.isFlipped === true;
      }),
      { numRuns: 100 },
    );
  });

  // Property 8.2: After FLIP_COMPLETE, all other tiles' isFlipped states remain unchanged
  it('should not change isFlipped state of other tiles after FLIP_COMPLETE', () => {
    fc.assert(
      fc.property(stateWithUnflippedTileArb, ({ tiles, targetIndex }) => {
        const state: LotteryState = {
          tiles,
          isAnimating: true,
          activeNumber: null,
          allFlipped: false,
        };

        const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: targetIndex });

        return result.tiles
          .filter((t) => t.index !== targetIndex)
          .every((t) => {
            const original = tiles.find((orig) => orig.index === t.index);
            return original !== undefined && t.isFlipped === original.isFlipped;
          });
      }),
      { numRuns: 100 },
    );
  });

  // Property 8.3: After FLIP_TILE, isAnimating becomes true
  it('should set isAnimating to true after FLIP_TILE', () => {
    fc.assert(
      fc.property(stateWithUnflippedTileArb, ({ tiles, targetIndex }) => {
        const state: LotteryState = {
          tiles,
          isAnimating: false,
          activeNumber: null,
          allFlipped: false,
        };

        const result = lotteryReducer(state, { type: 'FLIP_TILE', index: targetIndex });

        return result.isAnimating === true;
      }),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: lottery-puzzle-system, Property 9: 弹窗显示正确号码
 *
 * 对于任意被翻转的拼图块，弹窗中显示的号码应与该拼图块被分配的 lotteryNumber 完全一致。
 *
 * Validates: Requirements 3.2
 */
describe('Property 9: 弹窗显示正确号码 (FLIP_COMPLETE sets activeNumber)', () => {
  /**
   * Reuse stateWithUnflippedTileArb from Property 8 scope — redeclare locally
   * to keep the describe block self-contained.
   */
  const stateWithUnflippedTileArb9 = fc
    .array(tileArb, { minLength: 2, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      indexedTiles[0] = { ...indexedTiles[0], isFlipped: false };

      const unflippedIndices = indexedTiles
        .filter((t) => !t.isFlipped)
        .map((t) => t.index);

      return fc.record({
        tiles: fc.constant(indexedTiles),
        targetIndex: fc.constantFrom(...unflippedIndices),
      });
    });

  // Property 9: After FLIP_COMPLETE, activeNumber equals the flipped tile's lotteryNumber
  it('should set activeNumber to the flipped tile lotteryNumber after FLIP_COMPLETE', () => {
    fc.assert(
      fc.property(stateWithUnflippedTileArb9, ({ tiles, targetIndex }) => {
        const targetTile = tiles.find((t) => t.index === targetIndex)!;
        const state: LotteryState = {
          tiles,
          isAnimating: true,
          activeNumber: null,
          allFlipped: false,
        };

        const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: targetIndex });

        return result.activeNumber === targetTile.lotteryNumber;
      }),
      { numRuns: 100 },
    );
  });
});



/**
 * Feature: lottery-puzzle-system, Property 10: 翻转状态持久化
 *
 * 对于任意翻转操作序列，关闭弹窗后所有之前已翻转的拼图块应保持 isFlipped 为 true。
 *
 * Validates: Requirements 3.4
 */
describe('Property 10: 翻转状态持久化 (FLIP_COMPLETE sequence + CLOSE_MODAL)', () => {
  /**
   * Arbitrary: generates a list of unflipped tiles with unique indices,
   * plus a non-empty subset of indices to flip.
   */
  const tilesAndFlipSubsetArb = fc
    .integer({ min: 2, max: 30 })
    .chain((count) => {
      const tilesArb = fc.array(
        fc.record({
          imageDataUrl: fc.string(),
          lotteryNumber: fc.string(),
        }),
        { minLength: count, maxLength: count },
      ).map((records) =>
        records.map((r, i) => ({
          index: i,
          imageDataUrl: r.imageDataUrl,
          lotteryNumber: r.lotteryNumber,
          isFlipped: false,
        }))
      );

      return tilesArb.chain((tiles) => {
        const allIndices = tiles.map((t) => t.index);
        // Pick a non-empty subset of indices to flip
        const subsetArb = fc
          .subarray(allIndices, { minLength: 1 })
          .filter((s) => s.length > 0);

        return fc.record({
          tiles: fc.constant(tiles),
          flipIndices: subsetArb,
        });
      });
    });

  // Property 10: After flipping a subset of tiles and closing the modal, all flipped tiles remain isFlipped === true
  it('should keep all previously flipped tiles as isFlipped === true after CLOSE_MODAL', () => {
    fc.assert(
      fc.property(tilesAndFlipSubsetArb, ({ tiles, flipIndices }) => {
        // Start with initialized state
        let state: LotteryState = {
          tiles,
          isAnimating: false,
          activeNumber: null,
          allFlipped: false,
        };

        // Apply FLIP_COMPLETE for each tile in the flip subset
        for (const idx of flipIndices) {
          state = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: idx });
        }

        // Close the modal
        state = lotteryReducer(state, { type: 'CLOSE_MODAL' });

        // All tiles that were flipped should still have isFlipped === true
        const flippedSet = new Set(flipIndices);
        return state.tiles.every((tile) => {
          if (flippedSet.has(tile.index)) {
            return tile.isFlipped === true;
          }
          // Tiles not in the flip set should remain unflipped
          return tile.isFlipped === false;
        });
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Feature: lottery-puzzle-system, Property 11: 动画期间阻止并发点击
 *
 * 对于任意处于动画播放状态（isAnimating 为 true）的系统，对任何拼图块的点击操作应被忽略，不改变任何状态。
 *
 * Validates: Requirements 3.5
 */
describe('Property 11: 动画期间阻止并发点击 (FLIP_TILE while isAnimating)', () => {
  /**
   * Arbitrary: generates a LotteryState with isAnimating=true and a random tile index to click.
   */
  const animatingStateWithClickArb = fc
    .array(tileArb, { minLength: 1, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      return fc.record({
        tiles: fc.constant(indexedTiles),
        clickIndex: fc.integer({ min: 0, max: indexedTiles.length - 1 }),
        activeNumber: fc.option(fc.string(), { nil: null }),
        allFlipped: fc.boolean(),
      });
    });

  // Property 11: Dispatching FLIP_TILE when isAnimating is true should not change tiles
  it('should not change any tile states when FLIP_TILE is dispatched during animation', () => {
    fc.assert(
      fc.property(animatingStateWithClickArb, ({ tiles, clickIndex, activeNumber, allFlipped }) => {
        const state: LotteryState = {
          tiles,
          isAnimating: true,
          activeNumber,
          allFlipped,
        };

        const result = lotteryReducer(state, { type: 'FLIP_TILE', index: clickIndex });

        // Tiles array should be completely unchanged
        const tilesUnchanged = result.tiles.every((tile, i) => {
          const original = state.tiles[i];
          return (
            tile.index === original.index &&
            tile.imageDataUrl === original.imageDataUrl &&
            tile.lotteryNumber === original.lotteryNumber &&
            tile.isFlipped === original.isFlipped
          );
        });

        // isAnimating should remain true
        return tilesUnchanged && result.isAnimating === true && result.tiles.length === state.tiles.length;
      }),
      { numRuns: 100 },
    );
  });
});



/**
 * Feature: lottery-puzzle-system, Property 12: 已翻转拼图块点击无效
 *
 * 对于任意已翻转的拼图块（isFlipped 为 true），点击操作不应改变系统中任何拼图块的状态。
 *
 * Validates: Requirements 4.2
 */
describe('Property 12: 已翻转拼图块点击无效 (FLIP_COMPLETE on already-flipped tile)', () => {
  /**
   * Arbitrary: generates a LotteryState with at least one already-flipped tile,
   * plus the index of a flipped tile to target.
   */
  const stateWithFlippedTileArb = fc
    .array(tileArb, { minLength: 2, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      // Force at least the first tile to be already flipped
      indexedTiles[0] = { ...indexedTiles[0], isFlipped: true };

      const flippedIndices = indexedTiles
        .filter((t) => t.isFlipped)
        .map((t) => t.index);

      return fc.record({
        tiles: fc.constant(indexedTiles),
        targetIndex: fc.constantFrom(...flippedIndices),
      });
    });

  // Property 12: Dispatching FLIP_COMPLETE on an already-flipped tile should not change any tile's isFlipped state
  it('should not change any tile isFlipped state when FLIP_COMPLETE targets an already-flipped tile', () => {
    fc.assert(
      fc.property(stateWithFlippedTileArb, ({ tiles, targetIndex }) => {
        const state: LotteryState = {
          tiles,
          isAnimating: false,
          activeNumber: null,
          allFlipped: false,
        };

        const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: targetIndex });

        // Every tile's isFlipped should remain exactly as before
        return result.tiles.every((tile, i) => {
          return tile.isFlipped === state.tiles[i].isFlipped;
        });
      }),
      { numRuns: 100 },
    );
  });
});
