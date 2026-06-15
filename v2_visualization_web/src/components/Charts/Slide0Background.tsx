import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

const Slide0Background = () => {
  const option = useMemo(() => {
    // ===== 上半部分：四方势力关系图 =====
    const cx = 480;
    const cy = 160;

    const nodes = [
      {
        id: 'GAStech', name: 'GAStech',
        value: [cx - 200, cy],
        symbolSize: 58,
        itemStyle: { color: '#2C3E50', shadowBlur: 10, shadowColor: 'rgba(44,62,80,0.2)' },
        label: { show: true, formatter: 'GAStech\n能源巨头', position: 'left' as const, fontSize: 18, fontWeight: 'bold' as const, fontFamily: 'Georgia, serif', color: '#2C3E50', distance: 18, lineHeight: 24 }
      },
      {
        id: 'Gov', name: 'Kronos 政府',
        value: [cx + 200, cy],
        symbolSize: 52,
        itemStyle: { color: '#D4AF37', shadowBlur: 10, shadowColor: 'rgba(212,175,55,0.2)' },
        label: { show: true, formatter: 'Kronos 政府\n许可·安保·接待', position: 'right' as const, fontSize: 18, fontWeight: 'bold' as const, fontFamily: 'Georgia, serif', color: '#8B7300', distance: 18, lineHeight: 24 }
      },
      {
        id: 'POK', name: 'POK',
        value: [cx - 200, cy + 130],
        symbolSize: 48,
        itemStyle: { color: '#526E4F', shadowBlur: 10, shadowColor: 'rgba(82,110,79,0.2)' },
        label: { show: true, formatter: 'POK\n环保组织', position: 'left' as const, fontSize: 18, fontWeight: 'bold' as const, fontFamily: 'Georgia, serif', color: '#526E4F', distance: 18, lineHeight: 24 }
      },
      {
        id: 'Elodis', name: 'Elodis',
        value: [cx + 200, cy + 130],
        symbolSize: 36,
        itemStyle: { color: '#8C3636', shadowBlur: 6, shadowColor: 'rgba(140,54,54,0.15)' },
        label: { show: true, formatter: 'Elodis\n污染地区', position: 'right' as const, fontSize: 16, fontWeight: 'bold' as const, fontFamily: 'Helvetica Neue, sans-serif', color: '#8C3636', distance: 14, lineHeight: 22 }
      },
      {
        id: 'APA', name: 'APA',
        value: [cx, cy + 210],
        symbolSize: 40,
        itemStyle: { color: '#4A5568', shadowBlur: 8, shadowColor: 'rgba(74,85,104,0.18)' },
        label: { show: true, formatter: 'APA\n区域安全力量', position: 'bottom' as const, fontSize: 16, fontWeight: 'bold' as const, fontFamily: 'Helvetica Neue, sans-serif', color: '#4A5568', distance: 14, lineHeight: 22 }
      }
    ];

    const edges = [
      { source: 'GAStech', target: 'Gov', lineStyle: { width: 3.5, color: '#D4AF37', curveness: 0.12 } },
      { source: 'GAStech', target: 'POK', lineStyle: { width: 3, color: '#8C3636', curveness: -0.12 } },
      { source: 'POK', target: 'Gov', lineStyle: { width: 2, color: 'rgba(140,54,54,0.35)', type: 'dashed' as const, curveness: 0.08 } },
      { source: 'Elodis', target: 'GAStech', lineStyle: { width: 2, color: 'rgba(140,54,54,0.25)', type: 'dashed' as const, curveness: 0.15 } },
      { source: 'APA', target: 'Gov', lineStyle: { width: 2.2, color: 'rgba(74,85,104,0.55)', curveness: -0.08 } },
      { source: 'APA', target: 'POK', lineStyle: { width: 1.8, color: 'rgba(140,54,54,0.35)', type: 'dashed' as const, curveness: 0.18 } }
    ];

    // ===== 下半部分：关键时间线 =====
    const tlY = 430;
    const tlStart = 100;
    const tlEnd = 860;
    const events = [
      { x: tlStart, year: '1993', label: 'GAStech 与政府\n签署开发协议', color: '#D4AF37' },
      { x: tlStart + (tlEnd - tlStart) * 0.22, year: '1998', label: 'Elodis 污染\n居民开始患病', color: '#8C3636' },
      { x: tlStart + (tlEnd - tlStart) * 0.44, year: '2009', label: 'POK 领袖\nKarel 惨死狱中', color: '#8C3636' },
      { x: tlStart + (tlEnd - tlStart) * 0.66, year: '2013.12', label: 'GAStech IPO\n高管暴富 $2B', color: '#D4AF37' },
      { x: tlEnd, year: '2014.1.20', label: '多名高管\n集体失踪', color: '#111111' }
    ];

    return {
      backgroundColor: 'transparent',
      grid: { top: '2%', bottom: '2%', left: '2%', right: '2%' },
      xAxis: { type: 'value', min: 0, max: 1000, show: false },
      yAxis: { type: 'value', min: 0, max: 520, show: false, inverse: true },
      series: [
        // 关系图
        {
          type: 'graph', coordinateSystem: 'cartesian2d', layout: 'none',
          data: nodes, edges: edges, roam: false,
          label: { show: true },
          lineStyle: { color: 'source', curveness: 0.3 },
          animationDuration: 1500, animationEasing: 'cubicOut'
        },
        // 时间线
        {
          type: 'line',
          data: [[tlStart - 20, tlY], [tlEnd + 20, tlY]],
          symbol: 'none',
          lineStyle: { color: '#D4C4A8', width: 2 },
          silent: true, animation: false
        },
        // 时间节点
        {
          type: 'scatter',
          data: events.map(e => ({
            value: [e.x, tlY], symbolSize: 14,
            itemStyle: { color: e.color, shadowBlur: 6, shadowColor: `${e.color}25` }
          })),
          silent: true, animationDuration: 2000, animationDelay: 800
        }
      ],
      graphic: [
        // 区域标题
        {
          type: 'text', left: '4%', top: '3%', zlevel: 10,
          style: { text: '核心势力关系', fill: '#111111', font: 'bold 28px Georgia, serif' }
        },
        // 关系线标注
        {
          type: 'text', left: '54%', top: '22%', zlevel: 10,
          style: { text: '商业合作', fill: '#D4AF37', font: 'bold 15px Georgia, serif', backgroundColor: 'rgba(249,249,246,0.9)', padding: [4, 8], borderRadius: 2 }
        },
        {
          type: 'text', left: '24%', top: '36%', zlevel: 10,
          style: { text: '环境冲突', fill: '#8C3636', font: 'bold 15px Georgia, serif', backgroundColor: 'rgba(249,249,246,0.9)', padding: [4, 8], borderRadius: 2 }
        },
        {
          type: 'text', left: '50%', top: '54%', zlevel: 10,
          style: { text: '安全/执法关系', fill: '#4A5568', font: 'bold 14px Helvetica Neue, sans-serif', backgroundColor: 'rgba(249,249,246,0.9)', padding: [4, 8], borderRadius: 2 }
        },
        // APA 注释
        {
          type: 'group', right: '3%', top: '15%', zlevel: 10,
          children: [
            { type: 'rect', shape: { width: 210, height: 54, r: 3 }, style: { fill: 'rgba(249,249,246,0.95)', shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.05)', stroke: '#E2E2E2' } },
            { type: 'text', left: 12, top: 9, style: { text: 'APA：区域安全力量\n与 POK 不同，但同样卷入冲突', fill: '#666', font: '13px Helvetica Neue, sans-serif', lineHeight: 18 } }
          ]
        },
        // 时间线标题
        {
          type: 'text', left: '4%', top: '72%', zlevel: 10,
          style: { text: '关键事件时间线', fill: '#666', font: 'italic 15px Helvetica Neue, sans-serif', letterSpacing: 2 }
        },
        // 事件标签
        ...events.map(e => ({
          type: 'text' as const,
          left: `${(e.x / 1000) * 100}%`,
          top: '78%', zlevel: 10,
          style: {
            text: `${e.year}\n${e.label}`,
            fill: '#444',
            font: 'bold 12px Helvetica Neue, sans-serif',
            textAlign: 'center' as const,
            lineHeight: 17
          }
        })),
        // 最后一个事件的强调框
        {
          type: 'group',
          left: `${((tlEnd) / 1000) * 100 - 8}%`,
          top: '88%', zlevel: 10,
          children: [
            { type: 'rect', shape: { width: 150, height: 32, r: 3 }, style: { fill: 'rgba(17,17,17,0.06)', stroke: 'rgba(17,17,17,0.15)' } },
            { type: 'text', left: 15, top: 8, style: { text: '本案核心事件', fill: '#111', font: 'bold 12px Georgia, serif' } }
          ]
        }
      ]
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#F9F9F6] pt-6">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide0Background;
