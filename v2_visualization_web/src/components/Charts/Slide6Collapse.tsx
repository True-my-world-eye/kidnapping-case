import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide6CollapseProps {
  nodesData: any[];
  edgesData: any[];
}

const Slide6Collapse: React.FC<Slide6CollapseProps> = ({ nodesData, edgesData }) => {
  const [step, setStep] = useState(0);

  const handleChartClick = () => {
    setStep((prev) => (prev < 2 ? prev + 1 : 0));
  };

  const option = useMemo(() => {
    if (!nodesData || nodesData.length === 0) return {};

    // 核心高管层 (Layer 1)
    const execsL1 = [
      'Sten Sanjorge Jr.', 'Sten_Sanjorge',
      'Ingrid Barranco', 'Ingrid_Barranco',
      'Ada Campo-Corrente', 'Ada_Campo_Corrente',
      'Orhan Strum', 'Orhan_Strum',
      'Willem Vasco-Pais', 'Willem_Vasco_Pais'
    ];

    // 部门经理层 (Layer 2)
    const managersL2 = [
      'Lidelse Dedos', 'Lidelse_Dedos',
      'Bertrand Ovan', 'Bertrand_Ovan',
      'Linnea Bergen', 'Linnea_Bergen',
      'Felix Resumir', 'Felix_Resumir'
    ];

    // 去重机制
    const uniqueNodesMap = new Map();
    [...nodesData].forEach(node => {
      const nodeName = node.label || node.node_id;
      const normalizedName = nodeName.replace(/_/g, ' ').replace(/Jr\./g, '').trim().toLowerCase();
      
      if (normalizedName.includes('sten sanjorge')) {
        if (!uniqueNodesMap.has('sten_sanjorge_merged')) {
          uniqueNodesMap.set('sten_sanjorge_merged', { ...node, node_id: 'Sten Sanjorge Jr.', label: 'Sten Sanjorge Jr.' });
        }
      } else {
        if (!uniqueNodesMap.has(normalizedName)) {
          uniqueNodesMap.set(normalizedName, node);
        }
      }
    });

    const dedupedNodesData = Array.from(uniqueNodesMap.values());

    const family = ['Bodrogi', 'Vann', 'Osvaldo', 'Lagos', 'Ferro'];

    const sortedNodesData = dedupedNodesData.sort((a, b) => {
      const aName = a.label || a.node_id;
      const bName = b.label || b.node_id;
      const aFam = family.find(f => aName.includes(f)) || 'Z';
      const bFam = family.find(f => bName.includes(f)) || 'Z';
      return aFam.localeCompare(bFam);
    });

    let topCount = 0;
    let middleCount = 0;
    let nonFamilyCount = 0;
    let bodrogiCount = 0;
    let lagosCount = 0;
    let vannCount = 0;

    const centerX = 550;
    
    // 保持与 Slide5 一模一样的基础矩阵，确保切换时没有任何闪烁
    const processedNodes = sortedNodesData.map((node) => {
      let x, y, itemStyle, symbolSize = 10, label: any = { show: false };
      
      const nodeName = node.label || node.node_id;
      
      const isL1 = execsL1.includes(node.node_id) || execsL1.some(e => nodeName.includes(e));
      const isL2 = managersL2.includes(node.node_id) || managersL2.some(e => nodeName.includes(e));

      const isCEO = nodeName.includes('Sten Sanjorge');
      const isGov = nodeName.includes('Kronos_Government') || nodeName.includes('Government');
      const isPOK = nodeName.includes('POK') || nodeName.includes('Protectors_of_Kronos');

      if (isL1) {
        const totalWidthL1 = 4 * 125;
        const startXL1 = centerX - totalWidthL1 / 2;
        x = startXL1 + topCount * 125;
        y = 100;
        topCount++;
        itemStyle = { color: '#2C3E50', opacity: 0.2 }; 
        
        let title = 'SVP';
        if (isCEO) title = 'CEO';
        else if (nodeName.includes('Ingrid')) title = 'CFO';
        else if (nodeName.includes('Ada')) title = 'CIO';
        else if (nodeName.includes('Orhan')) title = 'COO';
        else if (nodeName.includes('Willem')) title = 'Advisor';

        symbolSize = title === 'CEO' ? 50 : 35;
        label = { show: true, position: 'bottom' as const, formatter: title, fontSize: title === 'CEO' ? 18 : 15, color: '#1A202C', fontWeight: 'bold' };

        // Step 1: 高管参与掩盖
        if (step >= 1 && !isCEO) {
            itemStyle = { color: '#8C3636', opacity: 0.9 };
            label.color = '#8C3636';
        }

        // Step 2: CEO 逃亡
        if (step >= 2 && isCEO) {
            x = centerX + 200;
            y = 30; // 防止飞出屏幕
            itemStyle = { color: '#D4AF37', shadowBlur: 20, shadowColor: '#D4AF37', opacity: 1 };
            symbolSize = 40;
            label = { show: true, position: 'bottom' as const, formatter: 'ESCAPED', fontSize: 16, fontWeight: 'bold', color: '#D4AF37' };
        } else if (step === 1 && isCEO) {
            itemStyle = { color: '#2C3E50', opacity: 0.2 }; 
        }

      }
      else if (isL2) {
        const totalWidthL2 = 3 * 150;
        const startXL2 = centerX - totalWidthL2 / 2;
        x = startXL2 + middleCount * 150;
        y = 280;
        middleCount++;
        itemStyle = { color: '#2C3E50', opacity: 0.2 };
        
        let dept = 'Manager';
        if (nodeName.includes('Lidelse')) dept = 'Engineering';
        else if (nodeName.includes('Bertrand')) dept = 'Facilities';
        else if (nodeName.includes('Linnea')) dept = 'IT';
        else if (nodeName.includes('Felix')) dept = 'Security';

        symbolSize = 25;
        label = { show: true, position: 'bottom' as const, formatter: dept, fontSize: 13, color: '#2D3748', fontWeight: 'bold' };
      }
      else if (isPOK) {
        x = centerX + 320; y = 450;
        itemStyle = { color: '#AAAAAA', opacity: 0.1 };
        symbolSize = 15;
      }
      else if (isGov) {
        x = centerX - 300; y = 350; // 政府位置
        itemStyle = { color: step >= 1 ? '#D4AF37' : '#2C3E50', opacity: step >= 1 ? 1 : 0 };
        symbolSize = step >= 1 ? 45 : 15;
        label = { show: step >= 1, position: 'bottom' as const, formatter: 'Kronos Government', fontSize: 15, fontWeight: 'bold', color: '#D4AF37' };
      }
      else {
        // Layer 3 (General Employees) - 保持与 Slide5 相同的物理坐标，以实现无缝切换
        if (nodeName.includes('Bodrogi')) {
          x = centerX - 240 + (bodrogiCount % 3) * 45;
          y = 570 + Math.floor(bodrogiCount / 3) * 40;
          bodrogiCount++;
        } else if (nodeName.includes('Lagos')) {
          x = centerX - 40 + (lagosCount % 3) * 45;
          y = 570 + Math.floor(lagosCount / 3) * 40;
          lagosCount++;
        } else if (nodeName.includes('Vann') || nodeName.includes('Osvaldo') || nodeName.includes('Ferro')) {
          x = centerX + 160 + (vannCount % 3) * 45;
          y = 570 + Math.floor(vannCount / 3) * 40;
          vannCount++;
        } else {
          const cols = 15;
          const spacingX = 600 / (cols - 1);
          const startXL3 = centerX - 300;
          x = startXL3 + (nonFamilyCount % cols) * spacingX;
          y = 420 + Math.floor(nonFamilyCount / cols) * 40;
          nonFamilyCount++;
        }
        
        // x += (Math.random() - 0.5) * 5;
        itemStyle = { color: '#2C3E50', opacity: 0.05 }; // Slide 6 底层不重要，透明度降极低
        symbolSize = 12; 

        if (nodeName.includes('Henk Mies')) { // Truck Driver
          if (step >= 2) {
            x = centerX + 350; y = 650; // 挪到右下角，避免和 Layer 3 员工重叠
          }
          itemStyle = { color: step >= 2 ? '#D4AF37' : '#2C3E50', opacity: step >= 2 ? 1 : 0.05 };
          symbolSize = step >= 2 ? 25 : 12;
          label = { show: step >= 2, position: 'left' as const, formatter: 'Truck Driver: Henk Mies\n(The "Files")', fontSize: 13, color: '#D4AF37', fontWeight: 'bold' };
        }
      }
      
      return {
        id: node.node_id,
        name: nodeName,
        value: [x, y],
        x: x,
        y: y,
        symbolSize: symbolSize,
        itemStyle: itemStyle,
        label: label,
        category: node.node_type,
        z: 2 
      };
    });

    // 虚拟 Media 节点
    if (step >= 1) {
      processedNodes.push({
        id: 'Media_Node_Virtual', name: 'Media',
        value: [centerX + 350, 150], x: centerX + 350, y: 150, symbolSize: 45, 
        itemStyle: { color: '#8C3636', opacity: 1, shadowBlur: 15, shadowColor: '#8C3636' },
        label: { show: true, position: 'bottom', formatter: 'News Media\n(DELETED)', color: '#8C3636', fontSize: 14, fontWeight: 'bold' },
        category: 'organization', z: 2
      });
    }

    const uniqueProcessedNodes = [];
    const seenNames = new Set();
    for (const node of processedNodes) {
      const normalizedName = node.name.replace(/_/g, ' ');
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueProcessedNodes.push(node);
      }
    }

    const allNodes = uniqueProcessedNodes;
    const validNodeIds = new Set(allNodes.map(n => n.id));
    const rawEdges: any[] = [];
    
    // Add base edges like Slide 5
    edgesData.forEach((edge) => {
      let sourceName = edge.source;
      let targetName = edge.target;
      if (sourceName.includes('Sten') && sourceName.includes('Sanjorge')) sourceName = 'Sten Sanjorge Jr.';
      if (targetName.includes('Sten') && targetName.includes('Sanjorge')) targetName = 'Sten Sanjorge Jr.';
      
      if (validNodeIds.has(sourceName) && validNodeIds.has(targetName)) {
        rawEdges.push({
          source: sourceName,
          target: targetName,
          lineStyle: { width: 1, color: '#9CA3AF', opacity: 0.02, curveness: 0.05 }
        });
      }
    });

    const actualCeoNode = allNodes.find(n => n.id === 'Sten Sanjorge Jr.');
    const actualCeoId = actualCeoNode ? actualCeoNode.id : null;

    const actualGovNode = allNodes.find(n => n.name.includes('Government'));
    const actualGovId = actualGovNode ? actualGovNode.id : null;

    const actualTruckNode = allNodes.find(n => n.name.includes('Henk Mies'));
    const actualTruckId = actualTruckNode ? actualTruckNode.id : null;

    if (step === 1 && actualGovId) {
      execsL1.forEach(exec => {
        if(exec.includes('Sten Sanjorge')) return; // CEO 不参与这部分连线
        const eNode = allNodes.find(n => n.name.includes(exec) || n.id.includes(exec));
        if (eNode) {
          rawEdges.push({ source: actualGovId, target: eNode.id, lineStyle: { width: 3, color: '#D4AF37', opacity: 0.8, curveness: 0.2 }});
          rawEdges.push({ source: eNode.id, target: 'Media_Node_Virtual', lineStyle: { width: 2, color: '#8C3636', type: 'dashed', opacity: 0.8, curveness: 0.1 }});
        }
      });
    } else if (step >= 2 && actualCeoId && actualTruckId) {
      rawEdges.push({ source: actualCeoId, target: actualTruckId, lineStyle: { width: 4, color: '#D4AF37', type: 'dashed', opacity: 0.9, curveness: 0.2 }});
      for(let i=0; i<3; i++) {
         rawEdges.push({ source: actualCeoId, target: actualCeoId, lineStyle: { width: 2, color: '#D4AF37', curveness: 0.5 + i*0.2, opacity: 0.8 }});
      }
    }

    const safeEdges = rawEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    const graphics: any[] = [];

    if (step === 0) {
      graphics.push({
        id: 'hint_text_0', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '点击图表，揭露高层掩盖真相的操作...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 1) {
      graphics.push({
        id: 'group_step1', type: 'group', left: '2%', bottom: '15%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 260, height: 90, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '高层联合封口：\n政府与公司高管紧密勾结。\n国际媒体上抗议者的照片被强行\n【DELETED（删除）】。', fill: '#8C3636', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      graphics.push({
        id: 'hint_text_1', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '再次点击图表，追踪 CEO 案发时的去向...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 2) {
      graphics.push({
        id: 'group_step2', type: 'group', right: '2%', top: '15%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 300, height: 110, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '金蝉脱壳的局中局：\n案发前，CEO向自己发了23封加密邮件，\n并越级与卡车司机秘密交接 "Files"。\n案发时刻，他并未被绑架，\n而是乘坐绝密私人飞机逃离了小岛。', fill: '#D4AF37', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
    }

    return {
      backgroundColor: 'transparent',
      title: {
        text: '第三幕（下）：金蝉脱壳与消失的真相',
        subtext: '高层数据删改与逃亡轨迹',
        left: '5%', top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333', fontSize: 14 }
      },
      grid: { top: '5%', bottom: '5%', left: '5%', right: '5%' },
      xAxis: { type: 'value', min: 0, max: 1050, show: false },
      yAxis: { type: 'value', min: 0, max: 700, show: false, inverse: true },
      animationDurationUpdate: 2000,
      animationEasingUpdate: 'cubicInOut',
      series: [
        {
          type: 'graph', 
          coordinateSystem: 'cartesian2d',
          layout: 'none',
          data: allNodes, edges: safeEdges,
          roam: false, label: { position: 'right', formatter: '{b}' },
          lineStyle: { color: 'source', curveness: 0.3 }
        },
        // Background Layers
        {
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          silent: true,
          data: [],
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(44, 62, 80, 0.03)', borderWidth: 1, borderType: 'dashed', borderColor: '#2C3E50' },
            label: { position: 'insideTopLeft', color: '#2C3E50', fontSize: 13, fontWeight: 'bold', opacity: 0.7 },
            data: [
              // Layer 1
            [ 
              { name: 'Layer 1: Executive Suite (SVP & CEO)', coord: [centerX - 280, 40] }, 
              { coord: [centerX + 280, 160] } 
            ],
            // Layer 2
            [ 
              { name: 'Layer 2: Group Managers', coord: [centerX - 260, 200] }, 
              { coord: [centerX + 260, 330] } 
            ],
            // Layer 3
            [ 
              { name: 'Layer 3: General Employees / Security', coord: [centerX - 340, 360] }, 
              { coord: [centerX + 340, 700] } 
            ]
            ]
          }
        }
      ],
      graphic: { elements: graphics }
    };
  }, [nodesData, edgesData, step]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner relative overflow-hidden cursor-pointer" onClick={handleChartClick}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} className="react_for_echarts" opts={{ renderer: 'canvas' }} notMerge={true} />
    </div>
  );
};
export default Slide6Collapse;
