import sys

file_path = r'd:\数据可视化清晰版\数据整理(1)\数据整理\v2_visualization_web\src\components\Charts\Slide5Network.tsx'

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