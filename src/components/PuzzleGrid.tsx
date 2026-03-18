import React from 'react';
import styles from './PuzzleGrid.module.css';
import { PuzzleTile } from './PuzzleTile';
import type { TileData } from '../types';

export interface PuzzleGridProps {
  tiles: TileData[];
  onTileClick: (index: number) => void;
  isAnimating: boolean;
  rows: number;
  cols: number;
}

export const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  tiles,
  onTileClick,
  isAnimating,
  rows,
  cols,
}) => {
  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      data-testid="puzzle-grid"
    >
      {tiles.map((tile) => (
        <PuzzleTile
          key={tile.index}
          tile={tile}
          onClick={() => onTileClick(tile.index)}
          disabled={isAnimating || tile.isFlipped}
        />
      ))}
    </div>
  );
};
