# 需求文档

## 简介

本文档描述对现有抽奖拼图系统的五项增强需求：(1) 跑马灯减速停止机制；(2) 支持配置背景图片；(3) 调整拼图布局以适配4米高大屏幕；(4) 优化中奖弹窗样式与交互；(5) 翻转后拼图卡片背面视觉优化。所有增强在保持现有架构不变的前提下进行最小化修改。

## 术语表

- **抽奖系统 (Lottery_System)**：整个抽奖拼图应用程序
- **配置页面 (Config_Page)**：启动后的初始页面，用于设置图片和网格参数
- **抽奖页面 (Lottery_Page)**：展示拼图网格并进行抽奖的主页面
- **拼图块 (Jigsaw_Tile)**：图片被切分后的单个拼图单元，正面显示图片片段，背面显示抽奖号码
- **跑马灯 (Marquee)**：拼图块外轮廓依次发光的动画效果
- **减速引擎 (Deceleration_Engine)**：跑马灯停止时的减速动画逻辑，控制逐步减速直至停止
- **减速阶段 (Deceleration_Phase)**：从用户触发停止到跑马灯完全停下的过渡期间
- **中奖弹窗 (Number_Modal)**：展示中奖号码的全屏模态弹窗组件
- **背景图片 (Background_Image)**：用户可选配置的抽奖页面背景图片
- **缓动函数 (Ease_Out)**：easeOutQuad 缓动曲线，公式为 `1 - (1 - t)²`
- **翻转动画 (Flip_Animation)**：拼图块被选中后的 CSS 3D 翻转展示效果
- **拼图形状裁剪 (Jigsaw_Clip)**：通过 SVG clipPath 将矩形区域裁剪为拼图轮廓形状

## 需求

### 需求 1：跑马灯减速停止机制

**用户故事：** 作为活动组织者，我希望按下空格键后跑马灯不是立即停止，而是逐步减速并在走过若干块拼图后自然停下，以增强抽奖的悬念感和观赏性。

#### 验收标准

1. WHEN 用户在跑马灯运行中按下空格键时，THE Deceleration_Engine SHALL 进入 Deceleration_Phase，随机选择 4 到 6 之间的整数作为剩余步数
2. WHILE 处于 Deceleration_Phase 期间，THE Deceleration_Engine SHALL 使用 Ease_Out 缓动函数逐步增大每步间隔时间，从基础速度（baseSpeed）递增至基础速度的 4 倍（baseSpeed × 4）
3. WHILE 处于 Deceleration_Phase 期间，THE Lottery_System SHALL 忽略用户的空格键输入，防止中断减速过程
4. WHEN Deceleration_Phase 的剩余步数减至 0 时，THE Deceleration_Engine SHALL 停止跑马灯并将当前高亮的拼图块设为选中状态
5. THE Deceleration_Engine SHALL 确保每步间隔时间单调递增，即第 i 步的间隔时间不大于第 i+1 步的间隔时间
6. THE Deceleration_Engine SHALL 使用 requestAnimationFrame 驱动减速动画，与现有跑马灯动画共用同一帧循环
7. WHEN 减速停止完成后选中的 Jigsaw_Tile 为已翻转状态时，THE Deceleration_Engine SHALL 选中减速路径上最后一个未翻转的 Jigsaw_Tile

### 需求 2：背景图片配置

**用户故事：** 作为活动组织者，我希望能为抽奖页面配置自定义背景图片，以便匹配不同活动的视觉主题。

#### 验收标准

1. WHEN 用户进入 Config_Page 时，THE Config_Page SHALL 显示一个额外的图片上传区域，用于上传 Background_Image
2. THE Config_Page SHALL 将 Background_Image 作为可选配置项，用户可以不上传背景图片
3. WHEN 用户上传 Background_Image 时，THE Config_Page SHALL 使用现有的图片格式验证逻辑（支持 JPG、JPEG、PNG 格式）验证文件有效性
4. WHEN 用户配置了 Background_Image 并进入 Lottery_Page 时，THE Lottery_Page SHALL 将该图片作为全屏背景显示，使用 CSS `background-size: cover` 和 `background-position: center` 进行适配
5. WHEN 用户未配置 Background_Image 时，THE Lottery_Page SHALL 使用默认纯色背景 `#1a1a2e`
6. IF Background_Image 加载失败，THEN THE Lottery_Page SHALL 回退到默认纯色背景 `#1a1a2e`，不影响抽奖功能

### 需求 3：大屏幕拼图布局调整

**用户故事：** 作为活动参与者，我希望在4米高的大屏幕上，拼图区域位于从最下沿起1米到2.8米的位置，以便站在屏幕前方的观众能舒适地观看抽奖过程。

#### 验收标准

1. WHEN 进入 Lottery_Page 时，THE Lottery_System SHALL 将屏幕划分为三个区域：标题区（顶部 30vh）、拼图区（中部 45vh）、底部信息区（底部 25vh）
2. THE Lottery_System SHALL 确保三个区域的高度之和等于 100vh（30vh + 45vh + 25vh = 100vh）
3. THE Lottery_System SHALL 根据新的拼图区高度（45vh）重新计算每个 Jigsaw_Tile 的高度，公式为 `tileHeight = (window.innerHeight × 45) / 100 / rows`

### 需求 4：中奖弹窗优化

**用户故事：** 作为活动组织者，我希望中奖弹窗的数字背景色更醒目，并且只能通过 ESC 键关闭，以防止在大屏幕操作时误触关闭。

#### 验收标准

1. THE Number_Modal SHALL 使用 `rgb(5, 69, 214)` 作为弹窗背景色
2. THE Number_Modal SHALL 不渲染右上角关闭按钮（移除 `×` 按钮元素）
3. THE Number_Modal SHALL 不响应遮罩层（overlay）的点击事件来关闭弹窗
4. WHEN Number_Modal 处于可见状态且用户按下 ESC 键时，THE Lottery_System SHALL 关闭 Number_Modal
5. WHEN Number_Modal 处于不可见状态且用户按下 ESC 键时，THE Lottery_System SHALL 不执行任何操作
6. THE useKeyboard hook SHALL 支持可选的 `onEscape` 回调参数，用于监听 ESC 键事件

### 需求 5：翻转后拼图卡片背面视觉优化

**用户故事：** 作为活动参与者，我希望翻转后的拼图卡片背面呈现深蓝色并保持拼图形状轮廓，以获得拼图卡片翻过来的真实视觉效果。

#### 验收标准

1. WHEN Jigsaw_Tile 翻转至背面时，THE Jigsaw_Tile SHALL 使用 `rgb(4, 4, 63)` 作为背面填充色
2. WHEN Jigsaw_Tile 翻转至背面时，THE Jigsaw_Tile SHALL 通过 SVG clipPath（Jigsaw_Clip）裁剪背面区域，保持与正面相同的拼图轮廓形状
3. THE Jigsaw_Tile SHALL 保持背面号码文字颜色为 `#FFD700`（金色），确保在深蓝背景上具有良好的对比度
4. THE Jigsaw_Tile SHALL 保持 CSS 3D rotateY(180deg) 翻转效果，呈现拼图卡片翻过来的视觉效果
