import { describe, it, expect } from 'vitest';
import { lotteryReducer, initialState } from '../lotteryReducer';
import type { TileData, LotteryState } from '../../types';

function makeTile(index: number, lotteryNumber: string, isFlipped = false): TileData {
  return { index, row: 0, col: index, imageDataUrl: `data:image/png;base64,tile${index}`, lotteryNumber, isFlipped, path: '' };
}

describe('单元测试：所有拼图块翻转完毕显示提示 (allFlipped detection)', () => {
  it('should set allFlipped to true when the last unflipped tile is flipped via FLIP_COMPLETE', () => {
    const tiles: TileData[] = [
      makeTile(0, 'A1', true),
      makeTile(1, 'A2', true),
      makeTile(2, 'A3', false), // last unflipped tile
    ];
    const state: LotteryState = {
      ...initialState,
      tiles,
      flippingIndex: 2,
    };

    const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: 2 });

    expect(result.allFlipped).toBe(true);
    expect(result.tiles.every((t) => t.isFlipped)).toBe(true);
  });

  it('should keep allFlipped false when there are still unflipped tiles after FLIP_COMPLETE', () => {
    const tiles: TileData[] = [
      makeTile(0, 'A1', false),
      makeTile(1, 'A2', false),
      makeTile(2, 'A3', false),
    ];
    const state: LotteryState = {
      ...initialState,
      tiles,
      flippingIndex: 0,
    };

    const result = lotteryReducer(state, { type: 'FLIP_COMPLETE', index: 0 });

    expect(result.allFlipped).toBe(false);
    expect(result.tiles.filter((t) => !t.isFlipped).length).toBe(2);
  });

  it('should set allFlipped to false after INIT_TILES even if input tiles had isFlipped=true', () => {
    const tilesWithFlipped: TileData[] = [
      makeTile(0, 'A1', true),
      makeTile(1, 'A2', true),
      makeTile(2, 'A3', true),
    ];

    const result = lotteryReducer(initialState, { type: 'INIT_TILES', tiles: tilesWithFlipped });

    expect(result.allFlipped).toBe(false);
    expect(result.tiles.every((t) => t.isFlipped === false)).toBe(true);
  });
});
