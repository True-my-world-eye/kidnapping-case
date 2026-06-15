import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide4TimelineProps {
  data: Record<string, unknown>[];
}

/**
 * 利润与代价的剪刀差
 * 数据依据: timeline_master.csv
 * - 上方(金色): narrative_lines 含 "1"(商业利益线) 的事件数，按年聚合
 * - 下方(暗红): narrative_lines 含 "2"|"3"(环境冲突/组织对抗) 的事件数，按年聚合
 * 事件计数来自 articles_lite.csv → anchor_events.csv → timeline_master.csv 的数据流水线
 */
const Slide4Timeline: React.FC<Slide4TimelineProps> = ({ data }) => {
  const option = useMemo(() => {
    // 按年聚合事件
    const yearBuckets: Record<string, { profit: number; conflict: number }> = {};

    if (data && data.length > 0) {
      for (const row of data) {
        const date = String(row.date || '');
        const yearMatch = date.match(/^(\d{4})/);
        if (!yearMatch) continue;
        const year = yearMatch[1];

        const lines = String(row.narrative_lines || '');
        const isProfit = lines.includes('1');
        const isConflict = lines.includes('2') || lines.includes('3');

        if (!yearBuckets[year]) {
          yearBuckets[year] = { profit: 0, conflict: 0 };
        }
        if (isProfit) yearBuckets[year].profit += 1;
        if (isConflict) yearBuckets[year].conflict += 1;
      }
    }

    // 排序年份
    const years = Object.keys(yearBuckets).sort();
    // 如果数据不足，使用 anchor_events 的实际年份
    const displayYears = years.length >= 3
      ? years
      : ['1993', '1998', '2005', '2009', '2012', '2013', '2014'];

    const profitData = displayYears.map(y =>
      yearBuckets[y]?.profit || 0
    );
    const conflictData = displayYears.map(y =>
      -(yearBuckets[y]?.conflict || 0)
    );

    // 从 anchor_events.csv 补充关键标签
    const keyLabels: Record<string, string> = {
      '1993': '开发协议签署',
      '1998': 'Elodis 污染暴露',
      '2009': 'Karel 狱中死亡',
      '2012': 'POK 被定性为罪犯',
      '2013': 'GAStech IPO',
      '2014': '高管集体失踪',
    };
    const upperLabels = displayYears.map(y => keyLabels[y] || '');
    const lowerLabels = displayYears.map(y => keyLabels[y] || '');

    // 计算实际 Y 轴范围
    const maxProfit = Math.max(...profitData, 1);
    const maxConflict = Math.max(...conflictData.map(Math.abs), 1);
    const yMax = Math.ceil(Math.max(maxProfit, maxConflict) * 1.3);

    return {
      backgroundColor: 'transparent',
      title: {
        text: '利润与代价的剪刀差',
        subtext: '上方: 商业利益相关事件数 | 下方: 环境冲突/组织对抗事件数 | 数据源: timeline_master.csv',
        left: '5%',
        top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 11 },
      },
      grid: { top: '28%', bottom: '15%', left: '10%', right: '10%' },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: (params: Array<{ seriesName: string; value: number; axisValue: string }>) => {
          const p = params[0];
          if (!p) return '';
          const absVal = Math.abs(p.value);
          return `${p.axisValue}年<br/>${p.seriesName}: ${absVal} 件`;
        },
      },
      xAxis: {
        type: 'category',
        data: displayYears,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#888', width: 2 } },
        axisLabel: {
          fontFamily: '"Helvetica Neue", sans-serif',
          color: '#555',
          fontWeight: 'bold',
          fontSize: 13,
          margin: 15,
        },
        axisTick: { show: true, length: 8, lineStyle: { color: '#888' } },
      },
      yAxis: {
        type: 'value',
        show: true,
        min: -yMax,
        max: yMax,
        axisLabel: {
          formatter: (v: number) => String(Math.abs(v)),
          fontSize: 11,
          color: '#888',
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      series: [
        // 商业利益线 (上方金色区域)
        {
          name: '商业利益事件',
          type: 'line',
          data: profitData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#D4AF37' },
          lineStyle: { width: 3, color: '#D4AF37' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(212, 175, 55, 0.6)' },
                { offset: 1, color: 'rgba(212, 175, 55, 0.05)' },
              ],
            },
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: { dataIndex: number }) =>
              upperLabels[params.dataIndex] || '',
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: 11,
            color: '#2C3E50',
            distance: 10,
          },
          animationDuration: 2000,
          animationEasing: 'quadraticOut',
        },
        // 环境冲突线 (下方暗红区域)
        {
          name: '环境冲突/对抗事件',
          type: 'line',
          data: conflictData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#8C3636' },
          lineStyle: { width: 3, color: '#8C3636' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 1, x2: 0, y2: 0,
              colorStops: [
                { offset: 0, color: 'rgba(140, 54, 54, 0.6)' },
                { offset: 1, color: 'rgba(140, 54, 54, 0.05)' },
              ],
            },
          },
          label: {
            show: true,
            position: 'bottom',
            formatter: (params: { dataIndex: number }) =>
              lowerLabels[params.dataIndex] || '',
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: 11,
            color: '#8C3636',
            distance: 10,
          },
          animationDuration: 2000,
          animationEasing: 'quadraticOut',
        },
      ],
      graphic: [
        {
          type: 'text',
          left: '5%',
          bottom: '5%',
          zlevel: 10,
          style: {
            text: '※ Y 轴 = 该年 timeline_master.csv 中对应叙事线的事件数',
            fill: '#999',
            font: 'italic 10px "Helvetica Neue", sans-serif',
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] pt-10">
      <ReactECharts
        option={option}
        style={{ height: '90%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide4Timeline;
