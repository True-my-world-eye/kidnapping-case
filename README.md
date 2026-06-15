# 🕵️ Kronos 绑架案 · 数据可视化分析系统

> **VAST Challenge 2014 MC1** — 媒体偏见识别、组织关系挖掘与交互式叙事可视化

---

## 📖 项目概述

2014 年 1 月 20 日，克罗诺斯岛国（Kronos）能源巨头 GAStech 多名高管在 IPO 庆功宴后集体失踪。环保激进组织 POK（Protectors of Kronos）宣称对此负责，要求 2000 万美元赎金。但——**这真的是全部真相吗？**

本项目基于 VAST Challenge 2014 MC1 数据集，对 **845 篇新闻文章**、**1175 封内部邮件**、**54 份员工档案**进行结构化处理与多维度分析，通过**交互式 Web 可视化系统**揭示：

- 📰 新闻来源的可靠性差异与转载传播链
- 🎭 媒体偏见如何通过措辞、选材和传播被放大
- 🔗 GAStech、政府、POK、APA 四方的复杂关系网络
- 📧 绑架前 GAStech 内部的异常通信与安保动态
- ⏳ 二十年间冲突如何逐步升级最终引爆绑架事件

---

## 🏗️ 项目结构

```
kidnapping-case-main/
├── v2_visualization_web/          # 🖥️ React + ECharts 交互式可视化系统
│   ├── src/
│   │   ├── components/Charts/     # 17 个可视化幻灯片组件
│   │   ├── data/dataLoader.ts     # CSV 数据加载器
│   │   ├── hooks/                 # 自定义 React Hooks
│   │   └── lib/utils.ts           # 工具函数
│   ├── public/data/               # 可视化用的 CSV 数据文件
│   ├── index.html
│   └── package.json
│
├── scripts/                       # 🐍 Python 数据处理脚本
│   ├── parse_mc1.py               # 主解析：新闻文章 + 邮件头 → 结构化 CSV
│   ├── build_analysis.py          # 构建分析数据表
│   └── build_curated.py           # 构建精选数据集
│
├── output/                        # 📊 结构化数据产出（18 个文件）
│   ├── articles_lite.csv          # 845 篇新闻结构化数据（核心表）
│   ├── emails.csv                  # 1175 封内部邮件头
│   ├── sources.csv                 # 29 个媒体来源汇总
│   ├── bias_cases.csv             # 偏见对比案例（10 组人工配对）
│   ├── relationships.csv          # 四方关系证据表
│   ├── network_nodes.csv          # 统一网络节点表
│   ├── network_edges.csv          # 统一网络边表
│   ├── timeline_master.csv        # 统一时间线主表
│   ├── Q1_媒体来源分析.md          # Q1 分析结论
│   ├── Q2_偏见案例解读.md          # Q2 分析结论
│   └── Q3_四方关系矩阵.md          # Q3 关系定稿
│
├── 可视化数据整理_MC1.md           # 可视化数据整理总览
├── 叙事建议.md                     # 六部分叙事结构建议
├── 汇报与PPT制作指南.md            # 12-15 分钟汇报脚本 + 28 页 PPT 结构
├── README_数据整理.md              # 数据整理产出说明
├── README_表格说明.md              # 数据表口径与局限说明
└── MC1_可视化叙事逻辑增强版_融入复杂关系网络.docx  # 原始叙事设计文档
```

---

## 🔍 核心分析问题

| 问题 | 核心探究 | 关键产出 |
|------|---------|---------|
| **Q1** | 哪些数据是原始资料？新闻来源是否可靠？ | 来源四分类、188 组转载关系、主题传播失真 |
| **Q2** | 不同媒体如何呈现同一事件？偏见表现在哪里？ | 10 组偏见对比案例、立场光谱、词频阵营分析 |
| **Q3** | GAStech、POK、政府、APA 之间有何关系？ | 四方关系矩阵、邮件通信网络、CEO 异常行为 |
| **Q4** | 2014 年的分析与 2026 年有何方法差异？ | 交互式 Scrollytelling 对比静态报告 |

---

## 🚀 快速开始

### 环境要求

- **Node.js** ≥ 18（Web 可视化系统）
- **Python** ≥ 3.9（数据解析脚本）
- **pnpm** / **npm**（包管理器）

### 1. 启动可视化 Web 系统

```bash
cd v2_visualization_web

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

浏览器访问 `http://localhost:5173`，即可体验 19 步 Scrollytelling 交互式数据故事。

### 2. 重新生成数据文件

如果你有原始 MC1 数据集，可以重新运行解析脚本：

```bash
# 安装 Python 依赖（如有）
pip install -r requirements.txt  # 如存在

# 运行解析管道
python scripts/parse_mc1.py
python scripts/build_analysis.py
python scripts/build_curated.py
```

解析后的 CSV 文件将输出到 `output/` 目录。

---

## 🎨 可视化系统架构

### 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | React 18 + TypeScript |
| **构建工具** | Vite 6 |
| **样式** | Tailwind CSS 3 |
| **图表引擎** | ECharts 6 + echarts-for-react |
| **网络布局** | d3-force、d3-hierarchy |
| **交互滚动** | react-scrollama（Scrollytelling） |
| **状态管理** | Zustand |
| **CSV 解析** | PapaParse |

### 幻灯片序列（19 步叙事）

```
[0]  封面        → Slide1Cover           案件标题
[1]  案件背景    → Slide0Background       四方关系图 + 时间锚点
[2]  数据概览    → Slide2Overview         845/1175/54 数据卡片

── Q1：新闻来源分析 ──
[3]  来源分类    → SlideSourceClass       柱状图：四类来源分布
[4]  转载网络    → SlideSourceNetwork     力导向图：188 组转载关系
[5]  主题热力    → SlideTopicHeatmap      热力图：主题 × 来源矩阵

[6]  证据地图    → Slide2EvidenceMap      四条分析路径

── Q2：偏见识别 ──
[7]  定罪词云    → SlideMediaBias         词云：POK 的标签化
[8]  控制链      → SlideWhoControls       桑基图：谁在控制叙事
[9]  立场光谱    → SlideStanceSpectrum    发散柱图：29 家媒体立场
[10] 词汇武器    → SlideWordCompare       分组柱图：阵营词频对比
[11] 利益剪刀差  → SlideTimeline          双轴面积图：财富 vs 苦难
[12] 媒体雷达    → SlideMediaRadar        雷达图：三家媒体对比

── Q3：关系网络 ──
[13] 木马暗网    → SlideNetwork           组织金字塔 + 幽灵员工
[14] CEO 异常    → SlideCollapse          CEO 越级通信网络
[15] 邮件热力    → SlideHeatmap           邮件主题时间热力图
[16] 72h 汇流    → SlideCountdown         四股力量时间流向

── Q4：方法论 ──
[17] 方法对比    → SlideMethodCompare     2014 静态 vs 2026 交互

[18] 结案陈词    → SlideConclusion        综合证据链总结
```

---

## 📊 数据资产

### 核心统计

| 指标 | 数值 |
|------|------|
| 新闻文章 | **845 篇** |
| 内部邮件 | **1,175 封** |
| 媒体来源 | **29 个** |
| 员工记录 | **54 人** |
| 时间跨度 | **1993 – 2014**（21 年） |
| 偏见案例 | **10 组**（人工配对） |
| 转载关系 | **188 组** Primary → Derivative |
| 叙事线 | **4 条**（商业 / 环境 / 对抗 / 导火索） |

### 数据表总览

| 文件 | 行数 | 主要字段 |
|------|------|---------|
| `articles_lite.csv` | 845 | source, source_type, title, date, topics, entities, narrative_lines |
| `emails.csv` | 1,175 | from_name, to_names, date, subject, thread_subject, topics |
| `sources.csv` | 29 | source, source_type, article_count, date_range, top_topics |
| `source_relations.csv` | 188 | primary_source, derivative_source, shared_topic |
| `bias_cases.csv` | 10 | primary_article, derivative_article, bias_type, severity |
| `relationships.csv` | — | entity_a, entity_b, relation_type, evidence |
| `network_nodes.csv` | — | node_id, node_type, display_name, attributes |
| `network_edges.csv` | — | source, target, relation_type, weight, confidence |
| `timeline_master.csv` | — | date, event, narrative_line, source_articles |
| `media_stance.csv` | 29 | source, stance_score (0=亲政府, 10=亲POK) |

---

## 🧩 关键发现

### 1. 新闻来源不可等量齐观

- **10 家本地一手**（316 篇）质量最高，包含现场细节
- **12 家国际衍生**（304 篇）常见翻译错误和立场偏移
- 衍生报道中「环境议题」几乎消失——**信息在传播中被过滤**

### 2. 偏见在结构层面，不止措辞

- 建制派媒体（400+ 篇）用绝对声量碾压独立媒体（108 篇）
- 同一"criminal"一词，建制派用 23 次，独立媒体仅 5 次
- 偏见不仅在「说什么」，更在「谁的声音被放大、谁被消音」

### 3. 绑架是多方博弈的结果

- GAStech ↔ 政府：20 年合作绑定，IPO 后政企利益深度交织
- GAStech ↔ POK：环境冲突持续升级，从抗议到对峙
- POK ↔ 政府：被污名化为「criminals/terrorists」
- APA ≠ POK：不同组织，但媒体常混淆以构建威胁叙事

### 4. 内部邮件揭示安保异常

- 2014 年 1 月 13 日后安全相关邮件激增
- CEO 存在越级通信、加密邮件、私人飞机等异常行为
- 19 名「幽灵员工」无简历记录，Vann 兄弟把控安保核心

---

## 📝 汇报指南

详见 [`汇报与PPT制作指南.md`](./汇报与PPT制作指南.md)，核心结构：

```
引子(2min) → Q1数据来源(3min) → Q2偏见分析(3min) → Q3关系网(3min) → Q4方法论(1min) → 结案(1min)
```

- **总时长**：12-15 分钟
- **建议 PPT 页数**：28 页（16:9、深色主题）
- **核心策略**：不直接断言「谁干的」，而是通过数据展示多方共谋的复杂图景



---

## 📐 数据处理方法论与推断依据

本项目从原始非结构化数据到最终可视化结论，经历了**数据解析 → 特征提取 → 多源交叉验证 → 量化编码**四个阶段。每条推断均有明确的数据来源、推理路径和验证方法，确保分析结论**可追溯、可复核、可复现**。

### 1. 媒体立场评分（`media_stance.csv`）

| 维度 | 说明 |
|------|------|
| **量化体系** | 0–10 连续评分，0 = 亲政府/GAStech 口径，10 = 亲 POK/反政府立场，5 = 均衡中立 |
| **三维交叉验证** | ① **来源归属**——`parse_mc1.py` 中的 `SOURCE_TYPE_MAP` 依据媒体注册地、所有权结构和历史报道倾向，将 29 家媒体系统性地归入 primary_local / primary_institutional / derivative_international / aggregator 四类，政府公报型媒体（如 Central Bulletin）因其信息发布职能天然倾向官方口径；② **措辞模式分析**——`bias_cases.csv` 中 10 组人工配对案例，逐篇对照同一事件在不同媒体的词语选择差异（如 "protest" vs "riot"、"died of natural causes" vs "body showed signs of blunt trauma"），提取系统性措辞偏向；③ **选题偏差量化**——`articles_lite.csv` 按 source_type 统计各媒体的 topic/entity 覆盖分布，发现衍生国际媒体对环境议题的报道覆盖率仅为本地一手媒体的 23%，存在显著的选择性过滤 |
| **方法论支撑** | 三个维度相互独立又彼此印证：来源归属提供了先验分类，措辞分析提供了文本证据，选题偏差提供了统计证据。三者指向一致的媒体，评分置信度最高 |

### 2. 「幽灵员工」识别

| 维度 | 说明 |
|------|------|
| **分析方法** | 多源差集比对——将 `EmployeeRecords.xlsx`（54 人）、`resumes/`（35 份简历）、`email headers.csv`（通信网络）、`GAStechKronos-org-chart.pdf`（组织架构）四个数据源逐层交叉 |
| **推理链** | ① 员工记录 ∩ 简历补集 = 19 人——这些人在正式员工名册上但无个人简历档案；② 19 人中 14 人集中在安保、后勤和设施部门（按 `employee_nodes.csv` 中 department 字段分组统计）；③ 这 14 人在绑架前两周的邮件通信频率显著低于同部门有简历员工（均值 2.1 封 vs 8.7 封），且通信对象高度集中在安保主管层级；④ 组织架构图中部分安保岗位有人名标注但无对应简历——与差集结果吻合 |
| **分析价值** | 「有编制无档案 + 通信模式异常 + 集中在安保部门」三重特征叠加，指向一个值得重点关注的调查方向。在可视化中将其标记为「幽灵员工」并区分渲染，引导观众关注这一模式 |

### 3. 组织管理关系提取（`network_edges.csv`）

| 维度 | 说明 |
|------|------|
| **提取策略** | 「图主文辅」双源交叉验证——以 `GAStechKronos-org-chart.pdf` 的显式连线为主干，以 `email headers.csv` 的通信模式为验证层 |
| **置信度分层** | ① **high**：组织架构图显式实线连线 + 邮件通信存在且方向一致（如上级→下级发送含 "report"、"update"、"approval" 关键词的邮件）→ 双源一致，高度可靠；② **medium**：仅组织架构图有连线但邮件通信无直接佐证，或组织架构图为虚线（如跨部门协调、临时汇报关系）→ 单源支撑，在可视化中以不同透明度区分，确保观众可以辨识证据强度的差异 |
| **方法论意义** | 置信度分层不是不确定性的妥协，而是**证据透明度的主动展示**——让读者不仅能看见关系，还能看见每条关系背后的证据厚度。这在情报分析和调查报道中是标准实践 |

### 4. 空间坐标归一化方案

| 维度 | 说明 |
|------|------|
| **工程决策** | 将 `A Map of Kronos.jpg`（手绘风格示意图，无经纬度标注和投影信息）中的关键地点坐标归一化到 [0, 1] 区间，使用 `map_x_norm / map_y_norm` 字段存储 |
| **设计依据** | ① 归一化保留了地物之间的相对方位和距离比例——两个节点在原始地图上的空间关系在被映射后保持不变；② 辅以 FACTBOOK-Kronos.docx 中的文字方位描述（如「Elodis 位于 Abila 以东约 15 公里」）作为语义锚点，核查归一化结果的空间一致性；③ 在可视化系统中，归一化坐标可直接映射到画布坐标系，无需额外投影转换 |
| **实际效果** | 在四方关系图和案件背景图中，地点节点的空间排布忠实反映了原始地图的拓扑关系，为网络图布局提供了有意义的空间参考 |

### 5. 邮件元数据最大化利用

| 维度 | 说明 |
|------|------|
| **设计约束** | VAST Challenge 2014 MC1 数据集中的 `email headers.csv` 仅包含邮件头部字段（From / To / Date / Subject），不含正文。这是挑战组委会的刻意设计——考察在受限信息条件下，能否仅凭通信元数据发现异常模式 |
| **分析方法** | 在无正文语义的条件下，从三个维度最大化元数据的信息密度：① **主题特征提取**——对 Subject 行进行正则匹配（ipo / security / patrol / VIP / encryption），识别关键话题线程；② **通信频次时序**——按日聚合邮件量，按主题聚类绘制时间热力图，定位通讯模式突变点（2014/01/13 后安全相关邮件骤增 340%）；③ **网络拓扑分析**——构建发件-收件有向网络，计算节点的度中心性和介数中心性，识别 CEO Sten Sanjorge Jr. 跨越三个管理层级直连底层人员的异常通信模式 |
| **分析产出** | 邮件热力图、CEO 越级通信网络图、72 小时汇流图——三张图分别对应通信时序、角色关系和多方动态，共同构成绑架前 GAStech 内部异常的完整证据链 |

### 推断依据总览

| 分析维度 | 数据来源 | 验证方法 | 证据强度 |
|----------|---------|---------|---------|
| 来源分类与立场评分 | `sources.csv` + `articles_lite.csv` + `bias_cases.csv` | 来源归属 → 措辞模式 → 选题偏差三维交叉 | ★★★ 多源收敛 |
| 幽灵员工识别 | `EmployeeRecords.xlsx` + `resumes/` + `emails.csv` + `org-chart.pdf` | 四源差集比对 + 通信模式异常检测 | ★★★ 多源收敛 |
| 组织管理关系 | `org-chart.pdf` + `email_network.csv` | 图主文辅双源验证，置信度分层标注 | ★★☆ 双源为主 |
| 空间坐标 | `A Map of Kronos.jpg` + `FACTBOOK-Kronos.docx` | 归一化 + 语义锚点核查 | ★★☆ 单源映射 |
| 邮件通信模式 | `email headers.csv` | 主题正则 + 时序分析 + 网络拓扑三维度 | ★★★ 原始数据直接 |

> **方法论原则**：本项目遵循「每条推断可追溯至原始数据 → 每条推断有独立验证路径 → 每条推断的置信度明确标注」的三步标准。分析的核心价值不在于「给出一个确定答案」，而在于**用系统化的数据方法，将看似分散的线索编织成一张可被检验的证据网络**。

---

## 🔧 重新生成数据

如果你有完整的原始 MC1 数据集（包含 `News Articles/` 文件夹和 `email headers.csv`），可以完整重现所有数据产出：

```bash
# 1. 解析原始数据为结构化 CSV
python scripts/parse_mc1.py --data-dir ./MC1 --output-dir ./output

# 2. 构建分析数据表（关系、时间线等）
python scripts/build_analysis.py

# 3. 构建精选案例集（偏见配对等）
python scripts/build_curated.py
```



---

## 👥 参考资源

- [VAST Challenge 2014](https://www.vacommunity.org/VAST+Challenge+2014) — 原始挑战与数据集
- [ECharts 文档](https://echarts.apache.org/) — 图表库
- [React Scrollama](https://github.com/jsonkao/react-scrollama) — Scrollytelling 库

---

*文档版本: 2.0*
*更新时间: 2026-06-12*
*基于 VAST Challenge 2014 MC1*
