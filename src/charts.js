import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';
const gridColor = () => isDark() ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
const textColor = () => isDark() ? '#94a3b8' : '#64748b';

const baseOptions = (title = '') => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeOutQuart' },
  plugins: {
    legend: { display: false },
    title: title ? { display: true, text: title, color: textColor(), font: { size: 13, weight: 600 } } : { display: false },
    tooltip: {
      backgroundColor: isDark() ? '#252b42' : '#1e293b',
      titleColor: '#f1f5f9', bodyColor: '#94a3b8',
      padding: 10, cornerRadius: 8,
      bodyFont: { family: "'JetBrains Mono', monospace", size: 12 },
    },
  },
  scales: {
    x: { grid: { color: gridColor(), drawBorder: false }, ticks: { color: textColor(), font: { size: 10 }, maxTicksLimit: 8 } },
    y: { grid: { color: gridColor(), drawBorder: false }, ticks: { color: textColor(), font: { size: 10 } }, beginAtZero: true },
  },
});

export function createLineChart(ctx, label, data, color1 = '#6366f1', color2 = '#06b6d4') {
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  gradient.addColorStop(0, color1 + '40');
  gradient.addColorStop(1, color1 + '00');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i + 1),
      datasets: [{
        label, data, fill: true,
        borderColor: color1, backgroundColor: gradient,
        borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
        tension: 0.4,
      }],
    },
    options: baseOptions(),
  });
}

export function createDualLineChart(ctx, label1, data1, label2, data2) {
  const g1 = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  g1.addColorStop(0, '#6366f140'); g1.addColorStop(1, '#6366f100');
  const g2 = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  g2.addColorStop(0, '#06b6d440'); g2.addColorStop(1, '#06b6d400');
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data1.map((_, i) => i + 1),
      datasets: [
        { label: label1, data: data1, fill: true, borderColor: '#6366f1', backgroundColor: g1, borderWidth: 2, pointRadius: 0, tension: 0.4 },
        { label: label2, data: data2, fill: true, borderColor: '#06b6d4', backgroundColor: g2, borderWidth: 2, pointRadius: 0, tension: 0.4 },
      ],
    },
    options: { ...baseOptions(), plugins: { ...baseOptions().plugins, legend: { display: true, labels: { color: textColor(), usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 11 } } } } },
  });
}

export function createBarChart(ctx, labels, data, colors) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors || ['#6366f1','#06b6d4','#22c55e','#f59e0b','#ef4444','#a855f7'], borderRadius: 6, borderSkipped: false, barPercentage: 0.6 }],
    },
    options: { ...baseOptions(), plugins: { ...baseOptions().plugins, legend: { display: false } } },
  });
}

export function createDoughnutChart(ctx, labels, data, colors) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors || ['#6366f1','#06b6d4','#22c55e','#f59e0b'], borderWidth: 0, spacing: 3 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: { position: 'bottom', labels: { color: textColor(), usePointStyle: true, pointStyle: 'circle', padding: 14, font: { size: 11 } } },
        tooltip: baseOptions().plugins.tooltip,
      },
    },
  });
}

export function updateChartData(chart, newData, datasetIdx = 0) {
  if (!chart) return;
  chart.data.labels = newData.map((_, i) => i + 1);
  chart.data.datasets[datasetIdx].data = newData;
  chart.update('none');
}

export function updateDualChart(chart, data1, data2) {
  if (!chart) return;
  chart.data.labels = data1.map((_, i) => i + 1);
  chart.data.datasets[0].data = data1;
  chart.data.datasets[1].data = data2;
  chart.update('none');
}
