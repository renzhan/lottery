// 抽奖拼图系统 - 类型定义

/** 抽奖配置 */
export interface LotteryConfig {
  imageFile: File;
  rows: number;  // 垂直行数，默认 5
  cols: number;  // 水平列数，默认 20
}

/** 拼图块数据 */
export interface TileData {
  index: number;          // 拼图块在网格中的位置索引
  imageDataUrl: string;   // 该块对应的图片片段 Data URL
  lotteryNumber: string;  // 分配的抽奖号码（如 "C15"）
  isFlipped: boolean;     // 是否已翻转
}

/** 抽奖页面状态 */
export interface LotteryState {
  tiles: TileData[];
  isAnimating: boolean;       // 是否正在播放翻转动画
  activeNumber: string | null; // 当前放大显示的号码，null 表示无弹窗
  allFlipped: boolean;         // 是否所有拼图块已翻转
}
