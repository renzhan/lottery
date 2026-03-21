# 需求文档

## 简介

本文档描述对现有抽奖拼图系统的两项修复与改进：(1) 号码排列顺序改进——默认按顺序排列（左到右 1~cols，上到下 A~E），打乱顺序作为可选项（默认不打乱）；(2) 拼图凸出部分颜色修复——翻转后的拼图卡片背面，凸出方块（tab）区域在卡片和弹窗中均未被背景色覆盖，导致该区域透明露出底层图片。

## 术语表

- **抽奖系统 (Lottery_System)**：整个抽奖拼图应用程序
- **配置页面 (Config_Page)**：启动后的初始页面，用于设置图片、网格参数和号码排列选项
- **抽奖页面 (Lottery_Page)**：展示拼图网格并进行抽奖的主页面
- **拼图块 (Jigsaw_Tile)**：图片被切分后的单个拼图单元，正面显示图片片段，背面显示抽奖号码
- **号码生成器 (Number_Generator)**：根据行列数生成抽奖号码列表的模块（`generateNumbers` 函数）
- **中奖弹窗 (Number_Modal)**：展示中奖号码的全屏模态弹窗组件
- **拼图形状裁剪 (Jigsaw_Clip)**：通过 SVG clipPath 将矩形区域裁剪为拼图轮廓形状
- **凸出方块 (Tab)**：拼图块边缘向外凸出的部分，超出基础矩形范围
- **背面填充矩形 (Back_Rect)**：拼图块翻转后背面用于填充背景色的 SVG rect 元素
- **填充间距 (PAD)**：拼图块渲染时在基础矩形四周预留的额外空间比例，当前值为 0.30

## 需求

### 需求 1：号码默认按顺序排列

**用户故事：** 作为活动组织者，我希望拼图块上的号码默认按顺序排列（左到右、上到下），以便参与者能快速定位自己的号码位置。

#### 验收标准

1. WHEN Config_Page 未设置打乱号码选项时，THE Lottery_Page SHALL 将号码按原始顺序分配给拼图块，使位置 (r, c) 的拼图块号码等于行字母标识加列编号（如 A1, A2, ..., E20）
2. WHEN 用户在 Config_Page 启用打乱号码选项时，THE Lottery_Page SHALL 使用 Fisher-Yates 洗牌算法对号码进行随机排列后再分配给拼图块
3. THE Config_Page SHALL 提供一个"打乱号码顺序"开关控件，默认状态为关闭（不打乱）
4. WHEN 号码分配完成后，THE Lottery_System SHALL 确保分配的号码集合与 Number_Generator 生成的原始号码集合完全相同（无遗漏、无重复）

### 需求 2：向后兼容号码配置

**用户故事：** 作为开发者，我希望新增的号码排列配置与现有系统向后兼容，以避免破坏已有功能。

#### 验收标准

1. WHEN LotteryConfig 中 shuffleNumbers 字段未传递时，THE Lottery_Page SHALL 将其视为 false，保持号码顺序排列
2. THE LotteryConfig 类型 SHALL 将 shuffleNumbers 定义为可选布尔字段（`shuffleNumbers?: boolean`），默认值为 false

### 需求 3：拼图块背面 Tab 区域颜色修复

**用户故事：** 作为活动参与者，我希望翻转后的拼图块背面完整显示背景色，包括凸出方块区域，以获得视觉上完整的拼图卡片效果。

#### 验收标准

1. WHEN Jigsaw_Tile 翻转至背面时，THE Back_Rect SHALL 在水平方向扩展至 `offsetX - padX` 起始、宽度为 `tileWidth + padX * 2`，在垂直方向扩展至 `offsetY - padY` 起始、高度为 `tileHeight + padY * 2`，其中 padX = tileWidth × PAD，padY = tileHeight × PAD
2. WHEN Jigsaw_Tile 翻转至背面时，THE Back_Rect SHALL 通过 Jigsaw_Clip 裁剪，确保填充区域严格限制在拼图轮廓形状内
3. THE Back_Rect 的扩展范围 SHALL 完全覆盖拼图形状的包围盒（bounding box），包含所有可能的 Tab 凸出区域（Tab 凸出量为 tileWidth × 0.25 或 tileHeight × 0.25，PAD 值 0.30 大于 0.25）

### 需求 4：中奖弹窗 Tab 区域颜色修复

**用户故事：** 作为活动参与者，我希望中奖弹窗中放大显示的拼图形状背面也完整显示背景色，包括凸出方块区域。

#### 验收标准

1. WHEN Number_Modal 以拼图形状显示中奖号码时，THE Number_Modal 的填充矩形 SHALL 在水平方向扩展至 `offsetX - padX` 起始、宽度为 `tileWidth + padX * 2`，在垂直方向扩展至 `offsetY - padY` 起始、高度为 `tileHeight + padY * 2`
2. WHEN Number_Modal 以拼图形状显示中奖号码时，THE Number_Modal 的填充矩形 SHALL 通过 clipPath 裁剪，确保填充区域严格限制在拼图轮廓形状内
3. THE Number_Modal 的填充矩形扩展范围 SHALL 完全覆盖拼图形状的包围盒，与 Jigsaw_Tile 背面使用相同的扩展策略
