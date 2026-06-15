import React, { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { EXECUTIVES_L1, MANAGERS_L2 } from '@/data/employeeConstants';

type NetworkNodeInput = {
  node_id: string;
  label?: string;
  node_type?: string;
  [key: string]: unknown;
};

type NetworkEdgeInput = {
  source: string;
  target: string;
  [key: string]: unknown;
};

type ChartStyle = Record<string, unknown>;

type ProcessedNode = {
  id: string;
  name: string;
  value: [number, number];
  x: number;
  y: number;
  symbol?: string;
  symbolSize: number;
  itemStyle: ChartStyle;
  label: ChartStyle;
  category?: string;
  z?: number;
};

type ProcessedEdge = {
  source: string;
  target: string;
  lineStyle: ChartStyle;
};

/**
 * Slide6Collapse — "金蝉脱壳"内部异常通信与文件转移可视化。
 *
 * 数据溯源注意：
 * - 网络节点和边来自 network_nodes.csv / network_edges.csv，真实可查。
 * - Step 2 弹出层中展示的 "[CONFIDENTIAL INTERCEPT]" 邮件正文
 *   （"安保部内部正在传播 POK 的极端宣传材料…他们掌握了所有钥匙"）
 *   是研究者基于 emails.csv **邮件标题**（Subject: "RE: FW: ARISE - Inspiration
 *   for Defenders of Kronos"）和上下文推断的叙事填充。
 *   **原始 emails.csv 仅含邮件头（From/To/Subject/Date），无邮件正文。**
 *   该文本不应被理解为真实的被截获邮件内容。
 * - 文件转移/删除/异常离场等叙事线索来自邮件标题的时序聚类分析，
 *   属于"基于模式的推断"而非"直接证据"。
 */
interface Slide6CollapseProps {
  nodesData: Record<string, unknown>[];
  edgesData: Record<string, unknown>[];
}

const Slide6Collapse: React.FC<Slide6CollapseProps> = ({ nodesData, edgesData }) => {
  const [step, setStep] = useState(0);

  const handleChartClick = () => {
    setStep((prev) => (prev < 2 ? prev + 1 : 0));
  };

  const option = useMemo(() => {
    if (!nodesData || nodesData.length === 0) return {};
    const networkNodesData = nodesData as NetworkNodeInput[];
    const networkEdgesData = edgesData as NetworkEdgeInput[];

    const isIntro = step === 0;
    const isAnomaly = step === 1;
    const isReveal = step === 2;

    // 核心高管层 (Layer 1)
    const execsL1 = EXECUTIVES_L1;

    // 部门经理层 (Layer 2)
    const managersL2 = MANAGERS_L2;

    // 去重机制
    const uniqueNodesMap = new Map<string, NetworkNodeInput>();
    [...networkNodesData].forEach(node => {
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
    const processedNodes = sortedNodesData.map((node): ProcessedNode => {
      let x = 0, y = 0, itemStyle: ChartStyle = {}, symbolSize = 10, label: ChartStyle = { show: false };
      
      const nodeName = node.label || node.node_id;
      
      const isL1 = execsL1.includes(node.node_id) || execsL1.some(e => nodeName.includes(e));
      const isL2 = managersL2.includes(node.node_id) || managersL2.some(e => nodeName.includes(e));

      const isCEO = nodeName.includes('Sten Sanjorge');
      const isPOK = nodeName.includes('POK') || nodeName.includes('Protectors_of_Kronos');

      if (isL1) {
        const totalWidthL1 = 4 * 125;
        const startXL1 = centerX - totalWidthL1 / 2;
        x = startXL1 + topCount * 125;
        y = 100;
        topCount++;
        itemStyle = { color: '#2C3E50', opacity: isIntro ? 0.34 : 0.2 }; 
        
        let title = 'SVP';
        if (isCEO) title = 'CEO';
        else if (nodeName.includes('Ingrid')) title = 'CFO';
        else if (nodeName.includes('Ada')) title = 'CIO';
        else if (nodeName.includes('Orhan')) title = 'COO';
        else if (nodeName.includes('Willem')) title = 'Advisor';

        symbolSize = title === 'CEO' ? 50 : 35;
        label = {
          show: true,
          position: 'bottom' as const,
          formatter: title,
          fontSize: title === 'CEO' ? 18 : 15,
          color: isIntro ? '#2C3E50' : '#1A202C',
          fontWeight: 'bold'
        };

        if ((isAnomaly || isReveal) && isCEO) {
          x = centerX + 150;
          y = 100;
          itemStyle = { color: '#D4AF37', shadowBlur: 25, shadowColor: '#D4AF37', opacity: 1 };
          symbolSize = 46;
          label = {
            show: true,
            position: 'bottom' as const,
            formatter: isReveal ? 'CEO\n核心发信人' : 'CEO\n异常通信源头',
            fontSize: 15,
            fontWeight: 'bold',
            color: '#D4AF37'
          };
        } else if (isAnomaly || isReveal) {
          itemStyle = { color: '#2C3E50', opacity: 0.08 };
          label = { ...label, color: '#A0AEC0' };
        }

      }
      else if (isL2) {
        const totalWidthL2 = 3 * 150;
        const startXL2 = centerX - totalWidthL2 / 2;
        x = startXL2 + middleCount * 150;
        y = 280;
        middleCount++;
        itemStyle = { color: '#2C3E50', opacity: isIntro ? 0.28 : 0.2 };
        
        let dept = 'Manager';
        if (nodeName.includes('Lidelse')) dept = 'Engineering';
        else if (nodeName.includes('Bertrand')) dept = 'Facilities';
        else if (nodeName.includes('Linnea')) dept = 'IT';
        else if (nodeName.includes('Felix')) dept = 'Security';

        symbolSize = 25;
        label = { show: true, position: 'bottom' as const, formatter: dept, fontSize: 13, color: '#2D3748', fontWeight: 'bold' };

        if (isAnomaly || isReveal) {
          itemStyle = { color: '#2C3E50', opacity: 0.04 };
          label = { show: false };
        }
      }
      else if (isPOK) {
        x = centerX + 320; y = 450;
        itemStyle = { color: '#718096', opacity: isIntro ? 0.18 : 0.03 };
        symbolSize = isIntro ? 16 : 10;
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
        itemStyle = { color: '#2C3E50', opacity: isIntro ? 0.12 : isAnomaly ? 0.02 : 0.015 };
        symbolSize = isIntro ? 13 : 10; 

        if (nodeName.includes('Henk Mies')) { // Truck Driver
          x = centerX + 45;
          y = 625;
          itemStyle = { color: isAnomaly || isReveal ? '#D4AF37' : '#2C3E50', opacity: isAnomaly || isReveal ? 1 : 0.05 };
          symbolSize = isAnomaly || isReveal ? 28 : 12;
          label = {
            show: isAnomaly || isReveal,
            position: 'right' as const,
            formatter: isReveal ? 'Henk Mies\n底层接收者' : 'Henk Mies\nTruck Driver',
            fontSize: 13,
            color: '#D4AF37',
            fontWeight: 'bold'
          };
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

    if (isReveal) {
      processedNodes.push(
        {
          id: 'Files_Node_Virtual',
          name: 'Files',
          value: [centerX + 315, 325],
          x: centerX + 315,
          y: 325,
          symbolSize: 34,
          itemStyle: { color: '#F6AD55', opacity: 1, shadowBlur: 12, shadowColor: 'rgba(246,173,85,0.45)' },
          label: { show: true, position: 'right', formatter: '"Files"', color: '#C05621', fontSize: 14, fontWeight: 'bold' },
          category: 'document',
          z: 3
        },
        {
          id: 'Plane_Node_Virtual',
          name: 'Private Plane',
          value: [centerX + 355, 90],
          x: centerX + 355,
          y: 90,
          symbolSize: 36,
          itemStyle: { color: '#D4AF37', opacity: 1, shadowBlur: 16, shadowColor: '#D4AF37' },
          label: { show: true, position: 'right', formatter: 'Private Plane', color: '#D4AF37', fontSize: 14, fontWeight: 'bold' },
          category: 'transport',
          z: 3
        }
      );
    }

    const uniqueProcessedNodes: ProcessedNode[] = [];
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
    const rawEdges: ProcessedEdge[] = [];
    
    if (isIntro) {
      networkEdgesData.forEach((edge) => {
        let sourceName = edge.source;
        let targetName = edge.target;
        if (sourceName.includes('Sten') && sourceName.includes('Sanjorge')) sourceName = 'Sten Sanjorge Jr.';
        if (targetName.includes('Sten') && targetName.includes('Sanjorge')) targetName = 'Sten Sanjorge Jr.';
        
        if (validNodeIds.has(sourceName) && validNodeIds.has(targetName)) {
          rawEdges.push({
            source: sourceName,
            target: targetName,
            lineStyle: { width: 1.4, color: '#7A8797', opacity: 0.18, curveness: 0.05 }
          });
        }
      });
    }

    const actualCeoNode = allNodes.find(n => n.id === 'Sten Sanjorge Jr.');
    const actualCeoId = actualCeoNode ? actualCeoNode.id : null;

    const actualTruckNode = allNodes.find(n => n.name.includes('Henk Mies'));
    const actualTruckId = actualTruckNode ? actualTruckNode.id : null;

    if (isAnomaly && actualCeoId && actualTruckId) {
      rawEdges.push({
        source: actualCeoId,
        target: actualTruckId,
        lineStyle: { width: 5, color: '#D4AF37', opacity: 1, curveness: 0.06 }
      });
    } else if (isReveal && actualCeoId && actualTruckId) {
      rawEdges.push(
        { source: actualCeoId, target: actualTruckId, lineStyle: { width: 5, color: '#D4AF37', opacity: 1, curveness: 0.06 }},
        { source: actualCeoId, target: actualCeoId, lineStyle: { width: 2, color: '#D4AF37', opacity: 0.85, curveness: 0.45 }},
        { source: actualCeoId, target: actualCeoId, lineStyle: { width: 2, color: '#D4AF37', opacity: 0.7, curveness: 0.7 }},
        { source: actualCeoId, target: 'Files_Node_Virtual', lineStyle: { width: 4, color: '#F6AD55', type: 'dashed', opacity: 0.95, curveness: 0.05 }},
        { source: 'Files_Node_Virtual', target: actualTruckId, lineStyle: { width: 4, color: '#F6AD55', type: 'dashed', opacity: 0.95, curveness: 0.08 }},
        { source: actualCeoId, target: 'Plane_Node_Virtual', lineStyle: { width: 4, color: '#D4AF37', opacity: 0.95, curveness: -0.18 }}
      );
    }

    const safeEdges = rawEdges.filter(e => validNodeIds.has(e.source) && validNodeIds.has(e.target));

    // 所有叙事弹窗已移除，只保留关键标注
    const graphics: ChartStyle[] = [];

    // 只保留 ANOMALY 水印作为视觉效果
    if (isAnomaly) {
      graphics.push({
        id: 'anomaly_tag', type: 'text', right: '7%', top: '34%', rotation: -0.12, zlevel: 10,
        style: { text: 'ANOMALY', fill: 'rgba(212, 175, 55, 0.18)', font: 'bold 50px Impact, sans-serif' }
      });
    }

    const titleText = isAnomaly
      ? '谁在删除真相？'
      : isReveal
        ? '谁在消失，谁在转移文件？'
        : '谁在消失，谁在删除真相？';

    const subtextText = isAnomaly
      ? '第一步：标出顶层与底层之间不该出现的黄色通信线'
      : isReveal
        ? '第二步：顺着通信记录，追踪 Files、离场路径与高层异常'
        : '金蝉脱壳图：先看完整通信网络，再点击标出异常联络';

    return {
      backgroundColor: 'transparent',
      title: {
        text: titleText,
        subtext: subtextText,
        left: '5%', top: '3%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333', fontSize: 14 }
      },
      grid: { top: '13%', bottom: '5%', left: '5%', right: '5%' },
      xAxis: { type: 'value', min: 0, max: 1050, show: false },
      yAxis: { type: 'value', min: 0, max: 700, show: false, inverse: true },
      animationDurationUpdate: 1200,
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
