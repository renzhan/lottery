import React from 'react';
import styles from './NumberModal.module.css';
import type { TileData } from '../types';

export interface NumberModalProps {
  number: string;
  visible: boolean;
  onClose: () => void;
  tile?: TileData | null;
  tileWidth?: number;
  tileHeight?: number;
  offsetX?: number;
  offsetY?: number;
  tilePath?: string;
}

const PAD = 0.30;

export const NumberModal: React.FC<NumberModalProps> = ({
  number, visible, tile, tileWidth, tileHeight, offsetX, offsetY, tilePath,
}) => {
  if (!visible) {
    return null;
  }

  // If we have tile data, render the jigsaw-shaped back face (scaled up)
  const hasTileShape = tile && tileWidth && tileHeight && offsetX !== undefined && offsetY !== undefined && tilePath;

  return (
    <div
      className={styles.overlay}
      data-testid="number-modal-overlay"
    >
      {hasTileShape ? (
        <div className={styles.tileModal} data-testid="number-modal-number">
          <TileBackSvg
            tilePath={tilePath}
            tileWidth={tileWidth}
            tileHeight={tileHeight}
            offsetX={offsetX}
            offsetY={offsetY}
            lotteryNumber={tile.lotteryNumber}
          />
        </div>
      ) : (
        <div className={styles.modal}>
          <div className={styles.number} data-testid="number-modal-number">
            {number}
          </div>
        </div>
      )}
    </div>
  );
};

/** Renders a scaled-up replica of the jigsaw tile back face */
const TileBackSvg: React.FC<{
  tilePath: string;
  tileWidth: number;
  tileHeight: number;
  offsetX: number;
  offsetY: number;
  lotteryNumber: string;
}> = ({ tilePath, tileWidth, tileHeight, offsetX, offsetY, lotteryNumber }) => {
  const padX = tileWidth * PAD;
  const padY = tileHeight * PAD;
  const vbX = offsetX - padX;
  const vbY = offsetY - padY;
  const vbW = tileWidth + padX * 2;
  const vbH = tileHeight + padY * 2;

  // Scale up to fill ~60% of viewport height
  const scale = (window.innerHeight * 0.6) / vbH;
  const displayW = vbW * scale;
  const displayH = vbH * scale;

  return (
    <svg
      width={displayW}
      height={displayH}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
    >
      <defs>
        <clipPath id="modal-tile-clip"><path d={tilePath} /></clipPath>
      </defs>
      <rect
        x={offsetX} y={offsetY}
        width={tileWidth} height={tileHeight}
        fill="rgb(5, 69, 214)"
        clipPath="url(#modal-tile-clip)"
      />
      <text
        x={offsetX + tileWidth / 2}
        y={offsetY + tileHeight / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFD700"
        fontSize={Math.min(tileWidth, tileHeight) * 0.35}
        fontWeight="bold"
      >
        {lotteryNumber}
      </text>
    </svg>
  );
};
