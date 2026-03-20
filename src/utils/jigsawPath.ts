import type { EdgeType, EdgeMap } from '../types';

/**
 * 拼图路径生成器 — 经典拼图凸凹形状
 *
 * 核心算法（参考 nevernormal1/sergebat SVG Jigsaw Generator + Elm puzzle tutorial）：
 *
 * 每条共享边存储为一组控制点。相邻两个 tile 共享同一条边数据，
 * 一个正向绘制（得到凸起），另一个反向绘制（得到凹入），完美互锁。
 *
 * 凸起形状用 4 段 cubic bezier 曲线定义：
 *   起点 → 颈部起点 → 头部左侧 → 头部顶点 → 头部右侧 → 颈部终点 → 终点
 */

/** 一条边的控制点序列（绝对像素坐标） */
export type EdgeControlPoints = [number, number][];

/** 存储所有边的控制点 */
export interface EdgePointsMap {
  /** hEdges[row][col]: 水平边控制点, row: 0..rows, col: 0..cols-1 */
  hEdges: (EdgeControlPoints | null)[][];
  /** vEdges[row][col]: 垂直边控制点, row: 0..rows-1, col: 0..cols */
  vEdges: (EdgeControlPoints | null)[][];
}

/**
 * 生成一条水平边的控制点（从左到右）
 * 凸起方向由 sign 控制：+1 向上凸，-1 向下凸
 */
function genHorizontalEdge(
  leftX: number, rightX: number, y: number,
  sign: number, _tileW: number, tileH: number,
): EdgeControlPoints {
  const w = rightX - leftX;
  const bulge = tileH * 0.25 * sign;

  // 10 个关键点定义经典拼图凸起
  return [
    [leftX, y],                                    // 0: 起点
    [leftX + w * 0.35, y],                         // 1: 颈部起点
    [leftX + w * 0.35, y - bulge * 0.4],           // 2: 颈部弯曲
    [leftX + w * 0.22, y - bulge],                 // 3: 头部左侧
    [leftX + w * 0.50, y - bulge * 1.15],          // 4: 头部顶点
    [leftX + w * 0.78, y - bulge],                 // 5: 头部右侧
    [leftX + w * 0.65, y - bulge * 0.4],           // 6: 颈部弯曲
    [leftX + w * 0.65, y],                         // 7: 颈部终点
    [rightX, y],                                   // 8: 终点
  ];
}

/**
 * 生成一条垂直边的控制点（从上到下）
 * 凸起方向由 sign 控制：+1 向右凸，-1 向左凸
 */
function genVerticalEdge(
  x: number, topY: number, bottomY: number,
  sign: number, tileW: number, _tileH: number,
): EdgeControlPoints {
  const h = bottomY - topY;
  const bulge = tileW * 0.25 * sign;

  return [
    [x, topY],
    [x, topY + h * 0.35],
    [x + bulge * 0.4, topY + h * 0.35],
    [x + bulge, topY + h * 0.22],
    [x + bulge * 1.15, topY + h * 0.50],
    [x + bulge, topY + h * 0.78],
    [x + bulge * 0.4, topY + h * 0.65],
    [x, topY + h * 0.65],
    [x, bottomY],
  ];
}

/**
 * 生成边缘映射：边界为 flat，内部随机 tab/blank
 */
export function generateEdgeMap(rows: number, cols: number): EdgeMap {
  const randomEdge = (): EdgeType => (Math.random() < 0.5 ? 'tab' : 'blank');

  const horizontal: EdgeType[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: EdgeType[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(r === 0 || r === rows ? 'flat' : randomEdge());
    }
    horizontal.push(row);
  }

  const vertical: EdgeType[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: EdgeType[] = [];
    for (let c = 0; c <= cols; c++) {
      row.push(c === 0 || c === cols ? 'flat' : randomEdge());
    }
    vertical.push(row);
  }

  return { horizontal, vertical };
}

/**
 * 为所有非 flat 边生成控制点
 */
export function generateEdgePointsMap(
  edgeMap: EdgeMap, rows: number, cols: number,
  tileW: number, tileH: number,
): EdgePointsMap {
  const hEdges: (EdgeControlPoints | null)[][] = [];
  for (let r = 0; r <= rows; r++) {
    const row: (EdgeControlPoints | null)[] = [];
    for (let c = 0; c < cols; c++) {
      if (edgeMap.horizontal[r][c] === 'flat') {
        row.push(null);
      } else {
        const sign = edgeMap.horizontal[r][c] === 'tab' ? 1 : -1;
        row.push(genHorizontalEdge(c * tileW, (c + 1) * tileW, r * tileH, sign, tileW, tileH));
      }
    }
    hEdges.push(row);
  }

  const vEdges: (EdgeControlPoints | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: (EdgeControlPoints | null)[] = [];
    for (let c = 0; c <= cols; c++) {
      if (edgeMap.vertical[r][c] === 'flat') {
        row.push(null);
      } else {
        const sign = edgeMap.vertical[r][c] === 'tab' ? 1 : -1;
        row.push(genVerticalEdge(c * tileW, r * tileH, (r + 1) * tileH, sign, tileW, tileH));
      }
    }
    vEdges.push(row);
  }

  return { hEdges, vEdges };
}

/**
 * 将控制点序列转为 SVG path 片段
 * 9 个点 → 4 段 cubic bezier
 *
 * 点 0-1: 直线到颈部
 * 点 1-2-3-4: cubic bezier（颈部→头部）
 * 点 4-5-6-7: cubic bezier（头部→颈部）
 * 点 7-8: 直线到终点
 */
function controlPointsToPath(pts: EdgeControlPoints, reverse: boolean): string {
  const p = reverse ? [...pts].reverse() : pts;

  return [
    `L ${p[1][0]} ${p[1][1]}`,
    `C ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]} ${p[4][0]} ${p[4][1]}`,
    `C ${p[5][0]} ${p[5][1]} ${p[6][0]} ${p[6][1]} ${p[7][0]} ${p[7][1]}`,
    `L ${p[8][0]} ${p[8][1]}`,
  ].join(' ');
}

/**
 * 生成单个拼图块的 SVG path
 *
 * 关键：相邻 tile 共享同一条边的控制点数据。
 * 正向绘制 = 原始形状，反向绘制 = 镜像形状（凸变凹，凹变凸）。
 * 这保证了完美互锁。
 */
export function generateTilePath(
  row: number, col: number,
  pointsMap: EdgePointsMap,
  tileW: number, tileH: number,
): string {
  const x = col * tileW;
  const y = row * tileH;

  const parts: string[] = [`M ${x} ${y}`];

  // 上边：hEdges[row][col]，正向（左→右）
  const topPts = pointsMap.hEdges[row][col];
  parts.push(topPts ? controlPointsToPath(topPts, false) : `L ${x + tileW} ${y}`);

  // 右边：vEdges[row][col+1]，正向（上→下）
  const rightPts = pointsMap.vEdges[row][col + 1];
  parts.push(rightPts ? controlPointsToPath(rightPts, false) : `L ${x + tileW} ${y + tileH}`);

  // 下边：hEdges[row+1][col]，反向（右→左）
  const bottomPts = pointsMap.hEdges[row + 1][col];
  parts.push(bottomPts ? controlPointsToPath(bottomPts, true) : `L ${x} ${y + tileH}`);

  // 左边：vEdges[row][col]，反向（下→上）
  const leftPts = pointsMap.vEdges[row][col];
  parts.push(leftPts ? controlPointsToPath(leftPts, true) : `L ${x} ${y}`);

  parts.push('Z');
  return parts.join(' ');
}

/**
 * 生成蛇形遍历顺序
 */
export function generateSnakeOrder(rows: number, cols: number): number[] {
  const order: number[] = [];
  for (let row = 0; row < rows; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < cols; col++) order.push(row * cols + col);
    } else {
      for (let col = cols - 1; col >= 0; col--) order.push(row * cols + col);
    }
  }
  return order;
}
