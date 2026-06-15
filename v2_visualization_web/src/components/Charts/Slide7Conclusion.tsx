import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

/* ── 证据链四阶段 ── */
const stages = [
  {
    id: 'conflict',
    title: '二十年冲突积压',
    subtitle: '1993 — 2013',
    color: '#526E4F',
    items: [
      '1993 年 GAStech 与 Kronos 政府签署开发协议',
      '1998 年 Elodis 地区地下水遭苯污染，居民健康危机',
      '2009 年 POK 领袖 Elian Karel 在狱中离奇死亡',
      '污染受害者 Juliana（10 岁）死于白血病',
    ],
  },
  {
    id: 'media',
    title: '舆论塑造与真相压制',
    subtitle: '媒体机器',
    color: '#2C3E50',
    items: [
      '381 篇亲政府/亲企业报道 vs 167 篇异见（另有 297 篇中立）',
      'GAStech 母公司 Tethys 控制同名媒体 + Centrum Sentinel',
      '15 家国际衍生媒体中 10 家立场一致照搬，无独立调查',
      '真正报道污染的 Homeland / Athena 被彻底边缘化',
    ],
  },
  {
    id: 'infiltration',
    title: '内部渗透与安保异常',
    subtitle: '木马已入城',
    color: '#8C3636',
    items: [
      '19 名"幽灵员工"无简历，与污染受害者/POK 有血缘',
      'Vann 兄弟把控安保核心，与死去女孩 Juliana 同姓',
      'CEO 越级直连卡车司机，案发前发送加密邮件给自己',
      '"Files" 转移、私人飞机安排——脱身路线已备好',
    ],
  },
  {
    id: 'converge',
    title: '四股力量汇流',
    subtitle: '2014.01.20',
    color: '#111111',
    items: [
      'POK：抗议情绪 + 复仇动机 → 外部行动压力',
      '高层：明知危险仍推 IPO，让他人充当诱饵',
      '安保：Vann 兄弟留门，路线条件被利用',
      '政府：20 周年接待打开场域，所有力量汇于一点',
    ],
  },
];

/* ── 阶段之间的因果箭头 ── */
const arrows = [
  { from: 0, to: 1, label: '冲突催生\n叙事控制' },
  { from: 1, to: 2, label: '真相被压制\n内鬼趁虚而入' },
  { from: 2, to: 3, label: '渗透完成\n条件具备' },
];

const Slide7Conclusion: React.FC = () => {
  const option = useMemo(() => {
    const nodeData = stages.map((s, i) => ({
      name: s.title,
      x: 80 + i * 280,
      y: 180,
      symbolSize: 64,
      itemStyle: {
        color: s.color,
        shadowBlur: 14,
        shadowColor: `${s.color}30`,
      },
      label: {
        show: true,
        position: 'bottom' as const,
        distance: 14,
        formatter: s.title,
        fontSize: 14,
        fontWeight: 'bold' as const,
        fontFamily: 'Georgia, serif',
        color: '#111',
      },
    }));

    const linkData = arrows.map((a) => ({
      source: stages[a.from].title,
      target: stages[a.to].title,
      lineStyle: {
        color: '#D4C4A8',
        width: 2.5,
        curveness: 0.15,
      },
      label: {
        show: true,
        formatter: a.label,
        fontSize: 11,
        color: '#8B7355',
        fontFamily: 'Helvetica Neue, sans-serif',
        lineHeight: 16,
      },
      symbol: ['none', 'arrow'],
      symbolSize: 8,
    }));

    return {
      backgroundColor: 'transparent',
      xAxis: { show: false, min: 0, max: 1200 },
      yAxis: { show: false, min: 0, max: 400 },
      tooltip: { show: false },
      series: [
        {
          type: 'graph',
          layout: 'none',
          roam: false,
          data: nodeData,
          links: linkData,
          lineStyle: { opacity: 1 },
          emphasis: { disabled: true },
        },
      ],
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner p-6 flex flex-col">
      {/* 标题 */}
      <div className="mb-2 text-center">
        <h2 className="text-[26px] font-serif font-bold text-[#111111] tracking-tight">
          结案陈词：证据链汇流
        </h2>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-[#D4C4A8]" />
          <p className="text-[13px] text-[#999] font-sans tracking-widest">
            不是单方策划，而是四股力量的必然汇流
          </p>
          <span className="h-px w-12 bg-[#D4C4A8]" />
        </div>
      </div>

      {/* 上半：流程图 */}
      <div className="h-[28%] min-h-0">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* 下半：四列证据卡片 */}
      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0 mt-1">
        {stages.map((stage, idx) => (
          <div
            key={stage.id}
            className="flex flex-col rounded-lg border border-[#E2DDD5] bg-white/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] overflow-hidden"
          >
            {/* 色条 */}
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, ${stage.color}99, ${stage.color})` }}
            />

            {/* 卡片头部 */}
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold font-sans flex-shrink-0"
                  style={{ backgroundColor: stage.color }}
                >
                  {idx + 1}
                </span>
                <div>
                  <div className="text-[14px] font-serif font-bold" style={{ color: stage.color }}>
                    {stage.title}
                  </div>
                  <div className="text-[11px] text-[#999] font-sans">{stage.subtitle}</div>
                </div>
              </div>
            </div>

            {/* 分割线 */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-[#E2DDD5] to-transparent" />

            {/* 证据列表 */}
            <div className="flex-1 px-4 py-3 space-y-2.5 overflow-auto">
              {stage.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-[12px] text-[#444] font-sans leading-[1.6]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 底部总结 */}
      <div className="mt-3 rounded-sm border border-dashed border-[#C9B79C] bg-[rgba(255,255,255,0.76)] px-5 py-3">
        <div className="text-[11px] tracking-[0.2em] text-[#8C3636] font-sans mb-1">CONCLUSION</div>
        <div className="text-[15px] font-serif leading-[1.8] text-[#111111]">
          我们没有指定唯一主谋。通过新闻、时间线、关系网与邮件四类证据，我们展示的是：
          <span className="font-bold text-[#8C3636]">
            这起绑架是长期冲突、舆论操纵、内部渗透与安保失控在案发前 72 小时内同步汇流的必然结果
          </span>。
        </div>
      </div>
    </div>
  );
};

export default Slide7Conclusion;
