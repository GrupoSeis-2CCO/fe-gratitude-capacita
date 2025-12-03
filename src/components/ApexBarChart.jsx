import React from 'react';
import Chart from 'react-apexcharts';

export default function ApexBarChart({ data = [], height = 360 }) {
  // data: [{date: 'yyyy-mm-dd', value: number, usuariosUnicos: number}, ...]
  const series = [
    {
      name: 'Materiais Concluídos',
      type: 'bar',
      data: data.map(d => ({ x: d.date, y: d.value ?? 0 }))
    },
    {
      name: 'Usuários Únicos',
      type: 'line',
      data: data.map(d => ({ x: d.date, y: d.usuariosUnicos ?? 0 }))
    }
  ];

  const options = {
    chart: {
      type: 'line',
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
      width: [0, 3],
      colors: ['transparent', '#3B82F6'],
      curve: 'smooth'
    },
    markers: {
      size: [0, 5],
      colors: ['#FF6B35', '#3B82F6'],
      strokeWidth: 0
    },
    xaxis: {
      type: 'category',
      labels: { rotate: -45, style: { fontSize: '12px' } },
      title: { text: 'Data', style: { fontWeight: 600 } }
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      title: { text: 'Quantidade', style: { fontWeight: 600 } },
      labels: { style: { colors: '#71717a' } }
    },
    fill: {
      opacity: [1, 1]
    },
    colors: ['#FF6B35', '#3B82F6'],
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right'
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val) {
          return val
        }
      }
    }
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" height={height} />
    </div>
  );
}
