import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide2OverviewProps {
  sources?: any[];
  entities?: any[];
  networkNodes?: any[];
  networkEdges?: any[];
  employees?: any[];
}

const Slide2Overview: React.FC<Slide2OverviewProps> = ({ sources, networkNodes, networkEdges, employees }) => {
  // ===== 数据处理 =====
  const sourceData = useMemo(() => {
    if (!sources) return null;

    const typeLabels: Record<string, string> = {
      primary_local: '本地一手', primary_institutional: '机构一手',
      aggregator: '聚合转载', derivative_international: '国际衍生'
    };
    const typeMap: Record<string, number> = {};
    sources.forEach((s: any) => {
      const t = s.source_type || 'other';
      typeMap[t] = (typeMap[t] || 0) + (parseInt(s.article_count) || 0);
    });
    const sourceTypes = ['primary_local', 'derivative_international', 'aggregator', 'primary_institutional'];
    const labels = sourceTypes.map(t => typeLabels[t] || t);
    const values = sourceTypes.map(t => typeMap[t] || 0);
    const total = values.reduce((a, b) => a + b, 0);
    return { labels, values, total };
  }, [sources]);

  const deptData = useMemo(() => {
    if (!employees) return null;
    const deptMap: Record<string, number> = {};
    employees.forEach((e: any) => {
      const d = e.department || 'Other';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const entries = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([d]) => d === 'Information Technology' ? 'IT' : d);
    const values = entries.map(([, v]) => v);
    return { labels, values };
  }, [employees]);

  const nodeData = useMemo(() => {
    if (!networkNodes) return null;
    const nodeTypeLabels: Record<string, string> = {
      person: '人物', media: '媒体', organization: '组织',
      event: '事件', location: '地点', department: '部门'
    };
    const nodeTypeMap: Record<string, number> = {};
    networkNodes.forEach((n: any) => {
      const t = n.node_type || 'other';
      nodeTypeMap[t] = (nodeTypeMap[t] || 0) + 1;
    });
    const entries = Object.entries(nodeTypeMap).sort((a, b) => b[1] - a[1]);
    const labels = entries.map(([t]) => nodeTypeLabels[t] || t);
    const values = entries.map(([, v]) => v);
    return { labels, values, typeCount: entries.length };
  }, [networkNodes]);

  // ===== ECharts 配置 =====
  const makeBarOption = (
    labels: string[], values: number[], color: string, accent: string
  ) => ({
    backgroundColor: 'transparent',
    grid: { top: 8, bottom: 8, left: 6, right: 50, containLabel: true },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category', data: labels, inverse: true,
      axisLabel: {
        fontSize: 13, color: '#444',
        fontFamily: 'Helvetica Neue, sans-serif',
        margin: 10
      },
      axisLine: { show: false }, axisTick: { show: false }
    },
    series: [{
      type: 'bar', data: values, barWidth: 18,
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color: accent },
            { offset: 1, color: color }
          ]
        }
      },
      label: {
        show: true, position: 'right',
        fontSize: 14, fontWeight: 'bold', color: color,
        fontFamily: 'Georgia, serif'
      },
      animationDuration: 1400,
      animationEasing: 'cubicOut'
    }]
  });

  const sourceOption = sourceData ? makeBarOption(
    sourceData.labels, sourceData.values, '#2C3E50', '#5A7A9A'
  ) : {};

  const deptOption = deptData ? makeBarOption(
    deptData.labels, deptData.values, '#8B7300', '#D4AF37'
  ) : {};

  const nodeOption = nodeData ? makeBarOption(
    nodeData.labels, nodeData.values, '#8C3636', '#C0605E'
  ) : {};

  // ===== 卡片组件 =====
  const Card = ({
    title, subtitle, number, unit, color, accent, option, icon
  }: {
    title: string; subtitle: string; number: string; unit: string;
    color: string; accent: string; option: any; icon: string;
  }) => (
    <div className="flex flex-col rounded-lg border border-[#E2DDD5] bg-white/70 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden backdrop-blur-sm">
      {/* 顶部色条 */}
      <div className="h-1 w-full" style={{
        background: `linear-gradient(90deg, ${accent}, ${color})`
      }} />

      {/* 标题区 */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-baseline justify-between">
          <div>
            <h3 className="text-[17px] font-serif font-bold" style={{ color }}>{title}</h3>
            <p className="mt-1 text-[12px] text-[#999] font-sans tracking-wide">{subtitle}</p>
          </div>
          <div className="text-right">
            <span className="text-[36px] font-serif font-bold leading-none" style={{ color }}>{number}</span>
            <span className="ml-1 text-[13px] text-[#999] font-sans">{unit}</span>
          </div>
        </div>
      </div>

      {/* 分割线 */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-[#E2DDD5] to-transparent" />

      {/* 图表区 */}
      <div className="flex-1 px-2 py-1 min-h-0">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%' }}
          className="react_for_echarts"
        />
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-[#F9F9F6] flex flex-col p-6">
      {/* 总标题 */}
      <div className="text-center mb-4">
        <h2 className="text-[28px] font-serif font-bold text-[#111] tracking-tight">
          我们掌握了这些数据
        </h2>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-[#D4C4A8]" />
          <p className="text-[13px] text-[#999] font-sans tracking-widest">
            3 类核心数据集 · 覆盖 1993—2014
          </p>
          <span className="h-px w-12 bg-[#D4C4A8]" />
        </div>
      </div>

      {/* 三栏卡片 */}
      <div className="flex-1 grid grid-cols-3 gap-5 min-h-0">
        <Card
          title="新闻报道"
          subtitle="29 个来源 · 4 种类型"
          number="845"
          unit="篇"
          color="#2C3E50"
          accent="#5A7A9A"
          option={sourceOption}
          icon="📰"
        />
        <Card
          title="员工档案"
          subtitle="6 个部门 · 含幽灵员工"
          number="54"
          unit="人"
          color="#8B7300"
          accent="#D4AF37"
          option={deptOption}
          icon="👤"
        />
        <Card
          title="网络节点"
          subtitle={`${nodeData?.typeCount ?? 0} 种类型 · 关系图谱`}
          number={String(networkNodes?.length ?? 0)}
          unit="个"
          color="#8C3636"
          accent="#C0605E"
          option={nodeOption}
          icon="🔗"
        />
      </div>

      {/* 底部装饰 */}
      <div className="mt-4 flex items-center justify-center gap-4">
        <span className="h-px flex-1 bg-[#E2DDD5]" />
        <span className="text-[11px] text-[#BBB] font-sans tracking-[0.3em]">
          DATA OVERVIEW
        </span>
        <span className="h-px flex-1 bg-[#E2DDD5]" />
      </div>
    </div>
  );
};

export default Slide2Overview;
