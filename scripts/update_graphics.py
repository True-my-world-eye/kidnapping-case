import sys

file_path = r'd:\数据可视化清晰版\数据整理(1)\数据整理\v2_visualization_web\src\components\Charts\Slide5Network.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the graphics array generation block
old_graphics = """    if (step === 0) {
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
    }"""

new_graphics = """    if (step === 0) {
      graphics.push({
        id: 'hint_text_0', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '点击图表，识别隐藏在底层的“幽灵员工”...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 1) {
      graphics.push({
        id: 'group_step1_ghosts', type: 'group', left: '2%', bottom: '15%', zlevel: 10,
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
        id: 'group_step2', type: 'group', left: '2%', bottom: '15%', zlevel: 10,
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
        id: 'group_step3', type: 'group', right: '2%', bottom: '15%', zlevel: 10,
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
    }"""

content = content.replace(old_graphics, new_graphics)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Graphics updated successfully.")