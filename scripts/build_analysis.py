#!/usr/bin/env python3
"""Build analysis tables from parsed MC1 CSVs (events, entities, relationships, etc.)."""

from __future__ import annotations

import argparse
import csv
import re
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent.parent / "output"

ORG_ENTITIES = {"GAStech", "POK", "APA", "Government"}
LOCATION_ENTITIES = {"Elodis", "Abila", "Tethys", "Centrum"}
PERSON_ENTITIES = {
    "Elian Karel",
    "Sten Sanjorge",
    "President Kapelou",
    "Henk Bodrogi",
    "Ingrid Barranco",
    "Orhan Strum",
    "Ada Campo-Corrente",
    "Willem Vasco-Pais",
    "Edvard Vann",
    "Silvia Marek",
    "Carman Adrien",
    "Rufus Drymiau",
    "Haneson Ngohebo",
}

PERSON_AFFILIATION = {
    "Elian Karel": "POK",
    "Sten Sanjorge": "GAStech",
    "President Kapelou": "Government",
    "Henk Bodrogi": "POK",
    "Ingrid Barranco": "GAStech",
    "Orhan Strum": "GAStech",
    "Ada Campo-Corrente": "GAStech",
    "Willem Vasco-Pais": "GAStech",
    "Edvard Vann": "GAStech",
    "Silvia Marek": "POK",
    "Carman Adrien": "Government",
    "Rufus Drymiau": "Government",
    "Haneson Ngohebo": "The Abila Post",
}

# Curated cross-source relationship hypotheses with search hints for evidence
RELATIONSHIP_SEEDS: list[dict] = [
    {
        "entity_a": "GAStech",
        "entity_b": "Government",
        "relation": "official_cooperation",
        "description": "长期商业合作与政府支持",
        "search": r"cooperation|partnership|reception|President Kapelou.*GAStech|GAStech.*government",
    },
    {
        "entity_a": "GAStech",
        "entity_b": "POK",
        "relation": "opposition",
        "description": "环保抗议与设施冲突",
        "search": r"protest.*GAStech|GAStech.*POK|Protectors of Kronos.*GAStech",
    },
    {
        "entity_a": "POK",
        "entity_b": "Government",
        "relation": "opposition",
        "description": "抗议者被逮捕、被定性为罪犯",
        "search": r"POK.*police|criminals.*POK|Kapelou.*POK|arrest.*POK",
    },
    {
        "entity_a": "APA",
        "entity_b": "GAStech",
        "relation": "hostility",
        "description": "绑架风险与恐怖活动关联",
        "search": r"APA.*GAStech|kidnap.*APA|Asterian.*Army",
    },
    {
        "entity_a": "POK",
        "entity_b": "APA",
        "relation": "indirect_association",
        "description": "同为激进组织但目标与手段不同",
        "search": r"POK.*APA|APA.*POK|Protectors.*Asterian",
    },
    {
        "entity_a": "Sten Sanjorge",
        "entity_b": "President Kapelou",
        "relation": "official_meeting",
        "description": "IPO 后政府接待与高层互动",
        "search": r"Sanjorge.*Kapelou|reception.*Sanjorge|Government reception",
    },
    {
        "entity_a": "Elian Karel",
        "entity_b": "POK",
        "relation": "leadership",
        "description": "POK 领袖与运动象征",
        "search": r"Elian Karel.*POK|leader.*Protectors of Kronos|Karel.*activist",
    },
    {
        "entity_a": "Henk Bodrogi",
        "entity_b": "POK",
        "relation": "founder",
        "description": "POK 创始人之一",
        "search": r"Henk Bodrogi|founder of the POK",
    },
]

ANCHOR_EVENTS: list[dict] = [
    {"name": "POK 抗议 GAStech 设施遭逮捕", "date": "2009-02-20", "lines": "2|3", "search": r"protest.*GAStech.*arrest|POK.*GAStech.*Abila"},
    {"name": "Elian Karel 死亡", "date": "2009-06-19", "lines": "2|3", "search": r"Elian Karel.*(death|murder|died|jail)"},
    {"name": "POK 纪念 Karel 集会", "date": "2012-06-20", "lines": "3", "search": r"Karel.*ceremony|remember.*Karel|martyred leader"},
    {"name": "GAStech IPO", "date": "2013-12-16", "lines": "1|4", "search": r"initial public offering|\bIPO\b.*Sanjorge"},
    {"name": "IPO 后高管巨额收益披露", "date": "2013-12-16", "lines": "1|4", "search": r"327\.25 million|windfall|vested shares"},
    {"name": "2014-01-20 GAStech 总部会议", "date": "2014-01-20", "lines": "4", "search": r"headquarters.*meeting|annual GAStech International meeting"},
    {"name": "GAStech 高管失踪/绑架", "date": "2014-01-20", "lines": "4", "search": r"kidnap|missing.*leadership|CONFIRMED MISSING"},
    {"name": "POK 声称绑架责任", "date": "2014-01-20", "lines": "3|4", "search": r"ransom note.*POK|POK.*kidnap|Protectors of Kronos.*responsibility"},
]

SOURCE_TYPE_PRIORITY = {
    "primary_local": 0,
    "primary_institutional": 1,
    "aggregator": 2,
    "unclassified": 3,
    "derivative_international": 4,
}


def load_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def write_csv(path: Path, rows: list[dict], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def split_pipe(value: str) -> list[str]:
    return [v for v in value.split("|") if v]


def normalize_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())


def summary_fingerprint(summary: str, length: int = 100) -> str:
    return normalize_text(summary)[:length]


def title_similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize_text(a), normalize_text(b)).ratio()


def build_entities(articles: list[dict], emails: list[dict]) -> list[dict]:
    all_entities = ORG_ENTITIES | LOCATION_ENTITIES | PERSON_ENTITIES
    rows: list[dict] = []

    for name in sorted(all_entities):
        if name in ORG_ENTITIES:
            etype = "organization"
            affiliation = name
        elif name in LOCATION_ENTITIES:
            etype = "location"
            affiliation = "Kronos"
        else:
            etype = "person"
            affiliation = PERSON_AFFILIATION.get(name, "")

        news_hits = [a for a in articles if name in split_pipe(a.get("entities", ""))]
        email_hits = [
            e
            for e in emails
            if name.lower().replace(" ", ".") in e.get("from_name", "").lower()
            or name.lower() in e.get("subject", "").lower()
            or name.lower() in e.get("to_names", "").lower()
        ]
        source_counter = Counter(a["source"] for a in news_hits)

        rows.append(
            {
                "entity": name,
                "entity_type": etype,
                "affiliation": affiliation,
                "news_mentions": len(news_hits),
                "email_mentions": len(email_hits),
                "top_sources": "; ".join(f"{s}({c})" for s, c in source_counter.most_common(5)),
                "article_ids": ";".join(sorted({a["article_id"] for a in news_hits}, key=int)),
            }
        )
    return rows


def cluster_events(articles: list[dict]) -> list[dict]:
    """Group likely same-story articles across sources."""
    used: set[str] = set()
    clusters: list[dict] = []
    sorted_articles = sorted(articles, key=lambda a: (a.get("date", ""), a["article_id"]))

    for i, anchor in enumerate(sorted_articles):
        aid = anchor["article_id"]
        if aid in used or not anchor.get("date"):
            continue

        group = [anchor]
        used.add(aid)
        fp = summary_fingerprint(anchor.get("summary", ""))
        anchor_entities = set(split_pipe(anchor.get("entities", "")))

        for candidate in sorted_articles[i + 1 :]:
            cid = candidate["article_id"]
            if cid in used or candidate.get("date") != anchor.get("date"):
                if candidate.get("date", "") > anchor.get("date", ""):
                    break
                continue

            cand_fp = summary_fingerprint(candidate.get("summary", ""))
            same_story = False
            if fp and cand_fp and fp[:60] == cand_fp[:60]:
                same_story = True
            elif title_similarity(anchor["title"], candidate["title"]) >= 0.82:
                same_story = True
            elif (
                len(anchor_entities & set(split_pipe(candidate.get("entities", "")))) >= 2
                and title_similarity(anchor["title"], candidate["title"]) >= 0.45
            ):
                same_story = True

            if same_story:
                group.append(candidate)
                used.add(cid)

        if len(group) < 2:
            continue

        sources = [a["source"] for a in group]
        types = [a["source_type"] for a in group]
        primary_candidates = sorted(
            group,
            key=lambda a: (
                SOURCE_TYPE_PRIORITY.get(a["source_type"], 9),
                -len(a.get("summary", "")),
            ),
        )
        likely_primary = primary_candidates[0]

        clusters.append(
            {
                "event_id": f"EVT-{len(clusters)+1:04d}",
                "event_name": likely_primary["title"],
                "date": anchor["date"],
                "event_type": "cross_source_story",
                "article_count": len(group),
                "sources": "; ".join(sorted(set(sources))),
                "source_types": "; ".join(sorted(set(types))),
                "likely_primary_source": likely_primary["source"],
                "likely_primary_article_id": likely_primary["article_id"],
                "entities": "|".join(sorted(anchor_entities)),
                "topics": likely_primary.get("topics", ""),
                "narrative_lines": likely_primary.get("narrative_lines", ""),
                "article_ids": ";".join(a["article_id"] for a in group),
                "sample_summary": likely_primary.get("summary", "")[:200],
            }
        )

    return clusters


def add_anchor_events(articles: list[dict], clusters: list[dict]) -> list[dict]:
    rows = list(clusters)
    for anchor in ANCHOR_EVENTS:
        matched = []
        pattern = re.compile(anchor["search"], re.IGNORECASE)
        for article in articles:
            blob = f"{article.get('title', '')} {article.get('summary', '')} {article.get('body', '')}"
            if pattern.search(blob):
                matched.append(article)
        if not matched:
            continue

        sources = sorted({a["source"] for a in matched})
        primary = sorted(
            matched,
            key=lambda a: (
                SOURCE_TYPE_PRIORITY.get(a["source_type"], 9),
                a["date"] == anchor["date"],
            ),
        )[0]

        rows.append(
            {
                "event_id": f"EVT-A{len(rows)+1:03d}",
                "event_name": anchor["name"],
                "date": anchor["date"],
                "event_type": "anchor_event",
                "article_count": len(matched),
                "sources": "; ".join(sources),
                "source_types": "; ".join(sorted({a["source_type"] for a in matched})),
                "likely_primary_source": primary["source"],
                "likely_primary_article_id": primary["article_id"],
                "entities": primary.get("entities", ""),
                "topics": primary.get("topics", ""),
                "narrative_lines": anchor["lines"],
                "article_ids": ";".join(sorted({a["article_id"] for a in matched}, key=int)),
                "sample_summary": primary.get("summary", "")[:200],
            }
        )
    rows.sort(key=lambda r: (r["date"], r["event_id"]))
    return rows


def bias_case_score(event: dict) -> int:
    score = 0
    if event["event_type"] == "anchor_event":
        score += 100
    entities = event.get("entities", "")
    topics = event.get("topics", "")
    if any(x in entities for x in ("POK", "GAStech", "Elian Karel", "APA")):
        score += 40
    if any(x in topics for x in ("kidnapping", "protest", "environment", "ipo")):
        score += 30
    if event.get("date", "") >= "2005":
        score += 20
    score += min(int(event.get("article_count", 0)), 30)
    return score


def build_bias_cases(events: list[dict], articles: list[dict]) -> list[dict]:
    article_map = {a["article_id"]: a for a in articles}
    cases: list[dict] = []

    ranked_events = sorted(events, key=bias_case_score, reverse=True)

    for event in ranked_events:
        if event["article_count"] < 2:
            continue
        types = set(event.get("source_types", "").split("; "))
        if not ({"primary_local", "primary_institutional"} & types and "derivative_international" in types):
            if event["event_type"] != "anchor_event":
                continue

        ids = event["article_ids"].split(";")
        grouped = [article_map[i] for i in ids if i in article_map]
        primary = [a for a in grouped if a["source_type"] in ("primary_local", "primary_institutional")]
        derivative = [a for a in grouped if a["source_type"] == "derivative_international"]
        if not primary or not derivative:
            continue

        p = primary[0]
        d = derivative[0]
        cases.append(
            {
                "case_id": f"BIAS-{len(cases)+1:03d}",
                "event_id": event["event_id"],
                "event_name": event["event_name"],
                "date": event["date"],
                "score": bias_case_score(event),
                "primary_source": p["source"],
                "primary_title": p["title"],
                "primary_summary": p.get("summary", "")[:240],
                "primary_file": p["file_path"],
                "derivative_source": d["source"],
                "derivative_title": d["title"],
                "derivative_summary": d.get("summary", "")[:240],
                "derivative_file": d["file_path"],
                "notes": "对比 primary 与 derivative 报道措辞差异，供 Q2 使用",
            }
        )
        if len(cases) >= 20:
            break

    return cases


def find_relationship_evidence(articles: list[dict], seed: dict, limit: int = 3) -> list[dict]:
    pattern = re.compile(seed["search"], re.IGNORECASE)
    hits = []
    for article in articles:
        blob = f"{article.get('title', '')} {article.get('summary', '')} {article.get('body', '')}"
        match = pattern.search(blob)
        if match:
            start = max(0, match.start() - 80)
            end = min(len(blob), match.end() + 120)
            snippet = re.sub(r"\s+", " ", blob[start:end]).strip()
            hits.append((article, snippet))
    hits.sort(key=lambda x: (SOURCE_TYPE_PRIORITY.get(x[0]["source_type"], 9), x[0]["date"]))
    return hits[:limit]


def build_relationships(articles: list[dict], emails: list[dict]) -> list[dict]:
    rows: list[dict] = []

    for seed in RELATIONSHIP_SEEDS:
        evidence = find_relationship_evidence(articles, seed)
        for idx, (article, snippet) in enumerate(evidence, start=1):
            rows.append(
                {
                    "relationship_id": f"REL-{len(rows)+1:04d}",
                    "entity_a": seed["entity_a"],
                    "entity_b": seed["entity_b"],
                    "relation": seed["relation"],
                    "description": seed["description"],
                    "evidence_type": "news",
                    "evidence_id": article["article_id"],
                    "source": article["source"],
                    "date": article["date"],
                    "quote": snippet[:300],
                    "file_path": article["file_path"],
                    "confidence": "high" if idx == 1 else "medium",
                }
            )

    # Email-based GAStech internal / IPO communication
    ipo_emails = [e for e in emails if "ipo" in e.get("topics", "") or re.search(r"\bIPO\b", e["subject"], re.I)]
    for email in ipo_emails[:5]:
        rows.append(
            {
                "relationship_id": f"REL-{len(rows)+1:04d}",
                "entity_a": email["from_name"],
                "entity_b": email["to_names"].split(";")[0].strip() if email.get("to_names") else "",
                "relation": "email_communication",
                "description": "IPO 相关内部邮件通信",
                "evidence_type": "email",
                "evidence_id": str(email["email_id"]),
                "source": "email headers.csv",
                "date": email["date"],
                "quote": email["subject"],
                "file_path": "MC1/email headers.csv",
                "confidence": "high",
            }
        )

    security_emails = [
        e for e in emails if "security" in e.get("topics", "") and "VIP" in e.get("subject", "")
    ]
    for email in security_emails[:3]:
        rows.append(
            {
                "relationship_id": f"REL-{len(rows)+1:04d}",
                "entity_a": "GAStech",
                "entity_b": "Government",
                "relation": "security_coordination",
                "description": "2014-01-20 VIP 访问安保协调",
                "evidence_type": "email",
                "evidence_id": str(email["email_id"]),
                "source": "email headers.csv",
                "date": email["date"],
                "quote": email["subject"],
                "file_path": "MC1/email headers.csv",
                "confidence": "medium",
            }
        )

    return rows


def build_email_network(emails: list[dict], min_count: int = 3) -> list[dict]:
    edge_counter: Counter[tuple[str, str]] = Counter()
    for email in emails:
        sender = email.get("from_name", "")
        recipients = [n.strip() for n in email.get("to_names", "").split(";") if n.strip()]
        for recipient in recipients:
            if sender and recipient and sender != recipient:
                edge_counter[(sender, recipient)] += 1

    rows = []
    for (sender, recipient), count in edge_counter.most_common():
        if count < min_count:
            continue
        rows.append(
            {
                "from_name": sender,
                "to_name": recipient,
                "email_count": count,
                "from_org": PERSON_AFFILIATION.get(sender, "GAStech"),
                "to_org": PERSON_AFFILIATION.get(recipient, "GAStech"),
            }
        )
    return rows


def build_timeline(articles: list[dict], events: list[dict]) -> list[dict]:
    rows: list[dict] = []

    # Anchor events first
    for event in events:
        if event["event_type"] != "anchor_event":
            continue
        rows.append(
            {
                "timeline_id": event["event_id"],
                "date": event["date"],
                "title": event["event_name"],
                "narrative_lines": event["narrative_lines"],
                "importance": "high",
                "primary_source": event["likely_primary_source"],
                "article_id": event["likely_primary_article_id"],
                "summary": event.get("sample_summary", ""),
            }
        )

    # High-signal articles near crisis window
    for article in articles:
        if not article.get("date", "").startswith("2014-01"):
            continue
        if not any(t in split_pipe(article.get("topics", "")) for t in ("kidnapping", "ipo", "security", "protest")):
            continue
        rows.append(
            {
                "timeline_id": f"TL-{article['article_id']}",
                "date": article["date"],
                "title": article["title"],
                "narrative_lines": article.get("narrative_lines", ""),
                "importance": "medium",
                "primary_source": article["source"],
                "article_id": article["article_id"],
                "summary": article.get("summary", "")[:200],
            }
        )

    # Deduplicate by article_id, keep highest importance
    dedup: dict[str, dict] = {}
    importance_rank = {"high": 0, "medium": 1, "low": 2}
    for row in rows:
        key = row["article_id"]
        if key not in dedup or importance_rank[row["importance"]] < importance_rank[dedup[key]["importance"]]:
            dedup[key] = row

    final = sorted(dedup.values(), key=lambda r: (r["date"], r["timeline_id"]))
    return final


def build_source_derivation(events: list[dict]) -> list[dict]:
    rows = []
    for event in events:
        if event["article_count"] < 2:
            continue
        rows.append(
            {
                "event_id": event["event_id"],
                "event_name": event["event_name"],
                "date": event["date"],
                "likely_primary_source": event["likely_primary_source"],
                "likely_primary_article_id": event["likely_primary_article_id"],
                "derivative_sources": "; ".join(
                    s
                    for s in event["sources"].split("; ")
                    if s != event["likely_primary_source"]
                ),
                "article_count": event["article_count"],
            }
        )
    return rows


def write_q1_report(sources: list[dict], source_relations: list[dict], out_path: Path) -> None:
    type_counts = Counter(s["source_type"] for s in sources)
    lines = [
        "# Q1 媒体来源分析（数据整理组）",
        "",
        "## 来源分层结论",
        "",
        "| 类型 | 媒体数 | 文章数 | 说明 |",
        "|------|--------|--------|------|",
    ]
    type_article_counts = Counter()
    for s in sources:
        type_article_counts[s["source_type"]] += int(s["article_count"])

    descriptions = {
        "primary_local": "Kronos 本地一手报道，英文质量较高，常含现场细节",
        "primary_institutional": "机构/公司口径（Tethys News、Centrum Sentinel）",
        "derivative_international": "国际媒体转述，常见机器翻译痕迹",
        "aggregator": "聚合转载，来源多样",
        "unclassified": "未分类",
    }
    for stype in ["primary_local", "primary_institutional", "aggregator", "derivative_international", "unclassified"]:
        count = sum(1 for s in sources if s["source_type"] == stype)
        if count == 0:
            continue
        lines.append(
            f"| {stype} | {count} | {type_article_counts[stype]} | {descriptions.get(stype, '')} |"
        )

    lines.extend(
        [
            "",
            "## Primary 与 Derivative 的关系",
            "",
            f"- 识别到 **{len(source_relations)}** 组跨源同题报道（见 `source_relations.csv`）",
            "- 常见模式：Homeland Illumination / Kronos Star / The Abila Post 首发 → Worldwise / World Journal / News Online Today 转载或改写",
            "- Derivative 报道常出现语法错误、立场更倾向政府/GAStech 或简化 POK 诉求",
            "",
            "## 给可视化组",
            "",
            "- 用 `sources.csv` 画来源体量与类型分布",
            "- 用 `source_relations.csv` 画 primary→derivative 引用/转载关系",
            "- 关键节点见 `anchor_events.csv`",
            "",
        ]
    )
    out_path.write_text("\n".join(lines), encoding="utf-8")


def write_story_summary(timeline: list[dict], out_path: Path) -> None:
    text = """# 四幕故事总述（数据整理组）

## 第一幕：背景 — GAStech 与 Kronos 政府深度绑定

GAStech 是 Kronos 最大能源企业，长期开发 Tiskele 气田，为该国带来就业与税收。政府多次为 GAStech 提供许可、接待与安保支持，IPO 前已存在密切官方关系。

## 第二幕：矛盾 — 环境冲突点燃反对

Elodis 等地居民与 POK（Protectors of Kronos）持续指控 GAStech 造成污染与健康问题。媒体对环境风险的 framing 因来源而异：本地媒体更关注居民证言，部分 derivative 源则淡化或转述政府/公司口径。

## 第三幕：升级 — 抗议、执法与组织对抗

POK 在 GAStech 设施外抗议并多次与警方冲突；总统 Kapelou 公开称 POK 为「罪犯集团」。APA 作为 Asterian 准军事组织，与 POK 不同，亦被提及与绑架风险相关。

## 第四幕：爆发 — IPO 财富与 2014-01-20 绑架

2013 年 12 月 GAStech IPO 使 Sanjorge 及 Kronos 高管获得巨额收益。2014 年 1 月 20 日，总部会议后多名 GAStech 高管失踪，POK 被指认领绑架。邮件数据显示 IPO 与 VIP 安保安排在此前数天已密集讨论。

## 关键时间节点

详见 `anchor_events.csv` 与 `narrative_line_*.csv`。
"""
    out_path.write_text(text, encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build MC1 analysis tables from parsed CSVs.")
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    args = parser.parse_args()

    out = args.output_dir
    articles = load_csv(out / "articles_lite.csv")
    emails = load_csv(out / "emails.csv")
    sources = load_csv(out / "sources.csv")

    entities = build_entities(articles, emails)
    clusters = cluster_events(articles)
    events = add_anchor_events(articles, clusters)
    bias_cases = build_bias_cases(events, articles)
    relationships = build_relationships(articles, emails)
    email_network = build_email_network(emails)
    timeline = build_timeline(articles, events)
    source_relations = build_source_derivation(events)

    write_csv(
        out / "entities.csv",
        entities,
        ["entity", "entity_type", "affiliation", "news_mentions", "email_mentions", "top_sources", "article_ids"],
    )
    write_csv(
        out / "relationships.csv",
        relationships,
        [
            "relationship_id", "entity_a", "entity_b", "relation", "description",
            "evidence_type", "evidence_id", "source", "date", "quote", "file_path", "confidence",
        ],
    )
    write_csv(
        out / "email_network.csv",
        email_network,
        ["from_name", "to_name", "email_count", "from_org", "to_org"],
    )
    write_csv(
        out / "source_relations.csv",
        source_relations,
        [
            "event_id", "event_name", "date", "likely_primary_source",
            "likely_primary_article_id", "derivative_sources", "article_count",
        ],
    )

    write_q1_report(sources, source_relations, out / "Q1_媒体来源分析.md")
    write_story_summary(timeline, out / "故事总述.md")
    write_narrative_exports(out, events, timeline)
    write_readme(out)

    print(f"Entities: {len(entities)}")
    print(f"Events: {len(events)} (clusters={sum(1 for e in events if e['event_type']=='cross_source_story')}, anchors={sum(1 for e in events if e['event_type']=='anchor_event')})")
    print(f"Relationships: {len(relationships)}")
    print(f"Bias cases: {len(bias_cases)}")
    print(f"Email network edges: {len(email_network)}")
    print(f"Timeline entries: {len(timeline)}")
    print(f"Source relations: {len(source_relations)}")
    print(f"\nAnalysis output: {out.resolve()}")


def write_narrative_exports(out: Path, events: list[dict], timeline: list[dict]) -> None:
    line_names = {
        "1": "商业利益线",
        "2": "环境冲突线",
        "3": "组织对抗线",
        "4": "绑架导火索线",
    }
    fields = [
        "item_id", "item_type", "date", "title", "sources", "article_ids",
        "likely_primary_source", "sample_summary",
    ]
    for line, label in line_names.items():
        rows = []
        for event in events:
            if line not in event.get("narrative_lines", "").split("|"):
                continue
            rows.append(
                {
                    "item_id": event["event_id"],
                    "item_type": event["event_type"],
                    "date": event["date"],
                    "title": event["event_name"],
                    "sources": event.get("sources", ""),
                    "article_ids": event.get("article_ids", ""),
                    "likely_primary_source": event.get("likely_primary_source", ""),
                    "sample_summary": event.get("sample_summary", ""),
                }
            )
        for item in timeline:
            if line not in item.get("narrative_lines", "").split("|"):
                continue
            if any(r["item_id"] == item["timeline_id"] for r in rows):
                continue
            rows.append(
                {
                    "item_id": item["timeline_id"],
                    "item_type": "timeline",
                    "date": item["date"],
                    "title": item["title"],
                    "sources": item.get("primary_source", ""),
                    "article_ids": item.get("article_id", ""),
                    "likely_primary_source": item.get("primary_source", ""),
                    "sample_summary": item.get("summary", ""),
                }
            )
        rows.sort(key=lambda r: (r["date"], r["item_id"]))
        write_csv(out / f"narrative_line_{line}_{label}.csv", rows, fields)


def write_readme(out: Path) -> None:
    content = """# MC1 数据整理产出 — 给可视化组

## 文件清单（共 18 个）

| 文件 | 用途 | 题目 |
|------|------|------|
| `articles_lite.csv` | 845 篇新闻结构化数据 | 全部 |
| `sources.csv` | 29 个媒体汇总 | Q1 |
| `source_relations.csv` | Primary→Derivative 同题关系 | Q1 |
| `Q1_媒体来源分析.md` | Q1 结论草稿 | Q1 |
| `bias_cases.csv` | 偏见对比案例（10 组） | Q2 |
| `Q2_偏见案例解读.md` | Q2 文字解读 | Q2 |
| `relationships.csv` | 四方关系证据 | Q3 |
| `emails.csv` | 1175 封邮件头 | Q3 |
| `email_network.csv` | 邮件通信网络 | Q3 |
| `Q3_四方关系矩阵.md` | Q3 关系定稿 | Q3 |
| `entities.csv` | 实体词典 | Q2/Q3 |
| `anchor_events.csv` | 8 个关键时间节点 | 汇报 |
| `故事总述.md` | 四幕故事框架 | 汇报 |
| `narrative_line_1~4_*.csv` | 四条叙事线分表 | 汇报 |

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
"""
    (out / "README_给可视化组.md").write_text(content, encoding="utf-8")


if __name__ == "__main__":
    main()
