# MC1 数据整理产出

## 文件清单（共 18 个）

| 文件 | 用途 | 题目 |
|------|------|------|
| `articles_lite.csv` | 845 篇新闻结构化数据 | 全部 |
| `sources.csv` | 29 个媒体汇总 | Q1 |
| `source_relations.csv` | Primary→Derivative 同题关系 | Q1 |
| `Q1_媒体来源分析.md` | Q1 结论草稿 | Q1 |
| `bias_cases.csv` | 偏见对比案例（10 组，人工配对） | Q2 |
| `Q2_偏见案例解读.md` | Q2 文字解读 | Q2 |
| `relationships.csv` | 四方关系证据 | Q3 |
| `emails.csv` | 1175 封邮件头 | Q3 |
| `email_network.csv` | 邮件通信网络 | Q3 |
| `Q3_四方关系矩阵.md` | Q3 关系定稿 | Q3 |
| `entities.csv` | 实体词典 | Q2/Q3 |
| `anchor_events.csv` | 8 个关键时间节点 | 汇报 |
| `故事总述.md` | 四幕故事框架 | 汇报 |
| `narrative_line_1~4_*.csv` | 四条叙事线分表（4 个文件） | 汇报 |

## 叙事线编码

- `1` = 商业利益线 | `2` = 环境冲突线 | `3` = 组织对抗线 | `4` = 绑架导火索线

## 可视化映射

- **Q1**：`sources.csv` + `source_relations.csv`
- **Q2**：`bias_cases.csv` + `articles_lite.csv`（按 source_type 统计）
- **Q3**：`relationships.csv` + `email_network.csv` + `Q3_四方关系矩阵.md`
- **汇报**：`故事总述.md` + `anchor_events.csv` + `narrative_line_*.csv`

## 重新生成

```bash
python scripts/parse_mc1.py
python scripts/build_analysis.py
python scripts/build_curated.py
```
