import React, { useEffect, useRef, useState } from 'react';
import type { TileData } from '../types';
import styles from './JigsawTile.module.css';

export interface JigsawTileProps {
  tile: TileData;
  path: string;
  isHighlighted: boolean;
  isFlipping: boolean;
  onFlipComplete: () => void;
  tileWidth: number;
  tileHeight: number;
  offsetX: number;
  offsetY: number;
}

// padding ratio, slightly larger than 0.25 bulge in jigsawPath
const PAD = 0.30;

export const JigsawTile: React.FC<JigsawTileProps> = ({
  tile, path, isHighlighted, isFlipping, onFlipComplete,
  tileWidth, tileHeight, offsetX, offsetY,
}) => {
  const [showBack, setShowBack] = useState(tile.isFlipped);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clipId = `tile-clip-${tile.index}`;
  const filterId = `glow-filter-${tile.index}`;

  const padX = tileWidth * PAD;
  const padY = tileHeight * PAD;
  const vbX = offsetX - padX;
  const vbY = offsetY - padY;
  const vbW = tileWidth + padX * 2;
  const vbH = tileHeight + padY * 2;

  useEffect(() => {
    if (isFlipping) {
      setShowBack(true);
      timerRef.current = setTimeout(() => onFlipComplete(), 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isFlipping, onFlipComplete]);

  useEffect(() => { if (tile.isFlipped) setShowBack(true); }, [tile.isFlipped]);

  const flipped = showBack || isFlipping;

  return (
    <div
      className={`${styles.container} ${tile.isFlipped ? styles.flippedTile : ''}`}
      style={{ left: offsetX - padX, top: offsetY - padY, width: vbW, height: vbH }}
    >
      <div className={`${styles.inner} ${flipped ? styles.flipped : ''}`}>
        <div className={styles.front}>
          <svg width={vbW} height={vbH} viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}>
            <defs>
              <clipPath id={clipId}><path d={path} /></clipPath>
              <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feFlood floodColor="#FFD700" floodOpacity="0.8" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <image
              href={tile.imageDataUrl}
              x={0} y={0}
              width={tile.imgW} height={tile.imgH}
              clipPath={`url(#${clipId})`}
              preserveAspectRatio="none"
            />
            <path d={path} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
            {isHighlighted && (
              <path d={path} fill="none" stroke="#FFD700" strokeWidth={2}
                filter={`url(#${filterId})`} className={styles.glowPath} />
            )}
          </svg>
        </div>
        <div className={styles.back}>
          <svg width={vbW} height={vbH} viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}>
            <defs>
              <clipPath id={`${clipId}-back`}><path d={path} /></clipPath>
            </defs>
            <rect x={offsetX - padX} y={offsetY - padY} width={tileWidth + padX * 2} height={tileHeight + padY * 2}
              fill="rgb(5, 69, 214)" clipPath={`url(#${clipId}-back)`} />
            <text x={offsetX + tileWidth / 2} y={offsetY + tileHeight / 2}
              textAnchor="middle" dominantBaseline="central"
              fill="#FFD700" fontSize={Math.min(tileWidth, tileHeight) * 0.35}
              fontWeight="bold">
              {tile.lotteryNumber}
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
