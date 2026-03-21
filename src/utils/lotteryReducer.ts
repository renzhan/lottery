import type { TileData, EdgeMap, LotteryState, MarqueeState } from '../types';

export type LotteryAction =
  | { type: 'INIT_TILES'; tiles: TileData[] }
  | { type: 'INIT_FULL'; tiles: TileData[]; edgeMap: EdgeMap; traversalOrder: number[] }
  | { type: 'FLIP_TILE'; index: number }
  | { type: 'FLIP_COMPLETE'; index: number }
  | { type: 'FLIP_SELECTED' }
  | { type: 'CLOSE_MODAL' }
  | { type: 'START_MARQUEE' }
  | { type: 'START_DECELERATION' }
  | { type: 'STOP_MARQUEE'; index: number }
  | { type: 'SET_HIGHLIGHT'; index: number };

const defaultMarquee: MarqueeState = {
  isRunning: false,
  isDecelerating: false,
  highlightIndex: null,
  selectedIndex: null,
  speed: 100,
  remainingSteps: null,
};

export const initialState: LotteryState = {
  tiles: [],
  edgeMap: { horizontal: [], vertical: [] },
  marquee: { ...defaultMarquee },
  flippingIndex: null,
  activeNumber: null,
  allFlipped: false,
  traversalOrder: [],
};

export function lotteryReducer(state: LotteryState, action: LotteryAction): LotteryState {
  switch (action.type) {
    case 'INIT_TILES':
      return {
        ...state,
        tiles: action.tiles.map((tile) => ({ ...tile, isFlipped: false })),
        flippingIndex: null,
        activeNumber: null,
        allFlipped: false,
      };

    case 'INIT_FULL':
      return {
        ...state,
        tiles: action.tiles.map((tile) => ({ ...tile, isFlipped: false })),
        edgeMap: action.edgeMap,
        traversalOrder: action.traversalOrder,
        flippingIndex: null,
        activeNumber: null,
        allFlipped: false,
        marquee: { ...defaultMarquee },
      };

    case 'FLIP_TILE':
      if (state.flippingIndex !== null) return state;
      return {
        ...state,
        flippingIndex: action.index,
      };

    case 'FLIP_SELECTED': {
      if (state.marquee.selectedIndex === null) return state;
      if (state.flippingIndex !== null) return state;
      return {
        ...state,
        flippingIndex: state.marquee.selectedIndex,
      };
    }

    case 'FLIP_COMPLETE': {
      const updatedTiles = state.tiles.map((tile) =>
        tile.index === action.index ? { ...tile, isFlipped: true } : tile
      );
      const flippedTile = updatedTiles.find((t) => t.index === action.index);
      const allFlipped = updatedTiles.every((t) => t.isFlipped);

      return {
        ...state,
        tiles: updatedTiles,
        flippingIndex: null,
        activeNumber: flippedTile?.lotteryNumber ?? null,
        allFlipped,
      };
    }

    case 'CLOSE_MODAL':
      return {
        ...state,
        activeNumber: null,
      };

    case 'START_MARQUEE':
      return {
        ...state,
        marquee: {
          ...state.marquee,
          isRunning: true,
          selectedIndex: null,
        },
      };

    case 'START_DECELERATION':
      return {
        ...state,
        marquee: {
          ...state.marquee,
          isDecelerating: true,
          remainingSteps: Math.floor(Math.random() * 3) + 4, // random 4-6
        },
      };

    case 'STOP_MARQUEE':
      return {
        ...state,
        marquee: {
          ...state.marquee,
          isRunning: false,
          isDecelerating: false,
          selectedIndex: action.index,
          highlightIndex: null,
          remainingSteps: null,
        },
      };

    case 'SET_HIGHLIGHT':
      return {
        ...state,
        marquee: {
          ...state.marquee,
          highlightIndex: action.index,
        },
      };

    default:
      return state;
  }
}
