import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide3MediaBiasProps {
  data: any[];
}

const Slide3MediaBias: React.FC<Slide3MediaBiasProps> = ({ data }) => {
  const option = useMemo(() => {
    // 1. 生成“非对称气泡碰撞墙”数据 (Asymmetric Bubble Swarm Collision)
    // 极右侧边缘（85%-100%区域）的动态气泡墙，取代之前的死板条纹
    
    // 巨大的官方气泡墙（代表800+报道的碾压）
    const generateGovBubbles = (count: number) => {
      const nodes = [];
      for (let i = 0; i < count; i++) {
        // x 坐标死死压在 85 左右（中轴线左侧一点）
        const x = 85 - Math.random() * 5; 
        const y = Math.random() * 100;
        const size = 3 + Math.random() * 8; // 气泡大小不一
        nodes.push({
          value: [x, y],
          symbolSize: size,
          itemStyle: { 
            color: '#2C3E50', 
            opacity: 0.3 + Math.random() * 0.5 
          }
        });
      }
      return nodes;
    };

    // 被挤压的微弱反叛气泡（代表不足100篇的微弱声音）
    const generatePokBubbles = (count: number) => {
      const nodes = [];
      for (let i = 0; i < count; i++) {
        // x 坐标被挤压在 87-95 之间
        const x = 87 + Math.random() * 8;
        const y = 10 + Math.random() * 80; // 散落分布
        const size = 2 + Math.random() * 5;
        nodes.push({
          value: [x, y],
          symbolSize: size,
          itemStyle: { 
            color: '#8C3636', 
            opacity: 0.6 + Math.random() * 0.4 
          }
        });
      }
      return nodes;
    };

    const govBubbles = generateGovBubbles(350);
    const pokBubbles = generatePokBubbles(40);

    // 2. 词汇对抗数据 (主图数据)
    const wordData = [
      { target: '对 POK', govWord: 'Criminals (罪犯)', pokWord: 'Martyrs', govVolume: 745, pokVolume: 52 },
      { target: '对 高管', govWord: 'Victims (受害者)', pokWord: 'Eco-hostile', govVolume: 680, pokVolume: 85 },
      { target: '对 1.20', govWord: 'Kidnapping (绑架)', pokWord: 'Missing', govVolume: 890, pokVolume: 41 }
    ];
    
    const yAxisData = wordData.map(d => d.target).reverse();
    const govSeries = wordData.map(d => ({ value: -d.govVolume, label: d.govWord })).reverse();
    const pokSeries = wordData.map(d => ({ value: d.pokVolume, label: d.pokWord })).reverse();

    return {
      backgroundColor: 'transparent',
      title: {
        text: '词汇战争：定性与声量对比',
        subtext: '建制派洪流与被吞没的微弱发声',
        left: '5%',
        top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333', fontSize: 14 },
        zlevel: 10
      },
      // 重构后的完美比例网格布局
      grid: [
        // Grid 0: 最右侧气泡碰撞墙 (边缘氛围，占比压缩至20%)
        { top: '0%', bottom: '0%', left: '80%', right: '0%' },
        // Grid 1: 中间主图 (大幅放大，占据20%~75%的黄金位置)
        { top: '25%', bottom: '25%', left: '20%', right: '25%' }
      ],
      xAxis: [
        { gridIndex: 0, type: 'value', min: 0, max: 100, show: false },
        { gridIndex: 1, type: 'value', min: -1000, max: 300, show: false }
      ],
      yAxis: [
        { gridIndex: 0, type: 'value', min: 0, max: 100, show: false },
        { 
          gridIndex: 1, type: 'category', data: yAxisData, 
          axisLine: { show: false }, axisTick: { show: false },
          axisLabel: { fontFamily: 'Helvetica Neue, sans-serif', color: '#111111', fontWeight: 'bold', fontSize: 16, margin: 20 }
        }
      ],
      series: [
        // --- 气泡碰撞墙 (Grid 0，最右侧边缘) ---
        {
          type: 'scatter',
          xAxisIndex: 0, yAxisIndex: 0,
          data: govBubbles,
          silent: true,
          zlevel: 1,
          animationDelay: (idx: number) => idx * 2,
          animationDuration: 2000,
          animationEasing: 'cubicOut'
        },
        {
          type: 'scatter',
          xAxisIndex: 0, yAxisIndex: 0,
          data: pokBubbles,
          silent: true,
          zlevel: 2,
          animationDelay: (idx: number) => idx * 5 + 1000, // 红色气泡稍后出现，像被挤压出来的
          animationDuration: 1500,
          animationEasing: 'bounceOut'
        },
        // --- 词汇对抗条形图 (Grid 1，放大后的主视觉) ---
        {
          name: 'Pro-Gov',
          type: 'bar',
          xAxisIndex: 1, yAxisIndex: 1,
          data: govSeries,
          barWidth: 45, // 加粗
          itemStyle: { color: '#2C3E50', opacity: 0.9 },
          zlevel: 10,
          label: {
            show: true, position: 'insideLeft', formatter: (params: any) => `${params.data.label} (${Math.abs(params.value)})`,
            fontFamily: 'Georgia, serif', fontSize: 14, color: '#F9F9F6', offset: [15, 0]
          }
        },
        {
          name: 'Pro-POK',
          type: 'bar',
          xAxisIndex: 1, yAxisIndex: 1,
          data: pokSeries,
          barWidth: 45, // 加粗
          itemStyle: { color: '#8C3636', opacity: 0.9 },
          zlevel: 10,
          label: {
            show: true, position: 'right', formatter: (params: any) => `${params.data.label} (${params.value})`,
            fontFamily: 'Georgia, serif', fontSize: 14, color: '#8C3636', offset: [8, 0]
          }
        }
      ],
      graphic: [
        // 隐约的水印移到最右侧气泡墙后方
        {
          type: 'text',
          right: '2%', top: '35%', zlevel: 0, 
          style: { text: 'TERRORISTS', fill: 'rgba(44, 62, 80, 0.06)', font: 'bold 60px Impact, sans-serif', textAlign: 'right' }
        },
        {
          type: 'text',
          right: '2%', top: '55%', zlevel: 0,
          style: { text: 'CRIMINALS', fill: 'rgba(44, 62, 80, 0.06)', font: 'bold 70px Impact, sans-serif', textAlign: 'right' }
        },
        // 高级图上标注 (放置在主图与气泡墙之间的空白处，完美利用空间)
        {
          type: 'group',
          right: '5%', top: '20%', zlevel: 10,
          children: [
            { type: 'rect', shape: { width: 220, height: 80, r: 2 }, style: { fill: 'rgba(249, 249, 246, 0.85)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
            { type: 'text', left: 15, top: 15, style: { text: '800+ 篇官方通稿如气泡墙\n般碾压公众认知：\n“他们是暴徒与恐怖分子。”', fill: '#2C3E50', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
          ]
        },
        {
          type: 'group',
          right: '5%', bottom: '20%', zlevel: 10,
          children: [
            { type: 'rect', shape: { width: 220, height: 80, r: 2 }, style: { fill: 'rgba(249, 249, 246, 0.85)', shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.1)' } },
            { type: 'text', left: 15, top: 15, style: { text: '不足 100 篇的微弱发声：\n在建制派巨大的舆论引力\n场中被挤压至边缘。', fill: '#8C3636', font: 'bold 13px Georgia, serif', lineHeight: 20 } }
          ]
        },
        // 主图底部的图例说明 (调整位置以适应放大的主图)
        {
          type: 'text', left: '20%', bottom: '15%', zlevel: 10,
          style: { text: '← 官方定罪词汇及发文量', fill: '#2C3E50', font: '13px Helvetica Neue, sans-serif' }
        },
        {
          type: 'text', right: '25%', bottom: '15%', zlevel: 10,
          style: { text: '反叛者词汇及发文量 →', fill: '#8C3636', font: '13px Helvetica Neue, sans-serif' }
        },
        // 绝对中立线 (穿过主条形图)
        {
          type: 'line',
          shape: { x1: '64.5%', y1: '20%', x2: '64.5%', y2: '80%' }, // 大约在主图放大后的0轴位置
          style: { stroke: '#D4C4A8', lineDash: [5, 5], lineWidth: 2 },
          zlevel: 5
        }
      ]
    };
  }, [data]);

  return (
    <div className="h-full w-full bg-[#F9F9F6]">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide3MediaBias;