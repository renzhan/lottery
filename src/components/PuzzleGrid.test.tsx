import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleGrid } from './PuzzleGrid';
import type { TileData } from '../types';

function makeTiles(count: number, overrides?: Partial<TileData>[]): TileData[] {
  return Array.from({ length: count }, (_, i) => ({
    index: i,
    imageDataUrl: `data:image/png;base64,tile${i}`,
    lotteryNumber: `A${i + 1}`,
    isFlipped: false,
    ...overrides?.[i],
  }));
}

describe('PuzzleGrid', () => {
  it('renders correct number of tiles in a CSS grid', () => {
    const tiles = makeTiles(6);
    render(
      <PuzzleGrid tiles={tiles} onTileClick={() => {}} isAnimating={false} rows={2} cols={3} />
    );
    const grid = screen.getByTestId('puzzle-grid');
    expect(grid.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    expect(grid.style.gridTemplateRows).toBe('repeat(2, 1fr)');
    expect(screen.getAllByTestId(/^puzzle-tile-/)).toHaveLength(6);
  });

  it('calls onTileClick with correct index when a tile is clicked', () => {
    const handleClick = vi.fn();
    const tiles = makeTiles(4);
    render(
      <PuzzleGrid tiles={tiles} onTileClick={handleClick} isAnimating={false} rows={2} cols={2} />
    );
    fireEvent.click(screen.getByTestId('puzzle-tile-2'));
    expect(handleClick).toHaveBeenCalledWith(2);
  });

  it('disables all tiles when isAnimating is true', () => {
    const handleClick = vi.fn();
    const tiles = makeTiles(4);
    render(
      <PuzzleGrid tiles={tiles} onTileClick={handleClick} isAnimating={true} rows={2} cols={2} />
    );
    fireEvent.click(screen.getByTestId('puzzle-tile-0'));
    fireEvent.click(screen.getByTestId('puzzle-tile-1'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disables already-flipped tiles', () => {
    const handleClick = vi.fn();
    const tiles = makeTiles(4, [{}, { index: 1, imageDataUrl: '', lotteryNumber: 'A2', isFlipped: true }]);
    render(
      <PuzzleGrid tiles={tiles} onTileClick={handleClick} isAnimating={false} rows={2} cols={2} />
    );
    // Flipped tile should be disabled
    fireEvent.click(screen.getByTestId('puzzle-tile-1'));
    expect(handleClick).not.toHaveBeenCalled();
    // Unflipped tile should work
    fireEvent.click(screen.getByTestId('puzzle-tile-0'));
    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('has 16:9 aspect-ratio class on the grid container', () => {
    const tiles = makeTiles(4);
    render(
      <PuzzleGrid tiles={tiles} onTileClick={() => {}} isAnimating={false} rows={2} cols={2} />
    );
    const grid = screen.getByTestId('puzzle-grid');
    expect(grid.className).toContain('grid');
  });
});
