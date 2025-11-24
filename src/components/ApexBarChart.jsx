import React from 'react';
import Chart from 'react-apexcharts';

export default function ApexBarChart({ data = [], height = 360 }) {
  // data: [{date: 'yyyy-mm-dd', value: number}, ...]
  const series = [{
    name: 'Engajamento',
    data: data.map(d => ({ x: d.date, y: d.value ?? 0 }))
  }];

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      type: 'category',
      labels: { rotate: -45, style: { fontSize: '12px' } },
      title: { text: 'Data', style: { fontWeight: 600 } }
    },
    yaxis: {
      title: { text: 'Engajamento', style: { fontWeight: 600 } }
    },
    fill: {
      opacity: 1
    },
    colors: ['#FF6B35'],
    tooltip: {
      y: {
        formatter: function (val) {
          return val
        }
      }
    }
  };

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={height} />
    </div>
  );
}
