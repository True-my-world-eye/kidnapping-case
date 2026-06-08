import React, { useEffect, useState, useRef } from 'react';
import wordData from '@/data/word_frequencies.json';

/**
 * Slide3InkDrop - 静态词云图版本
 * 直接显示 Python 生成的高质量词云图片，叠加标题和标注。
 */
const Slide3InkDrop: React.FC = () => {
  const [show, setShow] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 300);
    const t2 = setTimeout(() => setShowAnnotation(true), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const govCount = wordData.source_breakdown.pro_gov;
  const pokCount = wordData.source_breakdown.pro_pok;

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

      {/* 标题 */}
      <div
        className="absolute top-4 left-6 z-20"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.8s ease',
        }}
      >
        <h2
          className="text-[#111] text-xl font-bold tracking-wide"
          style={{ fontFamily: 'Georgia, "Noto Serif SC", serif' }}
        >
          词汇绞杀：舆论的死刑判决
        </h2>
        <p
          className="text-[#666] text-xs mt-1"
          style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}
        >
          845 篇新闻报道中，官方定罪词汇如墨水般碾压一切
        </p>
      </div>

      {/* 计数器 */}
      <div
        className="absolute top-4 right-6 z-20 text-right"
        style={{
          opacity: show ? 1 : 0,
          transition: 'opacity 0.8s ease 0.4s',
        }}
      >
        <div
          className="text-[10px] text-[#999] tracking-widest uppercase"
          style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}
        >
          Conviction Words
        </div>
        <div
          className="text-4xl font-bold text-[#2C3E50]"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          20
          <span className="text-sm text-[#999] ml-1">/ 20</span>
        </div>
      </div>

      {/* 词云图片 */}
      <div
        className="absolute inset-0 flex items-center justify-center pt-16 pb-16 px-8"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 1s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <img
          src="/wordcloud_slide3.png"
          alt="媒体定罪词云"
          className="max-w-full max-h-full object-contain"
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))',
          }}
        />
      </div>

      {/* 右下角证据标注 */}
      <div
        className="absolute bottom-5 right-5 z-20"
        style={{
          opacity: showAnnotation ? 1 : 0,
          transform: showAnnotation ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="bg-[#FEFCF8] border border-[#D8D0C4] p-4 max-w-[230px] shadow-md rounded-sm">
          <div
            className="text-[10px] text-[#8C3636] font-bold tracking-wider uppercase mb-2"
            style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}
          >
            Data Evidence
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-3xl font-bold text-[#2C3E50]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {govCount}
            </span>
            <span
              className="text-[11px] text-[#666]"
              style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}
            >
              篇亲政府报道
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="text-3xl font-bold text-[#8C3636]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {pokCount}
            </span>
            <span
              className="text-[11px] text-[#666]"
              style={{ fontFamily: '"Helvetica Neue", Inter, sans-serif' }}
            >
              篇亲POK报道
            </span>
          </div>
          <div className="h-[6px] bg-[#E2E2E2] rounded-full overflow-hidden mb-3 flex">
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
            className="text-[10px] text-[#777] leading-relaxed italic"
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

export default Slide3InkDrop;
