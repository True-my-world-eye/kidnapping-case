import React, { useEffect, useState, useMemo, useRef } from 'react';
import wordData from '@/data/word_frequencies.json';

/**
 * Slide3InkDrop - "墨水绞杀" 媒体偏见可视化
 *
 * 概念：像墨水滴落纸面一样，定罪词汇一滴一滴砸上来，
 * 逐渐吞噬整个画面，而环保/受害者的微弱声音被墨迹淹没。
 */

interface InkWord {
  word: string;
  label?: string;
  count: number;
  tier: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  rotation: number;
  isConviction: boolean;
  splashes: { cx: number; cy: number; rx: number; ry: number; opacity: number }[];
}

// 确定性随机数生成器，保证每次渲染结果一致
function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 生成所有词汇的布局和墨滴数据（只计算一次）
function buildLayout(): InkWord[] {
  const rng = createRng(42);
  const words: InkWord[] = [];
  const occupied: { x: number; y: number; r: number }[] = [];

  const convictionData = wordData.curated_conviction_words;
  const proPokData = wordData.proPOK_words;

  // 碰撞检测：确保词汇不重叠
  const tryPlace = (
    minDist: number,
    bounds: { xMin: number; xMax: number; yMin: number; yMax: number }
  ): [number, number] => {
    for (let i = 0; i < 60; i++) {
      const x = bounds.xMin + rng() * (bounds.xMax - bounds.xMin);
      const y = bounds.yMin + rng() * (bounds.yMax - bounds.yMin);
      const tooClose = occupied.some(
        (a) => Math.hypot(a.x - x, a.y - y) < a.r + minDist
      );
      if (!tooClose) return [x, y];
    }
    // fallback: 随机放
    return [
      bounds.xMin + rng() * (bounds.xMax - bounds.xMin),
      bounds.yMin + rng() * (bounds.yMax - bounds.yMin),
    ];
  };

  // 为每个词生成墨水飞溅的子圆
  const makeSplashes = (
    wordSize: number,
    isConviction: boolean,
    tier: number
  ) => {
    const count = isConviction ? (tier === 1 ? 5 : tier === 2 ? 3 : 2) : 1;
    return Array.from({ length: count }, () => {
      const angle = rng() * Math.PI * 2;
      const dist = wordSize * 0.3 * rng();
      return {
        cx: Math.cos(angle) * dist,
        cy: Math.sin(angle) * dist,
        rx: wordSize * (0.2 + rng() * 0.4),
        ry: wordSize * (0.15 + rng() * 0.3),
        opacity: isConviction ? 0.06 + rng() * 0.12 : 0.03 + rng() * 0.05,
      };
    });
  };

  // === 第一波 (0-3s)：核心定罪词，最大最黑 ===
  convictionData
    .filter((w) => w.tier === 1)
    .forEach((w, i) => {
      const r = w.count / 10;
      const [x, y] = tryPlace(r, { xMin: 8, xMax: 88, yMin: 10, yMax: 85 });
      occupied.push({ x, y, r });
      words.push({
        word: w.word.toUpperCase(),
        label: w.label,
        count: w.count,
        tier: w.tier,
        x,
        y,
        size: Math.max(20, Math.min(44, w.count / 3)),
        delay: i * 380 + rng() * 120,
        rotation: (rng() - 0.5) * 10,
        isConviction: true,
        splashes: makeSplashes(w.count / 3, true, 1),
      });
    });

  // === 第二波 (3-6s)：次级定罪词 ===
  convictionData
    .filter((w) => w.tier === 2)
    .forEach((w, i) => {
      const r = w.count / 14;
      const [x, y] = tryPlace(r, { xMin: 5, xMax: 90, yMin: 8, yMax: 88 });
      occupied.push({ x, y, r });
      words.push({
        word: w.word.toUpperCase(),
        label: w.label,
        count: w.count,
        tier: w.tier,
        x,
        y,
        size: Math.max(14, Math.min(28, w.count / 3.5)),
        delay: 3200 + i * 300 + rng() * 100,
        rotation: (rng() - 0.5) * 14,
        isConviction: true,
        splashes: makeSplashes(w.count / 3.5, true, 2),
      });
    });

  // === 第三波 (6-9s)：辅助定罪词 ===
  convictionData
    .filter((w) => w.tier === 3)
    .forEach((w, i) => {
      const r = w.count / 16;
      const [x, y] = tryPlace(r, { xMin: 5, xMax: 92, yMin: 5, yMax: 90 });
      occupied.push({ x, y, r });
      words.push({
        word: w.word.toUpperCase(),
        label: w.label,
        count: w.count,
        tier: w.tier,
        x,
        y,
        size: Math.max(10, Math.min(20, w.count / 4.5)),
        delay: 6200 + i * 250 + rng() * 80,
        rotation: (rng() - 0.5) * 18,
        isConviction: true,
        splashes: makeSplashes(w.count / 4.5, true, 3),
      });
    });

  // === 最后 (9s+)：环保/受害词，微弱到几乎看不见 ===
  proPokData.slice(0, 10).forEach((w, i) => {
    const [x, y] = tryPlace(8, { xMin: 10, xMax: 85, yMin: 10, yMax: 85 });
    words.push({
      word: w.word,
      count: w.count,
      tier: 4,
      x,
      y,
      size: Math.max(7, Math.min(11, w.count / 8)),
      delay: 9200 + i * 250,
      rotation: (rng() - 0.5) * 8,
      isConviction: false,
      splashes: makeSplashes(w.count / 8, false, 4),
    });
  });

  return words;
}

const Slide3InkDrop: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showAnnotation, setShowAnnotation] = useState(false);
  const allWords = useMemo(() => buildLayout(), []);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // 逐个显示词汇
    allWords.forEach((word, i) => {
      const t = window.setTimeout(() => {
        setVisibleCount(i + 1);
      }, word.delay);
      timers.current.push(t);
    });

    // 标注框延迟出现
    const annotationDelay =
      allWords.length > 0
        ? allWords[allWords.length - 1].delay + 800
        : 12000;
    const t = window.setTimeout(() => setShowAnnotation(true), annotationDelay);
    timers.current.push(t);

    return () => timers.current.forEach(clearTimeout);
  }, [allWords]);

  const visibleWords = allWords.slice(0, visibleCount);
  const govCount = wordData.source_breakdown.pro_gov;
  const pokCount = wordData.source_breakdown.pro_pok;
  const convictionVisible = visibleWords.filter((w) => w.isConviction).length;
  const convictionTotal = allWords.filter((w) => w.isConviction).length;

  return (
    <div className="h-full w-full relative overflow-hidden bg-[#F5F2EB]">
      {/* 旧纸张纹理 */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
        }}
      />

      {/* 标题 */}
      <div className="absolute top-4 left-6 z-20">
        <h2
          className="text-[#111] text-xl font-bold tracking-wide"
          style={{
            fontFamily: 'Georgia, "Noto Serif SC", serif',
            opacity: visibleCount > 2 ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        >
          词汇绞杀：舆论的死刑判决
        </h2>
        <p
          className="text-[#666] text-xs mt-1"
          style={{
            fontFamily: '"Helvetica Neue", Inter, sans-serif',
            opacity: visibleCount > 5 ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        >
          845 篇新闻报道中，官方定罪词汇如墨水般碾压一切
        </p>
      </div>

      {/* 计数器 */}
      <div
        className="absolute top-4 right-6 z-20 text-right"
        style={{
          opacity: visibleCount > 10 ? 1 : 0,
          transition: 'opacity 0.8s ease',
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
          {convictionVisible}
          <span className="text-sm text-[#999] ml-1">
            / {convictionTotal}
          </span>
        </div>
      </div>

      {/* 墨水词汇 SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <filter id="ink-rough" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.03"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="0.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {visibleWords.map((word, idx) => {
          const isGov = word.isConviction;
          const inkColor = isGov ? 'rgba(18, 18, 22, 0.88)' : 'rgba(120, 120, 120, 0.2)';
          const splashFill = isGov ? 'rgba(18, 18, 22, 0.08)' : 'rgba(120, 120, 120, 0.04)';
          const textColor = isGov ? '#111' : '#aaa';
          const animDuration = word.tier === 1 ? '0.5s' : '0.4s';

          return (
            <g
              key={`w-${idx}`}
              style={{
                opacity: 0,
                animation: `inkAppear ${animDuration} cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                animationDelay: `${word.delay}ms`,
              }}
            >
              {/* 墨水飞溅圆 */}
              {word.splashes.map((s, si) => (
                <ellipse
                  key={si}
                  cx={word.x + s.cx * 0.3}
                  cy={word.y + s.cy * 0.3}
                  rx={s.rx * 0.4}
                  ry={s.ry * 0.4}
                  fill={splashFill}
                  style={{
                    opacity: 0,
                    transform: `translate(${word.x + s.cx * 0.3}px, ${word.y + s.cy * 0.3}px) scale(0)`,
                    animation: `splashAppear 0.6s ease-out forwards`,
                    animationDelay: `${word.delay + si * 40}ms`,
                    transformOrigin: `${word.x + s.cx * 0.3}px ${word.y + s.cy * 0.3}px`,
                  }}
                />
              ))}

              {/* 核心词的重墨点 */}
              {isGov && word.tier <= 2 && (
                <circle
                  cx={word.x}
                  cy={word.y}
                  r={word.size * 0.08}
                  fill={inkColor}
                  filter="url(#ink-rough)"
                  style={{
                    opacity: 0,
                    animation: `splashAppear 0.3s ease-out forwards`,
                    animationDelay: `${word.delay}ms`,
                    transformOrigin: `${word.x}px ${word.y}px`,
                  }}
                />
              )}

              {/* 词汇文字 */}
              <text
                x={word.x}
                y={word.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textColor}
                style={{
                  fontSize: `${word.size * 0.3}px`,
                  fontFamily:
                    isGov && word.tier <= 2
                      ? '"Impact", "Arial Black", "Helvetica Neue", sans-serif'
                      : 'Georgia, "Noto Serif SC", serif',
                  fontWeight: word.tier === 1 ? 900 : word.tier === 2 ? 700 : 400,
                  letterSpacing: isGov ? '0.08em' : '0.02em',
                  transform: `rotate(${word.rotation}deg)`,
                  transformOrigin: `${word.x}px ${word.y}px`,
                  paintOrder: 'stroke fill',
                  stroke: isGov ? 'rgba(18,18,22,0.2)' : 'transparent',
                  strokeWidth: isGov && word.tier === 1 ? 0.12 : 0,
                  opacity: 0,
                  animation: `textAppear 0.3s ease-out forwards`,
                  animationDelay: `${word.delay + 50}ms`,
                }}
              >
                {word.word}
              </text>

              {/* 中文注释（仅Tier 1） */}
              {word.label && word.tier === 1 && (
                <text
                  x={word.x}
                  y={word.y + word.size * 0.2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="rgba(140, 54, 54, 0.55)"
                  style={{
                    fontSize: `${word.size * 0.14}px`,
                    fontFamily: '"Noto Serif SC", Georgia, serif',
                    fontWeight: 400,
                    fontStyle: 'italic',
                    opacity: 0,
                    animation: `textAppear 0.4s ease-out forwards`,
                    animationDelay: `${word.delay + 200}ms`,
                  }}
                >
                  {word.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* 右下角证据标注 */}
      <div
        className="absolute bottom-5 right-5 z-20"
        style={{
          opacity: showAnnotation ? 1 : 0,
          transform: showAnnotation ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="bg-white/92 backdrop-blur-sm border border-[#E2E2E2] p-4 max-w-[230px] shadow-lg rounded-sm">
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
          {/* 声量比例条 */}
          <div className="h-[6px] bg-[#E2E2E2] rounded-full overflow-hidden mb-3 flex">
            <div
              className="h-full bg-[#2C3E50] rounded-l-full"
              style={{
                width: `${(govCount / (govCount + pokCount)) * 100}%`,
                transition: 'width 1.5s ease',
              }}
            />
            <div
              className="h-full bg-[#8C3636] rounded-r-full"
              style={{
                width: `${(pokCount / (govCount + pokCount)) * 100}%`,
                transition: 'width 1.5s ease',
              }}
            />
          </div>
          <p
            className="text-[10px] text-[#999] leading-relaxed italic"
            style={{ fontFamily: 'Georgia, "Noto Serif SC", serif' }}
          >
            "在真相尚未查明之时，
            <br />
            媒体已经完成了死刑判决。"
          </p>
        </div>
      </div>

      {/* CSS 动画 */}
      <style>{`
        @keyframes inkAppear {
          0% {
            opacity: 0;
            transform: scale(0.05);
            filter: blur(6px);
          }
          60% {
            opacity: 0.9;
            transform: scale(1.12);
            filter: blur(0.5px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes splashAppear {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes textAppear {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Slide3InkDrop;
