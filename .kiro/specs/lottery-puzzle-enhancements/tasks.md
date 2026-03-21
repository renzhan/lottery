# 实现计划：抽奖拼图系统增强 (Lottery Puzzle Enhancements)

## 概述

基于现有 React 18 + TypeScript + Vite + CSS Modules 架构，对抽奖拼图系统进行五项增强：跑马灯减速停止、背景图片配置、大屏幕布局调整、中奖弹窗优化、翻转背面视觉优化。所有修改保持最小化，逐步递增实现。

## 任务

- [x] 1. 扩展类型定义和状态管理基础
  - [x] 1.1 在 `src/types/index.ts` 中扩展 `LotteryConfig` 接口，新增可选字段 `backgroundImage?: File`
    - 在 `MarqueeState` 接口中新增 `isDecelerating: boolean` 和 `remainingSteps: number | null` 字段
    - _需求: 1.1, 2.1, 2.2_
  - [x] 1.2 在 `src/utils/lotteryReducer.ts` 中更新 `defaultMarquee` 和 `initialState`，包含新增的 `isDecelerating` 和 `remainingSteps` 字段
    - 新增 `START_DECELERATION` action 类型，设置 `isDecelerating=true` 和随机 `remainingSteps`
    - 更新 `STOP_MARQUEE` action 处理，重置 `isDecelerating=false` 和 `remainingSteps=null`
    - _需求: 1.1, 1.4_

- [x] 2. 实现跑马灯减速停止机制
  - [x] 2.1 在 `src/hooks/useMarquee.ts` 中实现 `calculateDecelerationInterval` 函数
    - 参数: `step: number, totalSteps: number, baseSpeed: number`
    - 使用 easeOutQuad 缓动: `progress = step / totalSteps`, `eased = 1 - (1 - progress)²`
    - 返回值: `baseSpeed + (baseSpeed * 3) * eased`，范围 [baseSpeed, baseSpeed × 4]
    - _需求: 1.2, 1.5_
  - [ ]* 2.2 为 `calculateDecelerationInterval` 编写属性测试
    - **Property 2: 减速间隔函数正确性（边界 + 单调性）**
    - 在 `src/utils/__tests__/` 下创建 `deceleration.property.test.ts`
    - 使用 fast-check 验证: (a) 返回值 ≥ baseSpeed; (b) 返回值 ≤ baseSpeed × 4; (c) 单调递增
    - **验证: 需求 1.2, 1.5**
  - [x] 2.3 重写 `useMarquee` hook 的 `toggle` 和动画循环，实现减速逻辑
    - 新增 `UseMarqueeOptions.decelerationSteps?: [number, number]` 参数，默认 `[4, 6]`
    - 新增 `UseMarqueeReturn.isDecelerating: boolean` 返回值
    - `toggle()` 在运行中调用时进入减速阶段而非立即停止
    - 减速阶段随机选择 4-6 步剩余步数，使用 `calculateDecelerationInterval` 计算每步间隔
    - 减速期间 `toggle()` 调用无效果（防止中断）
    - 减速完成后设置 `selectedIndex` 并停止
    - 使用 `requestAnimationFrame` 驱动减速动画
    - 处理减速路径上拼图已翻转的情况（选中最后一个未翻转的）
    - _需求: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [ ]* 2.4 为减速步数范围编写属性测试
    - **Property 1: 减速步数范围**
    - 在 `src/utils/__tests__/deceleration.property.test.ts` 中追加
    - 验证减速引擎选择的剩余步数为 4 到 6 之间的整数
    - **验证: 需求 1.1**
  - [ ]* 2.5 为减速期间不可中断编写属性测试
    - **Property 3: 减速期间不可中断**
    - 验证处于减速阶段时调用 toggle() 不改变 isRunning、isDecelerating 和 remainingSteps
    - **验证: 需求 1.3**
  - [ ]* 2.6 为减速完成后状态正确编写属性测试
    - **Property 4: 减速完成后状态正确**
    - 验证减速完成后 isRunning=false, isDecelerating=false, selectedIndex 为有效非 null 值
    - **验证: 需求 1.4**

- [x] 3. 检查点 - 确保减速机制测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 4. 实现 ESC 键支持和中奖弹窗优化
  - [x] 4.1 在 `src/hooks/useKeyboard.ts` 中扩展 `UseKeyboardOptions` 接口，新增可选 `onEscape?: () => void` 回调
    - 在 `handleKeyDown` 中增加 `e.code === 'Escape'` 分支，调用 `onEscape`
    - _需求: 4.4, 4.5, 4.6_
  - [x] 4.2 修改 `src/components/NumberModal.tsx`
    - 移除右上角 `×` 关闭按钮元素
    - 移除 overlay 的 `onClick` 事件处理（不再响应遮罩层点击关闭）
    - _需求: 4.2, 4.3_
  - [x] 4.3 修改 `src/components/NumberModal.module.css`
    - 将 `.modal` 的 `background` 从 `#1a1a2e` 改为 `rgb(5, 69, 214)`
    - 移除 `.closeButton` 和 `.closeButton:hover` 样式规则
    - _需求: 4.1_
  - [x] 4.4 在 `src/components/LotteryPage.tsx` 中将 `handleModalClose` 作为 `onEscape` 传递给 `useKeyboard`
    - 确保仅在弹窗可见时 ESC 才触发关闭
    - _需求: 4.4, 4.5_
  - [ ]* 4.5 更新 `src/components/__tests__/NumberModal.test.tsx` 测试
    - 验证无关闭按钮渲染
    - 验证 overlay 点击不触发关闭
    - 验证背景色为 `rgb(5, 69, 214)`
    - _需求: 4.1, 4.2, 4.3_

- [x] 5. 实现翻转后拼图卡片背面视觉优化
  - [x] 5.1 修改 `src/components/JigsawTile.tsx` 中背面 SVG 的 `<rect>` 填充色
    - 将 `fill="rgba(0,0,0,0.85)"` 改为 `fill="rgb(4, 4, 63)"`
    - 保持 SVG clipPath 裁剪不变，确保背面仍呈现拼图形状轮廓
    - 保持号码文字颜色 `#FFD700` 不变
    - 保持 CSS 3D rotateY(180deg) 翻转效果不变
    - _需求: 5.1, 5.2, 5.3, 5.4_

- [x] 6. 检查点 - 确保弹窗和拼图背面修改测试通过
  - 确保所有测试通过，如有问题请询问用户。

- [x] 7. 实现大屏幕拼图布局调整
  - [x] 7.1 修改 `src/components/LotteryPage.module.css` 中的布局比例
    - `.titleArea` 的 `height` 从 `42.5vh` 改为 `30vh`
    - `.puzzleArea` 的 `height` 从 `32.5vh` 改为 `45vh`
    - `.bottomArea` 的 `height` 保持 `25vh` 不变
    - _需求: 3.1, 3.2_
  - [x] 7.2 修改 `src/components/LotteryPage.tsx` 中的 `PUZZLE_AREA_VH` 常量
    - 从 `32.5` 改为 `45`，确保 tileHeight 计算正确
    - _需求: 3.3_
  - [ ]* 7.3 为布局比例编写属性测试
    - **Property 6: 布局比例与拼图高度计算**
    - 在 `src/utils/__tests__/` 下创建 `layout.property.test.ts`
    - 使用 fast-check 验证: 三区域高度之和 = 100vh (30+45+25)，tileHeight = (windowHeight × 45 / 100) / rows
    - **验证: 需求 3.2, 3.3**

- [x] 8. 实现背景图片配置功能
  - [x] 8.1 修改 `src/components/ConfigPage.tsx`，新增背景图片上传
    - 新增 `backgroundImage` state
    - 新增第二个 `ImageUploader` 组件用于背景图片上传，标注为可选
    - 在 `handleSubmit` 中将 `backgroundImage` 传入 `LotteryConfig`
    - 如果提供了 `backgroundImage`，使用 `validateImageFile` 验证
    - _需求: 2.1, 2.2, 2.3_
  - [x] 8.2 修改 `src/components/LotteryPage.tsx`，支持背景图片渲染
    - 从 `config.backgroundImage` 创建 Object URL 作为背景
    - 在 `.container` div 上设置 `backgroundImage`、`backgroundSize: 'cover'`、`backgroundPosition: 'center'` 内联样式
    - 未配置背景图片时保持默认 `#1a1a2e` 背景色
    - 背景图片加载失败时回退到默认背景色
    - 组件卸载时释放 Object URL
    - _需求: 2.4, 2.5, 2.6_
  - [ ]* 8.3 为背景图片可选配置编写属性测试
    - **Property 5: 背景图片可选配置**
    - 在 `src/utils/__tests__/` 下创建 `backgroundImage.property.test.ts`
    - 验证 backgroundImage 为 undefined 时配置验证通过且系统正常运行
    - **验证: 需求 2.2**

- [x] 9. 最终检查点 - 确保所有测试通过
  - 确保所有测试通过，如有问题请询问用户。

## 备注

- 标记 `*` 的子任务为可选测试任务，可跳过以加快 MVP 进度
- 每个任务引用了具体的需求编号，确保可追溯性
- 检查点任务确保增量验证
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
