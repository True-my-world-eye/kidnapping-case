import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideMediaRadarProps {
  sources?: any[];
}

/**
 * Q2 补充图：3家代表性媒体的多维雷达图
 * 对比 Central Bulletin(亲建制)、Homeland Illumination(独立)、The Light of Truth(亲POK)
 */
const SlideMediaRadar: React.FC<SlideMediaRadarProps> = ({ sources }) => {
  const option = useMemo(() => {
    if (!sources || sources.length === 0) return {};

    const dims = ['security', 'business', 'environment', 'protest', 'kidnapping'];
    const dimLabels: Record<string, string> = {
      security: '安全', business: '商业', environment: '环境', protest: '抗议', kidnapping: '绑架',
    };

    const representatives = [
      { name: 'Central Bulletin (亲建制)', key: 'Central Bulletin', color: '#2C3E50' },
      { name: 'Homeland Illumination (独立)', key: 'Homeland Illumination', color: '#8B7355' },
      { name: 'The Light of Truth (亲POK)', key: 'The Light of Truth', color: '#526E4F' },
    ];

    const indicator = dims.map((d) => ({ name: dimLabels[d], max: 40 }));

    const seriesData = representatives.map((rep) => {
      const src = sources.find((s: any) => s.source === rep.key);
      if (!src) return { name: rep.name, value: [0, 0, 0, 0, 0], itemStyle: { color: rep.color } };

      const topicStr = src.top_topics || '';
      const values = dims.map((d) => {
        const match = topicStr.match(new RegExp(`${d}\\((\\d+)\\)`));
        return match ? parseInt(match[1]) : 0;
      });
      return { name: rep.name, value: values, itemStyle: { color: rep.color }, lineStyle: { width: 2 } };
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '代表性媒体：报道侧重对比',
        subtext: '同一事件，三家媒体的关注焦点截然不同',
        left: '4%', top: '2%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111', fontSize: 20, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 12 },
      },
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => {
          const lines = p.value.map((v: number, i: number) => `${indicator[i].name}: ${v}篇`).join('<br/>');
          return `<strong>${p.name}</strong><br/>${lines}`;
        },
      },
      legend: {
        data: representatives.map((r) => r.name),
        bottom: '5%',
        textStyle: { fontSize: 11, fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif' },
      },
      radar: {
        center: ['50%', '52%'],
        radius: '60%',
        indicator,
        shape: 'polygon',
        axisName: { color: '#333', fontSize: 12, fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif' },
        splitArea: { areaStyle: { color: ['#fff', '#fafafa'] } },
      },
      series: [{
        type: 'radar',
        data: seriesData,
        animationDuration: 1500,
      }],
    };
  }, [sources]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default SlideMediaRadar;
