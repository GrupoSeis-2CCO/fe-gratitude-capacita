import React from 'react';
import Chart from 'react-apexcharts';

export default function ApexLineChart({ data = [], height = 360 }) {
  // data: [{date: 'dd/mm/yyyy', value: number}, ...]
  // Prepare line series (no markers) and a scatter series with points only for non-zero values
  const lineData = data.map(d => ({ x: d.date, y: d.value ?? 0 }));
  const scatterData = (data || []).filter(d => (d.value ?? 0) !== 0).map(d => ({ x: d.date, y: d.value, marker: { size: 6 } }));

  const series = [
    { name: 'Materiais', type: 'line', data: lineData },
    { name: 'Pontos', type: 'scatter', data: scatterData }
  ];

  const options = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true }
    },
    stroke: { curve: 'smooth', width: 4 },
    // hide default markers (we'll show a scatter series for visible points)
    markers: { size: 0 },
    tooltip: {
      enabled: true,
      x: { formatter: (val) => val },
      y: { formatter: (v) => `${v}` }
    },
    xaxis: {
      type: 'category',
      labels: { rotate: -45, hideOverlappingLabels: true, style: { fontSize: '12px' } },
      title: { text: 'Primeiro acesso', style: { fontWeight: 600 } }
    },
    yaxis: [{ min: 0, forceNiceScale: true, title: { text: 'Materiais Completos', style: { fontWeight: 600 } } }],
    grid: { borderColor: '#eee' },
    // force orange for both series
    colors: ['#FF6B35', '#FF6B35'],
    legend: { show: false }
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
}
