# 需求文档

## 简介

抽奖拼图系统是一个全屏展示的网页应用，用于活动现场抽奖。系统将一张可定制的图片切分为网格状拼图块，每块拼图背面对应一个唯一的抽奖号码。用户直接点击任意未翻转的拼图块即可翻转揭示对应的中奖号码，已翻转的拼图块不可再次被点击。系统支持自定义图片、网格尺寸等配置。

## 术语表

- **抽奖系统 (Lottery_System)**：整个抽奖拼图应用程序
- **配置页面 (Config_Page)**：启动后的初始页面，用于设置图片和网格参数
- **抽奖页面 (Lottery_Page)**：展示拼图网格并进行抽奖的主页面
- **拼图块 (Puzzle_Tile)**：图片被切分后的单个网格单元，正面显示图片片段，背面显示抽奖号码
- **抽奖号码 (Lottery_Number)**：每个拼图块对应的唯一编号，格式为"字母+数字"（如 A1、B2、C15）
- **翻转动画 (Flip_Animation)**：拼图块被点击后的翻转展示效果
- **网格配置 (Grid_Config)**：水平列数和垂直行数的组合设置

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


### 需求 2：拼图网格展示

**用户故事：** 作为活动参与者，我希望在 16:9 的屏幕上看到完整的拼图网格，以便清晰地观看抽奖过程。

#### 验收标准

1. WHEN 进入 Lottery_Page 时，THE Lottery_System SHALL 将上传的图片按配置的行列数切分为等大的拼图块，并以网格形式全屏展示
2. THE Lottery_Page SHALL 以 16:9 的比例全屏展示拼图网格
3. THE Puzzle_Tile SHALL 初始状态显示图片正面（对应的图片片段）
4. THE Lottery_System SHALL 根据网格配置生成对应数量的 Lottery_Number，行以大写字母（A、B、C...）标识，列以数字（1、2、3...）标识
5. THE Lottery_System SHALL 将生成的 Lottery_Number 随机打乱后分配给每个 Puzzle_Tile，使号码与拼图位置无固定对应关系

### 需求 3：点击翻转拼图块

**用户故事：** 作为活动参与者，我希望直接点击拼图块来揭示中奖号码，以便获得直观的抽奖体验。

#### 验收标准

1. WHEN 用户在 Lottery_Page 点击一个未翻转的 Puzzle_Tile 时，THE Lottery_System SHALL 播放 Flip_Animation 将该拼图块翻转至背面，揭示对应的 Lottery_Number
2. WHEN Flip_Animation 完成后，THE Lottery_System SHALL 放大显示该 Puzzle_Tile 背面的 Lottery_Number
3. THE Lottery_System SHALL 在放大显示区域清晰展示中奖号码，字体大小足以让远处观众辨认
4. WHEN 用户确认中奖结果后（点击关闭或点击其他区域），THE Lottery_System SHALL 恢复拼图网格视图，被翻转的拼图块保持翻转状态显示号码
5. WHILE Flip_Animation 播放中，THE Lottery_System SHALL 忽略对其他 Puzzle_Tile 的点击操作，防止同时翻转多个拼图块

### 需求 4：已翻转拼图块管理

**用户故事：** 作为活动组织者，我希望已经翻转的拼图块不能再次被点击，以确保每个号码只被抽取一次。

#### 验收标准

1. THE Lottery_System SHALL 记录所有已翻转的 Puzzle_Tile 状态
2. WHEN 用户点击已翻转的 Puzzle_Tile 时，THE Lottery_System SHALL 忽略该点击操作，不产生任何响应
3. THE Lottery_Page SHALL 以视觉差异（如降低透明度或灰度显示）区分已翻转和未翻转的 Puzzle_Tile
4. IF 所有 Puzzle_Tile 均已翻转，THEN THE Lottery_System SHALL 显示提示信息"所有号码已抽完"

### 需求 5：号码生成规则

**用户故事：** 作为活动组织者，我希望号码按照行列规则自动生成，以便管理和核对中奖信息。

#### 验收标准

1. THE Lottery_System SHALL 根据垂直行数生成对应的行字母标识，从 A 开始按字母表顺序递增（A、B、C、D、E...）
2. THE Lottery_System SHALL 根据水平列数生成对应的列数字标识，从 1 开始按自然数递增（1、2、3...20）
3. THE Lottery_System SHALL 将行字母与列数字组合生成 Lottery_Number（如 5 行 20 列生成 A1~A20、B1~B20、C1~C20、D1~D20、E1~E20 共 100 个号码）
4. IF 垂直行数超过 26 行，THEN THE Lottery_System SHALL 使用双字母标识继续编号（如 AA、AB、AC...）