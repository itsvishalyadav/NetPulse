import './style.css';
import { NetworkDataEngine } from './src/data.js';
import { icons, navItems } from './src/icons.js';
import { createLineChart, createDualLineChart, createBarChart, createDoughnutChart, updateChartData, updateDualChart } from './src/charts.js';
import { renderDashboard, renderBandwidth, renderPacketLoss } from './src/pages1.js';
import { renderLatency, renderTopology, renderSystem, drawTopology } from './src/pages2.js';

const engine = new NetworkDataEngine();
let currentPage = 'dashboard';
let charts = {};
let tickInterval = null;
let topoAnimFrame = null;

// --- Toast ---
function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `${type === 'success' ? icons.check : type === 'danger' ? icons.error : type === 'warning' ? icons.warn : icons.activity}<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 5200);
}

// --- Navigation ---
function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = navItems.map(item => {
    if (item.section) return `<div class="nav-section-label">${item.section}</div>`;
    return `<div class="nav-item ${item.id === currentPage ? 'active' : ''}" data-page="${item.id}">${icons[item.icon]}<span>${item.label}</span></div>`;
  }).join('');
  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });
}

function navigate(page) {
  if (page === 'speedtest') {
    document.getElementById('speed-test-overlay').classList.remove('hidden');
    return;
  }
  currentPage = page;
  destroyCharts();
  cancelAnimationFrame(topoAnimFrame);
  buildNav();
  renderPage();
  document.getElementById('page-title').textContent = navItems.find(i => i.id === page)?.label || 'Dashboard';
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

// --- Destroy Charts ---
function destroyCharts() {
  Object.values(charts).forEach(c => { if (c && c.destroy) c.destroy(); });
  charts = {};
}

// --- Render Page ---
function renderPage() {
  const container = document.getElementById('page-container');
  const snap = engine.getSnapshot();

  switch (currentPage) {
    case 'dashboard': container.innerHTML = renderDashboard(snap); initDashboardCharts(snap); break;
    case 'bandwidth': container.innerHTML = renderBandwidth(snap); initBandwidthCharts(snap); break;
    case 'packetloss': container.innerHTML = renderPacketLoss(snap); initPacketLossCharts(snap); break;
    case 'latency': container.innerHTML = renderLatency(snap); initLatencyCharts(snap); break;
    case 'topology': container.innerHTML = renderTopology(snap); initTopology(snap); break;
  }
}

// --- Chart Initializers ---
function initDashboardCharts(snap) {
  const el = id => document.getElementById(id)?.getContext('2d');
  charts.sparkDl = createLineChart(el('spark-dl'), 'DL', snap.download.history, '#6366f1');
  charts.sparkUl = createLineChart(el('spark-ul'), 'UL', snap.upload.history, '#06b6d4');
  charts.sparkLat = createLineChart(el('spark-lat'), 'Lat', snap.latency.history, '#f59e0b');
  charts.sparkPl = createLineChart(el('spark-pl'), 'PL', snap.packetLoss.history, '#ef4444');
  charts.bandwidth = createDualLineChart(el('chart-bandwidth'), 'Download', snap.download.history, 'Upload', snap.upload.history);
  charts.latjit = createDualLineChart(el('chart-latjit'), 'Latency', snap.latency.history, 'Jitter', snap.jitter.history);
  
  document.getElementById('btn-dashboard-speedtest')?.addEventListener('click', () => {
    document.getElementById('speed-test-overlay').classList.remove('hidden');
  });
}

function initSpeedTest() {
  document.getElementById('btn-run-speed')?.addEventListener('click', runSpeedTest);
  
  document.getElementById('btn-close-speed')?.addEventListener('click', () => {
    document.getElementById('speed-test-overlay').classList.add('hidden');
    // Reset gauge when closing
    const arc = document.getElementById('gauge-arc');
    if (arc) arc.style.strokeDashoffset = '267';
    const needle = document.getElementById('gauge-needle');
    if (needle) needle.style.transform = 'rotate(-90deg)';
    document.getElementById('ping-radar').style.display = 'none';

    document.getElementById('gauge-val').textContent = '0';
    document.getElementById('gauge-phase').textContent = 'Ready';
    document.getElementById('speed-results').style.display = 'none';
    const viz = document.getElementById('speed-test-viz');
    if (viz) viz.className = 'cn-dynamic-viz';
  });
}

function runSpeedTest() {
  const btn = document.getElementById('btn-run-speed');
  if (btn) { btn.disabled = true; btn.innerHTML = `${icons.activity} Testing...`; }
  document.getElementById('speed-results').style.display = 'none';

  engine.runSpeedTest(({ phase, progress, currentSpeed }) => {
    const arc = document.getElementById('gauge-arc');
    const val = document.getElementById('gauge-val');
    const lbl = document.getElementById('gauge-phase');
    const viz = document.getElementById('speed-test-viz');
    const radar = document.getElementById('ping-radar');
    const needle = document.getElementById('gauge-needle');
    
    // Ping Phase Handle
    if (phase === 'ping') {
      if (lbl) lbl.textContent = `Connecting & Pinging...`;
      if (radar) radar.style.display = 'block';
      if (val) val.textContent = '—';
      if (arc) arc.style.strokeDashoffset = '267'; // Keep gauge empty
      if (needle) needle.style.transform = 'rotate(-90deg)';
      if (viz) viz.className = 'cn-dynamic-viz';
      return;
    }
    
    // Hide radar when past ping
    if (radar) radar.style.display = 'none';

    // RPM Speedometer Physics (Max visual scale set to 100 Mbps)
    const MAX_SPEED = 100;
    let speedPercent = Math.min((currentSpeed / MAX_SPEED) * 100, 100);
    let needleAngle = (speedPercent * 1.8) - 90;

    // Shift dial color dynamically (0=Red, 120=Green)
    const hue = Math.floor(speedPercent * 1.2);
    const startGrad = document.getElementById('gauge-grad-start');
    const endGrad = document.getElementById('gauge-grad-end');
    if (startGrad && endGrad) {
      startGrad.setAttribute('stop-color', `hsl(${Math.max(0, hue-20)}, 90%, 55%)`);
      endGrad.setAttribute('stop-color', `hsl(${hue}, 90%, 50%)`);
    }

    if (arc) arc.style.strokeDashoffset = 267 - (267 * speedPercent / 100);
    if (needle) needle.style.transform = `rotate(${needleAngle}deg)`;
    if (val) val.textContent = currentSpeed.toFixed(1);
    if (lbl) lbl.textContent = `${phase === 'download' ? '↓ Downloading' : '↑ Uploading'}... ${progress.toFixed(0)}%`;
    if (viz) viz.className = 'cn-dynamic-viz active phase-' + phase;

  }).then(result => {
    document.getElementById('gauge-val').textContent = result.download.toFixed(1);
    document.getElementById('gauge-phase').textContent = 'Test Complete';
    
    // Set gauge to final download speed position
    const finalSpeedPercent = Math.min((result.download / 100) * 100, 100);
    document.getElementById('gauge-arc').style.strokeDashoffset = 267 - (267 * finalSpeedPercent / 100);
    const needle = document.getElementById('gauge-needle');
    if (needle) needle.style.transform = `rotate(${(finalSpeedPercent * 1.8) - 90}deg)`;
    document.getElementById('speed-results').style.display = '';
    document.getElementById('res-dl').textContent = result.download.toFixed(1) + ' Mbps';
    document.getElementById('res-ul').textContent = result.upload.toFixed(1) + ' Mbps';
    document.getElementById('res-ping').textContent = result.ping.toFixed(1) + ' ms';
    
    const viz = document.getElementById('speed-test-viz');
    if (viz) viz.className = 'cn-dynamic-viz';

    if (btn) { btn.disabled = false; btn.innerHTML = `${icons.play} Run Test`; }
    showToast(`Speed test complete — ${result.download.toFixed(1)} ↓ / ${result.upload.toFixed(1)} ↑ Mbps`, 'success');
  });
}

function initBandwidthCharts(snap) {
  const el = id => document.getElementById(id)?.getContext('2d');
  charts.bwDual = createDualLineChart(el('chart-bw-dual'), 'Download', snap.download.history, 'Upload', snap.upload.history);
  charts.bwBar = createBarChart(el('chart-bw-bar'), ['HTTP','HTTPS','DNS','SSH','FTP','Other'], [42,31,8,6,3,10]);
  charts.proto = createDoughnutChart(el('chart-proto'), ['TCP','UDP','ICMP','Other'], [68,22,6,4]);
}

function initPacketLossCharts(snap) {
  const ctx = document.getElementById('chart-pl-hist')?.getContext('2d');
  if (ctx) charts.plHist = createLineChart(ctx, 'Packet Loss %', snap.packetLoss.history, '#ef4444');
}

function initLatencyCharts(snap) {
  const el = id => document.getElementById(id)?.getContext('2d');
  charts.latHist = createLineChart(el('chart-lat-hist'), 'Latency (ms)', snap.latency.history, '#6366f1');
  charts.jitHist = createLineChart(el('chart-jit-hist'), 'Jitter (ms)', snap.jitter.history, '#f59e0b');
}

function initTopology(snap) {
  const canvas = document.getElementById('topology-canvas');
  if (!canvas) return;
  function animate() {
    drawTopology(canvas, snap.hosts);
    topoAnimFrame = requestAnimationFrame(animate);
  }
  animate();
  document.getElementById('btn-refresh-topo')?.addEventListener('click', () => showToast('Topology refreshed', 'info'));
}

function initSystemCharts(snap) {
  const el = id => document.getElementById(id)?.getContext('2d');
  const cpuHist = Array.from({ length: 20 }, () => 20 + Math.random() * 40);
  const memHist = Array.from({ length: 20 }, () => 50 + Math.random() * 15);
  charts.sysCpu = createDualLineChart(el('chart-sys-cpu'), 'CPU %', cpuHist, 'Memory %', memHist);
  charts.sysRes = createDoughnutChart(el('chart-sys-res'), ['CPU', 'Memory', 'Disk', 'Available'], [snap.system.cpu, snap.system.memory, snap.system.disk, 100 - snap.system.disk]);
}

// --- Live Tick ---
function tick() {
  const snap = engine.tick();

  // Update current page charts
  if (currentPage === 'dashboard') {
    updateChartData(charts.sparkDl, snap.download.history);
    updateChartData(charts.sparkUl, snap.upload.history);
    updateChartData(charts.sparkLat, snap.latency.history);
    updateChartData(charts.sparkPl, snap.packetLoss.history);
    updateDualChart(charts.bandwidth, snap.download.history, snap.upload.history);
    updateDualChart(charts.latjit, snap.latency.history, snap.jitter.history);
    // Update stat values
    updateText('stat-dl', '.stat-card-value', snap.download.current.toFixed(1));
    updateText('stat-ul', '.stat-card-value', snap.upload.current.toFixed(1));
    updateText('stat-lat', '.stat-card-value', snap.latency.current.toFixed(1));
    updateText('stat-pl', '.stat-card-value', snap.packetLoss.current.toFixed(2) + '%');
  }
  if (currentPage === 'bandwidth') {
    updateDualChart(charts.bwDual, snap.download.history, snap.upload.history);
  }
  if (currentPage === 'packetloss') {
    updateChartData(charts.plHist, snap.packetLoss.history);
  }
  if (currentPage === 'latency') {
    updateChartData(charts.latHist, snap.latency.history);
    updateChartData(charts.jitHist, snap.jitter.history);
  }
}

function updateText(parentId, selector, value) {
  const el = document.getElementById(parentId);
  if (el) { const t = el.querySelector(selector); if (t) t.textContent = value; }
}

// --- Theme ---
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('netpulse-theme', theme);
}

// --- Clock ---
function updateClock() {
  const el = document.getElementById('live-clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// --- Init ---
function init() {
  // Apply saved theme
  const saved = localStorage.getItem('netpulse-theme') || 'dark';
  setTheme(saved);

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme');
    setTheme(curr === 'dark' ? 'light' : 'dark');
  });

  // Hamburger
  document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  buildNav();
  renderPage();
  initSpeedTest();
  updateClock();
  setInterval(updateClock, 1000);
  tickInterval = setInterval(tick, 2000);

  // Hide loader, show app
  setTimeout(() => {
    document.getElementById('app-loader').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
  }, 1500);
}

document.addEventListener('DOMContentLoaded', init);
