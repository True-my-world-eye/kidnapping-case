#!/usr/bin/env python3
"""从 articles_lite.csv 真实统计定罪词频，生成 word_frequencies.json。

   数据溯源说明（VAST Challenge 2021 MC1）：
   - 输入数据 articles_lite.csv 来自 VAST Challenge 2021 MC1 官方新闻数据集
     （845 篇），经 parse_mc1.py 解析生成，数据真实可信。
   - media_stance.csv 的立场评分（0-10）是研究者基于新闻来源属性和报道
     框架的人工编码，**不是** VAST Challenge 官方数据字段。评分方法论：
     * 立场分数 ≤4 = 亲建制/政府口径（pro-GAStech, pro-government）
     * 立场分数 ≥6 = 亲POK/独立报道（pro-POK, independent）
     * 立场分数 =5 = 中立/未判定（不计入任一阵营）
   - **重要局限**：CONVICTION_WORDS 列表（26 个词）是研究者预设的"定罪词汇"
     集合，只统计负面/定罪类词汇，不统计正面或中性词汇。这是有意的分析选择
     （聚焦偏见方向），但意味着统计结果反映的是"定罪语言的不对称分布"而非
     "报道的全面词汇差异"。建议在报告中标注此方法论限制。
   - 输出到 public/data/word_frequencies.json（运行时加载）和 src/data/
     word_frequencies.json（构建时导入）。两处应保持同步——当前已知两版本
     的 count 字段计算方式不同（src/data 版含 neutral 文章词频，public/data
     版仅 gov+pok），需统一计算口径。

   分类依据：
   - 亲建制/政府口径：media_stance.csv 中 stance_score ≤ 4 的来源
   - 亲POK/独立报道：media_stance.csv 中 stance_score ≥ 6 的来源
   - 中间分(5)：不计入任一阵营，避免灰色地带污染统计

   输出覆盖在 v2_visualization_web/public/data/word_frequencies.json
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output"
PUBLIC_DATA_DIR = ROOT / "v2_visualization_web" / "public" / "data"

CONVICTION_WORDS = [
    "guards", "kidnapping", "death", "violent", "threat", "attack",
    "terrorist", "kidnapped", "violence", "criminals", "investigation",
    "security", "assault", "patrol", "bomb", "custody", "trespassing",
    "thugs", "radical", "gang", "militant", "extremist", "terror",
    "hostage", "ransom",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="从 articles_lite.csv 真实统计词频")
    parser.add_argument("--output-dir", type=Path, default=PUBLIC_DATA_DIR)
    args = parser.parse_args()

    # 1. 读取文章数据
    articles_path = OUTPUT_DIR / "articles_lite.csv"
    if not articles_path.exists():
        raise SystemExit(f"找不到 {articles_path}，请先运行 parse_mc1.py")

    with open(articles_path, encoding="utf-8-sig") as f:
        articles = list(csv.DictReader(f))

    # 2. 读取媒体立场评分
    stance_path = OUTPUT_DIR / "media_stance.csv"
    if not stance_path.exists():
        raise SystemExit(f"找不到 {stance_path}")

    with open(stance_path, encoding="utf-8-sig") as f:
        stance_rows = list(csv.DictReader(f))

    # 构建 source → stance_score 映射
    source_stance: dict[str, float] = {}
    for row in stance_rows:
        try:
            source_stance[row["source"]] = float(
                row["stance_score_0_pro_gov_gastech_10_pro_pok"]
            )
        except (ValueError, KeyError):
            continue

    # 3. 按立场分阵营
    gov_articles = [
        a for a in articles
        if source_stance.get(a.get("source", ""), 5) <= 4
    ]
    pok_articles = [
        a for a in articles
        if source_stance.get(a.get("source", ""), 5) >= 6
    ]

    print(f"亲建制/政府口径文章: {len(gov_articles)} 篇 ({len(set(a['source'] for a in gov_articles))} 个来源)")
    print(f"亲POK/独立报道文章: {len(pok_articles)} 篇 ({len(set(a['source'] for a in pok_articles))} 个来源)")
    print(f"中间/未分类文章: {len(articles) - len(gov_articles) - len(pok_articles)} 篇")

    # 4. 统计词频
    def count_words(article_list: list[dict], words: list[str]) -> Counter:
        counter: Counter = Counter()
        for a in article_list:
            # 统计标题 + 摘要 + 正文
            text = " ".join([
                a.get("title", ""),
                a.get("summary", ""),
                a.get("body", ""),
            ]).lower()
            for w in words:
                count = len(re.findall(r"\b" + re.escape(w) + r"\b", text))
                if count:
                    counter[w] += count
        return counter

    gov_counter = count_words(gov_articles, CONVICTION_WORDS)
    pok_counter = count_words(pok_articles, CONVICTION_WORDS)

    # 5. 构建输出
    anti_pok_words = []
    for word in CONVICTION_WORDS:
        g = gov_counter.get(word, 0)
        p = pok_counter.get(word, 0)
        total = g + p
        if total == 0:
            continue
        anti_pok_words.append({
            "word": word,
            "count": total,
            "gov_count": g,
            "pok_count": p,
            "bias_ratio": round(g / total, 3) if total else 0,
            "sentiment": "conviction",
        })

    # 按总频次降序
    anti_pok_words.sort(key=lambda x: x["count"], reverse=True)

    result = {"antiPOK_words": anti_pok_words}

    # 6. 写出
    args.output_dir.mkdir(parents=True, exist_ok=True)
    out_path = args.output_dir / "word_frequencies.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n已生成: {out_path}")
    print(f"定罪词数量: {len(anti_pok_words)}")
    print(f"词频范围: {anti_pok_words[-1]['count']} ~ {anti_pok_words[0]['count']}")

    # 打印统计摘要
    print(f"\n{'word':15s} {'gov':>5s} {'pok':>5s} {'ratio':>7s}")
    print("-" * 35)
    for w in anti_pok_words[:15]:
        print(f"{w['word']:15s} {w['gov_count']:5d} {w['pok_count']:5d} {w['bias_ratio']:7.3f}")


if __name__ == "__main__":
    main()
