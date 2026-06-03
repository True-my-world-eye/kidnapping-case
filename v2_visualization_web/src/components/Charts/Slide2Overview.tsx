import React from 'react';
import ReactECharts from 'echarts-for-react';

const Slide2Overview = () => {
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'tree',
        data: [
          {
            name: '真相\nThe Truth',
            itemStyle: { color: '#2C3E50' },
            symbolSize: 20,
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left',
              fontSize: 16,
              fontFamily: 'Georgia, serif',
              color: '#111111'
            },
            children: [
              {
                name: '新闻报道\nNews Reports',
                value: 845,
                itemStyle: { color: '#8C3636' },
                symbolSize: 15,
                label: {
                  position: 'left',
                  verticalAlign: 'middle',
                  align: 'right',
                  fontSize: 14,
                  fontFamily: 'Helvetica Neue, sans-serif',
                  color: '#333333'
                }
              },
              {
                name: '内部邮件\nInternal Emails',
                value: 1200,
                itemStyle: { color: '#526E4F' },
                symbolSize: 15,
                label: {
                  position: 'left',
                  verticalAlign: 'middle',
                  align: 'right',
                  fontSize: 14,
                  fontFamily: 'Helvetica Neue, sans-serif',
                  color: '#333333'
                }
              },
              {
                name: '财报及档案\nFinancials & Records',
                value: 54,
                itemStyle: { color: '#D4C4A8' },
                symbolSize: 15,
                label: {
                  position: 'left',
                  verticalAlign: 'middle',
                  align: 'right',
                  fontSize: 14,
                  fontFamily: 'Helvetica Neue, sans-serif',
                  color: '#333333'
                }
              }
            ]
          }
        ],
        top: '10%',
        left: '20%',
        bottom: '10%',
        right: '40%',
        symbolSize: 7,
        orient: 'RL', // Right to Left
        edgeShape: 'curve',
        edgeForkPosition: '63%',
        initialTreeDepth: 3,
        lineStyle: {
          color: '#D4C4A8',
          width: 2,
          curveness: 0.5
        },
        animationDurationUpdate: 750
      }
    ]
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <ReactECharts 
        option={option} 
        style={{ height: '100%', width: '100%' }}
        className="react_for_echarts"
      />
    </div>
  );
};

export default Slide2Overview;