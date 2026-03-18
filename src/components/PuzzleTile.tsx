import React from 'react';
import styles from './PuzzleTile.module.css';
import type { TileData } from '../types';

export interface PuzzleTileProps {
  tile: TileData;
  onClick: () => void;
  disabled: boolean;
}

export const PuzzleTile: React.FC<PuzzleTileProps> = ({ tile, onClick, disabled }) => {
  const tileClass = [
    styles.tile,
    disabled ? styles.disabled : '',
    tile.isFlipped ? styles.flippedTile : '',
  ]
    .filter(Boolean)
    .join(' ');

  const innerClass = [styles.tileInner, tile.isFlipped ? styles.flipped : '']
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (!disabled) {
      onClick();
    }
  };

  return (
    <div className={tileClass} onClick={handleClick} data-testid={`puzzle-tile-${tile.index}`}>
      <div className={innerClass}>
        <div className={`${styles.face} ${styles.front}`}>
          <img src={tile.imageDataUrl} alt={`拼图块 ${tile.index}`} />
        </div>
        <div className={`${styles.face} ${styles.back}`}>
          <span>{tile.lotteryNumber}</span>
        </div>
      </div>
    </div>
  );
};
