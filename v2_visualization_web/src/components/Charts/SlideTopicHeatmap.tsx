import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideTopicHeatmapProps {
  sources?: any[];
}

/**
 * Q1 补充图：5类主题 × 4类来源 热力图
 * 展示不同来源类型对不同主题的报道侧重
 */
const SlideTopicHeatmap: React.FC<SlideTopicHeatmapProps> = ({ sources }) => {
  const option = useMemo(() => {
    if (!sources || sources.length === 0) return {};

    const topics = ['security', 'business', 'environment', 'protest', 'kidnapping'];
    const topicLabels: Record<string, string> = {
      security: '安全', business: '商业', environment: '环境', protest: '抗议', kidnapping: '绑架',
    };
    const typeOrder = ['primary_local', 'primary_institutional', 'aggregator', 'derivative_international'];
    const typeLabels: Record<string, string> = {
      primary_local: '本地一手', primary_institutional: '机构口径', aggregator: '聚合转载', derivative_international: '国际衍生',
    };

    // 解析每个 source 的 topics 字段 "security(11); business(8); ..."
    const matrix: number[][] = [];
    typeOrder.forEach((t) => {
      const row: number[] = [];
      const groupSources = sources.filter((s: any) => s.source_type === t);
      topics.forEach((topic) => {
        let total = 0;
        groupSources.forEach((s: any) => {
          const topicStr = s.top_topics || '';
          const match = topicStr.match(new RegExp(`${topic}\\((\\d+)\\)`));
          if (match) total += parseInt(match[1]);
        });
        row.push(total);
      });
      matrix.push(row);
    });

    const data: [number, number, number][] = [];
    matrix.forEach((row, i) => row.forEach((val, j) => data.push([j, i, val])));

    return {
      backgroundColor: 'transparent',
      title: {
        text: '报道主题 × 来源类型',
        subtext: '颜色深度 = 该类来源对该主题的报道量',
        left: '4%', top: '3%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111', fontSize: 20, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 12 },
      },
      grid: { top: '18%', bottom: '12%', left: '18%', right: '12%' },
      xAxis: {
        type: 'category',
        data: topics.map((t) => topicLabels[t]),
        axisLabel: { fontSize: 13, fontWeight: 'bold', color: '#333', fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif' },
        splitArea: { show: true },
      },
      yAxis: {
        type: 'category',
        data: typeOrder.map((t) => typeLabels[t]),
        axisLabel: { fontSize: 12, color: '#333', fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif' },
        splitArea: { show: true },
      },
      visualMap: {
        min: 0,
        calculable: true,
        orient: 'vertical',
        right: '2%',
        top: 'center',
        inRange: { color: ['#F9F9F6', '#D4C4A8', '#8B7355', '#5A3E28'] },
        textStyle: { color: '#666', fontSize: 11 },
      },
      tooltip: {
        formatter: (p: any) => {
          const topicLabel = topicLabels[topics[p.data[0]]];
          const typeLabel = typeLabels[typeOrder[p.data[1]]];
          return `<strong>${typeLabel}</strong> × <strong>${topicLabel}</strong><br/>报道量: ${p.data[2]}篇`;
        },
      },
      series: [{
        type: 'heatmap',
        data,
        label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#333', fontFamily: '"Helvetica Neue", sans-serif' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
      }],
    };
  }, [sources]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default SlideTopicHeatmap;
