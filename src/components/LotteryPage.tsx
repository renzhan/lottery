import React, { useEffect, useState, useCallback } from 'react';
import styles from './LotteryPage.module.css';
import { PuzzleGrid } from './PuzzleGrid';
import { NumberModal } from './NumberModal';
import { sliceImage, generateNumbers, shuffle } from '../utils';
import type { LotteryConfig, TileData } from '../types';

export interface LotteryPageProps {
  config: LotteryConfig;
}

const FLIP_ANIMATION_DELAY = 600;

export const LotteryPage: React.FC<LotteryPageProps> = ({ config }) => {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeNumber, setActiveNumber] = useState<string | null>(null);
  const [allFlipped, setAllFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const initTiles = async () => {
      const url = URL.createObjectURL(config.imageFile);
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = url;
      });

      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }

      const imageSlices = sliceImage(img, config.rows, config.cols);
      URL.revokeObjectURL(url);

      const numbers = generateNumbers(config.rows, config.cols);
      const shuffledNumbers = shuffle(numbers);

      const tileData: TileData[] = imageSlices.map((dataUrl, i) => ({
        index: i,
        imageDataUrl: dataUrl,
        lotteryNumber: shuffledNumbers[i],
        isFlipped: false,
      }));

      setTiles(tileData);
      setLoading(false);
    };

    initTiles();

    return () => {
      cancelled = true;
    };
  }, [config]);

  const handleTileClick = useCallback((index: number) => {
    if (isAnimating) return;

    setIsAnimating(true);

    setTimeout(() => {
      setTiles((prev) => {
        const updated = prev.map((tile) =>
          tile.index === index ? { ...tile, isFlipped: true } : tile
        );
        const flippedTile = updated[index];
        if (flippedTile) {
          setActiveNumber(flippedTile.lotteryNumber);
        }

        const allDone = updated.every((t) => t.isFlipped);
        if (allDone) {
          setAllFlipped(true);
        }

        return updated;
      });
      setIsAnimating(false);
    }, FLIP_ANIMATION_DELAY);
  }, [isAnimating]);

  const handleModalClose = useCallback(() => {
    setActiveNumber(null);
  }, []);

  if (loading) {
    return (
      <div className={styles.container} data-testid="lottery-page">
        <div className={styles.loading}>加载中...</div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="lottery-page">
      <div className={styles.gridWrapper}>
        <PuzzleGrid
          tiles={tiles}
          onTileClick={handleTileClick}
          isAnimating={isAnimating}
          rows={config.rows}
          cols={config.cols}
        />
      </div>

      <NumberModal
        number={activeNumber ?? ''}
        visible={activeNumber !== null}
        onClose={handleModalClose}
      />

      {allFlipped && (
        <div className={styles.allFlippedMessage} data-testid="all-flipped-message">
          所有号码已抽完
        </div>
      )}
    </div>
  );
};
