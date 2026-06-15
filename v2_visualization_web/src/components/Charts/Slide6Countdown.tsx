import React from 'react';

const flows = [
  {
    id: 'pok',
    label: 'POK / 外部抗议线',
    color: '#8C3636',
    glow: 'rgba(140, 54, 54, 0.24)',
    width: 30,
    startY: 110,
    endY: 310,
    summary: '污染旧怨',
    chain: '旧怨 → 反 IPO → 被预设指认',
    checkpoints: [
      { x: 380, y: 92, title: 'T-72h', note: '旧怨未退', event: '抗议情绪延续', align: 'top' as const },
      { x: 620, y: 140, title: 'T-48h', note: '反 IPO', event: '反 IPO 叙事升温', align: 'top' as const },
      { x: 840, y: 198, title: 'T-24h', note: '被预设指认', event: 'POK 成为首要嫌疑', align: 'top' as const },
    ],
  },
  {
    id: 'exec',
    label: 'GAStech 高层',
    color: '#B7791F',
    glow: 'rgba(183, 121, 31, 0.24)',
    width: 34,
    startY: 270,
    endY: 340,
    summary: 'IPO / VIP 异动',
    chain: 'IPO 活跃 → 越级通信 → Files / 离场',
    checkpoints: [
      { x: 380, y: 260, title: 'T-72h', note: 'IPO 活跃', event: '高层仍在推进 IPO / VIP', align: 'top' as const },
      { x: 620, y: 290, title: 'T-48h', note: '越级通信', event: '顶层直接联络底层', align: 'bottom' as const },
      { x: 840, y: 316, title: 'T-24h', note: 'Files / 离场', event: '13:03 CEO 发送 Files', align: 'bottom' as const },
    ],
  },
  {
    id: 'ops',
    label: '安保 / 执行层',
    color: '#2C3E50',
    glow: 'rgba(44, 62, 80, 0.22)',
    width: 28,
    startY: 440,
    endY: 388,
    summary: '巡逻与路线异动',
    chain: 'Patrol → 安保加速 → 路线变化',
    checkpoints: [
      { x: 380, y: 460, title: 'T-72h', note: 'Patrol', event: '巡逻与检查启动', align: 'bottom' as const },
      { x: 620, y: 440, title: 'T-48h', note: '安保加速', event: '会场安保同步加速', align: 'top' as const },
      { x: 840, y: 418, title: 'T-24h', note: '路线变化', event: '13:37 Route suggestion', align: 'bottom' as const },
    ],
  },
  {
    id: 'gov',
    label: '政府 / 接待链',
    color: '#4A5568',
    glow: 'rgba(74, 85, 104, 0.2)',
    width: 22,
    startY: 600,
    endY: 420,
    summary: '接待链打开场域',
    chain: 'VIP 接待 → 会场微调 → 条件被利用',
    checkpoints: [
      { x: 380, y: 620, title: 'T-72h', note: 'VIP 接待', event: '接待准备进入最后阶段', align: 'bottom' as const },
      { x: 620, y: 578, title: 'T-48h', note: '会场微调', event: '宾客与会场安排微调', align: 'bottom' as const },
      { x: 840, y: 528, title: 'T-24h', note: '条件被利用', event: '现场条件具备可利用空间', align: 'bottom' as const },
    ],
  },
];

const columnLabels = [
  { x: 190, label: '可疑势力' },
  { x: 380, label: 'T-72h' },
  { x: 620, label: 'T-48h' },
  { x: 840, label: 'T-24h' },
  { x: 1040, label: '绑架之夜' },
];

const flowPath = (startY: number, endY: number) =>
  `M 190 ${startY} C 380 ${startY}, 700 ${endY}, 955 ${endY}`;

const Slide6Countdown: React.FC = () => {
  return (
    <div className="h-full w-full bg-[#F9F9F6] border border-[#E2E2E2] rounded-sm shadow-inner flex flex-col overflow-hidden">
      {/* 顶部标题 */}
      <div className="flex-shrink-0 px-6 pt-5 pb-3">
        <h2 className="text-[28px] font-serif font-bold tracking-tight text-[#111111]">案发前 72 小时：多方异动汇流</h2>
        <p className="mt-1 max-w-4xl text-sm font-sans leading-6 text-[#4A5568]">
          同一时间窗口里，四股力量同步异动，最终汇向同一个爆点。
        </p>
      </div>

      {/* SVG 可视化填满剩余区域 */}
      <div className="flex-1 min-h-0 relative mx-4 mb-4 overflow-hidden rounded-sm border border-[#DDD4C7] bg-[radial-gradient(circle_at_84%_48%,rgba(212,196,168,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,241,234,0.94))]">
        <svg viewBox="0 0 1140 700" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
          <defs>
            {flows.map((flow) => (
              <linearGradient key={flow.id} id={`gradient-${flow.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={flow.color} stopOpacity="0.88" />
                <stop offset="65%" stopColor={flow.color} stopOpacity="0.65" />
                <stop offset="100%" stopColor={flow.color} stopOpacity="0.95" />
              </linearGradient>
            ))}
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.10)" />
            </filter>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 时间轴竖虚线 */}
          {columnLabels.map((column) => (
            <g key={column.label}>
              <line x1={column.x} y1="60" x2={column.x} y2="660" stroke="#E2D6C2" strokeDasharray="5 7" />
              <text x={column.x} y="32" textAnchor="middle" fontSize="13" fill="#8B7355" letterSpacing="2.4" fontWeight="500">
                {column.label}
              </text>
            </g>
          ))}

          {/* 四条流向 */}
          {flows.map((flow) => (
            <g key={flow.id}>
              {/* 光晕 */}
              <path
                d={flowPath(flow.startY, flow.endY)}
                fill="none"
                stroke={flow.glow}
                strokeWidth={flow.width + 14}
                strokeLinecap="round"
                opacity="0.5"
              />
              {/* 主线 */}
              <path
                d={flowPath(flow.startY, flow.endY)}
                fill="none"
                stroke={`url(#gradient-${flow.id})`}
                strokeWidth={flow.width}
                strokeLinecap="round"
                opacity="0.95"
                filter="url(#softShadow)"
              />

              {/* 左侧标签 */}
              <line x1="172" y1={flow.startY} x2="190" y2={flow.startY} stroke={flow.color} strokeWidth="2.5" opacity="0.7" />
              <circle cx="170" cy={flow.startY} r="10" fill={flow.color} />
              <text x="22" y={flow.startY - 8} fontSize="20" fill="#111111" fontFamily="Georgia, serif" fontWeight="bold">
                {flow.label}
              </text>
              <text x="22" y={flow.startY + 14} fontSize="12" fill="#5A6572">
                {flow.summary}
              </text>
              <text x="22" y={flow.startY + 32} fontSize="11" fill="#7B8794">
                {flow.chain}
              </text>

              {/* 检查点 */}
              {flow.checkpoints.map((point) => (
                <g key={`${flow.id}-${point.title}`}>
                  <circle cx={point.x} cy={point.y} r="8" fill={flow.color} stroke="#fff" strokeWidth="2.5" />
                  <text
                    x={point.x}
                    y={point.align === 'top' ? point.y - 22 : point.y + 22}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#8B7355"
                    letterSpacing="1"
                  >
                    {point.title}
                  </text>
                  <text
                    x={point.x}
                    y={point.align === 'top' ? point.y + 18 : point.y + 38}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#2D3748"
                    fontWeight="500"
                  >
                    {point.note}
                  </text>
                  <text
                    x={point.x}
                    y={point.align === 'top' ? point.y + 34 : point.y + 54}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#6B7280"
                  >
                    {point.event}
                  </text>
                </g>
              ))}
            </g>
          ))}

          {/* 终点：绑架之夜 */}
          <g>
            <circle cx="1040" cy="365" r="80" fill="#111111" opacity="0.96" filter="url(#glow)" />
            <circle cx="1040" cy="365" r="100" fill="none" stroke="#D4C4A8" strokeDasharray="8 8" strokeWidth="2" opacity="0.85" />
            <circle cx="1040" cy="365" r="118" fill="none" stroke="rgba(212,196,168,0.22)" strokeWidth="1.5" />
            <text x="1040" y="348" textAnchor="middle" fontSize="22" fill="#F9F9F6" fontFamily="Georgia, serif" fontWeight="bold">
              绑架之夜
            </text>
            <text x="1040" y="376" textAnchor="middle" fontSize="14" fill="#EBD9BE" letterSpacing="1.4">
              2014.01.20
            </text>
            <text x="1040" y="400" textAnchor="middle" fontSize="12" fill="#F2E7D2">
              四股力量的汇点
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Slide6Countdown;
