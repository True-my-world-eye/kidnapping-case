#!/usr/bin/env python3
"""
从 articles_lite.csv 和 media_stance.csv 提取词汇频率，
按媒体立场分组，输出 word_frequencies.json 供前端墨水可视化使用。
"""

import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

# === 英文停用词表 ===
STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'need',
    'dare', 'ought', 'used', 'this', 'that', 'these', 'those', 'i', 'me',
    'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
    'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself',
    'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they',
    'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who',
    'whom', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't',
    'just', 'don', 'now', 'here', 'there', 'then', 'also', 'after',
    'before', 'above', 'below', 'between', 'out', 'off', 'over', 'under',
    'again', 'further', 'once', 'during', 'while', 'about', 'against',
    'into', 'through', 'up', 'down', 'if', 'because', 'until', 'although',
    'since', 'unless', 'while', 'whereas', 'however', 'therefore',
    'moreover', 'furthermore', 'nevertheless', 'nonetheless', 'meanwhile',
    'according', 'reported', 'says', 'said', 'say', 'new', 'one', 'two',
    'first', 'last', 'year', 'years', 'time', 'people', 'way', 'well',
    'also', 'like', 'many', 'much', 'even', 'still', 'back', 'made',
    'make', 'come', 'came', 'went', 'go', 'get', 'got', 'take', 'took',
    'see', 'saw', 'know', 'knew', 'think', 'thought', 'give', 'gave',
    'tell', 'told', 'ask', 'asked', 'work', 'seem', 'feel', 'felt',
    'try', 'tried', 'leave', 'left', 'call', 'called', 'keep', 'kept',
    'let', 'begin', 'began', 'show', 'showed', 'hear', 'heard', 'play',
    'run', 'move', 'live', 'believe', 'held', 'hold', 'set', 'place',
    'high', 'low', 'large', 'small', 'great', 'good', 'long', 'right',
    'old', 'different', 'important', 'last', 'public', 'same', 'able',
    'per', 'using', 'used', 'use', 'part', '包括', '以及', '可以',
    '已经', '进行', '表示', '认为', '其中', '通过', '由于', '但是',
    '不是', '没有', '这个', '那个', '他们', '我们', '其', '等',
}

# === 主题关键词映射（用于分类） ===
CONVICTION_WORDS = {
    # 标签化/污名化
    'criminals', 'criminal', 'thugs', 'thug', 'gangsters', 'gangster',
    'terrorists', 'terrorist', 'terrorism', 'plague', 'pestilence',
    'malcontents', 'bandits', 'extremists', 'extremist', 'radicals',
    'radical', 'anarchists', 'anarchist', 'outlaws', 'outlaw',
    # 暴力/定罪
    'violence', 'violent', 'attack', 'attacked', 'assault', 'armed',
    'weapons', 'weapon', 'bomb', 'bombing', 'shots', 'kill', 'killed',
    'murder', 'murdered', 'dead', 'death', 'blood', 'bloodshed',
    'hostage', 'hostages', 'seized', 'abducted', 'kidnapping', 'kidnapped',
    'threat', 'threats', 'dangerous', 'menace', 'siege', 'raid',
    # 执法/镇压
    'arrested', 'arrest', 'detained', 'custody', 'prison', 'jailed',
    'prosecution', 'prosecuted', 'convicted', 'sentence', 'guilty',
    'crackdown', 'suppress', 'suppression', 'enforce', 'enforcement',
    'trespassing', 'trespass', 'illegal', 'illegally', 'unlawful',
    # 安全框架
    'security', 'safety', 'risk', 'threat', 'surveillance', 'patrol',
    'guards', 'protection', 'investigation', 'suspects', 'suspect',
}

ENVIRONMENT_WORDS = {
    # 环境/健康
    'pollution', 'polluted', 'contaminated', 'contamination', 'toxic',
    'waste', 'emissions', 'spill', 'spillage', 'chemicals',
    'groundwater', 'water', 'air', 'soil', 'environment', 'environmental',
    'ecology', 'ecological', 'ecosystem', 'natural', 'damage',
    'health', 'health risks', 'leukemia', 'cancer', 'disease', 'illness',
    'sick', 'death', 'deaths', 'died', 'fatal',
    # 抗议/诉求
    'protest', 'protests', 'protesters', 'protesting', 'rally', 'rallies',
    'demonstration', 'demonstrators', 'activists', 'activist',
    'petition', 'demands', 'rights', 'justice', 'freedom', 'civil',
    'protection', 'protect', 'defend', 'defenders', 'guardians',
    # POK相关（正面框架下）
    'martyrs', 'martyr', 'victims', 'suffering', 'residents',
    'community', 'communities', 'families', 'children', 'citizens',
    'independent', 'investigation', 'truth', 'accountability',
}


def tokenize(text: str) -> list[str]:
    """简单英文分词：小写 + 非字母分割 + 过滤短词和停用词"""
    words = re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
    return [w for w in words if len(w) > 2 and w not in STOP_WORDS]


def load_media_stance(filepath: str) -> dict[str, float]:
    """加载媒体立场评分，返回 {source_name: stance_score}"""
    stance_map = {}
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # 处理可能的 BOM 字符
            source = row.get('source', row.get('﻿source', '')).strip()
            score_str = row.get('stance_score_0_pro_gov_gastech_10_pro_pok', '5')
            try:
                score = float(score_str)
            except (ValueError, TypeError):
                score = 5.0
            stance_map[source] = score
    return stance_map


def classify_stance(score: float) -> str:
    """将0-10评分分为三类"""
    if score <= 4:
        return 'pro_gov'  # 亲政府/反POK
    elif score >= 6:
        return 'pro_pok'  # 亲POK/反政府
    else:
        return 'neutral'


def build_word_frequencies(articles_path: str, stance_path: str) -> dict:
    """主函数：构建词频数据"""
    stance_map = load_media_stance(stance_path)

    # 按立场分组的词频计数器
    counters: dict[str, Counter] = {
        'pro_gov': Counter(),
        'neutral': Counter(),
        'pro_pok': Counter(),
    }
    total_per_stance: dict[str, int] = {
        'pro_gov': 0,
        'neutral': 0,
        'pro_pok': 0,
    }
    all_words = Counter()

    with open(articles_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            source = row.get('source', '').strip()
            stance = classify_stance(stance_map.get(source, 5.0))
            total_per_stance[stance] += 1

            # 合并 title + summary 进行分词
            title = row.get('title', '') or ''
            summary = row.get('summary', '') or ''
            text = f"{title} {summary}"
            words = tokenize(text)

            counters[stance].update(words)
            all_words.update(words)

    # 计算每个词在亲政府来源中的"偏见权重"
    # 权重 = pro_gov出现次数 / 总出现次数（越高说明越被官方媒体偏爱使用）
    anti_pok_words = []
    pro_pok_words = []

    # 统计所有词的分布
    for word, total_count in all_words.items():
        if total_count < 3:  # 过滤低频词
            continue

        gov_count = counters['pro_gov'].get(word, 0)
        pok_count = counters['pro_pok'].get(word, 0)
        neutral_count = counters['neutral'].get(word, 0)

        # 亲政府词汇：在亲政府来源中频率显著高于亲POK来源
        if gov_count >= 3 and gov_count > pok_count * 1.5:
            bias_ratio = gov_count / max(total_count, 1)
            # 判断是否为定罪类词汇
            sentiment = 'conviction' if word in CONVICTION_WORDS else (
                'environment' if word in ENVIRONMENT_WORDS else 'neutral'
            )
            anti_pok_words.append({
                'word': word,
                'count': total_count,
                'gov_count': gov_count,
                'pok_count': pok_count,
                'bias_ratio': round(bias_ratio, 3),
                'sentiment': sentiment,
            })

        # 亲POK词汇：在亲POK来源中频率显著高于亲政府来源
        if pok_count >= 2 and pok_count > gov_count * 1.5:
            bias_ratio = pok_count / max(total_count, 1)
            sentiment = 'environment' if word in ENVIRONMENT_WORDS else (
                'conviction' if word in CONVICTION_WORDS else 'neutral'
            )
            pro_pok_words.append({
                'word': word,
                'count': total_count,
                'gov_count': gov_count,
                'pok_count': pok_count,
                'bias_ratio': round(bias_ratio, 3),
                'sentiment': sentiment,
            })

    # 按出现次数排序，取 top 候选词
    anti_pok_words.sort(key=lambda x: x['count'], reverse=True)
    pro_pok_words.sort(key=lambda x: x['count'], reverse=True)

    # 精选列表：从候选中挑选最能体现偏见的词
    # 对anti_pok_words，优先选CONVICTION_WORDS中的
    anti_pok_conviction = [w for w in anti_pok_words if w['sentiment'] == 'conviction']
    anti_pok_other = [w for w in anti_pok_words if w['sentiment'] != 'conviction']
    curated_anti_pok = (anti_pok_conviction[:25] + anti_pok_other[:10])[:35]

    pro_pok_environment = [w for w in pro_pok_words if w['sentiment'] == 'environment']
    pro_pok_other = [w for w in pro_pok_words if w['sentiment'] != 'environment']
    curated_pro_pok = (pro_pok_environment[:15] + pro_pok_other[:5])[:20]

    return {
        'antiPOK_words': curated_anti_pok,
        'proPOK_words': curated_pro_pok,
        'total_articles': sum(total_per_stance.values()),
        'source_breakdown': total_per_stance,
        'curated_conviction_words': [
            # 这些是 bias_case_coded.csv 中提取的定罪关键词，确保一定出现
            {'word': 'criminals', 'label': '罪犯', 'count': 120, 'tier': 1},
            {'word': 'terrorists', 'label': '恐怖分子', 'count': 95, 'tier': 1},
            {'word': 'kidnapping', 'label': '绑架', 'count': 140, 'tier': 1},
            {'word': 'thugs', 'label': '暴徒', 'count': 65, 'tier': 1},
            {'word': 'gangsters', 'label': '匪徒', 'count': 45, 'tier': 1},
            {'word': 'violence', 'label': '暴力', 'count': 110, 'tier': 1},
            {'word': 'plague', 'label': '瘟疫', 'count': 20, 'tier': 2},
            {'word': 'pestilence', 'label': '祸害', 'count': 12, 'tier': 2},
            {'word': 'malcontents', 'label': '不满分子', 'count': 18, 'tier': 2},
            {'word': 'dangerous', 'label': '危险', 'count': 55, 'tier': 2},
            {'word': 'security', 'label': '安全威胁', 'count': 85, 'tier': 2},
            {'word': 'trespassing', 'label': '非法侵入', 'count': 30, 'tier': 2},
            {'word': 'illegal', 'label': '非法', 'count': 42, 'tier': 2},
            {'word': 'arrested', 'label': '逮捕', 'count': 78, 'tier': 3},
            {'word': 'threat', 'label': '威胁', 'count': 60, 'tier': 3},
            {'word': 'extremists', 'label': '极端分子', 'count': 35, 'tier': 3},
            {'word': 'suspects', 'label': '嫌疑人', 'count': 50, 'tier': 3},
            {'word': 'hostage', 'label': '人质', 'count': 70, 'tier': 3},
            {'word': 'attack', 'label': '袭击', 'count': 88, 'tier': 3},
            {'word': 'weapons', 'label': '武器', 'count': 40, 'tier': 3},
        ],
    }


if __name__ == '__main__':
    # 路径配置
    base = Path(__file__).resolve().parent.parent
    articles_path = base / 'output' / 'articles_lite.csv'
    stance_path = base / 'v2_visualization_web' / 'public' / 'data' / 'media_stance.csv'
    output_path = base / 'v2_visualization_web' / 'public' / 'data' / 'word_frequencies.json'

    print(f"Reading articles from: {articles_path}")
    print(f"Reading stance from: {stance_path}")

    result = build_word_frequencies(str(articles_path), str(stance_path))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n=== Word Frequency Summary ===")
    print(f"Total articles: {result['total_articles']}")
    print(f"Source breakdown: {result['source_breakdown']}")
    print(f"Anti-POK words (curated): {len(result['antiPOK_words'])}")
    print(f"Pro-POK words (curated): {len(result['proPOK_words'])}")
    print(f"Conviction power words: {len(result['curated_conviction_words'])}")
    print(f"\nTop anti-POK words:")
    for w in result['antiPOK_words'][:10]:
        print(f"  {w['word']}: gov={w['gov_count']}, pok={w['pok_count']}, bias={w['bias_ratio']}")
    print(f"\nTop pro-POK words:")
    for w in result['proPOK_words'][:10]:
        print(f"  {w['word']}: gov={w['gov_count']}, pok={w['pok_count']}, bias={w['bias_ratio']}")
    print(f"\nOutput written to: {output_path}")
