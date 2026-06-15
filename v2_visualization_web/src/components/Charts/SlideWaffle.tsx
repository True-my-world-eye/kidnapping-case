import React, { useMemo } from 'react';

interface SlideWaffleProps {
  data?: any[];
}

/**
 * Q2 补充图：845篇文章立场分布 Waffle Chart
 * 每格=1篇文章，按立场评分着色
 */
const SlideWaffle: React.FC<SlideWaffleProps> = ({ data }) => {
  const grid = useMemo(() => {
    if (!data || data.length === 0) return null;

    // 按立场评分统计文章数
    const stanceCounts: Record<number, number> = {};
    data.forEach((d: any) => {
      const score = Number(d.stance_score_0_pro_gov_gastech_10_pro_pok) || 5;
      const count = Number(d.article_count) || 0;
      stanceCounts[score] = (stanceCounts[score] || 0) + count;
    });

    // 生成格子数组
    const cells: { score: number; color: string }[] = [];
    const colorMap: Record<number, string> = {
      0: '#1a365d', 1: '#2C3E50', 2: '#3d5a80', 3: '#5a7fa8',
      4: '#8B7355', 5: '#D4C4A8', 6: '#9cb88a', 7: '#7BA378',
      8: '#526E4F', 9: '#3d5238', 10: '#2d3e28',
    };

    Object.entries(stanceCounts)
      .sort(([a], [b]) => Number(a) - Number(b))
      .forEach(([score, count]) => {
        for (let i = 0; i < Math.min(count, 200); i++) {
          cells.push({ score: Number(score), color: colorMap[Number(score)] || '#ccc' });
        }
      });

    // 填充到 40x21 = 840 格
    while (cells.length < 840) {
      cells.push({ score: 5, color: '#eee' });
    }

    return { cells: cells.slice(0, 840), cols: 40, rows: 21 };
  }, [data]);

  if (!grid) return <div className="h-full flex items-center justify-center text-[#888]">Loading...</div>;

  const cellSize = 14;
  const gap = 2;
  const svgWidth = grid.cols * (cellSize + gap);
  const svgHeight = grid.rows * (cellSize + gap);

  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-6 pt-5 pb-3">
        <h2 className="text-[20px] font-serif font-bold text-[#111111]">845 篇报道的立场分布</h2>
        <p className="mt-1 text-sm font-sans text-[#666]">每格 = 1 篇文章，颜色 = 立场评分（深蓝=亲建制 → 深绿=亲POK）</p>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
          {grid.cells.map((cell, i) => {
            const col = i % grid.cols;
            const row = Math.floor(i / grid.cols);
            return (
              <rect
                key={i}
                x={col * (cellSize + gap)}
                y={row * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={1.5}
                fill={cell.color}
                opacity={0.85}
              />
            );
          })}
        </svg>
      </div>

      {/* 底部图例 */}
      <div className="flex-shrink-0 border-t border-[#E2E2E2] px-6 py-3 bg-white/60 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#2C3E50' }} />
          <span className="text-[11px] font-sans text-[#333]">亲建制 (0-2)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#8B7355' }} />
          <span className="text-[11px] font-sans text-[#333]">中立 (4-5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ background: '#526E4F' }} />
          <span className="text-[11px] font-sans text-[#333]">亲POK (6-10)</span>
        </div>
      </div>
    </div>
  );
};

export default SlideWaffle;
