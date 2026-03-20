# 实现任务

## 1. 项目基础设施与类型定义
- [x] 1.1 使用 Vite + React + TypeScript 初始化项目
- [x] 1.2 安装依赖：vitest, @testing-library/react, fast-check, jsdom
- [x] 1.3 配置 Vitest 测试环境（vitest.config.ts，jsdom 环境）
- [x] 1.4 创建项目目录结构（components/, utils/, hooks/, types/）
- [x] 1.5 更新 TypeScript 类型接口：新增 EdgeType, EdgeMap, TileData.path, MarqueeState, 更新 LotteryState（新增 edgeMap, marquee, traversalOrder 字段）

## 2. 拼图形状工具函数（新增）
- [x] 2.1 实现 `utils/jigsawPath.ts`：`generateEdgeMap(rows, cols): EdgeMap` 边缘映射生成函数（边界 flat，内部随机 tab/blank）
- [x] 2.2 实现 `utils/jigsawPath.ts`：`generateTilePath(row, col, edgeMap, tileW, tileH): string` 单块拼图 SVG path 生成函数（贝塞尔曲线凸凹边缘）
- [x] 2.3 实现 `utils/jigsawPath.ts`：`generateSnakeOrder(rows, cols): number[]` 蛇形遍历顺序生成函数

## 3. 拼图形状属性测试（新增）
- [x] 3.1 属性测试：边缘映射正确性（属性 8 - 边界 flat，内部 tab/blank，维度 [rows+1][cols] 和 [rows][cols+1]）
- [x] 3.2 属性测试：拼图路径闭合性（属性 9 - SVG path 以 "M" 开头、"Z" 结尾）
- [x] 3.3 属性测试：蛇形遍历完整性（属性 10 - 长度 rows×cols，包含 0~rows*cols-1 所有整数恰好一次）
- [x] 3.4 属性测试：蛇形遍历顺序正确性（属性 11 - 偶数行左到右递增，奇数行右到左递增）

## 4. 已有工具函数（保持不变）
- [x] 4.1 实现 `getRowLabel(rowIndex: number): string` 行标识生成函数
- [x] 4.2 实现 `generateNumbers(rows: number, cols: number): string[]` 号码生成函数
- [x] 4.3 实现 `shuffle<T>(array: T[]): T[]` Fisher-Yates 洗牌函数
- [x] 4.4 实现 `sliceImage(image, rows, cols): string[]` 图片切分函数
- [x] 4.5 实现 `validateGridInput(value): boolean` 网格输入校验函数
- [x] 4.6 实现 `validateImageFile(file): boolean` 图片文件格式校验函数

## 5. 已有工具函数属性测试（保持不变）
- [x] 5.1 属性测试：行标识生成（属性 7）
- [x] 5.2 属性测试：号码生成正确性（属性 5）
- [x] 5.3 属性测试：洗牌是排列（属性 6）
- [x] 5.4 属性测试：网格输入校验（属性 2）
- [x] 5.5 属性测试：文件格式校验（属性 1）
- [x] 5.6 属性测试：图片切分数量（属性 3）

## 6. 配置页面组件（保持不变）
- [x] 6.1 实现 ImageUploader 图片上传组件
- [x] 6.2 实现 GridConfig 网格配置组件（默认行=5，列=20）
- [x] 6.3 实现 ConfigPage 配置页面组件，集成上传和网格配置
- [x] 6.4 单元测试：ConfigPage 默认值、校验提示、页面跳转


## 7. useMarquee 和 useKeyboard Hooks（新增）
- [x] 7.1 实现 `hooks/useMarquee.ts`：跑马灯动画 Hook（requestAnimationFrame 循环、蛇形遍历、跳过已翻转、启停切换）
- [x] 7.2 实现 `hooks/useKeyboard.ts`：键盘事件监听 Hook（空格键回调、阻止默认行为、enabled 控制）

## 8. 抽奖页面核心组件（重构）
- [x] 8.1 实现 JigsawTile 拼图块组件（替代 PuzzleTile）：SVG clipPath 裁剪图片、轮廓发光效果、CSS 3D 翻转动画
- [x] 8.2 实现 JigsawTile 轮廓发光 CSS：glow-pulse 动画、SVG filter（feGaussianBlur + feFlood）
- [x] 8.3 实现 PuzzleBoard 拼图面板组件（替代 PuzzleGrid）：SVG 渲染拼图形状网格、管理高亮和翻转
- [x] 8.4 保持 NumberModal 号码放大弹窗组件不变
- [x] 8.5 重构 LotteryPage 抽奖页面组件：三区域布局（42.5%/32.5%/25%）、集成 PuzzleBoard + useMarquee + useKeyboard、空格键启停跑马灯流程

## 9. 抽奖状态管理（重构）
- [x] 9.1 重构抽奖状态 reducer：新增 marquee 相关 action（START_MARQUEE, STOP_MARQUEE, FLIP_SELECTED）、新增 edgeMap 和 traversalOrder 初始化
- [x] 9.2 属性测试：初始状态全部未翻转（属性 4）
- [x] 9.3 属性测试：翻转后状态变更（属性 14 - 翻转后 isFlipped 为 true，其他不受影响）
- [x] 9.4 属性测试：弹窗显示正确号码（属性 15）
- [x] 9.5 属性测试：翻转状态持久化（属性 16 - 关闭弹窗后已翻转保持 true）
- [x] 9.6 属性测试：已翻转拼图块不可再次选中（属性 17）
- [x] 9.7 属性测试：跑马灯启停状态切换（属性 12 - toggle 后 isRunning 取反）
- [x] 9.8 属性测试：跑马灯跳过已翻转拼图块（属性 13 - highlightIndex 不指向已翻转拼图块）
- [x] 9.9 单元测试：所有拼图块翻转完毕显示提示

## 10. App 根组件与集成（重构）
- [x] 10.1 更新 App 根组件，管理配置页面与抽奖页面的切换
- [x] 10.2 更新全局样式：三区域布局（42.5vh/32.5vh/25vh）、移除旧 16:9 布局
- [x] 10.3 清理旧 V1 组件文件（PuzzleGrid、PuzzleTile 及其样式和测试文件）
- [x] 10.4 端到端冒烟测试：配置 → 进入抽奖 → 空格键启动跑马灯 → 空格键停止 → 翻转 → 弹窗显示号码