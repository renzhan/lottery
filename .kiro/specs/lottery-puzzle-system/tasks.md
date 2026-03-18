# 实现任务

## 1. 项目初始化与基础设施
- [x] 1.1 使用 Vite + React + TypeScript 初始化项目
- [x] 1.2 安装依赖：vitest, @testing-library/react, fast-check, jsdom
- [x] 1.3 配置 Vitest 测试环境（vitest.config.ts，jsdom 环境）
- [x] 1.4 创建项目目录结构（components/, utils/, types/）

## 2. 数据类型与工具函数
- [x] 2.1 定义 TypeScript 类型接口（LotteryConfig, TileData, LotteryState）
- [x] 2.2 实现 `getRowLabel(rowIndex: number): string` 行标识生成函数，支持超过 26 行的双字母标识
- [x] 2.3 实现 `generateNumbers(rows: number, cols: number): string[]` 号码生成函数
- [x] 2.4 实现 `shuffle<T>(array: T[]): T[]` Fisher-Yates 洗牌函数
- [x] 2.5 实现 `sliceImage(image: HTMLImageElement, rows: number, cols: number): string[]` 图片切分函数
- [x] 2.6 实现 `validateGridInput(value: unknown): boolean` 网格输入校验函数
- [x] 2.7 实现 `validateImageFile(file: File): boolean` 图片文件格式校验函数

## 3. 工具函数属性测试
- [x] 3.1 属性测试：行标识生成（属性 7 - 对于任意非负整数行索引，getRowLabel 应生成正确的字母标识）
- [x] 3.2 属性测试：号码生成正确性（属性 5 - 对于任意有效行列数，generateNumbers 应生成 rows×cols 个唯一号码）
- [x] 3.3 属性测试：洗牌是排列（属性 6 - 对于任意数组，shuffle 返回相同元素相同数量）
- [x] 3.4 属性测试：网格输入校验（属性 2 - 对于任意非法输入值，validateGridInput 应拒绝）
- [x] 3.5 属性测试：文件格式校验（属性 1 - 对于任意文件，只有 JPG/PNG 被接受）
- [x] 3.6 属性测试：图片切分数量（属性 3 - 对于任意有效行列数，sliceImage 返回 rows×cols 个片段）

## 4. 配置页面组件
- [x] 4.1 实现 ImageUploader 图片上传组件
- [x] 4.2 实现 GridConfig 网格配置组件（默认行=5，列=20）
- [x] 4.3 实现 ConfigPage 配置页面组件，集成上传和网格配置，包含校验逻辑和"进入抽奖"按钮
- [x] 4.4 单元测试：ConfigPage 默认值、校验提示、页面跳转

## 5. 抽奖页面核心组件
- [x] 5.1 实现 PuzzleTile 拼图块组件，包含 CSS 3D 翻转动画
- [x] 5.2 实现 NumberModal 号码放大弹窗组件
- [x] 5.3 实现 PuzzleGrid 拼图网格组件，16:9 比例布局
- [x] 5.4 实现 LotteryPage 抽奖页面组件，集成网格、弹窗和状态管理

## 6. 抽奖状态管理与交互逻辑
- [x] 6.1 实现抽奖状态 reducer（初始化、翻转、关闭弹窗、全部翻转检测）
- [x] 6.2 属性测试：初始状态全部未翻转（属性 4）
- [x] 6.3 属性测试：点击翻转状态变更（属性 8）
- [x] 6.4 属性测试：弹窗显示正确号码（属性 9）
- [x] 6.5 属性测试：翻转状态持久化（属性 10）
- [x] 6.6 属性测试：动画期间阻止并发点击（属性 11）
- [x] 6.7 属性测试：已翻转拼图块点击无效（属性 12）
- [x] 6.8 单元测试：所有拼图块翻转完毕显示提示

## 7. App 根组件与页面路由
- [x] 7.1 实现 App 根组件，管理配置页面与抽奖页面的切换
- [x] 7.2 添加全局样式（全屏布局、16:9 容器）
- [x] 7.3 端到端冒烟测试：配置 → 进入抽奖 → 点击翻转 → 弹窗显示号码
