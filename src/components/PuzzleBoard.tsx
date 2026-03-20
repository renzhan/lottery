import React from 'react';
import { JigsawTile } from './JigsawTile';
import type { TileData, EdgeMap } from '../types';
import styles from './PuzzleBoard.module.css';

export interface PuzzleBoardProps {
  tiles: TileData[];
  edgeMap: EdgeMap;
  highlightIndex: number | null;
  onTileFlipComplete: (index: number) => void;
  flippingIndex: number | null;
  rows: number;
  cols: number;
  tileWidth: number;
  tileHeight: number;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  tiles,
  highlightIndex,
  onTileFlipComplete,
  flippingIndex,
  cols,
  rows,
  tileWidth,
  tileHeight,
}) => {
  return (
    <div
      className={styles.board}
      style={{
        width: cols * tileWidth,
        height: rows * tileHeight,
      }}
    >
      {tiles.map((tile) => {
        const offsetX = tile.col * tileWidth;
        const offsetY = tile.row * tileHeight;

        return (
          <JigsawTile
            key={tile.index}
            tile={tile}
            path={tile.path}
            isHighlighted={highlightIndex === tile.index}
            isFlipping={flippingIndex === tile.index}
            onFlipComplete={() => onTileFlipComplete(tile.index)}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
            offsetX={offsetX}
            offsetY={offsetY}
          />
        );
      })}
    </div>
  );
};
