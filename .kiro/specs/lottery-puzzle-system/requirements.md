# 需求文档

## 简介

抽奖拼图系统是一个全屏展示的网页应用，用于活动现场大屏幕（7m × 4m）抽奖。系统将一张可定制的图片切分为具有真实拼图形状（凸凹互锁边缘）的拼图块，每块拼图背面对应一个唯一的抽奖号码。抽奖过程采用跑马灯动画——拼图块的外轮廓依次发光，用户通过键盘空格键控制跑马灯的启停，停止时选中的拼图块翻转揭示对应的中奖号码。已翻转的拼图块不可再次被选中。系统支持自定义图片、网格尺寸等配置。

## 术语表

- **抽奖系统 (Lottery_System)**：整个抽奖拼图应用程序
- **配置页面 (Config_Page)**：启动后的初始页面，用于设置图片和网格参数
- **抽奖页面 (Lottery_Page)**：展示拼图网格并进行抽奖的主页面
- **拼图块 (Jigsaw_Tile)**：图片被切分后的单个拼图单元，具有凸凹互锁边缘，正面显示图片片段，背面显示抽奖号码
- **拼图面板 (Puzzle_Board)**：承载所有拼图块的容器组件，管理拼图块的布局和发光效果
- **抽奖号码 (Lottery_Number)**：每个拼图块对应的唯一编号，格式为"字母+数字"（如 A1、B2、C15）
- **翻转动画 (Flip_Animation)**：拼图块被选中后的 CSS 3D 翻转展示效果
- **网格配置 (Grid_Config)**：水平列数和垂直行数的组合设置
- **边缘映射 (Edge_Map)**：记录每条拼图边缘凸凹状态的数据结构
- **跑马灯 (Marquee)**：拼图块外轮廓依次发光的动画效果，按蛇形顺序遍历
- **轮廓发光 (Contour_Glow)**：通过 SVG filter 实现的拼图块外轮廓发光效果
- **蛇形遍历 (Snake_Traversal)**：偶数行从左到右、奇数行从右到左的交替遍历顺序

## 需求

### 需求 1：配置页面

**用户故事：** 作为活动组织者，我希望在启动应用后能配置抽奖图片和网格尺寸，以便灵活适配不同活动场景。

#### 验收标准

1. WHEN 抽奖系统启动时，THE Config_Page SHALL 显示图片上传区域、水平切分数量输入框、垂直切分数量输入框和"进入抽奖"按钮
2. THE Config_Page SHALL 提供图片上传功能，支持用户选择本地图片文件（支持 JPG、PNG 格式）
3. THE Config_Page SHALL 提供水平切分数量（列数）输入框，默认值为 20
4. THE Config_Page SHALL 提供垂直切分数量（行数）输入框，默认值为 5
5. IF 用户未上传图片就点击"进入抽奖"，THEN THE Config_Page SHALL 显示提示信息"请先上传抽奖图片"
6. IF 用户输入的切分数量小于 1 或不是正整数，THEN THE Config_Page SHALL 显示提示信息"切分数量必须为大于 0 的正整数"
7. WHEN 用户完成配置并点击"进入抽奖"按钮时，THE Config_Page SHALL 跳转至 Lottery_Page


### 需求 2：屏幕布局与拼图展示

**用户故事：** 作为活动参与者，我希望在 7m × 4m 的大屏幕上看到布局合理的拼图网格，拼图区域位于屏幕中部便于观看的高度，以便清晰地观看抽奖过程。

#### 验收标准

1. WHEN 进入 Lottery_Page 时，THE Lottery_System SHALL 将屏幕划分为三个区域：标题区（顶部 42.5%）、拼图区（中部 32.5%，对应屏幕高度 1.7m~3.0m）、底部信息区（底部 25%）
2. WHEN 进入 Lottery_Page 时，THE Lottery_System SHALL 将上传的图片按配置的行列数切分为等大的矩形图片片段，并通过 SVG clipPath 裁剪为拼图形状后在拼图区全屏展示
3. THE Jigsaw_Tile SHALL 初始状态显示图片正面（经拼图形状裁剪的图片片段）
4. THE Lottery_System SHALL 根据网格配置生成对应数量的 Lottery_Number，行以大写字母（A、B、C...）标识，列以数字（1、2、3...）标识
5. THE Lottery_System SHALL 将生成的 Lottery_Number 随机打乱后分配给每个 Jigsaw_Tile，使号码与拼图位置无固定对应关系

### 需求 3：拼图形状生成

**用户故事：** 作为活动参与者，我希望看到具有真实拼图形状（凸凹互锁边缘）的拼图块，以获得更逼真的拼图视觉效果。

#### 验收标准

1. THE Lottery_System SHALL 为每个拼图网格生成 Edge_Map，记录每条边的凸凹状态
2. THE Edge_Map SHALL 将网格边界上的所有边设为平边（flat），内部边随机设为凸边（tab）或凹边（blank）
3. THE Edge_Map SHALL 确保相邻拼图块的共享边互补：若一侧为凸边（tab），则另一侧为凹边（blank）
4. THE Lottery_System SHALL 使用贝塞尔曲线为每个 Jigsaw_Tile 生成闭合的 SVG path 字符串，描述该拼图块的完整轮廓
5. THE Jigsaw_Tile SHALL 使用 SVG clipPath 将矩形图片片段裁剪为拼图形状
6. THE Edge_Map 的水平边数组维度 SHALL 为 [rows+1][cols]，垂直边数组维度 SHALL 为 [rows][cols+1]

### 需求 4：跑马灯动画

**用户故事：** 作为活动参与者，我希望看到拼图块外轮廓依次发光的跑马灯动画，以获得紧张刺激的抽奖体验。

#### 验收标准

1. WHEN 跑马灯启动时，THE Lottery_System SHALL 按 Snake_Traversal 顺序依次高亮 Jigsaw_Tile 的外轮廓
2. THE Snake_Traversal SHALL 按偶数行（0-indexed）从左到右、奇数行从右到左的交替顺序遍历所有拼图块
3. THE Lottery_System SHALL 生成长度为 rows × cols 的遍历索引数组，包含 0 到 rows×cols-1 的所有整数恰好一次
4. WHILE 跑马灯运行中，THE Lottery_System SHALL 跳过已翻转的 Jigsaw_Tile，仅在未翻转的拼图块上高亮
5. THE Lottery_System SHALL 使用 requestAnimationFrame 驱动跑马灯动画，默认速度为 100ms/步
6. IF 所有 Jigsaw_Tile 均已翻转，THEN THE Lottery_System SHALL 禁用跑马灯功能

### 需求 5：轮廓发光效果

**用户故事：** 作为活动参与者，我希望跑马灯高亮时仅拼图块的外轮廓发光，而非整块高亮，以获得精致的视觉效果。

#### 验收标准

1. WHEN 一个 Jigsaw_Tile 被跑马灯高亮时，THE Lottery_System SHALL 使用 SVG path 绘制该拼图块的外轮廓，并通过 SVG filter（feGaussianBlur + feFlood）实现发光效果
2. WHILE Jigsaw_Tile 处于高亮状态，THE Contour_Glow SHALL 播放脉冲动画（stroke-opacity 在 0.6 和 1.0 之间交替，drop-shadow 在 4px 和 12px 之间交替）
3. WHEN Jigsaw_Tile 不处于高亮状态时，THE Contour_Glow SHALL 隐藏（visibility: hidden）

### 需求 6：键盘控制与抽奖交互

**用户故事：** 作为活动组织者，我希望通过键盘空格键控制跑马灯的启停来进行抽奖，以便在大屏幕前远程操控。

#### 验收标准

1. WHEN 用户在 Lottery_Page 按下空格键且跑马灯未运行时，THE Lottery_System SHALL 启动 Marquee 动画
2. WHEN 用户在 Lottery_Page 按下空格键且跑马灯正在运行时，THE Lottery_System SHALL 停止 Marquee 动画并选中当前高亮的 Jigsaw_Tile
3. WHEN 跑马灯停止并选中一个 Jigsaw_Tile 时，THE Lottery_System SHALL 播放 Flip_Animation 将该拼图块翻转至背面，揭示对应的 Lottery_Number
4. WHEN Flip_Animation 完成后，THE Lottery_System SHALL 放大显示该 Jigsaw_Tile 背面的 Lottery_Number
5. THE Lottery_System SHALL 在放大显示区域清晰展示中奖号码，字体大小足以让远处观众辨认
6. WHEN 用户确认中奖结果后（点击关闭或点击其他区域），THE Lottery_System SHALL 恢复拼图网格视图，被翻转的拼图块保持翻转状态显示号码
7. WHILE Flip_Animation 播放中，THE Lottery_System SHALL 忽略空格键输入，防止在翻转过程中启动跑马灯
8. THE Lottery_System SHALL 在监听键盘事件时阻止空格键的默认行为（页面滚动）

### 需求 7：已翻转拼图块管理

**用户故事：** 作为活动组织者，我希望已经翻转的拼图块不能再次被选中，以确保每个号码只被抽取一次。

#### 验收标准

1. THE Lottery_System SHALL 记录所有已翻转的 Jigsaw_Tile 状态
2. WHEN 跑马灯遍历时遇到已翻转的 Jigsaw_Tile，THE Lottery_System SHALL 跳过该拼图块
3. THE Lottery_Page SHALL 以视觉差异（如降低透明度或灰度显示）区分已翻转和未翻转的 Jigsaw_Tile
4. IF 所有 Jigsaw_Tile 均已翻转，THEN THE Lottery_System SHALL 显示提示信息"所有号码已抽完"

### 需求 8：号码生成规则

**用户故事：** 作为活动组织者，我希望号码按照行列规则自动生成，以便管理和核对中奖信息。

#### 验收标准

1. THE Lottery_System SHALL 根据垂直行数生成对应的行字母标识，从 A 开始按字母表顺序递增（A、B、C、D、E...）
2. THE Lottery_System SHALL 根据水平列数生成对应的列数字标识，从 1 开始按自然数递增（1、2、3...20）
3. THE Lottery_System SHALL 将行字母与列数字组合生成 Lottery_Number（如 5 行 20 列生成 A1~A20、B1~B20、C1~C20、D1~D20、E1~E20 共 100 个号码）
4. IF 垂直行数超过 26 行，THEN THE Lottery_System SHALL 使用双字母标识继续编号（如 AA、AB、AC...）