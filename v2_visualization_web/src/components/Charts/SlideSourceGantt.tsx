import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideSourceGanttProps {
  sources?: any[];
}

/**
 * Q1 补充图：各媒体报道时间跨度（甘特条）
 * 展示哪些媒体报道时间最长、覆盖最全
 */
const SlideSourceGantt: React.FC<SlideSourceGanttProps> = ({ sources }) => {
  const option = useMemo(() => {
    if (!sources || sources.length === 0) return {};

    const typeColors: Record<string, string> = {
      primary_local: '#2C3E50',
      primary_institutional: '#D4AF37',
      aggregator: '#8B7355',
      derivative_international: '#D4C4A8',
    };

    // 按文章数排序取 top 15
    const sorted = [...sources]
      .sort((a, b) => (Number(b.article_count) || 0) - (Number(a.article_count) || 0))
      .slice(0, 15)
      .reverse();

    const names = sorted.map((s: any) => s.source);
    const minDate = '1982-01-01';
    const maxDate = '2015-01-01';

    // 计算时间条数据
    const barData = sorted.map((s: any) => {
      const d0 = new Date(s.date_min || minDate).getTime();
      const d1 = new Date(s.date_max || maxDate).getTime();
      return [d0, d1];
    });

    // 用 scatter + markArea 模拟甘特条
    const series: any[] = barData.map((range, i) => ({
      type: 'scatter',
      name: names[i],
      data: [[range[0], i]],
      symbolSize: 0,
      z: 2,
    }));

    // 用自定义graphic绘制条形
    const graphics: any[] = barData.map((range, i) => {
      const startPct = ((range[0] - new Date(minDate).getTime()) / (new Date(maxDate).getTime() - new Date(minDate).getTime())) * 100;
      const endPct = ((range[1] - new Date(minDate).getTime()) / (new Date(maxDate).getTime() - new Date(minDate).getTime())) * 100;
      const info = sorted[i];
      const color = typeColors[info.source_type] || '#ccc';
      const yPos = 15 + (i / sorted.length) * 75;

      return {
        type: 'rect',
        shape: {
          x: `${4 + startPct * 0.85}%`,
          y: `${yPos}%`,
          width: `${(endPct - startPct) * 0.85}%`,
          height: `${65 / sorted.length}%`,
          r: 2,
        },
        style: { fill: color, opacity: 0.75 },
        zlevel: 1,
      };
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '媒体报道时间跨度',
        subtext: '条形长度 = 该媒体报道的时间覆盖范围',
        left: '4%', top: '2%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111', fontSize: 20, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 12 },
      },
      grid: { top: '15%', bottom: '10%', left: '22%', right: '4%' },
      xAxis: {
        type: 'value',
        min: new Date(minDate).getTime(),
        max: new Date(maxDate).getTime(),
        axisLabel: {
          formatter: (v: number) => new Date(v).getFullYear().toString(),
          fontFamily: '"Helvetica Neue", sans-serif',
          fontSize: 11,
          color: '#666',
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: { fontSize: 10, color: '#333', fontFamily: '"Helvetica Neue", sans-serif', width: 140, overflow: 'truncate' },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const info = sorted[p.dataIndex];
          return `<strong>${info.source}</strong><br/>类型: ${info.source_type}<br/>覆盖: ${info.date_min} → ${info.date_max}<br/>文章: ${info.article_count}篇`;
        },
      },
      graphic: graphics,
      series,
    };
  }, [sources]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default SlideSourceGantt;
