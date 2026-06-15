"""
update_slide5.py — 向 Slide5Network.tsx 注入"幽灵员工"叙事层。

数据溯源说明（VAST Challenge 2021 MC1）：
- 基础数据全部来自 VAST Challenge 2021 MC1 官方数据集，真实可信：
  845 篇新闻 → output/articles_lite.csv
  1175 封邮件 → output/emails.csv
  54 份员工档案 → output/employee_nodes.csv
- employee_nodes.csv 中 54 名员工均拥有完整档案字段（出生日期、国籍、
  入职日期、兵役记录等），数据来源为 EmployeeRecords.xlsx。
- **重要局限**：employee_nodes.csv **没有** "resume_status" 或 "is_ghost" 字段。
  本脚本中硬编码的 19 人"幽灵员工（无简历/CV）"名单，是基于以下研究者推断：
  (a) 部分员工姓氏与 POK 创始人及已知污染受害者重叠
  (b) 部分员工入职日期晚于 2010 年，且在安保/设施部门
  (c) VAST Challenge 叙事设定中暗示存在内部漏洞
  该分类是**叙事解读**而非数据字段直接映射，建议在正式报告中标注为
  "研究者推断"并说明推断依据，而非作为既定事实呈现。
- 硬编码 Windows 绝对路径：需替换为相对路径才能在他人环境中运行。
- VAST Challenge 2021 MC1 官方数据来源：
  https://vast-challenge.github.io/2021/MC1.html
"""

import sys
from pathlib import Path

# 使用相对路径定位 Slide5Network.tsx（从 scripts/ 的父目录出发）
ROOT = Path(__file__).resolve().parents[1]
file_path = str(ROOT / "v2_visualization_web" / "src" / "components" / "Charts" / "Slide5Network.tsx")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1
content = content.replace(
"""  const handleChartClick = () => {
    setStep((prev) => (prev < 3 ? prev + 1 : 0));
  };""",
"""  const handleChartClick = () => {
    setStep((prev) => (prev < 4 ? prev + 1 : 0));
  };""")

# 2
content = content.replace(
"""    const family = ['Bodrogi', 'Vann', 'Osvaldo', 'Lagos', 'Ferro'];""",
"""    const family = ['Bodrogi', 'Vann', 'Osvaldo', 'Lagos', 'Ferro'];
    
    // 幽灵员工（无简历）名单
    const ghosts = [
      'Isia Vann', 'Edvard Vann', 'Loreto Bodrogi', 'Henk Mies', 'Minke Mies', 
      'Adan Morlun', 'Valeria Morlun', 'Cecilia Morluniau', 'Benito Hawelon', 'Claudio Hawelon', 
      'Varja Lagos', 'Albina Hafon', 'Irene Nant', 'Dylan Scozzese', 'Kanon Herrero', 
      'Stenig Fusil', 'Hennie Osvaldo', 'Hideki Cocinaro', 'Inga Ferro',
      'Isia_Vann', 'Edvard_Vann', 'Loreto_Bodrogi', 'Henk_Mies', 'Minke_Mies', 
      'Adan_Morlun', 'Valeria_Morlun', 'Cecilia_Morluniau', 'Benito_Hawelon', 'Claudio_Hawelon', 
      'Varja_Lagos', 'Albina_Hafon', 'Irene_Nant', 'Dylan_Scozzese', 'Kanon_Herrero', 
      'Stenig_Fusil', 'Hennie_Osvaldo', 'Hideki_Cocinaro', 'Inga_Ferro'
    ];""")

# 3
content = content.replace(
"""      const isFamily = family.some(f => nodeName.includes(f));""",
"""      const isFamily = family.some(f => nodeName.includes(f));
      const isGhost = ghosts.includes(node.node_id) || ghosts.includes(nodeName);""")

# 4
content = content.replace("step >= 2 ? '#526E4F' : '#AAAAAA'", "step >= 3 ? '#526E4F' : '#AAAAAA'")
content = content.replace("opacity: step >= 2 ? 1 : 0.1", "opacity: step >= 3 ? 1 : 0.1")
content = content.replace("symbolSize = step >= 2 ? 55 : 15", "symbolSize = step >= 3 ? 55 : 15")
content = content.replace("show: step >= 2", "show: step >= 3")

# 5
content = content.replace(
"""      // Step 1: 家族暗网亮起 (在 Step 2 及以后，隐藏紫色字体和节点高亮，以聚焦红色内鬼)
      if (step === 1 && isFamily && !isMole) {""",
"""      let symbol = 'circle';
      if (step >= 1 && isGhost) {
        symbol = 'emptyCircle'; // 幽灵员工变为虚线空心圆
      }

      // Step 1: 幽灵员工亮起
      if (step === 1 && isGhost) {
        itemStyle = { color: '#F9F9F6', borderColor: '#4A5568', borderWidth: 2, borderType: 'dashed', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)', opacity: 1 };
        symbolSize = 16;
        const labelPos = y > 500 ? ('top' as const) : ('bottom' as const);
        label = { show: true, position: labelPos, formatter: '{b}', fontSize: 11, color: '#4A5568', fontWeight: 'bold' };
      }

      // Step 2: 家族暗网亮起 (在 Step 3 及以后，隐藏紫色字体和节点高亮，以聚焦红色内鬼)
      if (step === 2 && isFamily && !isMole) {""")

content = content.replace("if (step >= 2 && isMole)", "if (step >= 3 && isMole)")
content = content.replace("else if (step === 1 && isMole)", "else if (step === 2 && isMole)")

# 6
content = content.replace(
"""        x: x,
        y: y,
        symbolSize: symbolSize,""",
"""        x: x,
        y: y,
        symbol: symbol,
        symbolSize: symbolSize,""")

# 7
content = content.replace("if (step >= 1) {\n      processedNodes", "if (step >= 2) {\n      processedNodes")
content = content.replace("if (step === 1 && isSourceFamily && isTargetFamily)", "if (step === 2 && isSourceFamily && isTargetFamily)")
content = content.replace("if (step >= 2 && isMoleEdge && isPokEdge)", "if (step >= 3 && isMoleEdge && isPokEdge)")
content = content.replace("else if (isPokEdge && step < 2)", "else if (isPokEdge && step < 3)")
content = content.replace("if (step >= 2 && pokId)", "if (step >= 3 && pokId)")

# 8
content = content.replace("if (step === 3) {\n      // Step 3: 脉冲警报动效", "if (step === 4) {\n      // Step 4: 脉冲警报动效")
content = content.replace("if (step === 1) {\n      // 动态计算每个家族", "if (step === 2) {\n      // 动态计算每个家族")
content = content.replace("if (step === 2) {\n      const edvard =", "if (step === 3) {\n      const edvard =")

# 9 Graphic arrays
old_graphics = """    if (step === 0) {
      graphics.push({
        id: 'hint_text_0', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '点击图表，揭开隐藏在底层的家族暗网...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 1) {
      graphics.push({
        id: 'group_step1', type: 'group', left: '2%', top: '25%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 240, height: 110, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '裙带暗网浮现：\\n看似无关的底层与中层员工，\\n通过家族血脉构成了私密情报网。\\n\\n* Vann/Lagos：同受污染残害的死者家属\\n* Bodrogi：与极端组织 POK 创始人同姓', fill: '#6B4C9A', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      graphics.push({
        id: 'hint_text_1', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '再次点击图表，追踪内鬼与致命的留门人...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 2 || step === 3) {
      graphics.push({
        id: 'group_step2', type: 'group', right: '5%', top: '10%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 250, height: 90, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: 'REMEMBER JULIANA!\\n安保核心的 Vann 兄弟与死去的女孩同姓。\\n案发当晚，弟弟是最后一个离开大楼的人，\\n他为绑匪留了门。', fill: '#8C3636', font: 'bold 12px Georgia, serif', lineHeight: 20 } }
        ]
      });
      
      if (step === 2) {
        graphics.push({
          id: 'hint_text_2', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
          style: { text: '最后点击，查看被截获的机密通讯证据...', fill: '#888', font: 'italic 14px Georgia' }
        });
      }
    }
    
    // step 3 的邮件框现在直接用 React 渲染，不在 ECharts graphic 中处理"""

new_graphics = """    if (step === 0) {
      graphics.push({
        id: 'hint_text_0', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '点击图表，识别隐藏在底层的“幽灵员工”...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 1) {
      graphics.push({
        id: 'group_step1_ghosts', type: 'group', left: '2%', top: '25%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 240, height: 85, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '身份缺失的幽灵：\\n安保部与设施部潜伏着 19 名\\n没有简历（CV）的员工，\\n他们是安保系统的巨大漏洞。', fill: '#4A5568', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      graphics.push({
        id: 'hint_text_1', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '再次点击图表，揭开这些幽灵背后的家族暗网...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 2) {
      graphics.push({
        id: 'group_step2', type: 'group', left: '2%', top: '25%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 240, height: 110, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '裙带暗网浮现：\\n看似无关的底层与中层员工，\\n通过家族血脉构成了私密情报网。\\n\\n* Vann/Lagos：同受污染残害的死者家属\\n* Bodrogi：与极端组织 POK 创始人同姓', fill: '#6B4C9A', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      graphics.push({
        id: 'hint_text_2', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '再次点击图表，追踪内鬼与致命的留门人...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 3 || step === 4) {
      graphics.push({
        id: 'group_step3', type: 'group', right: '5%', top: '10%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 250, height: 90, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: 'REMEMBER JULIANA!\\n安保核心的 Vann 兄弟与死去的女孩同姓。\\n案发当晚，弟弟是最后一个离开大楼的人，\\n他为绑匪留了门。', fill: '#8C3636', font: 'bold 12px Georgia, serif', lineHeight: 20 } }
        ]
      });
      
      if (step === 3) {
        graphics.push({
          id: 'hint_text_3', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
          style: { text: '最后点击，查看被截获的机密通讯证据...', fill: '#888', font: 'italic 14px Georgia' }
        });
      }
    }
    
    // step 4 的邮件框现在直接用 React 渲染，不在 ECharts graphic 中处理"""

content = content.replace(old_graphics, new_graphics)

# 10
content = content.replace("{/* Step 3 的邮件框直接用 React 渲染 */}\n      {step === 3 && (", "{/* Step 4 的邮件框直接用 React 渲染 */}\n      {step === 4 && (")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update completed successfully.")
