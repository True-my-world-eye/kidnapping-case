import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

type AnchorEvent = {
  date?: string;
  title?: string;
  significance?: string;
  event_id?: string;
  related_entities?: string;
};

type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  note: string;
  color: string;
};

const CORE_EVENTS: TimelineEvent[] = [
  {
    id: 'ANCHOR-03',
    date: '2009.02.18',
    title: 'POK 在 GAStech 总部抗议，多人被捕',
    note: '环保诉求与 GAStech 正面冲突；政府下令加强未来 POK 集会安保',
    color: '#8C3636',
  },
  {
    id: 'ANCHOR-04',
    date: '2009.06.20',
    title: 'Elian Karel 死亡引发 Abila 骚乱',
    note: 'POK 领袖之死成为运动象征，抗议升级为暴力冲突',
    color: '#8C3636',
  },
  {
    id: 'ANCHOR-05',
    date: '2012.06.22',
    title: 'Kapelou 总统称 POK 为「罪犯集团」',
    note: '政府公开定性 POK，预示后续强硬执法',
    color: '#8C3636',
  },
  {
    id: 'ANCHOR-08',
    date: '2014.01.20',
    title: 'GAStech 高管失踪/绑架，POK 被指认',
    note: '全案高潮：14 名员工被绑，POK 发赎金要求，APA 亦被提及',
    color: '#111111',
  },
];

const ANIMATION_MS = 7000;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const formatDate = (raw: string) => {
  const clean = raw.slice(0, 10).replace(/-/g, '.');
  return clean.length === 10 ? clean : clean.slice(0, 7);
};

const buildEvents = (anchorEvents: AnchorEvent[]): TimelineEvent[] => {
  const pokIds = ['ANCHOR-03', 'ANCHOR-04', 'ANCHOR-05', 'ANCHOR-08'];
  const fromData = pokIds
    .map((id) => anchorEvents.find((e) => String(e.event_id) === id))
    .filter(Boolean)
    .map((event) => {
      const id = String(event!.event_id);
      return {
        id,
        date: formatDate(String(event!.date || '')),
        title: String(event!.title || ''),
        note: String(event!.significance || ''),
        color: id === 'ANCHOR-08' ? '#111111' : '#8C3636',
      };
    });

  return fromData.length === 4 ? fromData : CORE_EVENTS;
};

interface SlidePOKHistoryProps {
  anchorEvents?: AnchorEvent[];
}

const SlidePOKHistory: React.FC<SlidePOKHistoryProps> = ({ anchorEvents = [] }) => {
  const events = buildEvents(anchorEvents);
  const { ref: containerRef, inView } = useInView({ threshold: 0.25, triggerOnce: false });
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>();
  const hasStartedRef = useRef(false);

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

  const lineProgress = Math.min(1, progress * 1.15);
  const nodeThreshold = (index: number) => (index + 0.35) / events.length;
  const nodeOpacity = (index: number) => {
    const threshold = nodeThreshold(index);
    if (progress < threshold - 0.08) return 0;
    if (progress >= threshold) return 1;
    return (progress - (threshold - 0.08)) / 0.08;
  };
  const nodeScale = (index: number) => 0.82 + nodeOpacity(index) * 0.18;
  const inferenceVisible = progress > 0.82;

  return (
    <div
      ref={containerRef}
      className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner p-5 flex flex-col"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-sans tracking-[0.24em] text-[#8B7355]">POK HISTORY</div>
          <h2 className="mt-1 text-[25px] font-serif font-bold text-[#111111]">长期冲突如何走向绑架</h2>
          <p className="mt-1 max-w-3xl text-sm font-sans text-[#6B7280]">
            先看 POK 为什么会成为最容易被指向的嫌疑对象：它不是突然出现，而是在长期污染、抗议和执法冲突中被推到台前。
          </p>
        </div>
        <button
          type="button"
          onClick={runAnimation}
          className="flex-shrink-0 mt-1 rounded-sm border border-[#DDD4C7] bg-white/80 px-3 py-1.5 text-xs font-sans text-[#5A6572] transition hover:border-[#8B7355] hover:text-[#111111]"
        >
          重播时间线
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-sm border border-[#E2DDD5] bg-[radial-gradient(circle_at_50%_40%,rgba(212,196,168,0.10),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(252,250,246,0.96))] px-6 pt-8 pb-24">
        {/* 时间轴基线 */}
        <div className="absolute left-[8%] right-[8%] top-[38%] h-[2px] bg-[#E2DDD5]" />
        <div
          className="absolute left-[8%] top-[38%] h-[2px] origin-left bg-gradient-to-r from-[#8C3636] via-[#8C3636] to-[#111111] transition-none"
          style={{ width: `${lineProgress * 84}%` }}
        />

        <div className="relative grid h-full grid-cols-4 gap-5">
          {events.map((event, index) => {
            const opacity = nodeOpacity(index);
            const scale = nodeScale(index);
            const isClimax = event.color === '#111111';

            return (
              <div
                key={event.id}
                className="flex min-h-0 flex-col items-center"
                style={{
                  opacity,
                  transform: `translateY(${(1 - opacity) * 18}px) scale(${scale})`,
                  transition: 'none',
                }}
              >
                <div
                  className={`z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] font-serif text-[15px] font-bold text-white shadow-md ${
                    isClimax ? 'border-[#333333]' : 'border-[#F9F9F6]'
                  }`}
                  style={{
                    backgroundColor: event.color,
                    boxShadow: isClimax && opacity > 0.9
                      ? '0 0 0 6px rgba(17,17,17,0.08), 0 4px 12px rgba(0,0,0,0.15)'
                      : '0 4px 10px rgba(0,0,0,0.10)',
                  }}
                >
                  {index + 1}
                </div>

                <div
                  className={`mt-5 w-full rounded-sm border bg-[#FCFAF6]/95 p-4 text-center shadow-sm backdrop-blur-sm ${
                    isClimax ? 'border-[#333333]/30' : 'border-[#E2DDD5]'
                  }`}
                >
                  <div className="font-serif text-[17px] font-bold tracking-tight" style={{ color: event.color }}>
                    {event.date}
                  </div>
                  <div className="mt-2 font-serif text-[15px] font-bold leading-snug text-[#111111]">
                    {event.title}
                  </div>
                  <div className="mt-2 font-sans text-[12px] leading-relaxed text-[#666666]">
                    {event.note}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 推理结论 */}
        <div
          className="absolute bottom-5 left-6 right-6 rounded-sm border border-dashed border-[#C9B79C] bg-[#F9F9F6]/95 px-5 py-3 backdrop-blur-sm"
          style={{
            opacity: inferenceVisible ? Math.min(1, (progress - 0.82) / 0.1) : 0,
            transform: `translateY(${inferenceVisible ? 0 : 12}px)`,
          }}
        >
          <div className="font-sans text-[11px] font-bold tracking-[0.2em] text-[#8C3636]">INFERENCE</div>
          <div className="mt-1 font-serif text-[16px] font-bold leading-relaxed text-[#111111]">
            POK 有长期动机和冲突历史，但「有动机」不等于「唯一凶手」。
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidePOKHistory;
