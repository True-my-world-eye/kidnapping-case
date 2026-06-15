#!/usr/bin/env python3
"""Generate human-curated analysis deliverables for MC1 data organization."""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"

ANCHOR_EVENTS = [
    {
        "event_id": "ANCHOR-01",
        "date": "1993-03-12",
        "title": "政府与 GAStech 签署 Tiskele 气田开发协议",
        "narrative_lines": "1",
        "significance": "奠定 GAStech 在 Kronos 的合法经营基础与政府深度绑定",
        "best_source": "Kronos Star",
        "article_id": "666",
        "file_path": "MC1/News Articles/Kronos Star/666.txt",
        "key_quote": "President Araullo announced signing of an agreement... GAStech was awarded exclusive rights to drill... 50% tax levied on new oil and gas exploration could yield in excess of $1 billion",
        "related_entities": "GAStech|Government|Sten Sanjorge|Abila",
    },
    {
        "event_id": "ANCHOR-02",
        "date": "1998-03-19",
        "title": "Elodis 环境污染系列报道启动",
        "narrative_lines": "2",
        "significance": "揭示 GAStech 运营与 Elodis 儿童患病、农作物减产之间的关联",
        "best_source": "Homeland Illumination",
        "article_id": "69",
        "file_path": "MC1/News Articles/Homeland Illumination/69.txt",
        "key_quote": "After a couple of harvests, we saw a decline... when the kids started getting sick... The change turned out to be GAStech International",
        "related_entities": "GAStech|Elodis|Henk Bodrogi|Government",
    },
    {
        "event_id": "ANCHOR-03",
        "date": "2009-02-18",
        "title": "POK 在 GAStech 总部抗议，多人被捕",
        "narrative_lines": "2|3",
        "significance": "环保诉求与 GAStech 正面冲突；政府下令加强未来 POK 集会安保",
        "best_source": "Kronos Star",
        "article_id": "168",
        "file_path": "MC1/News Articles/Kronos Star/168.txt",
        "key_quote": "POK rally... claims of environmental damage... ten protestors chained themselves to the doors... President Kapelou has ordered the police to provide additional protection",
        "related_entities": "POK|GAStech|Government|Elian Karel|Abila",
    },
    {
        "event_id": "ANCHOR-04",
        "date": "2009-06-20",
        "title": "Elian Karel 死亡引发 Abila 骚乱",
        "narrative_lines": "2|3",
        "significance": "POK 领袖之死成为运动象征，抗议升级为暴力冲突",
        "best_source": "The Abila Post",
        "article_id": "185",
        "file_path": "MC1/News Articles/The Abila Post/185.txt",
        "key_quote": "Protesting the death yesterday of Elian Karel... died in jail after being arrested for tax evasion... chanted slogans including Justice for Elian and Remember Juliana",
        "related_entities": "POK|Elian Karel|Government|Abila|Elodis",
    },
    {
        "event_id": "ANCHOR-05",
        "date": "2012-06-22",
        "title": "Kapelou 总统称 POK 为「罪犯集团」",
        "narrative_lines": "3",
        "significance": "政府公开定性 POK，预示后续强硬执法",
        "best_source": "Kronos Star",
        "article_id": "541",
        "file_path": "MC1/News Articles/Kronos Star/541.txt",
        "key_quote": "President Kapelou called the POK a gang of criminals, thugs, and malcontents... future POK demonstrations will be met with maximum police force",
        "related_entities": "POK|Government|President Kapelou|Abila",
    },
    {
        "event_id": "ANCHOR-06",
        "date": "2013-12-18",
        "title": "GAStech IPO，Sanjorge 成为巨富",
        "narrative_lines": "1|4",
        "significance": "商业利益集中爆发，为后续矛盾激化提供背景",
        "best_source": "The General Post",
        "article_id": "223",
        "file_path": "MC1/News Articles/The General Post/223.txt",
        "key_quote": "ENORMOUS IPO MAKES MULTIMILLIONAIRE OF SANJORGE... initial public offer",
        "related_entities": "GAStech|Sten Sanjorge|Tethys|Centrum",
    },
    {
        "event_id": "ANCHOR-07",
        "date": "2014-01-19",
        "title": "GAStech 与 Kronos 庆祝合作 20 周年",
        "narrative_lines": "1|4",
        "significance": "IPO 后政府接待安排，绑架事件直接导火索",
        "best_source": "Kronos Star",
        "article_id": "174",
        "file_path": "MC1/News Articles/Kronos Star/174.txt",
        "key_quote": "Reception hosted by President Kapelou... celebrate the 20th year of cooperation between the corporation and our country",
        "related_entities": "GAStech|Government|Sten Sanjorge|President Kapelou|Abila",
    },
    {
        "event_id": "ANCHOR-08",
        "date": "2014-01-20",
        "title": "GAStech 高管失踪/绑架，POK 被指认",
        "narrative_lines": "3|4",
        "significance": "全案高潮：14 名员工被绑，POK 发赎金要求，APA 亦被提及",
        "best_source": "The Abila Post",
        "article_id": "713",
        "file_path": "MC1/News Articles/The Abila Post/713.txt",
        "key_quote": "Members of the GAStech leadership are in fact missing... expected to arrive at the Government reception... IPO netted Sten Sanjorge Jr. $1.96 billion",
        "related_entities": "GAStech|POK|APA|Government|Sten Sanjorge|Abila",
    },
]

BIAS_CASES = [
    {
        "case_id": "CURATED-01",
        "topic": "POK 抗议 GAStech（2009-02）",
        "date": "2009-02-18",
        "primary_source": "Kronos Star",
        "primary_article_id": "168",
        "primary_file": "MC1/News Articles/Kronos Star/168.txt",
        "derivative_source": "Worldwise",
        "derivative_article_id": "808",
        "derivative_file": "MC1/News Articles/Worldwise/808.txt",
        "bias_analysis": "Primary 使用 lawful rally、trespassing 等中性法律措辞；Derivative 出现 enfreindre、protestateurs 等翻译错误，且更强调 GAStech 员工可能受伤，弱化 POK 环保诉求。",
    },
    {
        "case_id": "CURATED-02",
        "topic": "Elian Karel 之死与骚乱（2009-06）",
        "date": "2009-06-20",
        "primary_source": "The Abila Post",
        "primary_article_id": "185",
        "primary_file": "MC1/News Articles/The Abila Post/185.txt",
        "derivative_source": "The Guide",
        "derivative_article_id": "162",
        "derivative_file": "MC1/News Articles/The Guide/162.txt",
        "bias_analysis": "Primary 明确 Karel 死于狱中、提及 Juliana 污染受害者；Derivative 将抗议者描述为对 innocent citizens 施暴，倾向政府视角。",
    },
    {
        "case_id": "CURATED-03",
        "topic": "Kapelou 称 POK 为罪犯（2012-06）",
        "date": "2012-06-22",
        "primary_source": "Kronos Star",
        "primary_article_id": "541",
        "primary_file": "MC1/News Articles/Kronos Star/541.txt",
        "derivative_source": "Worldwise",
        "derivative_article_id": "792",
        "derivative_file": "MC1/News Articles/Worldwise/792.txt",
        "bias_analysis": "同一总统言论：Primary 完整引用 criminals/gangsters；Derivative 语法混乱但同样强化 criminal 框架，无 POK 立场平衡。",
    },
    {
        "case_id": "CURATED-04",
        "topic": "GAStech IPO（2013-12）",
        "date": "2013-12-18",
        "primary_source": "The General Post",
        "primary_article_id": "223",
        "primary_file": "MC1/News Articles/The General Post/223.txt",
        "derivative_source": "The Light of Truth",
        "derivative_article_id": "1",
        "derivative_file": "MC1/News Articles/The Light of Truth/1.txt",
        "bias_analysis": "Primary 称 multimillionaire；Derivative 升级为 billionaire，夸大财富叙事，可能强化「贪婪」公众印象。",
    },
    {
        "case_id": "CURATED-05",
        "topic": "高管失踪确认（2014-01-20）",
        "date": "2014-01-20",
        "primary_source": "The Abila Post",
        "primary_article_id": "713",
        "primary_file": "MC1/News Articles/The Abila Post/713.txt",
        "derivative_source": "International Times",
        "derivative_article_id": "167",
        "derivative_file": "MC1/News Articles/International Times/167.txt",
        "bias_analysis": "Primary 引用公司行政人员否认绑架、披露 IPO 财富细节；Derivative 直接用 Kidnapped、radical environmental terrorist group，并点名 POK 赎金。",
    },
    {
        "case_id": "CURATED-06",
        "topic": "绑架事件总结（2014-01-20）",
        "date": "2014-01-20",
        "primary_source": "News Online Today",
        "primary_article_id": "7",
        "primary_file": "MC1/News Articles/News Online Today/7.txt",
        "derivative_source": "International News",
        "derivative_article_id": "29",
        "derivative_file": "MC1/News Articles/International News/29.txt",
        "bias_analysis": "Aggregator 称政府源确认 kidnapped、保安指 POK 涉案；International News 标题直接 POK Kidnaps，未保留信息不确定性。",
    },
    {
        "case_id": "CURATED-07",
        "topic": "POK 纪念 Karel（2012-06）",
        "date": "2012-06-20",
        "primary_source": "Homeland Illumination",
        "primary_article_id": "18",
        "primary_file": "MC1/News Articles/Homeland Illumination/18.txt",
        "derivative_source": "The Orb",
        "derivative_article_id": "662",
        "derivative_file": "MC1/News Articles/The Orb/662.txt",
        "bias_analysis": "Primary 用 touching ceremony、martyred leader、environmental catastrophe；Derivative 翻译腔严重，弱化纪念仪式的正当性。",
    },
    {
        "case_id": "CURATED-08",
        "topic": "GAStech 企业形象（2013）",
        "date": "2013-02-24",
        "primary_source": "The General Post",
        "primary_article_id": "223",
        "primary_file": "MC1/News Articles/The General Post/223.txt",
        "derivative_source": "World Journal",
        "derivative_article_id": "648",
        "derivative_file": "MC1/News Articles/World Journal/648.txt",
        "bias_analysis": "Primary（IPO 语境）强调 Sanjorge 成功与 multimillionaire；Derivative 强调 corrupted、eco-hostile past，对 GAStech 历史更负面且语法混乱。",
    },
    {
        "case_id": "CURATED-09",
        "topic": "Elodis 污染调查（1998-03）",
        "date": "1998-03-19",
        "primary_source": "Homeland Illumination",
        "primary_article_id": "69",
        "primary_file": "MC1/News Articles/Homeland Illumination/69.txt",
        "derivative_source": "News Online Today",
        "derivative_article_id": "4",
        "derivative_file": "MC1/News Articles/News Online Today/4.txt",
        "bias_analysis": "Primary 为深度调查系列，引用 Henk Bodrogi 与 Reese 编辑；Aggregator 转载但可能删减政府 malfeasance 论述。",
    },
    {
        "case_id": "CURATED-10",
        "topic": "Tiskele 设施抗议（2005-04）",
        "date": "2005-04-05",
        "primary_source": "Homeland Illumination",
        "primary_article_id": "221",
        "primary_file": "MC1/News Articles/Homeland Illumination/221.txt",
        "derivative_source": "The Wrap",
        "derivative_article_id": "17",
        "derivative_file": "MC1/News Articles/The Wrap/17.txt",
        "bias_analysis": "Primary 描述抗议者 orderly、singing；Derivative 出现 came close weapons 等不准确表述，丑化 POK。",
    },
]

Q3_MATRIX = """# Q3 四方关系矩阵（数据整理组定稿）

> 供可视化组与写作组使用。每条关系均可在 `relationships.csv` 或 `anchor_events.csv` 中找到对应证据路径。

## 组织关系总览

|  | GAStech | POK | APA | Government |
|--|---------|-----|-----|------------|
| **GAStech** | — | **对立**：设施抗议、环境指控 | **间接威胁**：绑架风险被一并提及 | **合作**：气田协议、税收、IPO 后接待 |
| **POK** | 环保抗议、封锁总部 | — | 同被提及但目标不同 | **对立**：逮捕、criminals 定性 |
| **APA** | 恐怖/犯罪关联 | 非同一组织 | — | 政府执法对象（隐含） |
| **Government** | 许可、接待、安保 | 镇压、逮捕 | 国际联合执法 | — |

---

## 1. GAStech ↔ Government

**关系类型**：正式合作 + 共同经济利益

**证据摘要**：
- 1993：总统 Araullo 与 GAStech 签 Tiskele 气田 exclusive 开发权，要求 50% 本地雇员，预计年税收超 10 亿美元（`Kronos Star/666.txt`）
- 2014-01-19：Kapelou 总统在 Capitol 设接待，庆祝合作 20 周年（`Kronos Star/174.txt`）
- 邮件：2014-01-06 多起 `VIP visit`、`Facilities preparations for VIP visit`（`email headers.csv` #32, #36, #74）

**共同目标**：吸引外资、天然气开发、基础设施投资、IPO 后巩固政企关系

---

## 2. GAStech ↔ POK

**关系类型**：对立（环境—商业冲突）

**证据摘要**：
- 2009-02：约 200 人在 GAStech Abila 总部抗议，10 人锁门，多人被捕（`Kronos Star/168.txt`）
- 2005-04：15 名 POK 成员在 Tiskele Bend 设施门口被捕（`Homeland Illumination/221.txt`）
- POK 诉求：environmental damage、 contamination 导致死亡

**冲突轴心**：POK 要问责污染；GAStech 要正常运营；政府偏 GAStech 一侧

---

## 3. POK ↔ Government

**关系类型**：对立（抗议—执法）

**证据摘要**：
- 2009：Karel 因 tax evasion 被捕后死于狱中，引发骚乱（`The Abila Post/185.txt`）
- 2012：Kapelou 称 POK 为 criminals/gangsters，未来示威将 maximum police force（`Kronos Star/623.txt`）
- 警方发言人 Carman Adrien 多次强调「维持秩序、响应 GAStech 投诉」

**政府 framing**：POK = 罪犯/暴徒；POK framing：政府腐败、包庇 GAStech

---

## 4. APA ↔ GAStech / POK

**关系类型**：APA 与 GAStech 敌对；与 POK 非同盟

**证据摘要**：
- `International Times/167.txt`：John Rathburn 指 Kronos 绑架风险因「POK, APA and others」上升
- APA：paramilitary、drug trafficking、terrorist activities（`World Source/775.txt` 等）
- 2014-01-20 绑架主嫌为 POK（赎金信），APA 作为区域风险因素被并列提及，非直接认领

---

## 5. 关键个人关系（非正式）

| 人物 | 组织 | 关系 |
|------|------|------|
| Sten Sanjorge Jr. | GAStech CEO | 与 Kapelou 有官方接待；IPO 最大受益者 |
| Elian Karel | POK 领袖 | 2009 死后成为运动象征 |
| Henk Bodrogi | POK 创始人 | Elodis 农民，环境系列报道核心证人 |
| Ingrid Barranco / Orhan Strum / Willem Vasco-Pais | GAStech 高管 | 失踪者；邮件中与 IPO/VIP 安保相关 |
| Orhan Strum ↔ Willem Vasco-Pais | GAStech | 邮件链 `RE: IPO` 多次往返（#26–#59） |

---

## 6. 邮件证据（Q3 非公开关系）

| 日期 | 主题 | 含义 |
|------|------|------|
| 2014-01-06 | IPO | 总部（Tethys）与 Kronos 高管讨论 IPO |
| 2014-01-09 | Security procedures for January 20 VIP visit | 绑架前安保已升级 |
| 2014-01-06 | Patrol schedule changes | 日常安保与巡逻调整 |

详见 `emails.csv`（filter `topics` 含 ipo/security）及 `email_network.csv`。

---

## 可视化建议（供组员参考）

- **组织层**：四角关系矩阵 + 边的 evidence 数量
- **个人层**：GAStech 高管邮件网络（`email_network.csv` top edges）
- **时间层**：`anchor_events.csv` 8 节点 + `narrative_line_4_绑架导火索线.csv`
"""

Q2_REPORT = """# Q2 偏见案例解读

> 完整配对见 `bias_cases.csv`。以下 6 组最适合写入 Answer Sheet。

## 案例 1：POK 抗议报道（CURATED-01）

| | Primary (Kronos Star) | Derivative (Worldwise) |
|--|----------------------|------------------------|
| 标题 | POK Protest at GAStech Headquarters Ends in Arrests | The protest of POK at GAStech sits of the ends in the arrests |
| 倾向 | 相对中性，引用警方与政府发言人 | 翻译错误多，强调 GAStech 员工安全 |

**差异**：Derivative 通过 poor English 降低 POK 可信度，同时Implicitly 支持 police action。

---

## 案例 2：Elian Karel 之死（CURATED-02）

- **Primary** 给出具体死因语境（tax evasion 被捕后狱中死亡）及 Juliana 污染受害者口号
- **Derivative** 强调 protestors 伤害 innocent citizens，将骚乱责任归于 POK 支持者

**偏见类型**：对 POK 的行为因果归因偏差

---

## 案例 3：绑架事件（CURATED-05）

- **Primary (Abila Post)**：公司发言人 **denied** abducted；提供 IPO 财富数据
- **Derivative (Intl Times)**：标题直接用 **Kidnapped**、**terrorist group**、POK 赎金 $20M

**偏见类型**：确定性差异（confirmed vs suspected）+ 标签化（terrorist）

---

## 案例 4：IPO 财富（CURATED-04）

- multimillionaire vs **billionaire** 的表述升级
- 影响：塑造 GAStech 高管「贪婪」公众形象，服务绑架叙事

---

## 案例 5：Kapelou 定性与翻译（CURATED-03）

- 两源均传播 criminal/gangster 框架
- Worldwise 的语法错误本身成为 Q1「derivative 源质量」的证据

---

## 案例 6：环境调查系列（CURATED-09）

- Homeland Illumination 深度调查 vs News Online Today 转载
- 可讨论：Aggregator 是否保留「government malfeasance」等敏感措辞

---

## 统计辅助（可视化组）

用 `articles_lite.csv` 按 `source_type` 分组，统计：
- 含 `POK` 且含 criminal/riot 词频
- 含 `GAStech` 且含 cooperation/tax 词频
- 含 `kidnapping` topic 的文章数 by source
"""


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()
    out = args.output_dir

    write_csv(
        out / "anchor_events.csv",
        ANCHOR_EVENTS,
        [
            "event_id", "date", "title", "narrative_lines", "significance",
            "best_source", "article_id", "file_path", "key_quote", "related_entities",
        ],
    )
    write_csv(
        out / "bias_cases.csv",
        BIAS_CASES,
        [
            "case_id", "topic", "date", "primary_source", "primary_article_id", "primary_file",
            "derivative_source", "derivative_article_id", "derivative_file", "bias_analysis",
        ],
    )
    (out / "Q3_四方关系矩阵.md").write_text(Q3_MATRIX, encoding="utf-8")
    (out / "Q2_偏见案例解读.md").write_text(Q2_REPORT, encoding="utf-8")

    print(f"Written curated deliverables to {out.resolve()}")
    print(f"  anchor_events.csv: {len(ANCHOR_EVENTS)} events")
    print(f"  bias_cases.csv: {len(BIAS_CASES)} cases")
    print("  Q3_四方关系矩阵.md")
    print("  Q2_偏见案例解读.md")


if __name__ == "__main__":
    main()
