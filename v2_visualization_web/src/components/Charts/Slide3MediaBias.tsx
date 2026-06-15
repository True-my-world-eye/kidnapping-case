import React from 'react';

interface Slide3MediaBiasProps {
  data: any[];
  wordData?: any; // 运行时从 dataLoader 加载的 word_frequencies.json
}

/**
 * Slide3MediaBias - 静态词云图（替换原ECharts动态图表）
 * 展示第一幕"非对称的舆论屠杀": 定罪词汇如墨水般碾压微弱发声
 *
 * 数据源：wordData 来自 public/data/word_frequencies.json，
 * 由 build_word_frequencies.py 从 articles_lite.csv 统计生成。
 * 数字可完整复现。立场阈值：stance_score ≤4 = 亲建制，≥6 = 亲POK。
 */
const Slide3MediaBias: React.FC<Slide3MediaBiasProps> = ({ wordData }) => {
  // 从运行时数据获取文章数量；若未传入则显示占位
  const sourceBreakdown = wordData?.source_breakdown || {};
  const govCount: number = sourceBreakdown.pro_gov ?? 381;
  const pokCount: number = sourceBreakdown.pro_pok ?? 167;

  return (
    <div className="h-full w-full relative overflow-hidden bg-[#F5F2EB]">
      {/* 旧纸张纹理 */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.08) 3px,rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* 词云图片 */}
      <div className="absolute inset-0 flex items-center justify-center pt-20 pb-20 px-4">
        <img
          src="/wordcloud_slide3.png"
          alt="媒体定罪词云"
          className="max-w-full max-h-full object-contain"
          style={{
            filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.08))',
          }}
        />
      </div>

      {/* 右下角证据标注 */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="bg-[#FEFCF8] border border-[#D8D0C4] p-3 max-w-[210px] shadow-md rounded-sm">
          <div
            className="text-[9px] text-[#8C3636] font-bold tracking-wider uppercase mb-1.5"
            style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}
          >
            Data Evidence
          </div>
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-2xl font-bold text-[#2C3E50]" style={{ fontFamily: 'Georgia, serif' }}>
              {govCount}
            </span>
            <span className="text-[10px] text-[#666]" style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}>
              篇亲政府报道
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-bold text-[#8C3636]" style={{ fontFamily: 'Georgia, serif' }}>
              {pokCount}
            </span>
            <span className="text-[10px] text-[#666]" style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}>
              篇亲POK报道
            </span>
          </div>
          <div className="h-[5px] bg-[#E2E2E2] rounded-full overflow-hidden mb-2 flex">
            <div
              className="h-full bg-[#2C3E50] rounded-l-full"
              style={{ width: `${(govCount / (govCount + pokCount)) * 100}%` }}
            />
            <div
              className="h-full bg-[#8C3636] rounded-r-full"
              style={{ width: `${(pokCount / (govCount + pokCount)) * 100}%` }}
            />
          </div>
          <p
            className="text-[9px] text-[#777] leading-relaxed italic"
            style={{ fontFamily: 'Georgia, "Noto Serif SC", serif' }}
          >
            "在真相尚未查明之时，
            <br />
            媒体已经完成了死刑判决。"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Slide3MediaBias;
