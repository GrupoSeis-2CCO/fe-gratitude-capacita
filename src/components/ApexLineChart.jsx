import React from 'react';
import Chart from 'react-apexcharts';

export default function ApexLineChart({ data = [], height = 360 }) {
  // data: [{date: 'dd/mm/yyyy', value: number}, ...]
  const series = [
    {
      name: 'Último Acesso',
      data: data.map(d => d.value ?? 0)
    }
  ];

  const options = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true }
    },
    stroke: { curve: 'smooth', width: 4 },
    markers: { size: 6 },
    tooltip: {
      enabled: true,
      x: { formatter: (idx) => data[idx] ? data[idx].date : '' },
      y: { formatter: (v) => `${v}` }
    },
    xaxis: {
      categories: data.map(d => d.date),
      labels: { rotate: -45, hideOverlappingLabels: true, style: { fontSize: '12px' } },
      title: { text: 'Primeiro acesso', style: { fontWeight: 600 } }
    },
    yaxis: [{ min: 0, forceNiceScale: true, title: { text: 'Materiais Completos', style: { fontWeight: 600 } } }],
    grid: { borderColor: '#eee' },
    colors: ['#FF6B35'],
    legend: { show: false }
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
}
