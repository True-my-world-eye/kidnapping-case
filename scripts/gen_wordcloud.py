#!/usr/bin/env python3
"""Generate a static word cloud PNG for Slide3InkDrop — 中英混合 + 透明背景."""
import json
import os
import numpy as np
from wordcloud import WordCloud
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

# 读取数据
data_path = os.path.join(os.path.dirname(__file__),
    '..', 'v2_visualization_web', 'src', 'data', 'word_frequencies.json')
with open(data_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 构建词频字典：定罪词用 "中文 ENGLISH" 格式
freq = {}
tier_map = {}
label_map = {}

for w in data['curated_conviction_words']:
    word = w['word']
    label = w.get('label', '')
    tier = w['tier']
    # 用 "中文 ENGLISH" 格式，大词显示中文+英文
    if tier == 1:
        display = f"{label} {word.upper()}" if label else word.upper()
    elif tier == 2:
        display = f"{label} {word.upper()}" if label else word.upper()
    else:
        display = f"{label} {word.upper()}" if label else word.upper()
    freq[display] = w['count']
    tier_map[display] = tier
    label_map[display] = label

for w in data['proPOK_words']:
    if w.get('sentiment') == 'environment' or w.get('count', 0) <= 30:
        freq[w['word']] = w['count']
        tier_map[w['word']] = 4

# 颜色函数
def color_func(word, font_size, position, orientation, random_state=None, **kwargs):
    tier = tier_map.get(word, 4)
    if tier == 1:
        return "rgb(180, 35, 35)"       # 深红，最醒目
    elif tier == 2:
        return "rgb(60, 55, 52)"        # 深棕
    elif tier == 3:
        return "rgb(100, 90, 85)"       # 中灰棕
    else:
        return "rgb(170, 165, 158)"     # 浅灰（弱词）

# Windows 中文字体
font_path = "C:/Windows/Fonts/msyh.ttc"  # 微软雅黑
if not os.path.exists(font_path):
    font_path = "C:/Windows/Fonts/simhei.ttf"
if not os.path.exists(font_path):
    font_path = "C:/Windows/Fonts/simsun.ttc"

wc = WordCloud(
    font_path=font_path,
    width=1400,
    height=750,
    background_color=None,  # 透明
    max_words=30,
    max_font_size=120,
    min_font_size=14,
    prefer_horizontal=0.82,
    relative_scaling=0.5,
    color_func=color_func,
    margin=6,
    collocations=False,
)
wc.generate_from_frequencies(freq)

# 用 matplotlib 保存透明 PNG
fig, ax = plt.subplots(figsize=(14, 7.5), dpi=150)
ax.imshow(wc, interpolation='bilinear')
ax.axis('off')
fig.patch.set_alpha(0)
ax.set_facecolor('none')

out_dir = os.path.join(os.path.dirname(__file__),
    '..', 'v2_visualization_web', 'public')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'wordcloud_slide3.png')
fig.savefig(out_path, dpi=150, bbox_inches='tight', pad_inches=0,
            transparent=True, facecolor='none')
plt.close(fig)

# 验证透明度
img = Image.open(out_path)
print(f"Saved: {out_path}")
print(f"Size: {img.size}, Mode: {img.mode}")
print(f"Words placed: {len(wc.layout_)}")
