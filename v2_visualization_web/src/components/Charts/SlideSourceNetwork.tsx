import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface SlideSourceNetworkProps {
  sourceRelations?: Record<string, unknown>[];
  sources?: Record<string, unknown>[];
}

/**
 * Q1 补充图：原始→衍生转载关系网络
 * 用 ECharts graph 展示哪些媒体从哪些媒体衍生
 */
const SlideSourceNetwork: React.FC<SlideSourceNetworkProps> = ({ sourceRelations, sources }) => {
  const option = useMemo(() => {
    if (!sourceRelations || !sources || sourceRelations.length === 0) return {};

    // 构建来源 → 文章数映射
    const sourceMap: Record<string, { count: number; type: string }> = {};
    sources.forEach((s) => {
      sourceMap[String(s.source || '')] = { count: Number(s.article_count) || 0, type: String(s.source_type || 'unknown') };
    });

    const typeColors: Record<string, string> = {
      primary_local: '#2C3E50',
      primary_institutional: '#D4AF37',
      aggregator: '#8B7355',
      derivative_international: '#D4C4A8',
    };

    // 统计转载频次
    const edgeCount: Record<string, number> = {};
    const nodeSet = new Set<string>();
    sourceRelations.forEach((r) => {
      const src = String(r.likely_primary_source || '');
      const derivs = String(r.derivative_sources || '').split(';').map((s: string) => s.trim()).filter(Boolean);
      if (src) nodeSet.add(src);
      derivs.forEach((d) => {
        nodeSet.add(d);
        const key = `${src}->${d}`;
        edgeCount[key] = (edgeCount[key] || 0) + 1;
      });
    });

    const nodes = Array.from(nodeSet).map((name) => {
      const info = sourceMap[name] || { count: 5, type: 'unknown' };
      return {
        name,
        symbolSize: Math.max(15, Math.sqrt(info.count) * 5),
        itemStyle: { color: typeColors[info.type] || '#ccc', shadowBlur: 4, shadowColor: 'rgba(0,0,0,0.1)' },
        label: { show: info.count > 15, fontSize: 10, color: '#333', fontFamily: '"Helvetica Neue", sans-serif' },
      };
    });

    const edges = Object.entries(edgeCount).map(([key, count]) => {
      const [source, target] = key.split('->');
      return {
        source,
        target,
        lineStyle: { width: Math.min(count, 4), color: 'rgba(139,115,85,0.3)', curveness: 0.2 },
      };
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '新闻转载关系网络',
        subtext: '原始报道 → 衍生转述的传播链',
        left: '4%', top: '3%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111', fontSize: 20, fontWeight: 'bold' },
        subtextStyle: { fontFamily: '"Helvetica Neue", sans-serif', color: '#888', fontSize: 12 },
      },
      tooltip: {
        formatter: (p: { dataType?: string; data?: { source?: string; target?: string }; name?: string }) => {
          if (p.dataType === 'edge') return `${p.data.source} → ${p.data.target}`;
          const info = sourceMap[p.name] || { count: 0, type: '' };
          return `<strong>${p.name}</strong><br/>${info.type || ''}<br/>${info.count || '?'}篇`;
        },
      },
      series: [{
        type: 'graph',
        layout: 'force',
        roam: true,
        force: { repulsion: 180, gravity: 0.08, edgeLength: [80, 200] },
        data: nodes,
        edges,
        emphasis: { focus: 'adjacency', lineStyle: { width: 3 } },
        animationDuration: 2000,
      }],
      graphic: [{
        type: 'group', right: '3%', bottom: '10%', zlevel: 10,
        children: [
          { type: 'rect', shape: { width: 160, height: 72, r: 3 }, style: { fill: 'rgba(249,249,246,0.95)', stroke: '#E2E2E2' } },
          { type: 'text', left: 10, top: 8, style: { text: '● 本地一手  ● 机构口径\n● 聚合转载  ● 国际衍生', font: '10px "Helvetica Neue", sans-serif', fill: '#666', lineHeight: 16 } },
        ],
      }],
    };
  }, [sourceRelations, sources]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default SlideSourceNetwork;
