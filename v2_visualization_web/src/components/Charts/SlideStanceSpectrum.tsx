import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideStanceSpectrumProps {
  data?: Record<string, unknown>[];
}

/**
 * Q2 核心图：媒体立场光谱
 * 发散柱状图：左(绿色)=亲POK/反建制，右(蓝色)=亲建制/亲GAStech
 * 中心线=中立(5)
 */
const SlideStanceSpectrum: React.FC<SlideStanceSpectrumProps> = ({ data }) => {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {};

    // 按立场评分排序
    const sorted = [...data]
      .filter((d) => d.stance_score_0_pro_gov_gastech_10_pro_pok !== undefined)
      .map((d) => ({
        name: String(d.source || ''),
        score: Number(d.stance_score_0_pro_gov_gastech_10_pro_pok),
        count: Number(d.article_count) || 0,
        type: String(d.source_type || 'unknown'),
        label: String(d.stance_label || ''),
      }))
      .sort((a, b) => a.score - b.score);

    // 发散柱状图：以5为中心
    const centeredData = sorted.map((d) => ({
      ...d,
      deviation: d.score - 5, // 负=偏建制, 正=偏POK
    }));

    return {
      backgroundColor: 'transparent',
      title: {
        text: '媒体立场光谱',
        subtext: '29 家媒体的立场分布（0=亲建制  5=中立  10=亲POK）',
        left: '4%',
        top: '2%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111111', fontSize: 22, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif', color: '#666', fontSize: 13 },
      },
      grid: { top: '15%', bottom: '22%', left: '18%', right: '4%' },
      xAxis: {
        type: 'category',
        data: centeredData.map((d) => d.name),
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          fontFamily: '"Helvetica Neue", sans-serif',
          color: '#666',
          interval: 0,
        },
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        min: -5,
        max: 5,
        axisLabel: {
          formatter: (v: number) => {
            if (v === -5) return '← 亲建制';
            if (v === 0) return '中立';
            if (v === 5) return '亲POK →';
            return '';
          },
          fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif',
          fontSize: 11,
          color: '#888',
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: Array<{ dataIndex: number }>) => {
          const p = params[0];
          const d = centeredData[p.dataIndex];
          return `<strong>${d.name}</strong><br/>立场: ${d.score}/10 ${d.label}<br/>文章: ${d.count}篇<br/>类型: ${d.type}`;
        },
      },
      series: [
        // 中立参考线
        {
          type: 'line',
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#999', type: 'dashed', width: 1 },
            data: [{ yAxis: 0 }],
            label: { show: false },
          },
          data: [],
        },
        // 发散柱
        {
          type: 'bar',
          data: centeredData.map((d) => ({
            value: d.deviation,
            itemStyle: {
              color: d.deviation <= 0
                ? { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#2C3E50' }, { offset: 1, color: '#4A7C8F' }] }
                : { type: 'linear', x: 1, y: 0, x2: 0, y2: 0, colorStops: [{ offset: 0, color: '#526E4F' }, { offset: 1, color: '#7BA378' }] },
              borderRadius: d.deviation <= 0 ? [4, 0, 0, 4] : [0, 4, 4, 0],
            },
          })),
          barWidth: 14,
          animationDuration: 1500,
        },
        // 文章数气泡叠加
        {
          type: 'scatter',
          symbolSize: (val: [number, number]) => {
            const idx = centeredData.findIndex((d) => d.deviation === val[1]);
            return idx >= 0 ? Math.max(6, Math.sqrt(centeredData[idx].count) * 3) : 6;
          },
          data: centeredData.map((d, i) => [i, d.deviation]),
          itemStyle: { color: 'rgba(0,0,0,0.15)', borderColor: '#fff', borderWidth: 1 },
          z: 10,
          silent: true,
        },
      ],
      // 两侧阵营标注
      graphic: [
        {
          type: 'text',
          left: '5%',
          top: '92%',
          zlevel: 10,
          style: { text: '◀ 建制派阵营 (2-3分)', fill: '#2C3E50', font: 'bold 12px "Helvetica Neue", "Noto Sans SC", sans-serif' },
        },
        {
          type: 'text',
          right: '5%',
          top: '92%',
          zlevel: 10,
          style: { text: '受害方阵营 (6-8分) ▶', fill: '#526E4F', font: 'bold 12px "Helvetica Neue", "Noto Sans SC", sans-serif', textAlign: 'right' as const },
        },
      ],
    };
  }, [data]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner flex flex-col">
      <div className="flex-1 min-h-0">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
      {/* 关键案例 */}
      <div className="flex-shrink-0 border-t border-[#E2E2E2] px-6 py-3 bg-white/60">
        <div className="flex items-center justify-between text-[11px] font-sans">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#2C3E50]" />
            <span className="text-[#2C3E50] font-bold">Central Bulletin (2分)</span>
            <span className="text-[#888]">— 大量引用政府发言，标题使用"罪犯""暴徒"</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#526E4F]" />
            <span className="text-[#526E4F] font-bold">The Light of Truth (8分)</span>
            <span className="text-[#888]">— 关注受害者证言，但被衍生媒体忽视</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideStanceSpectrum;
