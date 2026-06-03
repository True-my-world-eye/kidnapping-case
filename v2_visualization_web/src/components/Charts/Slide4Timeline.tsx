import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide4TimelineProps {
  data: any[];
}

const Slide4Timeline: React.FC<Slide4TimelineProps> = ({ data }) => {
  const option = useMemo(() => {
    // 高级视觉概念：利润与鲜血的剪刀差 (The Scissors of Profit & Blood)
    
    // 1. 数据映射：X 轴时间节点 (1993 - 2014)
    const years = ['1993', '1995', '1998', '2001', '2009', '2011', '2013', '2014(Jan)'];

    // 2. 商业与利益线 (中轴上方，金色区域，代表 GAStech 与政府的利益膨胀)
    const profitData = [
      { value: 10,  label: '开发协议签署' },     // 1993
      { value: 20,  label: 'HASR技术引进' },     // 1995
      { value: 35,  label: '污染初步显现' },     // 1998
      { value: 50,  label: '否决资源税法案' },   // 2001 (政府庇护)
      { value: 75,  label: '强力镇压暴乱' },     // 2009
      { value: 90,  label: '定性POK为威胁' },    // 2011
      { value: 180, label: 'IPO 暴富 ($2B)' }, // 2013 (极值点)
      { value: 200, label: '20周年庆典' }        // 2014
    ];

    // 3. 环境与对抗线 (中轴下方，暗红色区域，代表污染恶化与流血冲突)
    const bloodData = [
      { value: -5,   label: '潜伏期' },
      { value: -15,  label: 'HASR被禁(原国)' },
      { value: -40,  label: 'Juliana 苯中毒死亡' }, // 1998 (转折点，情感图腾)
      { value: -45,  label: '环保抗议开始' },
      { value: -120, label: 'Karel 惨死狱中' },    // 2009 (暴力化转折点)
      { value: -140, label: '暴力对抗常态化' },
      { value: -160, label: '袭警事件激增' },
      { value: -200, label: '14名高管被绑架' }      // 2014 (极值点，爆发)
    ];

    // 4. 虚线因果连接数据 (Custom Series)
    const causalLinks = [
      { coords: [[2, 35], [2, -40]] },   // 1998: 利益扩张 -> 女孩死亡
      { coords: [[4, 75], [4, -120]] },  // 2009: 强力镇压 -> 领袖惨死
      { coords: [[6, 180], [6, -160]] }, // 2013: IPO暴富 -> 袭警激增
      { coords: [[7, 200], [7, -200]] }  // 2014: 周年庆典 -> 绑架爆发
    ];

    return {
      backgroundColor: 'transparent',
      title: {
        text: '利润与鲜血的剪刀差',
        subtext: '二十年矛盾积压的必然爆发',
        left: '5%',
        top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333', fontSize: 14 }
      },
      grid: {
        top: '25%',
        bottom: '15%',
        left: '10%',
        right: '10%'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' }
      },
      xAxis: {
        type: 'category',
        data: years,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#888888', width: 2 } }, // 中轴线
        axisLabel: { fontFamily: 'Helvetica Neue, sans-serif', color: '#555555', fontWeight: 'bold', fontSize: 13, margin: 15 },
        axisTick: { show: true, length: 8, lineStyle: { color: '#888888' } }
      },
      yAxis: {
        type: 'value',
        show: false, // 隐藏 Y 轴，靠图形和文字说话
        min: -250,
        max: 250
      },
      series: [
        // --- 商业利益线 (上方金色区域) ---
        {
          name: '政商利益膨胀',
          type: 'line',
          data: profitData.map(d => d.value),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#D4AF37' }, // 暗金色
          lineStyle: { width: 3, color: '#D4AF37' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{ offset: 0, color: 'rgba(212, 175, 55, 0.6)' }, { offset: 1, color: 'rgba(212, 175, 55, 0.05)' }]
            }
          },
          label: {
            show: true,
            position: 'top',
            formatter: (params: any) => profitData[params.dataIndex].label,
            fontFamily: 'Helvetica Neue, sans-serif',
            fontSize: 12,
            color: '#2C3E50',
            distance: 10
          },
          animationDuration: 2000,
          animationEasing: 'quadraticOut'
        },
        // --- 环境冲突线 (下方暗红区域) ---
        {
          name: '底层流血冲突',
          type: 'line',
          data: bloodData.map(d => d.value),
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#8C3636' }, // 暗红色
          lineStyle: { width: 3, color: '#8C3636' },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 1, x2: 0, y2: 0, // 渐变方向向上
              colorStops: [{ offset: 0, color: 'rgba(140, 54, 54, 0.6)' }, { offset: 1, color: 'rgba(140, 54, 54, 0.05)' }]
            }
          },
          label: {
            show: true,
            position: 'bottom',
            formatter: (params: any) => bloodData[params.dataIndex].label,
            fontFamily: 'Helvetica Neue, sans-serif',
            fontSize: 12,
            color: '#8C3636',
            distance: 10
          },
          animationDuration: 2000,
          animationEasing: 'quadraticOut'
        },
        // --- 因果绞杀虚线 (连接上下节点) ---
        {
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          data: causalLinks,
          zlevel: 1,
          lineStyle: {
            color: '#555555',
            width: 1,
            type: 'dashed',
            opacity: 0.5
          },
          animationDelay: 1500, // 等主图画完再画连线
          animationDuration: 1000
        }
      ],
      graphic: [
        // NYT 风格的高级图上标注 (Annotations)
        {
          type: 'group',
          left: '55%',
          top: '12%',
          zlevel: 10,
          children: [
            { type: 'rect', shape: { width: 200, height: 60, r: 2 }, style: { fill: 'rgba(249, 249, 246, 0.85)', shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.1)' } },
            { type: 'text', left: 15, top: 15, style: { text: '2013年底 IPO 敲钟\n高管财富瞬间暴增至 20 亿美元', fill: '#2C3E50', font: 'bold 12px Georgia, serif', lineHeight: 18 } }
          ]
        },
        {
          type: 'group',
          left: '30%',
          bottom: '12%',
          zlevel: 10,
          children: [
            { type: 'rect', shape: { width: 220, height: 60, r: 2 }, style: { fill: 'rgba(249, 249, 246, 0.85)', shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.1)' } },
            { type: 'text', left: 15, top: 15, style: { text: '2009年 领袖惨死狱中\n和平诉求破灭，彻底转向暴力对抗', fill: '#8C3636', font: 'bold 12px Georgia, serif', lineHeight: 18 } }
          ]
        },
        {
          type: 'group',
          right: '5%',
          top: '48%',
          zlevel: 10,
          children: [
            { type: 'text', left: 0, top: 0, style: { text: '必然的反噬 →', fill: '#111111', font: 'bold 14px Helvetica Neue, sans-serif' } }
          ]
        }
      ]
    };
  }, [data]);

  return (
    <div className="h-full w-full bg-[#F9F9F6] pt-10">
      <ReactECharts 
        option={option} 
        style={{ height: '90%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide4Timeline;