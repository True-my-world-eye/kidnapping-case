import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideSourceClassProps {
  sources?: Record<string, unknown>[];
}

/**
 * Q1 核心图：新闻来源分类
 * 水平柱状图，按 source_type 分组，柱子长度=文章数，颜色=来源类型
 * 右侧信息面板显示 4 类来源定义
 */
const SlideSourceClass: React.FC<SlideSourceClassProps> = ({ sources }) => {
  const option = useMemo(() => {
    if (!sources || sources.length === 0) return {};

    // 按 source_type 分组
    const typeGroups: Record<string, { name: string; count: number; items: string[] }> = {};
    const typeOrder = ['primary_local', 'primary_institutional', 'aggregator', 'derivative_international'];
    const typeLabels: Record<string, string> = {
      primary_local: '本地一手报道',
      primary_institutional: '机构/公司口径',
      aggregator: '聚合转载',
      derivative_international: '国际衍生报道',
    };
    const typeColors: Record<string, string> = {
      primary_local: '#2C3E50',
      primary_institutional: '#D4AF37',
      aggregator: '#8B7355',
      derivative_international: '#D4C4A8',
    };

    typeOrder.forEach((t) => {
      typeGroups[t] = { name: typeLabels[t], count: 0, items: [] };
    });

    sources.forEach((s) => {
      const t = String(s.source_type || 'unknown');
      if (typeGroups[t]) {
        typeGroups[t].count += Number(s.article_count) || 0;
        typeGroups[t].items.push(String(s.source || ''));
      }
    });

    const sorted = typeOrder
      .map((t) => ({ key: t, ...typeGroups[t] }))
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      backgroundColor: 'transparent',
      title: {
        text: '新闻来源分类',
        subtext: '845 篇报道来自 4 类不同来源',
        left: '4%',
        top: '3%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111111', fontSize: 22, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif', color: '#666', fontSize: 13 },
      },
      grid: { top: '16%', bottom: '14%', left: '14%', right: '16%' },
      xAxis: {
        type: 'value',
        name: '文章数量',
        nameTextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 11 },
        axisLabel: { color: '#666', fontFamily: '"Helvetica Neue", sans-serif', fontSize: 12 },
        axisLine: { lineStyle: { color: '#ccc' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      yAxis: {
        type: 'category',
        data: sorted.map((g) => g.name),
        axisLabel: {
          color: '#333',
          fontFamily: '"Helvetica Neue", "Noto Sans SC", sans-serif',
          fontSize: 13,
          fontWeight: 'bold',
        },
        axisLine: { lineStyle: { color: '#ccc' } },
        axisTick: { show: false },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: Array<{ name: string; value: number }>) => {
          const p = params[0];
          const g = sorted.find((s) => s.name === p.name);
          const items = g ? g.items.join('、') : '';
          return `<strong>${p.name}</strong><br/>文章数: ${p.value}<br/>代表媒体: ${items.substring(0, 80)}${items.length > 80 ? '...' : ''}`;
        },
      },
      series: [
        {
          type: 'bar',
          data: sorted.map((g) => ({
            value: g.count,
            itemStyle: {
              color: typeColors[g.key] || '#999',
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: 28,
          label: {
            show: true,
            position: 'right',
            formatter: (params: { value: number; dataIndex: number }) => {
              const g = sorted[params.dataIndex];
              return `{count|${params.value}篇}  {detail|${g.items.length}家媒体}`;
            },
            rich: {
              count: { fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 'bold', color: '#333' },
              detail: { fontFamily: '"Helvetica Neue", sans-serif', fontSize: 11, color: '#888', padding: [0, 0, 0, 8] },
            },
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    };
  }, [sources]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner flex flex-col">
      <div className="flex-1 min-h-0">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
      {/* 底部说明栏 */}
      <div className="flex-shrink-0 border-t border-[#E2E2E2] px-4 py-2.5 bg-white/60">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-sans text-[#666]">
          <span><span className="font-bold text-[#2C3E50]">● 本地一手</span> 记者直接采写</span>
          <span><span className="font-bold text-[#D4AF37]">● 机构口径</span> 官方发布</span>
          <span><span className="font-bold text-[#8B7355]">● 聚合转载</span> 汇编多源</span>
          <span><span className="font-bold text-[#D4C4A8]">● 国际衍生</span> 翻译转述</span>
        </div>
      </div>
    </div>
  );
};

export default SlideSourceClass;
