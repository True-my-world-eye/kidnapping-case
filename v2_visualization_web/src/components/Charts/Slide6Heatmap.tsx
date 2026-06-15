import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide6HeatmapProps {
  data: any[];
}

/* ── 主题分类：将原始 topic / subject 归入 3 大类 ── */
const securityKeywords = [
  'security', 'patrol', 'inspection', 'vip', 'kidnapping',
  'safety', 'guard', 'access', 'route', 'procedure', 'emergency',
];
const businessKeywords = [
  'ipo', 'business', 'reorganization', 'files', 'coffee',
  'wellhead', 'seismic', 'flow rate', 'data', 'report',
  'budget', 'contract', 'staples',
];

function classifyEmail(row: any): string {
  const topic = (row.topics || '').toLowerCase();
  const subject = (row.subject || '').toLowerCase();

  // 优先按 topic 字段分类
  if (topic === 'security' || topic === 'kidnapping') return '安保/VIP';
  if (topic === 'ipo' || topic === 'business' || topic === 'environment') return '商务/IPO';

  // topic 为空时，按 subject 关键词匹配
  if (securityKeywords.some((kw) => subject.includes(kw))) return '安保/VIP';
  if (businessKeywords.some((kw) => subject.includes(kw))) return '商务/IPO';

  return '日常/行政';
}

function extractDate(row: any): string | null {
  // date 字段格式: "2014-01-06 10:28" 或 "1/6/2014 10:28"
  const raw = row.date || row.date_raw || '';
  if (!raw) return null;

  // 尝试 ISO 格式 "2014-01-06"
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  // 尝试美式格式 "M/D/YYYY"
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return null;
}

const Slide6Heatmap: React.FC<Slide6HeatmapProps> = ({ data }) => {
  const { days, topics, seriesData, maxVal, spikeInfo } = useMemo(() => {
    if (!data || data.length === 0) {
      return { days: [], topics: [], seriesData: [], maxVal: 0, spikeInfo: null };
    }

    // 1. 分类 & 聚合
    const topicOrder = ['安保/VIP', '商务/IPO', '日常/行政'];
    const counts: Record<string, Record<string, number>> = {};
    const allDays = new Set<string>();

    data.forEach((row) => {
      const date = extractDate(row);
      if (!date) return;
      const topic = classifyEmail(row);
      allDays.add(date);
      if (!counts[topic]) counts[topic] = {};
      counts[topic][date] = (counts[topic][date] || 0) + 1;
    });

    // 2. 排序日期
    const sortedDays = Array.from(allDays).sort();

    // 3. 构建热力图数据 [dayIndex, topicIndex, value]
    const series: [number, number, number][] = [];
    let max = 0;
    topicOrder.forEach((topic, tIdx) => {
      sortedDays.forEach((day, dIdx) => {
        const val = counts[topic]?.[day] || 0;
        series.push([dIdx, tIdx, val]);
        if (val > max) max = val;
      });
    });

    // 4. 找到安保类的最大值日期（用于标注）
    let spike: { dayIdx: number; val: number; date: string } | null = null;
    const secCounts = counts['安保/VIP'] || {};
    for (const [day, val] of Object.entries(secCounts)) {
      if (!spike || val > spike.val) {
        spike = { dayIdx: sortedDays.indexOf(day), val, date: day };
      }
    }

    return {
      days: sortedDays,
      topics: topicOrder,
      seriesData: series,
      maxVal: max,
      spikeInfo: spike,
    };
  }, [data]);

  const option = useMemo(() => {
    if (days.length === 0) return {};

    return {
      backgroundColor: 'transparent',
      title: {
        text: '危险的预警',
        subtext: `内部邮件主题分类异常流量 (${days[0]} — ${days[days.length - 1]})`,
        left: '5%',
        top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333' },
      },
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(249, 249, 246, 0.95)',
        borderColor: '#D4C4A8',
        textStyle: { color: '#333333', fontFamily: 'Helvetica Neue, sans-serif' },
        formatter: (params: any) => {
          const [dIdx, tIdx, val] = params.data;
          return `${days[dIdx]}<br/><b>${topics[tIdx]}</b>: ${val} 封邮件`;
        },
      },
      grid: {
        top: '25%',
        bottom: '15%',
        left: '15%',
        right: '10%',
      },
      xAxis: {
        type: 'category',
        data: days.map((d) => d.substring(5)),
        splitArea: {
          show: true,
          areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.1)'] },
        },
        axisLabel: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'category',
        data: topics,
        splitArea: { show: true },
        axisLabel: {
          fontFamily: 'Georgia, serif',
          color: '#111111',
          fontSize: 13,
          fontWeight: 'bold',
        },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#E2E2E2', '#D4C4A8', '#8C3636'],
        },
        textStyle: { fontFamily: 'Helvetica Neue, sans-serif' },
      },
      series: [
        {
          name: 'Emails',
          type: 'heatmap',
          data: seriesData,
          label: { show: false },
          itemStyle: {
            borderColor: '#F9F9F6',
            borderWidth: 2,
          },
          ...(spikeInfo
            ? {
                markPoint: {
                  symbol: 'pin',
                  symbolSize: 40,
                  itemStyle: { color: '#111111' },
                  data: [
                    {
                      coord: [spikeInfo.dayIdx, 0],
                      label: {
                        formatter: `安保邮件\n激增 ${spikeInfo.val} 封`,
                        position: 'top',
                        color: '#8C3636',
                        fontFamily: 'Helvetica Neue, sans-serif',
                        fontWeight: 'bold',
                        distance: 10,
                      },
                    },
                  ],
                },
              }
            : {}),
        },
      ],
    };
  }, [days, topics, seriesData, maxVal, spikeInfo]);

  return (
    <div className="h-full w-full">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide6Heatmap;
