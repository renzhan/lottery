import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PuzzleTile } from '../PuzzleTile';
import type { TileData } from '../../types';

const makeTile = (overrides: Partial<TileData> = {}): TileData => ({
  index: 0,
  imageDataUrl: 'data:image/png;base64,abc',
  lotteryNumber: 'A1',
  isFlipped: false,
  ...overrides,
});

describe('PuzzleTile', () => {
  it('renders the image on the front face', () => {
    render(<PuzzleTile tile={makeTile()} onClick={() => {}} disabled={false} />);
    const img = screen.getByAltText('拼图块 0');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'data:image/png;base64,abc');
  });

  it('renders the lottery number on the back face', () => {
    render(<PuzzleTile tile={makeTile()} onClick={() => {}} disabled={false} />);
    expect(screen.getByText('A1')).toBeInTheDocument();
  });

  it('calls onClick when clicked and not disabled', () => {
    const onClick = vi.fn();
    render(<PuzzleTile tile={makeTile()} onClick={onClick} disabled={false} />);
    fireEvent.click(screen.getByTestId('puzzle-tile-0'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not respond to clicks when disabled', () => {
    const onClick = vi.fn();
    render(<PuzzleTile tile={makeTile()} onClick={onClick} disabled={true} />);
    fireEvent.click(screen.getByTestId('puzzle-tile-0'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies flipped class when tile.isFlipped is true', () => {
    const { container } = render(
      <PuzzleTile tile={makeTile({ isFlipped: true })} onClick={() => {}} disabled={false} />
    );
    const inner = container.querySelector('[class*="tileInner"]');
    expect(inner?.className).toMatch(/flipped/);
  });

  it('applies reduced opacity class when tile is flipped', () => {
    const { container } = render(
      <PuzzleTile tile={makeTile({ isFlipped: true })} onClick={() => {}} disabled={false} />
    );
    const tile = container.querySelector('[class*="tile"]');
    expect(tile?.className).toMatch(/flippedTile/);
  });

  it('does not apply flipped class when tile is not flipped', () => {
    const { container } = render(
      <PuzzleTile tile={makeTile({ isFlipped: false })} onClick={() => {}} disabled={false} />
    );
    const inner = container.querySelector('[class*="tileInner"]');
    expect(inner?.className).not.toMatch(/flipped/);
  });
});
