import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide5NetworkProps {
  nodesData: any[];
  edgesData: any[];
}

const Slide5Network: React.FC<Slide5NetworkProps> = ({ nodesData, edgesData }) => {
  const [step, setStep] = useState(0);

  const handleChartClick = () => {
    setStep((prev) => (prev < 4 ? prev + 1 : 0));
  };

  const option = useMemo(() => {
    if (!nodesData || !edgesData || nodesData.length === 0) return {};

    const moles = ['Loreto Bodrogi', 'Edvard Vann', 'Isia Vann', 'Loreto_Bodrogi', 'Edvard_Vann', 'Isia_Vann'];
    const coreMoles = ['Isia Vann', 'Loreto Bodrogi', 'Edvard Vann', 'Varja Lagos', 'Isia_Vann', 'Loreto_Bodrogi', 'Edvard_Vann', 'Varja_Lagos'];
    const family = ['Bodrogi', 'Vann', 'Osvaldo', 'Lagos', 'Ferro'];
    
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
    ];
    
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

    // 在开始处理之前，对 nodesData 进行彻底的去重
    // 由于数据集中可能有 "Sten Sanjorge Jr." 和 "Sten_Sanjorge" 等冗余实体
    const uniqueNodesMap = new Map();
    [...nodesData].forEach(node => {
      const nodeName = node.label || node.node_id;
      // 归一化名字：移除下划线、"Jr."、首尾空格，并转为小写用于判断唯一性
      const normalizedName = nodeName.replace(/_/g, ' ').replace(/Jr\./g, '').trim().toLowerCase();
      
      // 对于 CEO 特别处理：只要包含 sten sanjorge 就认为是同一个实体
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

    const sortedNodesData = dedupedNodesData.sort((a, b) => {
      const aName = a.label || a.node_id;
      const bName = b.label || b.node_id;
      const aFam = family.find(f => aName.includes(f)) || 'Z';
      const bFam = family.find(f => bName.includes(f)) || 'Z';
      return aFam.localeCompare(bFam);
    });

    const familyClusters: Record<string, { cx: number, cy: number, current: number }> = {
      Bodrogi: { cx: 350, cy: 560, current: 0 },
      Lagos: { cx: 500, cy: 560, current: 0 },
      Vann: { cx: 650, cy: 560, current: 0 },
      OtherFamily: { cx: 800, cy: 560, current: 0 }
    };

    const getFamilyCluster = (name: string) => {
      if (name.includes('Bodrogi')) return 'Bodrogi';
      if (name.includes('Lagos')) return 'Lagos';
      if (name.includes('Vann')) return 'Vann';
      if (name.includes('Osvaldo') || name.includes('Ferro')) return 'OtherFamily';
      return null;
    };

    let topCount = 0;
    let middleCount = 0;
    let nonFamilyCount = 0;
    let bodrogiCount = 0;
    let lagosCount = 0;
    let vannCount = 0;

    // 1. 定义画布中心，大幅向左移动以确保所有内容在屏幕内
    const centerX = 550;
    
    // 预先计算 Layer 3 的总人数，以动态确定其高度
    const l3NodesCount = sortedNodesData.filter((node) => {
      const nodeName = node.label || node.node_id;
      const isL1 = execsL1.includes(node.node_id) || execsL1.some(e => nodeName.includes(e));
      const isL2 = managersL2.includes(node.node_id) || managersL2.some(e => nodeName.includes(e));
      const isPok = ['POK', 'Protectors_of_Kronos', 'Kronos_Government'].includes(node.node_id) || nodeName.includes('Government');
      return !isL1 && !isL2 && !isPok;
    }).length;

    const cols = 12;
    const l3Rows = Math.ceil(l3NodesCount / cols);
    const l3GridHeight = (l3Rows - 1) * 45;

    const processedNodes = sortedNodesData
      .filter(node => {
        const nodeName = node.label || node.node_id;
        return !(node.node_id === 'Kronos_Government' || nodeName.includes('Government'));
      })
      .map((node) => {
      let x, y, itemStyle, symbolSize = 10, label: any = { show: false };
      
      const nodeName = node.label || node.node_id;
      const isMole = moles.includes(node.node_id) || moles.includes(nodeName);
      const isFamily = family.some(f => nodeName.includes(f));
      const isGhost = ghosts.includes(node.node_id) || ghosts.includes(nodeName);
      
      const isL1 = execsL1.includes(node.node_id) || execsL1.some(e => nodeName.includes(e));
      const isL2 = managersL2.includes(node.node_id) || managersL2.some(e => nodeName.includes(e));

      if (isL1) {
        // Layer 1 有 5 个人，总宽度 500，间距设为 125
        const totalWidthL1 = 4 * 125;
        const startXL1 = centerX - totalWidthL1 / 2;
        x = startXL1 + topCount * 125;
        y = 100;
        topCount++;
        itemStyle = { color: '#2C3E50', opacity: step === 0 ? 0.9 : 0.2 }; 
        
        // 映射职位缩写，避免全名重叠
        let title = 'SVP';
        if (nodeName.includes('Sten Sanjorge')) title = 'CEO';
        else if (nodeName.includes('Ingrid')) title = 'CFO';
        else if (nodeName.includes('Ada')) title = 'CIO';
        else if (nodeName.includes('Orhan')) title = 'COO';
        else if (nodeName.includes('Willem')) title = 'Advisor';

        symbolSize = title === 'CEO' ? 50 : 35;
        label = { show: true, position: 'bottom' as const, formatter: title, fontSize: title === 'CEO' ? 18 : 15, color: '#1A202C', fontWeight: 'bold' };
      }
      else if (isL2) {
        // Layer 2 有 4 个人，总宽度 450，间距设为 150
        const totalWidthL2 = 3 * 150;
        const startXL2 = centerX - totalWidthL2 / 2;
        x = startXL2 + middleCount * 150;
        y = 280;
        middleCount++;
        itemStyle = { color: '#2C3E50', opacity: step === 0 ? 0.8 : 0.2 };
        
        // 映射部门名称，避免全名重叠
        let dept = 'Manager';
        if (nodeName.includes('Lidelse')) dept = 'Engineering';
        else if (nodeName.includes('Bertrand')) dept = 'Facilities';
        else if (nodeName.includes('Linnea')) dept = 'IT';
        else if (nodeName.includes('Felix')) dept = 'Security';

        symbolSize = 25;
        label = { show: true, position: 'bottom' as const, formatter: dept, fontSize: 13, color: '#2D3748', fontWeight: 'bold' };
      }
      else if (node.node_id === 'POK' || node.node_id === 'Protectors_of_Kronos') {
        x = centerX + 320; y = 450; // 大幅左移 POK 节点
        itemStyle = { color: step >= 3 ? '#526E4F' : '#AAAAAA', opacity: step >= 3 ? 1 : 0.1 };
        symbolSize = step >= 3 ? 55 : 15;
        label = { show: step >= 3, position: 'top' as const, formatter: 'POK', fontSize: 18, fontWeight: 'bold', color: '#526E4F' }; // 标签放上方而不是右边
      }
      else {
        // Layer 3 (General Employees)
        // 家族与非家族分离布局：非家族在上方铺成网格，家族在下方分左中右聚集
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
          // 普通非家族员工网格
          const cols = 15;
          const spacingX = 600 / (cols - 1);
          const startXL3 = centerX - 300;
          x = startXL3 + (nonFamilyCount % cols) * spacingX;
          y = 420 + Math.floor(nonFamilyCount / cols) * 40;
          nonFamilyCount++;
        }
        
        // 稍微加一点极小的随机偏移让矩阵看起来没那么死板（可选）
        // x += (Math.random() - 0.5) * 5;
        
        itemStyle = { color: '#2C3E50', opacity: step === 0 ? 0.6 : 0.1 };
        symbolSize = 12; // 放大底层员工
      }
      
      let symbol = 'circle';
      if (step >= 1 && isGhost) {
        symbol = 'emptyCircle'; // 幽灵员工变为虚线空心圆
      }

      // Step 1: 幽灵员工亮起
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
      }

      // Step 2: 家族暗网亮起 (在 Step 3 及以后，隐藏紫色字体和节点高亮，以聚焦红色内鬼)
      if (step === 2 && isFamily && !isMole) {
        itemStyle = { color: '#6B4C9A', shadowBlur: 15, shadowColor: '#6B4C9A', opacity: 1 };
        symbolSize = 18;
        // 智能选择标签位置：对于偏下的节点，标签放在上方；对于偏上的节点，标签放在下方
        const labelPos = y > 500 ? ('top' as const) : ('bottom' as const);
        label = { show: true, position: labelPos, formatter: '{b}', fontSize: 11, color: '#6B4C9A', fontWeight: 'bold' };
      }

      // Step 2 & 3: 内鬼变红
      if (step >= 3 && isMole) {
        itemStyle = { color: '#8C3636', borderColor: '#FFFFFF', borderWidth: 2, shadowBlur: 15, shadowColor: '#8C3636', opacity: 1 };
        symbolSize = 28;
        // 智能选择标签位置：对于偏右的节点，标签放在左边；对于偏左的节点，标签放在右边
        const labelPos = x > centerX ? ('left' as const) : ('right' as const);
        label = { show: true, position: labelPos, formatter: '{b}', fontSize: 13, fontWeight: 'bold', color: '#8C3636' };
      } else if (step === 2 && isMole) {
        itemStyle = { color: '#6B4C9A', shadowBlur: 15, shadowColor: '#6B4C9A', opacity: 1 };
        symbolSize = 18;
        // 智能选择标签位置
        const labelPos = y > 500 ? ('top' as const) : ('bottom' as const);
        label = { show: true, position: labelPos, formatter: '{b}', fontSize: 11, color: '#6B4C9A', fontWeight: 'bold' };
      }

      return {
        id: node.node_id,
        name: nodeName,
        value: [x, y],
        x: x,
        y: y,
        symbol: symbol,
        symbolSize: symbolSize,
        itemStyle: itemStyle,
        label: label,
        category: node.node_type,
        z: 2 // 确保节点在框上方
      };
    });

    // 去重机制：数据集中可能包含同一人的别名（如带下划线和不带下划线）
    // 通过 name 进行简单的去重，保证高层节点只渲染一次
    const uniqueProcessedNodes = [];
    const seenNames = new Set();
    for (const node of processedNodes) {
      // 归一化名字：移除下划线
      const normalizedName = node.name.replace(/_/g, ' ');
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueProcessedNodes.push(node);
      }
    }

    const allNodes = [...uniqueProcessedNodes];
    const validNodeIds = new Set(allNodes.map(n => n.id));
    const nodesMap = new Map();
    uniqueProcessedNodes.forEach(n => nodesMap.set(n.id, n));

    const familyCenters: Record<string, { xs: number[], ys: number[] }> = {
      Vann: { xs: [], ys: [] },
      Lagos: { xs: [], ys: [] },
      Bodrogi: { xs: [], ys: [] }
    };

    if (step >= 2) {
      processedNodes.forEach(n => {
        const matchedFamily = Object.keys(familyCenters).find(f => n.name.includes(f));
        if (matchedFamily) {
          familyCenters[matchedFamily].xs.push(n.x);
          familyCenters[matchedFamily].ys.push(n.y);
        }
      });
    }

    // 处理边：由于节点合并了，需要修复边中指向旧别名的引用
    const processedEdges = edgesData.map((edge, idx) => {
      let lineStyle: any = { width: 1, color: '#9CA3AF', opacity: step === 0 ? 0.2 : 0.02, curveness: 0.05 }; // 官方层级为微弱直线
      
      let sourceName = edge.source;
      let targetName = edge.target;

      // 修复边的引用：凡是包含 Sten Sanjorge 的别名，全指向标准 ID
      if (sourceName.includes('Sten') && sourceName.includes('Sanjorge')) sourceName = 'Sten Sanjorge Jr.';
      if (targetName.includes('Sten') && targetName.includes('Sanjorge')) targetName = 'Sten Sanjorge Jr.';

      const isSourceFamily = family.some(f => sourceName.includes(f));
      const isTargetFamily = family.some(f => targetName.includes(f));
      const isMoleEdge = moles.includes(edge.source) || moles.includes(edge.target);
      const isPokEdge = ['POK', 'Protectors_of_Kronos'].includes(edge.source) || ['POK', 'Protectors_of_Kronos'].includes(edge.target);

      const sourceNode = nodesMap.get(sourceName);
      const targetNode = nodesMap.get(targetName);

      if (!sourceNode || !targetNode) return null;

      const isCrossLayer = Math.abs(sourceNode.y - targetNode.y) > 100; // 跨层级判定

      if (step === 2 && isSourceFamily && isTargetFamily) {
        // 家族暗网：有机曲线，仅在 Step 1 显示
        lineStyle = { 
          width: isCrossLayer ? 2 : 1.5, 
          color: isCrossLayer ? 'rgba(127, 29, 29, 0.6)' : 'rgba(107, 76, 154, 0.6)', 
          opacity: 0.8, 
          type: 'solid', 
          curveness: 0.15 + (idx % 4) * 0.1, // fan out
          shadowBlur: isCrossLayer ? 2 : 0, 
          shadowColor: isCrossLayer ? 'rgba(127, 29, 29, 0.4)' : 'transparent'
        };
      }

      if (step >= 3 && isMoleEdge && isPokEdge) {
        lineStyle = { width: 2.5, color: 'rgba(140, 54, 54, 0.8)', opacity: 0.9, type: 'dashed', curveness: 0.2 + (idx % 3) * 0.1 };
      } else if (isPokEdge && step < 3) {
        lineStyle = { opacity: 0 }; 
      }

      return { source: sourceName, target: targetName, lineStyle: lineStyle };
    }).filter(Boolean); // 过滤掉 null 边

    const pokNode = processedNodes.find(n => n.id === 'POK' || n.id === 'Protectors_of_Kronos');
    const pokId = pokNode ? pokNode.id : null;

    if (step >= 3 && pokId) {
      moles.filter(m => m.includes('_')).forEach(mole => {
        if (validNodeIds.has(mole)) {
          processedEdges.push({
            source: pokId,
            target: mole,
            lineStyle: { width: 3, color: '#8C3636', opacity: 0.9, type: 'dashed', curveness: 0.2 }
          });
        }
      });
    }

    const safeEdges = processedEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    const series: any[] = [
      {
        type: 'graph',
        coordinateSystem: 'cartesian2d',
        layout: 'none', 
        data: allNodes, edges: safeEdges,
        roam: false, label: { position: 'right', formatter: '{b}' },
        lineStyle: { color: 'source', curveness: 0.3 }
      },
      // Background Layers dynamically generated to wrap all nodes tightly
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
            // Layer 1: 调整坐标以更好地框住高管层
            [ 
              { name: 'Layer 1: Executive Suite (SVP & CEO)', coord: [centerX - 280, 40] }, 
              { coord: [centerX + 280, 160] } 
            ],
            // Layer 2: 调整坐标以更好地框住部门经理层
            [ 
              { name: 'Layer 2: Group Managers', coord: [centerX - 260, 200] }, 
              { coord: [centerX + 260, 330] } 
            ],
            // Layer 3: 调整坐标以更好地框住所有员工（不包括 POK）
            [ 
              { name: 'Layer 3: General Employees / Security', coord: [centerX - 340, 360] }, 
              { coord: [centerX + 340, 700] } 
            ]
          ]
        }
      }
    ];

    if (step === 4) {
      // Step 4: 脉冲警报动效
      const pulseNodes = processedNodes.filter(n => coreMoles.includes(n.id) || coreMoles.some(m => n.name.includes(m.replace('_', ' '))));
      if (pulseNodes.length > 0) {
        series.push({
          type: 'effectScatter',
          coordinateSystem: 'cartesian2d',
          zlevel: 3,
          data: pulseNodes.map(n => ({
            value: [n.x, n.y],
            symbolSize: 25,
            itemStyle: { color: '#8C3636', shadowBlur: 10, shadowColor: '#8C3636' }
          })),
          rippleEffect: {
            brushType: 'stroke',
            scale: 4,
            period: 2,
            number: 3
          }
        });
      }
    }

    if (step === 2) {
      // 动态计算每个家族的中心顶部坐标，而不是写死硬编码
      const familyAverages = Object.entries(familyCenters).map(([name, coords]) => {
        if (coords.xs.length === 0) return null;
        const avgX = coords.xs.reduce((a, b) => a + b, 0) / coords.xs.length;
        const minY = Math.min(...coords.ys);
        return { name, cx: avgX, cy: minY };
      }).filter(Boolean);

      series.push({
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        silent: true,
        zlevel: 5,
        data: familyAverages.map((l: any) => ({
          // 将标签位置上移，避免与节点重叠或飞出屏幕
          value: [l.cx, Math.max(l.cy - 45, 380)],
          label: {
            show: true,
            formatter: `${l.name} 家族`,
            color: '#6B4C9A',
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            fontWeight: 'bold',
            backgroundColor: 'rgba(249, 249, 246, 0.95)',
            padding: [4, 8],
            borderRadius: 4
          }
        }))
      });
    }

    if (step === 3) {
      const edvard = processedNodes.find(n => n.id === 'Edvard Vann' || n.name.includes('Edvard Vann') || n.id === 'Edvard_Vann');
      if (edvard) {
        series.push({
          type: 'scatter',
          coordinateSystem: 'cartesian2d',
          silent: true,
          data: [],
          markLine: {
            silent: true,
            symbol: ['none', 'arrow'],
            symbolSize: 10,
            lineStyle: { color: '#8C3636', width: 1.5, type: 'dashed' },
            label: { 
              show: true, 
              formatter: 'Vann 兄弟：把持安保命脉', 
              position: 'start', 
              color: '#8C3636', 
              fontSize: 12,
              fontWeight: 'bold',
              backgroundColor: 'rgba(249, 249, 246, 0.95)', 
              padding: [4, 8],
              borderRadius: 4
            },
            data: [
              [
                // 将箭头起点更靠左，避免飞出屏幕
                { coord: [centerX + 150, 340] },
                // 精确指向 Edvard Vann 新的物理坐标
                { coord: [edvard.x + 10, edvard.y - 10] }
              ]
            ]
          }
        });
      }
    }

    // 为所有的 graphic 元素指定确切的 id，防止 ECharts 更新时崩溃
    const graphics: any[] = [];

    if (step === 0) {
      graphics.push({
        id: 'hint_text_0', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '点击图表，排查公司底层的异常“幽灵员工”...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 1) {
      graphics.push({
        id: 'group_step1_ghosts', type: 'group', left: '2%', bottom: '15%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 250, height: 100, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '排查异常：发现“幽灵员工”\n在排查底层架构时，我们发现了 19 名\n没有简历（CV）档案的员工。\n这是安保系统的巨大漏洞。', fill: '#4A5568', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      graphics.push({
        id: 'hint_text_1', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '再次点击图表，揭开这些幽灵背后的特殊身份...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 2) {
      graphics.push({
        id: 'group_step2', type: 'group', left: '2%', bottom: '15%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 280, height: 110, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '揭开身份：惊人的血缘巧合\n剥开幽灵员工的档案，暗网浮出水面：\n看似无关的底层，实则通过家族血脉构成了情报网。\n\n* Vann/Lagos：当年因污染死亡的女孩家属\n* Bodrogi：与极端组织 POK 创始人同姓', fill: '#6B4C9A', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      graphics.push({
        id: 'hint_text_2', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
        style: { text: '顺藤摸瓜，点击追踪内鬼与致命的留门人...', fill: '#888', font: 'italic 14px Georgia' }
      });
    } else if (step === 3 || step === 4) {
      graphics.push({
        id: 'group_step3', type: 'group', right: '2%', bottom: '15%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 260, height: 100, r: 4 }, style: { fill: 'rgba(249, 249, 246, 0.95)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
          { type: 'text', left: 15, top: 15, style: { text: '渗透安保核心：致命的留门人\n顺着血脉，我们最终锁定了安保部的 Vann 兄弟。\n案发当晚，弟弟是最后一个离开大楼的人，\n他为绑匪留了门。', fill: '#8C3636', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
        ]
      });
      
      if (step === 3) {
        graphics.push({
          id: 'hint_text_3', type: 'text', left: 'center', bottom: '5%', zlevel: 10,
          style: { text: '最后点击，提取安保服务器上的机密通讯铁证...', fill: '#888', font: 'italic 14px Georgia' }
        });
      }
    }
    
    // step 4 的邮件框现在直接用 React 渲染，不在 ECharts graphic 中处理

    return {
      backgroundColor: 'transparent',
      title: {
        text: '第三幕（上）：木马与暗网',
        subtext: '金字塔结构下的致命漏洞',
        left: '5%', top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333', fontSize: 14 }
      },
      grid: { top: '5%', bottom: '5%', left: '5%', right: '5%' },
      xAxis: { type: 'value', min: 0, max: 1050, show: false },
      yAxis: { type: 'value', min: 0, max: 700, show: false, inverse: true },
      animationDurationUpdate: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: series,
      // 添加 replace 模式，避免保留上一步的残影
      graphic: { elements: graphics }
    };
  }, [nodesData, edgesData, step]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner relative overflow-hidden cursor-pointer" onClick={handleChartClick}>
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} className="react_for_echarts" opts={{ renderer: 'canvas' }} notMerge={true} />
      
      {/* Step 4 的邮件框直接用 React 渲染 */}
      {step === 4 && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          backgroundColor: 'rgba(249, 249, 246, 0.95)'
        }}>
          <div style={{
            backgroundColor: '#F4F1EA',
            border: '2px solid #D3C9B5',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            padding: '32px',
            width: '550px'
          }}>
            <div style={{
              color: '#8C3636',
              fontWeight: 'bold',
              fontSize: '24px',
              marginBottom: '24px',
              fontFamily: 'Courier New, monospace'
            }}>[CONFIDENTIAL INTERCEPT]</div>
            <div style={{
              color: '#333333',
              fontFamily: 'Courier New, monospace',
              marginBottom: '24px',
              lineHeight: '2'
            }}>
              <div>Date : 2014-01-13 20:05</div>
              <div>From : Isia Vann</div>
              <div>To   : Loreto Bodrogi</div>
              <div>Subj : RE: FW: ARISE - Inspiration for Defenders of Kronos</div>
            </div>
            <div style={{
              borderTop: '2px dashed #D3C9B5',
              margin: '24px 0'
            }}></div>
            <div style={{
              color: '#2C3E50',
              fontWeight: 'bold',
              fontSize: '18px',
              fontFamily: 'Georgia, serif',
              lineHeight: '1.75'
            }}>
              <div>安保部内部正在传播 POK 的极端宣传材料。</div>
              <div>与此同时（1月9日-17日），他们频繁讨论了 CEO 1月20日的</div>
              <div>访问安保细节。</div>
              <div style={{ marginTop: '16px' }}>他们掌握了所有钥匙。</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Slide5Network;
