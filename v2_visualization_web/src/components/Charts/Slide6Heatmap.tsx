import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface Slide6HeatmapProps {
  data: any[]; // emails.csv
}

/**
 * Slide6Heatmap - "危险的预警"
 * 使用真实邮件数据，展示案发前两周各类邮件的频率变化
 * Security/VIP 类邮件在案发前异常激增
 */
const Slide6Heatmap: React.FC<Slide6HeatmapProps> = ({ data }) => {
  const option = useMemo(() => {
    if (!data || data.length === 0) {
      return { backgroundColor: 'transparent', title: { text: 'Loading...' } };
    }

    // 按日期和主题分组统计邮件数量
    const dateTopicMap: Record<string, Record<string, number>> = {};
    const dateSet = new Set<string>();

    data.forEach((email: any) => {
      const rawDate = email.date || email.date_raw || '';
      // 统一日期格式为 YYYY-MM-DD
      let dateKey = '';
      if (rawDate.includes('-') && rawDate.length >= 10) {
        dateKey = rawDate.substring(0, 10);
      } else if (rawDate.includes('/')) {
        // 处理 M/D/YYYY 格式
        const parts = rawDate.split(' ')[0].split('/');
        if (parts.length === 3) {
          const m = parts[0].padStart(2, '0');
          const d = parts[1].padStart(2, '0');
          const y = parts[2];
          dateKey = `${y}-${m}-${d}`;
        }
      }

      if (!dateKey) return;
      dateSet.add(dateKey);

      // 获取主题分类
      const topic = (email.topics || '').trim().toLowerCase();
      let category = 'General';
      if (topic === 'security') category = 'Security/VIP';
      else if (topic === 'environment') category = 'Environment';
      else if (topic === 'ipo' || topic === 'business') category = 'Business/IPO';
      else if (topic === 'kidnapping') category = 'Kidnapping';

      if (!dateTopicMap[dateKey]) dateTopicMap[dateKey] = {};
      dateTopicMap[dateKey][category] = (dateTopicMap[dateKey][category] || 0) + 1;
    });

    // 排序日期
    const sortedDates = [...dateSet].sort();
    // 主题分类（固定的顺序）
    const categories = ['General', 'Business/IPO', 'Environment', 'Security/VIP'];

    // 构建热力图数据 [dateIdx, categoryIdx, count]
    const seriesData: [number, number, number][] = [];
    let maxVal = 1;

    sortedDates.forEach((date, dIdx) => {
      categories.forEach((cat, cIdx) => {
        const count = dateTopicMap[date]?.[cat] || 0;
        seriesData.push([dIdx, cIdx, count]);
        if (count > maxVal) maxVal = count;
      });
    });

    // 计算安全类邮件的平均值和峰值
    const securityIdx = categories.indexOf('Security/VIP');
    const securityValues = sortedDates.map((d) =>
      dateTopicMap[d]?.['Security/VIP'] || 0
    );
    const securityBaseline = Math.max(
      1,
      Math.round(
        securityValues.slice(0, 5).reduce((a, b) => a + b, 0) / 5
      )
    );
    const securityPeak = Math.max(...securityValues);
    const spikeRatio = securityPeak > 0 && securityBaseline > 0
      ? Math.round((securityPeak / securityBaseline) * 100)
      : 400;

    // 找到峰值日期
    const peakDateIdx = securityValues.indexOf(securityPeak);

    // 格式化日期标签
    const dateLabels = sortedDates.map((d) => d.substring(5)); // MM-DD

    return {
      backgroundColor: 'transparent',
      title: {
        text: '危险的预警',
        subtext: `内部邮件主题异常流量 (2014年1月) · ${data.length} 封邮件`,
        left: '5%',
        top: '3%',
        textStyle: { fontFamily: 'Georgia, "Noto Serif SC", serif', color: '#111111', fontSize: 22 },
        subtextStyle: { fontFamily: '"Helvetica Neue", Inter, sans-serif', color: '#666666', fontSize: 12 }
      },
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(249, 249, 246, 0.95)',
        borderColor: '#D4C4A8',
        textStyle: { fontFamily: '"Helvetica Neue", Inter, sans-serif', color: '#333', fontSize: 12 },
        formatter: (params: any) => {
          const dIdx = params.data[0];
          const cIdx = params.data[1];
          const count = params.data[2];
          return `<b style="font-family: Georgia, serif">${sortedDates[dIdx]}</b><br/>` +
            `<span style="color:${params.color}">●</span> <b>${categories[cIdx]}</b>: ${count} 封邮件`;
        }
      },
      grid: {
        top: '20%',
        bottom: '14%',
        left: '14%',
        right: '8%'
      },
      xAxis: {
        type: 'category',
        data: dateLabels,
        splitArea: { show: true, areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.05)'] } },
        axisLabel: {
          fontFamily: '"Helvetica Neue", Inter, sans-serif',
          color: '#555',
          fontSize: 11,
          rotate: 30,
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        data: categories,
        splitArea: { show: true },
        axisLabel: {
          fontFamily: 'Georgia, "Noto Serif SC", serif',
          color: '#111',
          fontSize: 12,
        },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      visualMap: {
        min: 0,
        max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '1%',
        itemWidth: 12,
        itemHeight: 120,
        inRange: {
          color: ['#F0EDE6', '#D4C4A8', '#C4956A', '#8C3636', '#5C1A1A']
        },
        textStyle: { fontFamily: '"Helvetica Neue", Inter, sans-serif', fontSize: 11, color: '#666' },
        text: [`${maxVal}`, '0'],
      },
      series: [{
        name: '邮件量',
        type: 'heatmap',
        data: seriesData,
        label: {
          show: true,
          fontSize: 10,
          fontFamily: '"Helvetica Neue", Inter, sans-serif',
          color: '#333',
          formatter: (params: any) => params.data[2] > 0 ? params.data[2] : '',
        },
        itemStyle: {
          borderColor: '#F9F9F6',
          borderWidth: 2,
          borderRadius: 2,
        },
        emphasis: {
          itemStyle: { borderColor: '#333', borderWidth: 2 }
        },
        // 峰值标注
        markPoint: securityPeak > securityBaseline * 2 ? {
          symbol: 'pin',
          symbolSize: 45,
          itemStyle: { color: '#8C3636' },
          data: [{
            coord: [peakDateIdx, securityIdx],
            label: {
              formatter: `安保邮件\n激增 ${spikeRatio}%`,
              position: 'top',
              color: '#8C3636',
              fontFamily: '"Helvetica Neue", Inter, sans-serif',
              fontWeight: 'bold',
              fontSize: 11,
              distance: 8,
            }
          }]
        } : undefined,
      }],
      // 数据来源标注
      graphic: [{
        type: 'text',
        left: '5%',
        bottom: '10%',
        zlevel: 10,
        style: {
          text: `数据来源：emails.csv (${data.length}封内部邮件)`,
          fill: '#bbb',
          font: '10px "Helvetica Neue", sans-serif',
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
