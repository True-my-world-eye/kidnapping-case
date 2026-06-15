# VAST Challenge 2014 MC1 数据整理文档

## 一、项目背景概述

### 1.1 场景设定
- **时间点**: 2014年1月21日（绑架事件发生后）
- **地点**: 克罗诺斯岛国（Kronos），首都阿比拉（Abila）
- **核心事件**: GAStech公司员工在IPO庆祝活动后失踪，疑似被POK组织绑架

### 1.2 关键实体
| 实体 | 描述 | 角色 |
|------|------|------|
| GAStech | 跨国天然气公司，总部位于特提斯（Tethys） | 核心公司 |
| POK (Protectors of Kronos) | 克罗诺斯守护者环保激进组织 | 嫌疑绑架者 |
| Kronos政府 | 克罗诺斯岛国政府 | 监管方 |
| APA (Asterian People's Army) | 阿斯特里亚人民军，准军事组织 | 区域威胁 |
| Abila Police (APA) | 阿比拉警察局 | 执法机构 |

---

## 二、数据来源完整清单

### 2.1 新闻媒体来源（共27个）

| 编号 | 媒体名称 | 类型倾向 | 文章数量 |
|------|----------|----------|----------|
| 1 | All News Today | 本地综合 | 18篇 |
| 2 | Worldwise | 国际综合 | 32篇 |
| 3 | World Source | 国际综合 | 8篇 |
| 4 | World Journal | 国际综合 | 14篇 |
| 5 | Who What News | 人物专题 | 13篇 |
| 6 | The Wrap | 事件报道 | 23篇 |
| 7 | The World | 国际大事件 | 22篇 |
| 8 | The Tulip | 待分析 | 4篇 |
| 9 | The Truth | 待分析 | 15篇 |
| 10 | The Orb | 待分析 | 16篇 |
| 11 | The Light of Truth | 待分析 | 6篇 |
| 12 | The Guide | 待分析 | 15篇 |
| 13 | The General Post | 待分析 | 4篇 |
| 14 | The Explainer | 待分析 | 12篇 |
| 15 | The Continent | 待分析 | 4篇 |
| 16 | The Abila Post | 本地新闻 | 20篇 |
| 17 | Tethys News | 国际（特提斯） | 7篇 |
| 18 | News Online Today | 在线综合 | 42篇 |
| 19 | News Desk | 新闻编辑室 | 15篇 |
| 20 | Modern Rubicon | 待分析 | 6篇 |
| 21 | Kronos Star | 本地大报 | 21篇 |
| 22 | International Times | 国际综合 | 4篇 |
| 23 | International News | 国际新闻 | 12篇 |
| 24 | Homeland Illumination | 本土媒体 | 15篇 |
| 25 | Everyday News | 日常新闻 | 5篇 |
| 26 | Daily Pegasus | 待分析 | 13篇 |
| 27 | Centrum Sentinel | 待分析 | 3篇 |
| 28 | Central Bulletin | 政府公告型 | 14篇 |
| 29 | Athena Speaks | 待分析 | 13篇 |

**总计**: 约845篇新闻文章

### 2.2 邮件数据
- **文件**: `email headers.csv`
- **内容**: 2014年1月6日-20日两周内部邮件标题
- **员工数量**: 约50+名GAStech员工
- **关键主题**: IPO、生日、巡逻安排、技术问题、VIP访问

### 2.3 员工简历
- **位置**: `resumes/` 文件夹
- **文件格式**: `.docx`
- **已确认简历**: 35份（部分高管为Bio-xxx.docx格式）
  - 高管简历: Sten Sanjorge Jr., Orhan Strum, Willem Vasco-Pais, Ingrid Barranco, Ada Campo-Corrente
  - 员工简历: 30份个人简历

### 2.4 其他文档
- `EmployeeRecords.xlsx` - 员工数据库
- `GAStechKronos-org-chart.pdf` - 公司组织架构图
- `FACTBOOK-Kronos.docx` - 克罗诺斯国家简介
- `FACTBOOK-Tethys.docx` - 特提斯国家简介
- `A Map of Kronos.jpg` - 克罗诺斯地图
- `HistoricalDocuments/10 year historical document clean.docx` - 10年历史文档
- `HistoricalDocuments/5 year report clean.docx` - 5年报告

---

## 三、事件时间线（关键节点）

### 3.0 APA组织背景
| 日期 | 事件 | 来源佐证 |
|------|------|----------|
| 2013/10 | Interpol成立多国任务组打击APA相关毒品 | World Source #775 |
| 2014/01 | 绑架专家称APA活动增加该地区绑架风险 | World Source #787 |

### 3.1 早期背景（1993-2001）
| 年份 | 事件 | 来源佐证 |
|------|------|----------|
| 1993 | Kronos政府出台税收优惠政策吸引外国投资 | All News Today #135 |
| 1994 | GAStech在Elodis建立天然气设施 | The Wrap #814 |
| 1997 | POK组织成立 | All News Today #420 |
| 1998 | Juliana Vann（10岁）死于苯中毒（饮用水污染） | Multiple sources |
| 1998 | Wellness for All发布Elodis公共健康报告 | All News Today #617 |
| 1999 | 卫生部长提议对外国能源开发增税（提案失败） | All News Today #612 |
| 2001 | 税收提案被否决 | All News Today #391 |

### 3.2 POK活动期（2005-2012）
| 年份 | 事件 | 来源佐证 |
|------|------|----------|
| 2005 | 15名POK成员在Tiskele Bend设施被捕 | All News Today #121 |
| 2007 | GAStech卡车撞死一家四口 | All News Today #603 |
| 2009/03 | Elian Karel（POK领袖）因逃税被捕 | Kronos Star #820 |
| 2009/06 | Elian Karel在狱中死亡（官方称心脏骤停） | Multiple sources |
| 2011 | Elian Karel逝世2周年纪念活动 | All News Today #77 |
| 2012/04 | Silvia Marek成为POK新领袖 | All News Today #135 |
| 2012/06 | POK周年抗议演变成骚乱 | News Online Today #785 |
| 2012/09 | 数千人游行抗议政府透明度缺失 | All News Today #714 |

### 3.3 GAStech IPO与绑架（2013-2014）
| 日期 | 事件 | 来源佐证 |
|------|------|----------|
| 2013/09 | Sten Sanjorge Jr.宣布GAStech IPO | The World #809 |
| 2013/12 | IPO完成，Sten身价达$19.6亿 | The Explainer #679 |
| 2014/01/06-17 | 邮件数据显示正常公司运营 | email headers.csv |
| 2014/01/19 | "庆祝不受约束的盗贼统治"文章 | All News Today #714 |
| 2014/01/20 | 绑架事件发生 | Multiple sources |
| 2014/01/21 | POK宣布对绑架负责，要求$2000万赎金 | The World #824 |

---

## 四、人物关系图谱

### 4.1 GAStech核心高管

```
                    Sten Sanjorge Jr. (CEO)
                           |
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
      Orhan Strum     Willem        (Board/Investors)
       (COO)      Vasco-Pais
         |        (环保安全顾问)
         ↓
   Ingrid Barranco (CFO)
         |
         ↓
   Ada Campo-Corrente (财务)
```

### 4.2 POK组织核心人物

```
创始期 (1997)          2009年后
    │                    │
    ↓                    ↓
Henk Bodrogi ──────→ Silvia Marek (现任领袖)
(POK创始人)                  │
    │                       │
    ↓                       ↓
Elian Karel (已故)      (抗议活动)
POK前领袖                    │
2009狱中死亡                 ↓
                           POK成员
```

### 4.3 关键关系网络

| 关系类型 | 人物A | 人物B | 证据 |
|----------|-------|-------|------|
| 商业 | Sten Sanjorge Jr. | Orhan Strum | 邮件讨论IPO |
| 商业 | Sten Sanjorge Jr. | Ingrid Barranco | IPO奖金$96.25M |
| 商业 | Orhan Strum | Willem Vasco-Pais | IPO奖金$38.5M |
| 对立 | GAStech | POK | 多次抗议、绑架 |
| 对立 | Sten Sanjorge Jr. | Elian Karel | 谴责POK为恐怖组织 |
| 个人 | Elian Karel | Juliana Vann | 邻居、同样受污染影响 |
| 个人 | Henk Bodrogi | Elian Karel | POK传承关系 |
| 政治 | GAStech | Kronos政府 | IPO庆祝活动、政府官员出席 |

---

## 五、APA组织信息（补充）

**APA (Asterian People's Army / 阿斯特里亚人民军)**

| 项目 | 内容 |
|------|------|
| 类型 | 准军事组织 |
| 活动 | 恐怖主义活动，通过毒品贸易筹集资金 |
| 标志 | 运营网站，出版专业杂志《Arise》 |
| 关联 | MDMC毒品（"棉花糖"、"香料梦"、"郁金香之花"） |
| 专家评价 | 绑架专家John Rathburn称APA活动增加该地区绑架风险 |

**来源证据**:
- World Source #775 (2013/10/22): "The Asterian People's Army (APA) is a paramilitary organization which has been engaged in terrorist activities funded through its criminal enterprises, which include drug trafficking."
- World Source #787 (2014/01/21): "However, increased activity by POK, APA [Asterian People's Army], and others in the region have significantly increased the risk."

---

## 六、新闻来源偏见分析素材

### 6.1 亲政府/亲GAStech倾向
- **Central Bulletin**: 使用"恐怖主义"等词汇描述POK
- **The Guide**: 强调GAStech为Kronos带来就业
- **Tethys News**: 关注GAStech国际形象

### 6.2 亲POK/反政府倾向
- **The Light of Truth**: 详细报道POK立场
- **All News Today**: 大量报道Elian Karel之死
- **The Truth**: 关注政府腐败和环境问题

### 6.3 中立/事件导向
- **The World**: 客观报道绑架事件
- **The Explainer**: 分析IPO财务细节
- **News Online Today**: 事件追踪

### 6.4 关键偏见案例

**案例1: Elian Karel之死**
- 亲政府: "自然原因死亡"（Central Bulletin）
- 反政府: "身体有钝器创伤痕迹"（All News Today）

**案例2: 抗议活动**
- 亲政府: "暴徒袭击警察"（Central Bulletin）
- 反政府: "和平示威被武力镇压"（The Light of Truth）

---

## 七、可视化建议

### 7.1 推荐图表类型

| 可视化目标 | 推荐图表 | 数据来源 |
|------------|----------|----------|
| 时间线展示 | 水平时间轴 + 事件节点 | 事件时间线 |
| 人物关系 | 力导向图/网络图 | 人物关系图谱 |
| 组织关系 | 桑基图/和弦图 | 组织间关系 |
| 邮件通信 | 社交网络图 | email headers.csv |
| 新闻来源分布 | 旭日图/树图 | 新闻来源清单 |
| 偏见对比 | 双轴对比图 | 偏见分析素材 |

### 7.2 叙事结构建议

```
第1章: 繁荣的假象 (1993-2009)
  - GAStech进入Kronos
  - 环境问题出现
  - POK成立与抗议

第2章: 冲突升级 (2009-2012)
  - Elian Karel之死
  - 抗议演变为暴力
  - 政府与企业的联盟

第3章: IPO与危机 (2013-2014)
  - GAStech上市
  - 财富分配不均
  - 绑架事件

第4章: 真相探寻 (分析结论)
  - 多方关系梳理
  - 事件因果分析
```

### 7.3 关键问题可视化映射

| VAST问题 | 可视化方案 |
|----------|------------|
| 数据来源描述 | 新闻来源分布图 + 来源关系图 |
| 新闻偏见分析 | 对比表格 + 引用高亮 |
| 关系识别 | 人物-组织网络图 + 关系类型图例 |

---

## 八、数据缺口与补充建议

### 8.1 需要确认的信息
1. ✅ APA组织已确认：Asterian People's Army（阿斯特里亚人民军）
2. 更多员工简历的完整内容
3. 历史文档的详细内容
4. 地图上的具体地点标注

### 8.2 可进一步分析的方向
1. 邮件通信频率和模式
2. 特定时间段内新闻报道数量变化
3. 员工姓氏词源分析（可能暗示关系）

---

*文档版本: 1.0*
*生成时间: 2024*
*数据来源: VAST Challenge 2014 MC1*
