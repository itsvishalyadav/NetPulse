import { icons } from './icons.js';

const fmt = (v, d = 1) => Number(v).toFixed(d);
const tagClass = (v, lo, hi) => v <= lo ? 'tag-success' : v <= hi ? 'tag-warning' : 'tag-danger';
const badgeDir = (curr, avg) => curr >= avg ? { cls: 'up', txt: '▲ ' + fmt(((curr-avg)/avg)*100,0) + '%' } : { cls: 'down', txt: '▼ ' + fmt(((avg-curr)/avg)*100,0) + '%' };

export function renderDashboard(snap) {
  const dlB = badgeDir(snap.download.current, snap.download.avg);
  const ulB = badgeDir(snap.upload.current, snap.upload.avg);
  return `
  <div class="dashboard-grid">
    <div class="stat-card" id="stat-dl">
      <div class="stat-card-header">
        <div class="stat-card-icon">${icons.download}</div>
        <span class="stat-card-badge ${dlB.cls}">${dlB.txt}</span>
      </div>
      <div class="stat-card-value">${fmt(snap.download.current)}</div>
      <div class="stat-card-label">Download (Mbps)</div>
      <div class="stat-card-sparkline"><canvas id="spark-dl"></canvas></div>
    </div>
    <div class="stat-card" id="stat-ul">
      <div class="stat-card-header">
        <div class="stat-card-icon">${icons.upload}</div>
        <span class="stat-card-badge ${ulB.cls}">${ulB.txt}</span>
      </div>
      <div class="stat-card-value">${fmt(snap.upload.current)}</div>
      <div class="stat-card-label">Upload (Mbps)</div>
      <div class="stat-card-sparkline"><canvas id="spark-ul"></canvas></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-card-icon">${icons.latency}</div>
        <span class="stat-card-badge neutral">${fmt(snap.latency.avg)} avg</span>
      </div>
      <div class="stat-card-value">${fmt(snap.latency.current)}</div>
      <div class="stat-card-label">Latency (ms)</div>
      <div class="stat-card-sparkline"><canvas id="spark-lat"></canvas></div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header">
        <div class="stat-card-icon">${icons.packet}</div>
        <span class="stat-card-badge ${snap.packetLoss.current < 1 ? 'up' : 'down'}">${snap.packetLoss.current < 1 ? 'Healthy' : 'Elevated'}</span>
      </div>
      <div class="stat-card-value">${fmt(snap.packetLoss.current, 2)}%</div>
      <div class="stat-card-label">Packet Loss</div>
      <div class="stat-card-sparkline"><canvas id="spark-pl"></canvas></div>
    </div>

    <div class="panel grid-col-2">
      <div class="panel-header">
        <div class="panel-title">${icons.activity} Bandwidth Over Time</div>
      </div>
      <div class="panel-body"><div class="chart-container"><canvas id="chart-bandwidth"></canvas></div></div>
    </div>
    <div class="panel grid-col-2">
      <div class="panel-header">
        <div class="panel-title">${icons.latency} Latency & Jitter</div>
      </div>
      <div class="panel-body"><div class="chart-container"><canvas id="chart-latjit"></canvas></div></div>
    </div>

    <div class="panel grid-col-2">
      <div class="panel-header">
        <div class="panel-title">${icons.server} Host Status</div>
      </div>
      <div class="panel-body">
        <table class="data-table">
          <thead><tr><th>Host</th><th>IP Address</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>
            ${snap.hosts.map(h => `<tr>
              <td class="fw-600">${h.name}</td>
              <td class="mono">${h.ip}</td>
              <td><span class="tag tag-info">${h.type}</span></td>
              <td><span class="tag ${h.status === 'online' ? 'tag-success' : 'tag-warning'}">${h.status}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}

export function renderSpeedTest() {
  return `
  <div class="dashboard-grid">
    <div class="panel" style="grid-column: span 8;">
      <div class="panel-header">
        <div class="panel-title">${icons.speed} Speed Test</div>
        <div class="panel-actions">
          <button class="btn btn-primary" id="btn-run-speed">${icons.play} Run Test</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="gauge-container" id="speed-gauge-area">
          <div class="gauge-wrapper">
            <svg class="gauge-svg" viewBox="0 0 200 200">
              <defs><linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs>
              <circle class="gauge-bg" cx="100" cy="100" r="85" />
              <circle class="gauge-fill" id="gauge-arc" cx="100" cy="100" r="85" stroke-dasharray="534" stroke-dashoffset="534" />
            </svg>
            <div class="gauge-center">
              <div class="gauge-value" id="gauge-val">0</div>
              <div class="gauge-unit">Mbps</div>
            </div>
          </div>
          <div class="gauge-label" id="gauge-phase">Press Run Test to begin</div>
          <div class="speed-results" id="speed-results" style="display:none;">
            <div class="speed-result-item"><div class="speed-result-value" id="res-dl">—</div><div class="speed-result-label">Download</div></div>
            <div class="speed-result-item"><div class="speed-result-value" id="res-ul">—</div><div class="speed-result-label">Upload</div></div>
            <div class="speed-result-item"><div class="speed-result-value" id="res-ping">—</div><div class="speed-result-label">Ping</div></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

export function renderBandwidth(snap) {
  return `
  <div class="dashboard-grid">
    <div class="stat-card">
      <div class="stat-card-header"><div class="stat-card-icon">${icons.download}</div></div>
      <div class="stat-card-value">${fmt(snap.download.current)}</div>
      <div class="stat-card-label">Current Download (Mbps)</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header"><div class="stat-card-icon">${icons.upload}</div></div>
      <div class="stat-card-value">${fmt(snap.upload.current)}</div>
      <div class="stat-card-label">Current Upload (Mbps)</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header"><div class="stat-card-icon">${icons.globe}</div></div>
      <div class="stat-card-value">${snap.system.networkIn}</div>
      <div class="stat-card-label">Network In (GB/hr)</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-header"><div class="stat-card-icon">${icons.cloud}</div></div>
      <div class="stat-card-value">${snap.system.networkOut}</div>
      <div class="stat-card-label">Network Out (GB/hr)</div>
    </div>
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.activity} Download vs Upload Bandwidth</div></div>
      <div class="panel-body"><div class="chart-container chart-container-lg"><canvas id="chart-bw-dual"></canvas></div></div>
    </div>
    <div class="panel grid-col-2">
      <div class="panel-header"><div class="panel-title">${icons.download} Traffic by Protocol</div></div>
      <div class="panel-body"><div class="chart-container"><canvas id="chart-bw-bar"></canvas></div></div>
    </div>
    <div class="panel grid-col-2">
      <div class="panel-header"><div class="panel-title">${icons.shield} Protocol Distribution</div></div>
      <div class="panel-body"><div class="chart-container"><canvas id="chart-proto"></canvas></div></div>
    </div>
  </div>`;
}

export function renderPacketLoss(snap) {
  return `
  <div class="dashboard-grid">
    <div class="stat-card grid-col-2">
      <div class="stat-card-header"><div class="stat-card-icon">${icons.packet}</div><span class="stat-card-badge ${snap.packetLoss.current < 1 ? 'up' : 'down'}">${snap.packetLoss.current < 0.5 ? 'Excellent' : snap.packetLoss.current < 2 ? 'Fair' : 'Poor'}</span></div>
      <div class="stat-card-value">${fmt(snap.packetLoss.current, 2)}%</div>
      <div class="stat-card-label">Current Packet Loss</div>
    </div>
    <div class="stat-card grid-col-2">
      <div class="stat-card-header"><div class="stat-card-icon">${icons.latency}</div></div>
      <div class="stat-card-value">${fmt(snap.jitter.current)}</div>
      <div class="stat-card-label">Jitter (ms)</div>
    </div>
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.packet} Packet Loss Over Time</div></div>
      <div class="panel-body"><div class="chart-container"><canvas id="chart-pl-hist"></canvas></div></div>
    </div>
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.network} Traceroute — Hop Analysis</div></div>
      <div class="panel-body">
        <div class="hop-row header"><div>Hop</div><div>Host</div><div>Avg (ms)</div><div>Min</div><div>Max</div><div>Loss</div><div>Status</div></div>
        ${snap.hops.map(h => `<div class="hop-row">
          <div class="hop-num">${h.hop}</div>
          <div class="hop-host" title="${h.ip}">${h.host}</div>
          <div class="hop-latency">${fmt(h.avg)}</div>
          <div class="hop-latency">${fmt(h.min)}</div>
          <div class="hop-latency">${fmt(h.max)}</div>
          <div><div class="hop-loss-bar"><div class="hop-loss-fill" style="width:${Math.min(h.loss*10,100)}%;background:${h.loss < 1 ? 'var(--status-success)' : h.loss < 3 ? 'var(--status-warning)' : 'var(--status-danger)'}"></div></div></div>
          <div><span class="tag ${tagClass(h.loss,1,3)}">${fmt(h.loss)}%</span></div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}
