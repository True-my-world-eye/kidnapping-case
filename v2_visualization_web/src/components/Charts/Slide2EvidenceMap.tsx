import React from 'react';

interface Slide2EvidenceMapProps {
  sources?: any[];
  timeline?: any[];
  relationships?: any[];
  emails?: any[];
}

const Slide2EvidenceMap: React.FC<Slide2EvidenceMapProps> = ({
  sources = [],
  timeline = [],
  relationships = [],
  emails = [],
}) => {
  const evidenceCards = [
    {
      title: '新闻舆论',
      value: `${sources.length || 29}`,
      unit: '个来源',
      note: '谁在定义敌人',
      color: 'bg-[#8C3636]',
    },
    {
      title: '历史时间线',
      value: `${timeline.length || 8}`,
      unit: '个关键节点',
      note: '冲突如何积累',
      color: 'bg-[#B7791F]',
    },
    {
      title: '组织关系',
      value: `${relationships.length || 0}`,
      unit: '条关系',
      note: '谁真正连在一起',
      color: 'bg-[#2C3E50]',
    },
    {
      title: '内部通信',
      value: `${emails.length || 1175}`,
      unit: '封邮件',
      note: '谁提前知道异常',
      color: 'bg-[#4A5568]',
    },
  ];

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner p-8">
      <div className="mb-8">
        <h2 className="text-[28px] font-serif font-bold text-[#111111]">证据地图：我们如何逼近真相</h2>
        <p className="mt-2 text-sm font-sans text-[#4A5568]">四类证据不是并列陈列，而是一条逐层逼近真相的调查路径。</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {evidenceCards.map((card) => (
          <div key={card.title} className="relative rounded-sm border border-[#D9D4C7] bg-white/80 p-6 shadow-sm">
            <div className={`mb-4 h-1.5 w-20 ${card.color}`} />
            <div className="text-sm tracking-[0.2em] text-[#6B7280]">{card.title}</div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-serif font-bold text-[#111111]">{card.value}</span>
              <span className="pb-1 text-sm text-[#6B7280]">{card.unit}</span>
            </div>
            <div className="mt-4 border-l-2 border-[#D4C4A8] pl-3 text-base font-serif text-[#2D3748]">{card.note}</div>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-dashed border-[#C9B79C] bg-[rgba(255,255,255,0.72)] p-6">
        <div className="mb-4 text-sm tracking-[0.25em] text-[#8B7355]">INVESTIGATION PATH</div>
        <div className="flex items-center justify-between gap-4 text-center">
          <div className="flex-1 rounded-sm bg-[#F7F3EA] p-4">
            <div className="text-sm text-[#8C3636]">媒体</div>
            <div className="mt-2 text-lg font-serif text-[#111111]">谁在讲故事</div>
          </div>
          <div className="text-2xl text-[#B7791F]">→</div>
          <div className="flex-1 rounded-sm bg-[#F7F3EA] p-4">
            <div className="text-sm text-[#B7791F]">时间</div>
            <div className="mt-2 text-lg font-serif text-[#111111]">矛盾如何升级</div>
          </div>
          <div className="text-2xl text-[#B7791F]">→</div>
          <div className="flex-1 rounded-sm bg-[#F7F3EA] p-4">
            <div className="text-sm text-[#2C3E50]">关系</div>
            <div className="mt-2 text-lg font-serif text-[#111111]">谁能进入现场</div>
          </div>
          <div className="text-2xl text-[#B7791F]">→</div>
          <div className="flex-1 rounded-sm bg-[#F7F3EA] p-4">
            <div className="text-sm text-[#4A5568]">邮件</div>
            <div className="mt-2 text-lg font-serif text-[#111111]">谁提前准备离场</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slide2EvidenceMap;
