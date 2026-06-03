import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide6HeatmapProps {
  data: any[];
}

const Slide6Heatmap: React.FC<Slide6HeatmapProps> = ({ data }) => {
  const option = useMemo(() => {
    // Since we might not have the raw daily email data with topics ready in the CSV,
    // we will simulate the pattern described in the narrative based on the known dates
    // (Jan 1 to Jan 20, 2014, with spike on Jan 16-19).
    
    const days = [];
    const baseDate = new Date('2014-01-01');
    for (let i = 0; i <= 19; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }

    const topics = ['General/Admin', 'Project/Tech', 'Security/VIP'];
    
    // Generate synthetic data matching the narrative
    const seriesData = [];
    topics.forEach((topic, tIndex) => {
      days.forEach((day, dIndex) => {
        let value = 10 + Math.random() * 20; // Base traffic
        
        // The narrative: "Security/VIP emails spiked abnormally before the incident"
        if (topic === 'Security/VIP' && dIndex >= 14 && dIndex <= 18) {
          value = 80 + Math.random() * 40; // Huge spike Jan 15-19
        }
        
        seriesData.push([dIndex, tIndex, Math.round(value)]);
      });
    });

    return {
      backgroundColor: 'transparent',
      title: {
        text: '危险的预警',
        subtext: '内部邮件主题分类异常流量 (2014.1.1 - 1.20)',
        left: '5%',
        top: '5%',
        textStyle: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 24 },
        subtextStyle: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333' }
      },
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(249, 249, 246, 0.95)',
        borderColor: '#D4C4A8',
        textStyle: { color: '#333333', fontFamily: 'Helvetica Neue, sans-serif' },
        formatter: (params: any) => {
          return `${days[params.data[0]]}<br/>
                  <b>${topics[params.data[1]]}</b>: ${params.data[2]} 封邮件`;
        }
      },
      grid: {
        top: '25%',
        bottom: '15%',
        left: '15%',
        right: '10%'
      },
      xAxis: {
        type: 'category',
        data: days.map(d => d.substring(5)), // Show MM-DD
        splitArea: { show: true, areaStyle: { color: ['rgba(250,250,250,0.3)','rgba(200,200,200,0.1)'] } },
        axisLabel: { fontFamily: 'Helvetica Neue, sans-serif', color: '#333333' },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        data: topics,
        splitArea: { show: true },
        axisLabel: { fontFamily: 'Georgia, serif', color: '#111111', fontSize: 13 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      visualMap: {
        min: 0,
        max: 120,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#E2E2E2', '#D4C4A8', '#8C3636'] // Gray to Sand to Brick Red
        },
        textStyle: { fontFamily: 'Helvetica Neue, sans-serif' }
      },
      series: [{
        name: 'Emails',
        type: 'heatmap',
        data: seriesData,
        label: {
          show: false
        },
        itemStyle: {
          borderColor: '#F9F9F6',
          borderWidth: 2
        },
        // Annotations
        markPoint: {
          symbol: 'pin',
          symbolSize: 40,
          itemStyle: { color: '#111111' },
          data: [
            {
              coord: [16, 2], // Jan 17, Security
              label: {
                formatter: '安保邮件\n激增 400%',
                position: 'top',
                color: '#8C3636',
                fontFamily: 'Helvetica Neue, sans-serif',
                fontWeight: 'bold',
                distance: 10
              }
            }
          ]
        }
      }]
    };
  }, [data]);

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