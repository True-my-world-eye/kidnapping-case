# MC1 补全可视化数据表说明

## 统一数字口径

- 新闻文章：845 篇（来自 `articles_lite.csv`）
- 邮件记录：1175 封（来自原始 `email headers.csv`）
- 媒体来源：29 个（来自 `sources.csv`）
- 员工记录：54 人（来自 `EmployeeRecords.xlsx`）

> 注意：如果口头材料写“约880篇新闻/1176封邮件”，正式提交建议统一改为上面的结构化口径。

## 已补全文件

| 文件 | 用途 | 主要来源 |
|---|---|---|
| `employee_nodes.csv` | 人物/员工属性表，可用于人物节点、部门筛选、邮件网络着色 | `EmployeeRecords.xlsx`、`email headers.csv`、`GAStechKronos-org-chart.pdf` |
| `network_nodes.csv` | 统一网络节点表，包含人物、组织、部门、媒体、地点、事件 | 员工表、实体表、来源表、地图、Factbook、关键事件 |
| `network_edges.csv` | 统一网络边表，包含组织关系、邮件通信、汇报关系、媒体转载、事件参与 | `relationships.csv`、`email_network.csv`、`source_relations.csv`、`anchor_events.csv` |
| `media_stance.csv` | 媒体立场评分表，0=亲政府/GAStech，10=亲POK/反政府 | `sources.csv`、`bias_cases.csv`、已有整理文档 |
| `bias_case_coded.csv` | 偏见案例量化表，含偏见类型、方向、严重程度 | `bias_cases.csv`、`articles_lite.csv` |
| `timeline_master.csv` | 统一时间线主表，合并8个关键事件与四条叙事线 | `anchor_events.csv`、`narrative_line_*.csv`、Factbook |

## APA 拆分说明

本次已明确拆分两个不同实体：

| 节点ID | 显示名 | 含义 |
|---|---|---|
| `Asterian_Peoples_Army` | APA / Asterian People's Army | 阿斯特里亚人民军，区域准军事/安全风险因素 |
| `Abila_Police` | Abila Police | 阿比拉警方，执法调查主体 |

不要在可视化中把二者合并为同一个 `APA` 节点。

## 重要局限

1. `media_stance.csv` 是初版评分，适合可视化草图，但正式提交前建议人工复核。
2. `employee_nodes.csv` 中“14名失踪员工”的完整名单在当前结构化数据中不能完全确认；本表只稳妥标注 `reported_leadership_group`。
3. `network_edges.csv` 中部分管理关系是根据组织架构图半结构化提取的，已在 `confidence` 中标为 medium。
4. 地点坐标为基于上传地图的相对坐标 `map_x_norm/map_y_norm`，适合示意图，不是地理经纬度。

## 推荐用法

- Gephi / Cytoscape：导入 `network_nodes.csv` 和 `network_edges.csv`
- Tableau / Power BI：导入 `timeline_master.csv`、`media_stance.csv`、`bias_case_coded.csv`
- Python / D3：用 `network_edges.csv` 的 `relation_type` 控制边颜色，用 `weight` 控制边粗细
