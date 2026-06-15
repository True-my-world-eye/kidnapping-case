import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([SankeyChart, TooltipComponent, CanvasRenderer]);

interface Slide1bWhoControlsProps {
  data: any[];
}

const Slide1bWhoControls: React.FC<Slide1bWhoControlsProps> = ({ data }) => {
  const option = useMemo(() => {
    if (!data || data.length === 0) return {};

    // === Layer 0: Controllers ===
    // GAStech/Tethys controls: Tethys News (35), Centrum Sentinel (36)
    // Government controls: Central Bulletin (21), Kronos Star (62)
    // Independent/POK side: Homeland (64), Athena (25), Light of Truth (19)

    // === Layer 1: Media outlets ===
    // Pro-GAStech: Tethys News, Centrum Sentinel
    // Pro-Gov: Central Bulletin, Kronos Star
    // Derivative: 12 international (all stance 4)
    // Independent: Homeland, Athena, Light of Truth

    // === Layer 2: Public perception ===
    // "POK=恐怖分子" (dominant)
    // "污染真相" (suppressed)

    const nodes = [
      // Controllers
      { name: 'GAStech / Tethys\n企业', itemStyle: { color: '#8C3636' } },
      { name: 'Kronos 政府', itemStyle: { color: '#526E4F' } },
      // Media - controlled by GAStech
      { name: 'Tethys News\n35篇', itemStyle: { color: '#C0392B' } },
      { name: 'Centrum Sentinel\n36篇', itemStyle: { color: '#C0392B' } },
      // Media - controlled by Government
      { name: 'Central Bulletin\n21篇', itemStyle: { color: '#27AE60' } },
      { name: 'Kronos Star\n62篇', itemStyle: { color: '#27AE60' } },
      // Media - derivative amplifiers
      { name: '15家国际衍生媒体\n304篇', itemStyle: { color: '#D4C4A8' } },
      // Media - independent (suppressed)
      { name: 'Homeland Illumination\n64篇', itemStyle: { color: '#95A5A6' } },
      { name: 'Athena Speaks\n25篇', itemStyle: { color: '#95A5A6' } },
      { name: 'Light of Truth\n19篇', itemStyle: { color: '#95A5A6' } },
    ];

    const links = [
      // GAStech → its media
      { source: 'GAStech / Tethys\n企业', target: 'Tethys News\n35篇', value: 35 },
      { source: 'GAStech / Tethys\n企业', target: 'Centrum Sentinel\n36篇', value: 36 },
      // Government → its media
      { source: 'Kronos 政府', target: 'Central Bulletin\n21篇', value: 21 },
      { source: 'Kronos 政府', target: 'Kronos Star\n62篇', value: 62 },
      // Controlled media → derivative amplifiers
      { source: 'Tethys News\n35篇', target: '15家国际衍生媒体\n304篇', value: 35 },
      { source: 'Centrum Sentinel\n36篇', target: '15家国际衍生媒体\n304篇', value: 36 },
      { source: 'Central Bulletin\n21篇', target: '15家国际衍生媒体\n304篇', value: 21 },
      { source: 'Kronos Star\n62篇', target: '15家国际衍生媒体\n304篇', value: 62 },
    ];

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            return `${params.data.source} → ${params.data.target}<br/>${params.data.value} 篇`;
          }
          return params.name.replace(/\n/g, '<br/>');
        },
      },
      series: [{
        type: 'sankey',
        layout: 'none',
        left: 40,
        right: 100,
        top: 30,
        bottom: 30,
        nodeWidth: 20,
        nodeGap: 12,
        orient: 'horizontal',
        draggable: false,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
        },
        label: {
          show: true,
          fontSize: 10,
          color: '#333',
          fontFamily: '"Helvetica Neue", "Noto Serif SC", sans-serif',
          formatter: '{b}',
          overflow: 'truncate',
          ellipsis: '…',
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { opacity: 0.8 },
        },
        data: nodes,
        links: links,
      }],
    };
  }, [data]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner p-3 flex flex-col">
      <div className="mb-3">
        <h2 className="text-[22px] font-serif font-bold text-[#111111]">谁在定调：从控制者到公众认知</h2>
        <p className="mt-1 text-sm font-sans text-[#4A5568]">
          三层结构：控制者（企业/政府）→ 媒体（定调/放大）→ 公众接收到的信息。流量宽度 = 文章数量。
        </p>
      </div>

      <div className="flex-1 flex min-h-0 gap-4">
        {/* Main chart */}
        <div className="flex-1 min-w-0 border border-[#E2E2E2] rounded-sm bg-white/80 p-2">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Right sidebar */}
        <div className="w-[220px] flex-shrink-0 flex flex-col gap-3 overflow-hidden">
          {/* Layer explanation */}
          <div className="border border-[#E2E2E2] rounded-sm bg-white/80 p-3">
            <div className="text-xs tracking-[0.15em] text-[#8B7355] mb-3 font-sans">三层结构</div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8C3636] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#333]">控制者</div>
                  <div className="text-[10px] text-[#888]">GAStech 企业 + Kronos 政府</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-[#B7791F] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#333]">定调媒体</div>
                  <div className="text-[10px] text-[#888]">4家媒体，立场 2-3</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-[#D4C4A8] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#333]">放大器</div>
                  <div className="text-[10px] text-[#888]">12家衍生媒体，立场全是4</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-3 h-3 rounded-full bg-[#95A5A6] mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#333]">独立声音</div>
                  <div className="text-[10px] text-[#888]">被边缘化，声量被碾压</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key insight */}
          <div className="border border-[#8C3636] rounded-sm bg-[#8C3636]/5 p-3">
            <div className="text-xs tracking-[0.15em] text-[#8C3636] mb-2 font-sans font-bold">关键发现</div>
            <div className="text-xs font-serif text-[#333] leading-relaxed space-y-1">
              <p><strong>Tethys News</strong> 以母公司命名=企业喉舌。</p>
              <p>定调+衍生 = <strong>400+篇</strong></p>
              <p>独立媒体仅 <strong>108篇</strong></p>
              <p className="font-bold text-[#8C3636]">公众"真相"是被设计的。</p>
            </div>
          </div>

          {/* Numbers */}
          <div className="border border-[#E2E2E2] rounded-sm bg-white/80 p-3">
            <div className="text-xs tracking-[0.15em] text-[#8B7355] mb-2 font-sans">数据对比</div>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8C3636]">400+</div>
                <div className="text-[10px] text-[#888]">亲企业报道</div>
              </div>
              <div className="text-lg text-[#ccc]">vs</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#95A5A6]">108</div>
                <div className="text-[10px] text-[#888]">独立报道</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide1bWhoControls;
