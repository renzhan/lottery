# 实现计划：拼图显示修复 (puzzle-display-fixes)

## 概述

两项修复：(1) 号码排列顺序改进——在 LotteryConfig 新增 `shuffleNumbers` 可选字段，ConfigPage 加开关，LotteryPage 根据配置决定是否 shuffle；(2) 拼图 Tab 颜色修复——扩大 JigsawTile 和 NumberModal 中背面 rect 的范围以覆盖 tab 凸出区域。

## 任务

- [x] 1. 扩展类型定义并实现号码排列配置
  - [x] 1.1 在 `src/types/index.ts` 的 `LotteryConfig` 接口中新增 `shuffleNumbers?: boolean` 可选字段
    - 默认值语义为 `false`（不打乱）
    - _需求: 2.2_
  - [x] 1.2 修改 `src/components/ConfigPage.tsx`，新增"打乱号码顺序"开关
    - 新增 `shuffleNumbers` state，默认值为 `false`
    - 在表单中添加 checkbox 控件，标签为"打乱号码顺序"
    - 在 `handleSubmit` 中将 `shuffleNumbers` 传入 `LotteryConfig`
    - _需求: 1.3_
  - [x] 1.3 修改 `src/components/LotteryPage.tsx` 的 `initTiles` 函数中号码分配逻辑
    - 将 `const shuffledNumbers = shuffle(numbers);` 改为 `const finalNumbers = config.shuffleNumbers ? shuffle(numbers) : numbers;`
    - 将 `lotteryNumber: shuffledNumbers[i]` 改为 `lotteryNumber: finalNumbers[i]`
    - _需求: 1.1, 1.2, 2.1_
  - [ ]* 1.4 编写属性测试：号码顺序一致性
    - **属性 1：号码顺序一致性**
    - 在 `src/utils/__tests__/numberGenerator.property.test.ts` 中追加
    - 使用 fast-check 验证：对任意 rows 和 cols，当 shuffleNumbers 为 false 时，位置 (r, c) 的号码等于 `getRowLabel(r) + (c + 1)`
    - **验证: 需求 1.1, 2.1**
  - [ ]* 1.5 编写属性测试：号码集合完整性
    - **属性 2：号码集合完整性**
    - 在 `src/utils/__tests__/numberGenerator.property.test.ts` 中追加
    - 使用 fast-check 验证：对任意 rows、cols 和 shuffleNumbers 设置，分配的号码集合与 `generateNumbers(rows, cols)` 输出完全相同
    - **验证: 需求 1.4, 1.2**

- [x] 2. 检查点 - 确保号码排列功能正常
  - 确保所有测试通过，如有问题请询问用户。

- [x] 3. 修复拼图块背面 Tab 区域颜色
  - [x] 3.1 修改 `src/components/JigsawTile.tsx` 中背面 `<rect>` 的坐标和尺寸
    - 将 `<rect x={offsetX} y={offsetY} width={tileWidth} height={tileHeight} ...>` 改为 `<rect x={offsetX - padX} y={offsetY - padY} width={tileWidth + padX * 2} height={tileHeight + padY * 2} ...>`
    - 保持 `clipPath` 裁剪不变，确保填充区域严格限制在拼图轮廓内
    - _需求: 3.1, 3.2, 3.3_
  - [x] 3.2 修改 `src/components/NumberModal.tsx` 中 `TileBackSvg` 的 `<rect>` 坐标和尺寸
    - 将 `<rect x={offsetX} y={offsetY} width={tileWidth} height={tileHeight} ...>` 改为 `<rect x={offsetX - padX} y={offsetY - padY} width={tileWidth + padX * 2} height={tileHeight + padY * 2} ...>`
    - 保持 `clipPath` 裁剪不变
    - _需求: 4.1, 4.2, 4.3_
  - [ ]* 3.3 编写属性测试：背面填充矩形覆盖拼图包围盒
    - **属性 3：背面填充矩形覆盖拼图包围盒**
    - 在 `src/utils/__tests__/jigsawPath.property.test.ts` 中追加
    - 使用 fast-check 验证：对任意正数 tileWidth 和 tileHeight，以 PAD=0.30 扩展后的 rect 完全包含最大 tab 凸出量（0.25 × tileWidth 或 0.25 × tileHeight）
    - **验证: 需求 3.1, 3.3, 4.1, 4.3**

- [x] 4. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的子任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务确保增量验证
- 属性测试使用 fast-check 库验证通用正确性属性
