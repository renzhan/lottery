// 抽奖拼图系统 - 类型定义

/** 抽奖配置 */
export interface LotteryConfig {
  imageFile: File;
  rows: number;  // 垂直行数，默认 5
  cols: number;  // 水平列数，默认 20
  backgroundImage?: File;  // 可选背景图片
  shuffleNumbers?: boolean;  // 是否打乱号码顺序，默认 false（不打乱）
}

/** 边缘类型 */
export type EdgeType = 'flat' | 'tab' | 'blank';

/** 边缘映射：记录每条边的凸凹状态 */
export interface EdgeMap {
  /** 水平边：horizontal[row][col]，row 范围 0~rows（含边界），col 范围 0~cols-1 */
  horizontal: EdgeType[][];
  /** 垂直边：vertical[row][col]，row 范围 0~rows-1，col 范围 0~cols（含边界） */
  vertical: EdgeType[][];
}

/** 拼图块数据 */
export interface TileData {
  index: number;          // 拼图块在网格中的位置索引
  row: number;            // 行位置
  col: number;            // 列位置
  imageDataUrl: string;   // 完整图片的 Data URL（所有块共享同一张图）
  lotteryNumber: string;  // 分配的抽奖号码（如 "C15"）
  isFlipped: boolean;     // 是否已翻转
  path: string;           // SVG path 字符串（拼图形状）
  imgW: number;           // 完整图片宽度（像素）
  imgH: number;           // 完整图片高度（像素）
}

/** 跑马灯状态 */
export interface MarqueeState {
  isRunning: boolean;           // 跑马灯是否运行中
  isDecelerating: boolean;      // 是否正在减速中
  highlightIndex: number | null; // 当前高亮拼图块索引
  selectedIndex: number | null;  // 停止时选中的索引
  speed: number;                 // 当前速度（ms/步）
  remainingSteps: number | null; // 减速剩余步数
}

/** 抽奖页面状态 */
export interface LotteryState {
  tiles: TileData[];
  edgeMap: EdgeMap;
  marquee: MarqueeState;
  flippingIndex: number | null;   // 正在翻转的拼图块索引
  activeNumber: string | null;    // 当前放大显示的号码
  allFlipped: boolean;            // 是否所有拼图块已翻转
  traversalOrder: number[];       // 蛇形遍历顺序
}
