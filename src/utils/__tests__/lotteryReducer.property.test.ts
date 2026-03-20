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
  row: fc.nat(),
  col: fc.nat(),
  imageDataUrl: fc.string(),
  lotteryNumber: fc.string(),
  isFlipped: fc.boolean(),
  path: fc.string(),
  imgW: fc.integer({ min: 100, max: 2000 }),
  imgH: fc.integer({ min: 100, max: 2000 }),
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

  // Property 4.2: After INIT_TILES, flippingIndex is null
  it('should set flippingIndex to null after INIT_TILES', () => {
    fc.assert(
      fc.property(fc.array(tileArb, { minLength: 0, maxLength: 50 }), (tiles: TileData[]) => {
        const state = lotteryReducer(initialState, { type: 'INIT_TILES', tiles });
        return state.flippingIndex === null;
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
  const stateWithUnflippedTileArb = fc
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

  // Property 8.1: After FLIP_COMPLETE on an unflipped tile, that tile's isFlipped becomes true
  it('should set isFlipped to true for the targeted unflipped tile after FLIP_COMPLETE', () => {
    fc.assert(
      fc.property(stateWithUnflippedTileArb, ({ tiles, targetIndex }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          flippingIndex: targetIndex,
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
          ...initialState,
          tiles,
          flippingIndex: targetIndex,
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

  // Property 8.3: After FLIP_TILE, flippingIndex becomes the target index
  it('should set flippingIndex to target after FLIP_TILE', () => {
    fc.assert(
      fc.property(stateWithUnflippedTileArb, ({ tiles, targetIndex }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          flippingIndex: null,
        };

        const result = lotteryReducer(state, { type: 'FLIP_TILE', index: targetIndex });

        return result.flippingIndex === targetIndex;
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
          ...initialState,
          tiles,
          flippingIndex: targetIndex,
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
          row: 0,
          col: i,
          imageDataUrl: r.imageDataUrl,
          lotteryNumber: r.lotteryNumber,
          isFlipped: false,
          path: '',
          imgW: 800,
          imgH: 600,
        }))
      );

      return tilesArb.chain((tiles) => {
        const allIndices = tiles.map((t) => t.index);
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
        let state: LotteryState = {
          ...initialState,
          tiles,
        };

        for (const idx of flipIndices) {
          state = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: idx });
        }

        state = lotteryReducer(state, { type: 'CLOSE_MODAL' });

        const flippedSet = new Set(flipIndices);
        return state.tiles.every((tile) => {
          if (flippedSet.has(tile.index)) {
            return tile.isFlipped === true;
          }
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
 * 对于任意处于翻转动画播放状态（flippingIndex 不为 null）的系统，对任何拼图块的点击操作应被忽略，不改变任何状态。
 *
 * Validates: Requirements 3.5
 */
describe('Property 11: 动画期间阻止并发点击 (FLIP_TILE while flipping)', () => {
  const animatingStateWithClickArb = fc
    .array(tileArb, { minLength: 1, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      return fc.record({
        tiles: fc.constant(indexedTiles),
        flippingIndex: fc.integer({ min: 0, max: indexedTiles.length - 1 }),
        clickIndex: fc.integer({ min: 0, max: indexedTiles.length - 1 }),
        activeNumber: fc.option(fc.string(), { nil: null }),
        allFlipped: fc.boolean(),
      });
    });

  // Property 11: Dispatching FLIP_TILE when flippingIndex is not null should not change tiles
  it('should not change any tile states when FLIP_TILE is dispatched during animation', () => {
    fc.assert(
      fc.property(animatingStateWithClickArb, ({ tiles, flippingIndex, clickIndex, activeNumber, allFlipped }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          flippingIndex,
          activeNumber,
          allFlipped,
        };

        const result = lotteryReducer(state, { type: 'FLIP_TILE', index: clickIndex });

        const tilesUnchanged = result.tiles.every((tile, i) => {
          const original = state.tiles[i];
          return (
            tile.index === original.index &&
            tile.imageDataUrl === original.imageDataUrl &&
            tile.lotteryNumber === original.lotteryNumber &&
            tile.isFlipped === original.isFlipped
          );
        });

        return tilesUnchanged && result.flippingIndex === flippingIndex && result.tiles.length === state.tiles.length;
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
  const stateWithFlippedTileArb = fc
    .array(tileArb, { minLength: 2, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
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
          ...initialState,
          tiles,
        };

        const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: targetIndex });

        return result.tiles.every((tile, i) => {
          return tile.isFlipped === state.tiles[i].isFlipped;
        });
      }),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: lottery-puzzle-system, Property 12: 跑马灯启停状态切换
 *
 * 对于任意跑马灯状态，调用 toggle 后 isRunning 应取反。
 * - START_MARQUEE when not running → isRunning = true, selectedIndex = null
 * - STOP_MARQUEE when running → isRunning = false, selectedIndex = provided index
 *
 * Validates: Requirements 6.1, 6.2
 */
describe('Property 12: 跑马灯启停状态切换 (START_MARQUEE / STOP_MARQUEE toggle)', () => {
  /** Arbitrary for generating a random LotteryState with tiles */
  const lotteryStateArb = fc
    .array(tileArb, { minLength: 1, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      return fc.record({
        tiles: fc.constant(indexedTiles),
        highlightIndex: fc.option(fc.integer({ min: 0, max: indexedTiles.length - 1 }), { nil: null }),
        selectedIndex: fc.option(fc.integer({ min: 0, max: indexedTiles.length - 1 }), { nil: null }),
        speed: fc.constant(100),
      });
    });

  // Property 12.1: START_MARQUEE when not running sets isRunning to true
  it('should set isRunning to true when START_MARQUEE is dispatched and marquee is not running', () => {
    fc.assert(
      fc.property(lotteryStateArb, ({ tiles, highlightIndex, selectedIndex, speed }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          marquee: {
            isRunning: false,
            highlightIndex,
            selectedIndex,
            speed,
          },
        };

        const result = lotteryReducer(state, { type: 'START_MARQUEE' });

        return result.marquee.isRunning === true;
      }),
      { numRuns: 100 },
    );
  });

  // Property 12.2: START_MARQUEE clears selectedIndex
  it('should clear selectedIndex when START_MARQUEE is dispatched', () => {
    fc.assert(
      fc.property(lotteryStateArb, ({ tiles, highlightIndex, selectedIndex, speed }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          marquee: {
            isRunning: false,
            highlightIndex,
            selectedIndex,
            speed,
          },
        };

        const result = lotteryReducer(state, { type: 'START_MARQUEE' });

        return result.marquee.selectedIndex === null;
      }),
      { numRuns: 100 },
    );
  });

  // Property 12.3: STOP_MARQUEE when running sets isRunning to false
  it('should set isRunning to false when STOP_MARQUEE is dispatched and marquee is running', () => {
    fc.assert(
      fc.property(
        lotteryStateArb.chain(({ tiles, highlightIndex, speed }) =>
          fc.record({
            tiles: fc.constant(tiles),
            highlightIndex: fc.constant(highlightIndex),
            speed: fc.constant(speed),
            stopIndex: fc.integer({ min: 0, max: tiles.length - 1 }),
          })
        ),
        ({ tiles, highlightIndex, speed, stopIndex }) => {
          const state: LotteryState = {
            ...initialState,
            tiles,
            marquee: {
              isRunning: true,
              highlightIndex,
              selectedIndex: null,
              speed,
            },
          };

          const result = lotteryReducer(state, { type: 'STOP_MARQUEE', index: stopIndex });

          return result.marquee.isRunning === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  // Property 12.4: STOP_MARQUEE sets selectedIndex to the provided index
  it('should set selectedIndex to the provided index when STOP_MARQUEE is dispatched', () => {
    fc.assert(
      fc.property(
        lotteryStateArb.chain(({ tiles, highlightIndex, speed }) =>
          fc.record({
            tiles: fc.constant(tiles),
            highlightIndex: fc.constant(highlightIndex),
            speed: fc.constant(speed),
            stopIndex: fc.integer({ min: 0, max: tiles.length - 1 }),
          })
        ),
        ({ tiles, highlightIndex, speed, stopIndex }) => {
          const state: LotteryState = {
            ...initialState,
            tiles,
            marquee: {
              isRunning: true,
              highlightIndex,
              selectedIndex: null,
              speed,
            },
          };

          const result = lotteryReducer(state, { type: 'STOP_MARQUEE', index: stopIndex });

          return result.marquee.selectedIndex === stopIndex;
        },
      ),
      { numRuns: 100 },
    );
  });
});


/**
 * Feature: lottery-puzzle-system, Property 13: 跑马灯跳过已翻转拼图块
 *
 * 在 reducer 层面，SET_HIGHLIGHT 总是将 marquee.highlightIndex 更新为提供的 index。
 * 跳过已翻转拼图块的逻辑由 useMarquee hook 负责，而非 reducer。
 *
 * Validates: Requirements 4.4, 7.2
 */
describe('Property 13: 跑马灯跳过已翻转拼图块 (SET_HIGHLIGHT updates highlightIndex)', () => {
  /** Arbitrary: state with some flipped tiles and a valid highlight index */
  const stateWithHighlightArb = fc
    .array(tileArb, { minLength: 1, maxLength: 30 })
    .chain((tiles) => {
      const indexedTiles = tiles.map((t, i) => ({ ...t, index: i }));
      return fc.record({
        tiles: fc.constant(indexedTiles),
        isRunning: fc.boolean(),
        highlightIndex: fc.option(fc.integer({ min: 0, max: indexedTiles.length - 1 }), { nil: null }),
        selectedIndex: fc.option(fc.integer({ min: 0, max: indexedTiles.length - 1 }), { nil: null }),
        newHighlight: fc.integer({ min: 0, max: indexedTiles.length - 1 }),
      });
    });

  // Property 13.1: SET_HIGHLIGHT always sets marquee.highlightIndex to the provided index
  it('should set marquee.highlightIndex to the provided index on SET_HIGHLIGHT', () => {
    fc.assert(
      fc.property(stateWithHighlightArb, ({ tiles, isRunning, highlightIndex, selectedIndex, newHighlight }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          marquee: {
            isRunning,
            highlightIndex,
            selectedIndex,
            speed: 100,
          },
        };

        const result = lotteryReducer(state, { type: 'SET_HIGHLIGHT', index: newHighlight });

        return result.marquee.highlightIndex === newHighlight;
      }),
      { numRuns: 100 },
    );
  });

  // Property 13.2: SET_HIGHLIGHT does not change other marquee fields
  it('should not change isRunning, selectedIndex, or speed when SET_HIGHLIGHT is dispatched', () => {
    fc.assert(
      fc.property(stateWithHighlightArb, ({ tiles, isRunning, highlightIndex, selectedIndex, newHighlight }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          marquee: {
            isRunning,
            highlightIndex,
            selectedIndex,
            speed: 100,
          },
        };

        const result = lotteryReducer(state, { type: 'SET_HIGHLIGHT', index: newHighlight });

        return (
          result.marquee.isRunning === isRunning &&
          result.marquee.selectedIndex === selectedIndex &&
          result.marquee.speed === 100
        );
      }),
      { numRuns: 100 },
    );
  });

  // Property 13.3: SET_HIGHLIGHT does not change tiles array
  it('should not change tiles when SET_HIGHLIGHT is dispatched', () => {
    fc.assert(
      fc.property(stateWithHighlightArb, ({ tiles, isRunning, highlightIndex, selectedIndex, newHighlight }) => {
        const state: LotteryState = {
          ...initialState,
          tiles,
          marquee: {
            isRunning,
            highlightIndex,
            selectedIndex,
            speed: 100,
          },
        };

        const result = lotteryReducer(state, { type: 'SET_HIGHLIGHT', index: newHighlight });

        return (
          result.tiles.length === tiles.length &&
          result.tiles.every((t, i) => t.isFlipped === tiles[i].isFlipped && t.index === tiles[i].index)
        );
      }),
      { numRuns: 100 },
    );
  });
});
