import React from 'react';

/**
 * Q4 对比图：2014 vs 2026 方法论
 * 左右两栏对比卡片，用图标和文字说明差异
 */
const SlideMethodCompare: React.FC = () => {
  const items2014 = [
    { icon: '📊', label: '静态统计', desc: '柱状图、饼图、手动标注' },
    { icon: '📰', label: '逐篇阅读', desc: '人工审阅新闻内容' },
    { icon: '🔗', label: '手工建模', desc: '手动绘制关系图' },
    { icon: '📋', label: '静态报告', desc: 'PPT / Word 汇报' },
    { icon: '🔍', label: '单一视角', desc: '线性叙事，无交互' },
  ];

  const items2026 = [
    { icon: '🌐', label: '交互探索', desc: 'Scrollytelling + 点击揭示' },
    { icon: '🤖', label: 'NLP 自动化', desc: '情感分析、实体识别、主题建模' },
    { icon: '📐', label: '力导向网络', desc: 'D3/ECharts 自动布局 + 动画' },
    { icon: '🖥️', label: 'Web 可视化', desc: 'React + ECharts 实时渲染' },
    { icon: '🔀', label: '多维度叙事', desc: '用户自主选择探索路径' },
  ];

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner flex flex-col overflow-hidden">
      {/* 标题 */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <h2 className="text-[24px] font-serif font-bold text-[#111111]">
          如果 2014 年做了这个挑战，今年怎么做得更好？
        </h2>
        <p className="mt-1 text-sm font-sans text-[#666]">
          12 年间，数据可视化工具和方法论都发生了根本性变化
        </p>
      </div>

      {/* 对比区域 */}
      <div className="flex-1 min-h-0 flex gap-0">
        {/* 2014 列 */}
        <div className="flex-1 flex flex-col px-8 py-4 border-r border-[#E2E2E2]">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🕰️</span>
            <h3 className="text-lg font-serif font-bold text-[#8B7355]">2014 年方法</h3>
          </div>
          <div className="space-y-3 flex-1">
            {items2014.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-[#8B7355]/5 border border-[#8B7355]/10">
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-sm font-bold text-[#8B7355]">{item.label}</div>
                  <div className="text-xs text-[#888] mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-sm bg-[#8B7355]/5 border border-[#8B7355]/10">
            <div className="text-xs text-[#8B7355] font-sans leading-relaxed">
              <strong>核心局限：</strong>分析结果不可复现，依赖个人判断，叙事路径单一
            </div>
          </div>
        </div>

        {/* 中间箭头 */}
        <div className="flex items-center justify-center w-16 flex-shrink-0">
          <div className="flex flex-col items-center">
            <div className="text-3xl text-[#D4AF37]">→</div>
            <div className="text-[10px] font-sans text-[#D4AF37] font-bold mt-1">进化</div>
          </div>
        </div>

        {/* 2026 列 */}
        <div className="flex-1 flex flex-col px-8 py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🚀</span>
            <h3 className="text-lg font-serif font-bold text-[#2C3E50]">2026 年方法</h3>
          </div>
          <div className="space-y-3 flex-1">
            {items2026.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-sm bg-[#2C3E50]/5 border border-[#2C3E50]/10">
                <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <div className="text-sm font-bold text-[#2C3E50]">{item.label}</div>
                  <div className="text-xs text-[#888] mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-sm bg-[#2C3E50]/5 border border-[#2C3E50]/10">
            <div className="text-xs text-[#2C3E50] font-sans leading-relaxed">
              <strong>核心优势：</strong>数据驱动、可复现、交互式叙事、多视角呈现
            </div>
          </div>
        </div>
      </div>

      {/* 底部总结 */}
      <div className="flex-shrink-0 border-t border-[#E2E2E2] px-8 py-3 bg-white/60">
        <div className="text-xs font-sans text-[#888] text-center">
          本项目采用 React + TypeScript + Apache ECharts 构建，数据从 21 张结构化 CSV 表自动加载，支持实时交互探索
        </div>
      </div>
    </div>
  );
};

export default SlideMethodCompare;
