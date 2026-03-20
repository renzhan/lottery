import React, { useEffect, useReducer, useCallback, useMemo, useRef, useState } from 'react';
import styles from './LotteryPage.module.css';
import { PuzzleBoard } from './PuzzleBoard';
import { NumberModal } from './NumberModal';
import {
  generateNumbers,
  shuffle,
  generateEdgeMap,
  generateEdgePointsMap,
  generateTilePath,
  generateSnakeOrder,
  lotteryReducer,
  initialState,
} from '../utils';
import { useMarquee } from '../hooks/useMarquee';
import { useKeyboard } from '../hooks/useKeyboard';
import type { LotteryConfig, TileData } from '../types';

export interface LotteryPageProps {
  config: LotteryConfig;
}

const PUZZLE_AREA_VH = 32.5;

export const LotteryPage: React.FC<LotteryPageProps> = ({ config }) => {
  const [state, dispatch] = useReducer(lotteryReducer, initialState);
  const [loading, setLoading] = useState(true);
  const prevSelectedRef = useRef<number | null>(null);

  const { rows, cols } = config;

  const tileWidth = useMemo(() => window.innerWidth / cols, [cols]);
  const tileHeight = useMemo(() => (window.innerHeight * PUZZLE_AREA_VH) / 100 / rows, [rows]);

  const traversalOrder = useMemo(() => generateSnakeOrder(rows, cols), [rows, cols]);

  const flippedSet = useMemo(
    () => new Set(state.tiles.filter((t) => t.isFlipped).map((t) => t.index)),
    [state.tiles],
  );

  const isFlipping = state.flippingIndex !== null;

  const marquee = useMarquee({
    totalTiles: rows * cols,
    speed: 100,
    traversalOrder,
    skipFlipped: true,
    flippedSet,
  });

  useKeyboard({ onSpace: marquee.toggle, enabled: !isFlipping });

  // Initialize tiles
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

      if (cancelled) { URL.revokeObjectURL(url); return; }

      // 将图片缩放到棋盘像素尺寸，这样 path 坐标和图片坐标完全对齐
      const boardW = tileWidth * cols;
      const boardH = tileHeight * rows;
      const canvas = document.createElement('canvas');
      canvas.width = boardW;
      canvas.height = boardH;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, boardW, boardH);
      const fullImageDataUrl = canvas.toDataURL();
      URL.revokeObjectURL(url);

      const edgeMap = generateEdgeMap(rows, cols);
      const pointsMap = generateEdgePointsMap(edgeMap, rows, cols, tileWidth, tileHeight);
      const numbers = generateNumbers(rows, cols);
      const shuffledNumbers = shuffle(numbers);

      const tileData: TileData[] = [];
      for (let i = 0; i < rows * cols; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        tileData.push({
          index: i,
          row: r,
          col: c,
          imageDataUrl: fullImageDataUrl,
          lotteryNumber: shuffledNumbers[i],
          isFlipped: false,
          path: generateTilePath(r, c, pointsMap, tileWidth, tileHeight),
          imgW: boardW,
          imgH: boardH,
        });
      }

      dispatch({ type: 'INIT_TILES', tiles: tileData });
      setLoading(false);
    };

    initTiles();
    return () => { cancelled = true; };
  }, [config, rows, cols, tileWidth, tileHeight]);

  useEffect(() => {
    if (marquee.selectedIndex !== null && marquee.selectedIndex !== prevSelectedRef.current) {
      prevSelectedRef.current = marquee.selectedIndex;
      dispatch({ type: 'FLIP_TILE', index: marquee.selectedIndex });
    }
  }, [marquee.selectedIndex]);

  const handleTileFlipComplete = useCallback(
    (index: number) => {
      dispatch({ type: 'FLIP_COMPLETE', index });
      marquee.reset();
    },
    [marquee],
  );

  const handleModalClose = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
    prevSelectedRef.current = null;
  }, []);

  const edgeMapRef = useRef(initialState.edgeMap);
  useEffect(() => {
    if (state.tiles.length > 0) {
      edgeMapRef.current = generateEdgeMap(rows, cols);
    }
  }, [state.tiles.length, rows, cols]);

  if (loading) {
    return (
      <div className={styles.container} data-testid="lottery-page">
        <div className={styles.titleArea} />
        <div className={styles.puzzleArea}>
          <div className={styles.loading}>加载中...</div>
        </div>
        <div className={styles.bottomArea} />
      </div>
    );
  }

  return (
    <div className={styles.container} data-testid="lottery-page">
      <div className={styles.titleArea} />
      <div className={styles.puzzleArea}>
        <PuzzleBoard
          tiles={state.tiles}
          edgeMap={edgeMapRef.current}
          highlightIndex={marquee.highlightIndex}
          flippingIndex={state.flippingIndex}
          onTileFlipComplete={handleTileFlipComplete}
          rows={rows}
          cols={cols}
          tileWidth={tileWidth}
          tileHeight={tileHeight}
        />
      </div>
      <div className={styles.bottomArea}>
        {state.allFlipped && (
          <div className={styles.allFlippedMessage} data-testid="all-flipped-message">
            所有号码已抽完
          </div>
        )}
      </div>
      <NumberModal
        number={state.activeNumber ?? ''}
        visible={state.activeNumber !== null}
        onClose={handleModalClose}
      />
    </div>
  );
};
