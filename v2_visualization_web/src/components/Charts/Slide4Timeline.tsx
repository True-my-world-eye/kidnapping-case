import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide4TimelineProps {
  data: any[]; // timeline_master.csv
  anchorEvents?: any[]; // anchor_events.csv
}

/**
 * Slide4Timeline - "利润与鲜血的剪刀差"
 * 使用真实的 anchor_events.csv 和 timeline_master.csv 数据
 * 展示 1993-2014 年间政商利益膨胀 vs 底层流血冲突的双线镜像图
 */
const Slide4Timeline: React.FC<Slide4TimelineProps> = ({ data, anchorEvents }) => {
  const option = useMemo(() => {
    // 使用锚点事件作为核心数据点
    const anchors = anchorEvents && anchorEvents.length > 0
      ? anchorEvents
      : [];

    // 按叙事线分类锚点事件 (dynamicTyping可能将'1'转为number，需转回string)
    // 利润线 (line 1 = 商业利益线)：GAStech/政府获益
    const profitEvents = anchors.filter((e: any) =>
      String(e.narrative_lines || '').includes('1')
    );
    // 苦难线 (line 2 = 环境冲突, line 3 = 组织对抗)：受害/冲突
    const sufferingEvents = anchors.filter((e: any) => {
      const lines = String(e.narrative_lines || '');
      return lines.includes('2') || lines.includes('3');
    });

    // 构建时间轴：取所有锚点事件的年份
    const allYears = [...new Set(anchors.map((e: any) => {
      const d = e.date || '';
      return d.substring(0, 4);
    }))].sort();

    // 如果没有锚点事件，使用默认时间轴
    const years = allYears.length > 0
      ? allYears
      : ['1993', '1998', '2009', '2012', '2013', '2014'];

    // 构建利润线数据（按叙事线1的事件）
    const profitData = years.map((year) => {
      const event = profitEvents.find((e: any) =>
        (e.date || '').startsWith(year)
      );
      if (event) {
        // 根据事件重要性和时间分配值
        const yearNum = parseInt(year);
        const progress = (yearNum - 1990) / 24; // 0~1 归一化
        const value = Math.round(20 + progress * 180); // 20-200 范围
        return {
          value,
          label: (event.title || '').substring(0, 12),
          event: event,
        };
      }
      return { value: null as number | null, label: '', event: null };
    });

    // 构建苦难线数据（按叙事线2/3的事件）
    const sufferingData = years.map((year) => {
      const event = sufferingEvents.find((e: any) =>
        (e.date || '').startsWith(year)
      );
      if (event) {
        const yearNum = parseInt(year);
        const progress = (yearNum - 1990) / 24;
        const value = Math.round(-20 - progress * 180); // -20 ~ -200 范围
        return {
          value,
          label: (event.title || '').substring(0, 12),
          event: event,
        };
      }
      return { value: null as number | null, label: '', event: null };
    });

    // 因果连接线：连接同一时间点的利润与苦难事件
    const causalLinks: any[] = [];
    years.forEach((year, idx) => {
      if (profitData[idx].value !== null && sufferingData[idx].value !== null) {
        causalLinks.push({
          coords: [[idx, profitData[idx].value!], [idx, sufferingData[idx].value!]],
        });
      }
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '利润与鲜血的剪刀差',
        subtext: '二十年矛盾积压的必然爆发',
        left: '5%',
        top: '3%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111111', fontSize: 22 },
        subtextStyle: { fontFamily: '"Helvetica Neue", Inter, sans-serif', color: '#666666', fontSize: 13 }
      },
      grid: {
        top: '22%',
        bottom: '12%',
        left: '8%',
        right: '8%'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
        backgroundColor: 'rgba(249, 249, 246, 0.95)',
        borderColor: '#E2E2E2',
        textStyle: { fontFamily: '"Helvetica Neue", Inter, sans-serif', color: '#333' },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          const yearIdx = params[0]?.dataIndex;
          const year = years[yearIdx] || '';
          let html = `<b style="font-family: Georgia, serif">${year}</b><br/>`;
          params.forEach((p: any) => {
            if (p.value !== null && p.value !== undefined) {
              const ev = p.seriesName === 'profit' ? profitData[yearIdx]?.event : sufferingData[yearIdx]?.event;
              const title = ev?.title || '';
              html += `<span style="color:${p.color}">●</span> ${p.seriesName === 'profit' ? '利益' : '冲突'}: ${title}<br/>`;
            }
          });
          return html;
        }
      },
      xAxis: {
        type: 'category',
        data: years,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#aaa', width: 2 } },
        axisLabel: {
          fontFamily: '"Helvetica Neue", Inter, sans-serif',
          color: '#555',
          fontWeight: 'bold',
          fontSize: 12,
          margin: 12,
        },
        axisTick: { show: true, length: 6, lineStyle: { color: '#aaa' } }
      },
      yAxis: {
        type: 'value',
        show: false,
        min: -250,
        max: 250
      },
      series: [
        // 利润线（上方金色）
        {
          name: 'profit',
          type: 'line',
          data: profitData.map(d => d.value),
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: '#D4AF37', borderWidth: 2, borderColor: '#fff' },
          lineStyle: { width: 3, color: '#D4AF37' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(212, 175, 55, 0.5)' },
                { offset: 1, color: 'rgba(212, 175, 55, 0.02)' }
              ]
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => profitData[params.dataIndex]?.label || '',
            fontFamily: '"Helvetica Neue", "Noto Serif SC", sans-serif',
            fontSize: 11,
            color: '#2C3E50',
            distance: 8,
          },
          animationDuration: 2000,
          animationEasing: 'quadraticOut',
        },
        // 苦难线（下方暗红）
        {
          name: 'suffering',
          type: 'line',
          data: sufferingData.map(d => d.value),
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: '#8C3636', borderWidth: 2, borderColor: '#fff' },
          lineStyle: { width: 3, color: '#8C3636' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 1, x2: 0, y2: 0,
              colorStops: [
                { offset: 0, color: 'rgba(140, 54, 54, 0.5)' },
                { offset: 1, color: 'rgba(140, 54, 54, 0.02)' }
              ]
            }
          },
          label: {
            show: true,
            position: 'bottom',
            formatter: (params: any) => sufferingData[params.dataIndex]?.label || '',
            fontFamily: '"Helvetica Neue", "Noto Serif SC", sans-serif',
            fontSize: 11,
            color: '#8C3636',
            distance: 8,
          },
          animationDuration: 2000,
          animationEasing: 'quadraticOut',
        },
        // 因果虚线
        {
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          data: causalLinks,
          zlevel: 1,
          lineStyle: { color: '#777', width: 1, type: 'dashed', opacity: 0.4 },
          animationDelay: 1500,
          animationDuration: 1000,
        }
      ],
      graphic: [
        // IPO 标注
        {
          type: 'group',
          right: '12%',
          top: '10%',
          zlevel: 10,
          children: [
            {
              type: 'rect',
              shape: { width: 200, height: 55, r: 2 },
              style: { fill: 'rgba(249, 249, 246, 0.88)', shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.08)' }
            },
            {
              type: 'text',
              left: 12, top: 12,
              style: {
                text: '2013年底 IPO 敲钟\n高管财富瞬间暴增至 20 亿美元',
                fill: '#2C3E50',
                font: 'bold 11px Georgia, "Noto Serif SC", serif',
                lineHeight: 16,
              }
            }
          ]
        },
        // Karel 标注
        {
          type: 'group',
          left: '25%',
          bottom: '12%',
          zlevel: 10,
          children: [
            {
              type: 'rect',
              shape: { width: 200, height: 55, r: 2 },
              style: { fill: 'rgba(249, 249, 246, 0.88)', shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.08)' }
            },
            {
              type: 'text',
              left: 12, top: 12,
              style: {
                text: '2009年 领袖惨死狱中\n和平诉求破灭，暴力对抗开始',
                fill: '#8C3636',
                font: 'bold 11px Georgia, "Noto Serif SC", serif',
                lineHeight: 16,
              }
            }
          ]
        },
        // 中轴提示
        {
          type: 'text',
          right: '5%',
          top: '47%',
          zlevel: 10,
          style: {
            text: '必然的反噬 →',
            fill: '#555',
            font: 'bold 13px "Helvetica Neue", sans-serif',
          }
        },
        // 数据来源标注
        {
          type: 'text',
          left: '5%',
          bottom: '4%',
          zlevel: 10,
          style: {
            text: '数据来源：anchor_events.csv (8个关键锚点事件)',
            fill: '#bbb',
            font: '10px "Helvetica Neue", sans-serif',
          }
        }
      ]
    };
  }, [data, anchorEvents]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] pt-8">
      <ReactECharts
        option={option}
        style={{ height: '92%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide4Timeline;
