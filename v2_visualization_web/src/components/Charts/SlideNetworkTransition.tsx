import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const layers = [
  {
    title: '外部冲突',
    items: ['GAStech', 'Kronos 政府', 'POK', 'Elodis 污染'],
    note: '先看到的是四方矛盾',
    color: '#2C3E50',
  },
  {
    title: '舆论指向',
    items: ['媒体定调', 'POK 嫌疑化', '安全叙事'],
    note: '公众认知被推向 POK',
    color: '#8B7355',
  },
  {
    title: '内部网络',
    items: ['安保邮件', '幽灵员工', '异常通信', 'Files'],
    note: '真正值得追的是内部通道',
    color: '#8C3636',
  },
];

/** 列间汇流：四方 → 三节点 → 内部焦点（仅绘制在卡片间隙） */
const flowPaths = [
  { id: 'a1', d: 'M 302 58 C 318 58, 328 72, 338 88', color: '#2C3E50', width: 4 },
  { id: 'a2', d: 'M 302 108 C 318 108, 328 112, 338 128', color: '#2C3E50', width: 4 },
  { id: 'a3', d: 'M 302 158 C 318 158, 328 148, 338 148', color: '#8C3636', width: 5 },
  { id: 'a4', d: 'M 302 208 C 318 208, 328 182, 338 168', color: '#526E4F', width: 4 },
  { id: 'b1', d: 'M 598 88 C 612 96, 622 108, 638 118', color: '#8B7355', width: 4 },
  { id: 'b2', d: 'M 598 128 C 612 128, 622 124, 638 128', color: '#8B7355', width: 4 },
  { id: 'b3', d: 'M 598 168 C 612 168, 622 152, 638 138', color: '#8B7355', width: 4 },
  { id: 'c1', d: 'M 638 118 C 660 128, 682 138, 698 148', color: '#8C3636', width: 5 },
  { id: 'c2', d: 'M 638 128 C 662 134, 684 140, 698 148', color: '#8C3636', width: 5 },
  { id: 'c3', d: 'M 638 138 C 664 142, 686 146, 698 148', color: '#8C3636', width: 5 },
];

const ANIMATION_MS = 5200;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** 当前调查焦点落在哪一列（0/1/2） */
const activeColumn = (progress: number) => {
  if (progress < 0.38) return 0;
  if (progress < 0.72) return 1;
  return 2;
};

const SlideNetworkTransition: React.FC = () => {
  const { ref: containerRef, inView } = useInView({ threshold: 0.3, triggerOnce: false });
  const [progress, setProgress] = useState(0);
  const [pathLengths, setPathLengths] = useState<Record<string, number>>({});
  const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const rafRef = useRef<number>();
  const hasStartedRef = useRef(false);

  useLayoutEffect(() => {
    const lengths: Record<string, number> = {};
    flowPaths.forEach((path) => {
      const el = pathRefs.current[path.id];
      if (el) lengths[path.id] = el.getTotalLength();
    });
    setPathLengths(lengths);
  }, []);

  const runAnimation = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / ANIMATION_MS, 1);
      setProgress(easeOutCubic(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (inView && !hasStartedRef.current) {
      hasStartedRef.current = true;
      runAnimation();
    }
    if (!inView) hasStartedRef.current = false;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [inView, runAnimation]);

  const columnOpacity = (index: number) => {
    const reveal = [0, 0.2, 0.48][index];
    if (progress < reveal - 0.04) return 0;
    if (progress >= reveal) return 1;
    return (progress - (reveal - 0.04)) / 0.04;
  };

  const focused = (index: number) => activeColumn(progress) === index && progress > 0.08;

  const pathDraw = (pathId: string, pathIndex: number) => {
    const len = pathLengths[pathId] ?? 400;
    const stagger = pathIndex * 0.04;
    const fp = progress <= stagger ? 0 : Math.min(1, (progress - stagger) / (1 - stagger));
    return { strokeDasharray: len, strokeDashoffset: len * (1 - fp) };
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col overflow-hidden rounded-sm border border-[#E2E2E2] bg-[#F9F9F6] p-5 shadow-inner"
    >
      <div className="mb-3 flex-shrink-0">
        <div className="font-sans text-[11px] tracking-[0.24em] text-[#8B7355]">NETWORK TRANSITION</div>
        <h2 className="mt-1 font-serif text-[25px] font-bold text-[#111111]">复杂的关系网络</h2>
        <p className="mt-1 max-w-3xl font-sans text-sm text-[#6B7280]">
          从这里开始，调查视角从外部冲突转向 GAStech 内部：谁有接触条件，谁能打开通道。
        </p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-visible rounded-sm border border-[#E2DDD5] bg-white/70">
        {/* 背景汇流 SVG */}
        <svg
          viewBox="0 0 920 300"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {flowPaths.map((path, i) => (
            <path
              key={`measure-${path.id}`}
              ref={(el) => { pathRefs.current[path.id] = el; }}
              d={path.d}
              fill="none"
              stroke="none"
              visibility="hidden"
            />
          ))}

          {flowPaths.map((path, i) => (
            <g key={path.id}>
              <path
                d={path.d}
                fill="none"
                stroke={path.color}
                strokeWidth={path.width + 6}
                strokeLinecap="round"
                opacity={0.12}
                style={pathDraw(path.id, i)}
              />
              <path
                d={path.d}
                fill="none"
                stroke={path.color}
                strokeWidth={path.width}
                strokeLinecap="round"
                opacity={0.45}
                style={pathDraw(path.id, i)}
              />
            </g>
          ))}

          {/* 汇流焦点（第三列中心） */}
          <circle
            cx={698}
            cy={148}
            r={progress > 0.78 ? 6 + Math.sin((progress - 0.78) * 18) * 1.5 : 0}
            fill="#8C3636"
            opacity={Math.min(1, (progress - 0.78) * 6)}
          />
        </svg>

        {/* 三栏内容 */}
        <div className="relative z-10 grid h-full grid-cols-3 gap-5 overflow-visible p-5">
          {layers.map((layer, index) => {
            const opacity = columnOpacity(index);
            const isFocused = focused(index);

            return (
              <div key={layer.title} className="relative flex min-h-0 flex-col overflow-visible">
                <div
                  className="flex min-h-0 flex-1 flex-col rounded-sm border bg-[#FCFAF6] p-5 shadow-sm transition-[border-color,box-shadow] duration-300"
                  style={{
                    borderColor: isFocused ? layer.color : '#E2DDD5',
                    boxShadow: isFocused
                      ? `0 0 0 1px ${layer.color}30, 0 6px 20px rgba(0,0,0,0.07)`
                      : '0 1px 4px rgba(0,0,0,0.04)',
                    opacity,
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="font-serif text-2xl font-bold" style={{ color: layer.color }}>
                      {layer.title}
                    </div>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full font-sans text-sm font-bold text-white"
                      style={{ backgroundColor: layer.color }}
                    >
                      {index + 1}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2.5">
                    {layer.items.map((item) => (
                      <div
                        key={item}
                        className={`rounded-sm border px-4 py-3 font-serif text-[17px] font-bold text-[#111111] ${
                          item === 'Files'
                            ? 'border-[#8C3636]/35 bg-white'
                            : 'border-[#E8E2D8] bg-white'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div
                    className="mt-4 border-l-4 px-4 py-3 font-sans text-sm leading-relaxed text-[#555555]"
                    style={{ borderColor: layer.color }}
                  >
                    {layer.note}
                  </div>
                </div>

                {index < layers.length - 1 && (
                  <div className="absolute -right-[22px] top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#D4C4A8] bg-[#F9F9F6] font-serif text-2xl font-bold text-[#B7791F] shadow-sm">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SlideNetworkTransition;
