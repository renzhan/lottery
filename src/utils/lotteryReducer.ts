import type { TileData, LotteryState } from '../types';

export type LotteryAction =
  | { type: 'INIT_TILES'; tiles: TileData[] }
  | { type: 'FLIP_TILE'; index: number }
  | { type: 'FLIP_COMPLETE'; index: number }
  | { type: 'CLOSE_MODAL' };

export const initialState: LotteryState = {
  tiles: [],
  isAnimating: false,
  activeNumber: null,
  allFlipped: false,
};

export function lotteryReducer(state: LotteryState, action: LotteryAction): LotteryState {
  switch (action.type) {
    case 'INIT_TILES':
      return {
        tiles: action.tiles.map((tile) => ({ ...tile, isFlipped: false })),
        isAnimating: false,
        activeNumber: null,
        allFlipped: false,
      };

    case 'FLIP_TILE':
      return {
        ...state,
        isAnimating: true,
      };

    case 'FLIP_COMPLETE': {
      const updatedTiles = state.tiles.map((tile) =>
        tile.index === action.index ? { ...tile, isFlipped: true } : tile
      );
      const flippedTile = updatedTiles.find((t) => t.index === action.index);
      const allFlipped = updatedTiles.every((t) => t.isFlipped);

      return {
        tiles: updatedTiles,
        isAnimating: false,
        activeNumber: flippedTile?.lotteryNumber ?? null,
        allFlipped,
      };
    }

    case 'CLOSE_MODAL':
      return {
        ...state,
        activeNumber: null,
      };

    default:
      return state;
  }
}
