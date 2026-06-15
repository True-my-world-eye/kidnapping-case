"""
update_ghosts_labels.py — 优化 Slide5Network 中幽灵员工标签的显示样式。

数据溯源说明：参见 update_slide5.py 头部的完整注释。幽灵员工名单是
研究者推断的叙事构造，employee_nodes.csv 中不存在对应的数据字段。
本脚本仅调整 UI 标签渲染，不涉及数据分类逻辑。
"""

import sys
from pathlib import Path

# 使用相对路径定位 Slide5Network.tsx（从 scripts/ 的父目录出发）
ROOT = Path(__file__).resolve().parents[1]
file_path = str(ROOT / "v2_visualization_web" / "src" / "components" / "Charts" / "Slide5Network.tsx")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the label generation logic to only show label on hover for ghosts, or stagger them
old_label_logic = """      // Step 1: 幽灵员工亮起
      if (step === 1 && isGhost) {
        itemStyle = { color: '#F9F9F6', borderColor: '#4A5568', borderWidth: 2, borderType: 'dashed', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)', opacity: 1 };
        symbolSize = 16;
        const labelPos = y > 500 ? ('top' as const) : ('bottom' as const);
        label = { show: true, position: labelPos, formatter: '{b}', fontSize: 11, color: '#4A5568', fontWeight: 'bold' };
      }"""

new_label_logic = """      // Step 1: 幽灵员工亮起
      if (step === 1 && isGhost) {
        itemStyle = { color: '#F9F9F6', borderColor: '#4A5568', borderWidth: 2, borderType: 'dashed', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)', opacity: 1 };
        symbolSize = 16;
        
        // 优化标签：由于 19 人全挤在一起，不再默认全部显示名字，改为只有部分核心人物显示，或错开位置
        // 这里我们只让部分具有代表性或不在密集区的节点显示标签，其他的靠悬浮(Tooltip)或只留圆圈
        const showLabel = ['Isia Vann', 'Loreto Bodrogi', 'Varja Lagos', 'Henk Mies', 'Adan Morlun'].includes(nodeName);
        
        // 即使显示，也增加半透明背景以减少文字重叠带来的杂乱感
        const labelPos = y > 500 ? ('top' as const) : ('bottom' as const);
        label = { 
          show: showLabel, 
          position: labelPos, 
          formatter: '{b}', 
          fontSize: 10, 
          color: '#4A5568', 
          fontWeight: 'bold',
          backgroundColor: 'rgba(249, 249, 246, 0.7)',
          padding: 2,
          borderRadius: 2
        };
      }"""

content = content.replace(old_label_logic, new_label_logic)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Ghosts labels updated successfully.")