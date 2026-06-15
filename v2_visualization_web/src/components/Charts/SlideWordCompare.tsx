import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideWordCompareProps {
  wordData?: any;
}

/**
 * Q2 补充图：亲建制 vs 独立媒体词频分组对比
 * 分组柱状图展示定罪词汇在不同阵营的出现频次
 */
const SlideWordCompare: React.FC<SlideWordCompareProps> = ({ wordData }) => {
  const option = useMemo(() => {
    if (!wordData) return {};

    // 取 antiPOK_words 的 top 10
    const antiWords = (wordData.antiPOK_words || []).slice(0, 10);

    const words = antiWords.map((w: any) => w.word);
    const govCounts = antiWords.map((w: any) => w.gov_count || 0);
    const pokCounts = antiWords.map((w: any) => w.pok_count || 0);

    return {
      backgroundColor: 'transparent',
      title: {
        text: '定罪词汇：谁在用？',
        subtext: '同一词汇在亲建制 vs 亲POK/独立媒体中的出现频次',
        left: '4%', top: '3%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111', fontSize: 20, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 12 },
      },
      grid: { top: '18%', bottom: '15%', left: '12%', right: '4%' },
      xAxis: {
        type: 'category',
        data: words,
        axisLabel: { fontSize: 11, color: '#333', fontFamily: '"Helvetica Neue", sans-serif', rotate: 25 },
        axisLine: { lineStyle: { color: '#ddd' } },
      },
      yAxis: {
        type: 'value',
        name: '出现次数',
        nameTextStyle: { color: '#888', fontSize: 11 },
        axisLabel: { color: '#666', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['亲建制/政府口径', '亲POK/独立报道'],
        top: '10%',
        textStyle: { fontSize: 11, fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif' },
      },
      series: [
        {
          name: '亲建制/政府口径',
          type: 'bar',
          data: govCounts,
          itemStyle: { color: '#2C3E50', borderRadius: [3, 3, 0, 0] },
          barWidth: 14,
          barGap: '20%',
        },
        {
          name: '亲POK/独立报道',
          type: 'bar',
          data: pokCounts,
          itemStyle: { color: '#526E4F', borderRadius: [3, 3, 0, 0] },
          barWidth: 14,
        },
      ],
    };
  }, [wordData]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default SlideWordCompare;
