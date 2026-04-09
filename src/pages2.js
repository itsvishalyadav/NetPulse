import { icons } from './icons.js';

const fmt = (v, d = 1) => Number(v).toFixed(d);

export function renderLatency(snap) {
  return `
  <div class="dashboard-grid">
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon">${icons.latency}</div></div><div class="stat-card-value">${fmt(snap.latency.current)}<span style="font-size:0.9rem;color:var(--text-muted)"> ms</span></div><div class="stat-card-label">Current Latency</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon">${icons.packet}</div></div><div class="stat-card-value">${fmt(snap.jitter.current)}<span style="font-size:0.9rem;color:var(--text-muted)"> ms</span></div><div class="stat-card-label">Current Jitter</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon">${icons.latency}</div></div><div class="stat-card-value">${fmt(snap.latency.avg)}<span style="font-size:0.9rem;color:var(--text-muted)"> ms</span></div><div class="stat-card-label">Avg Latency (30s)</div></div>
    <div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon">${icons.packet}</div></div><div class="stat-card-value">${fmt(snap.jitter.avg)}<span style="font-size:0.9rem;color:var(--text-muted)"> ms</span></div><div class="stat-card-label">Avg Jitter (30s)</div></div>
    <div class="panel grid-col-2"><div class="panel-header"><div class="panel-title">${icons.latency} Latency History</div></div><div class="panel-body"><div class="chart-container chart-container-lg"><canvas id="chart-lat-hist"></canvas></div></div></div>
    <div class="panel grid-col-2"><div class="panel-header"><div class="panel-title">${icons.activity} Jitter History</div></div><div class="panel-body"><div class="chart-container chart-container-lg"><canvas id="chart-jit-hist"></canvas></div></div></div>
  </div>`;
}

export function renderTopology(snap) {
  return `
  <div class="dashboard-grid">
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.network} Network Topology Map</div><div class="panel-actions"><button class="btn btn-secondary btn-sm" id="btn-refresh-topo">${icons.activity} Refresh</button></div></div>
      <div class="panel-body"><canvas id="topology-canvas" class="topology-canvas"></canvas></div>
    </div>
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.server} Connected Devices</div></div>
      <div class="panel-body">
        <table class="data-table"><thead><tr><th>Device</th><th>IP Address</th><th>Type</th><th>Status</th><th>Latency</th></tr></thead>
          <tbody>${snap.hosts.map((h, i) => `<tr><td class="fw-600">${h.name}</td><td class="mono">${h.ip}</td><td><span class="tag tag-info">${h.type}</span></td><td><span class="tag ${h.status==='online'?'tag-success':'tag-warning'}">${h.status}</span></td><td class="mono">${fmt(2 + i * 3.2 + Math.random()*2)} ms</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

export function renderSystem(snap) {
  const s = snap.system;
  const bars = [
    { label: 'CPU Usage', value: s.cpu, unit: '%', icon: icons.cpu },
    { label: 'Memory Usage', value: s.memory, unit: '%', icon: icons.memory },
    { label: 'Disk Usage', value: s.disk, unit: '%', icon: icons.disk },
    { label: 'Temperature', value: s.temp, unit: '°C', icon: icons.temp },
  ];
  return `
  <div class="dashboard-grid">
    ${bars.map(b => `<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon">${b.icon}</div><span class="stat-card-badge ${b.value>80?'down':b.value>60?'neutral':'up'}">${b.value>80?'Critical':b.value>60?'Warning':'Normal'}</span></div><div class="stat-card-value">${fmt(b.value)}${b.unit}</div><div class="stat-card-label">${b.label}</div><div class="progress-bar mt-lg"><div class="progress-fill ${b.value>80?'danger':b.value>60?'warning':'success'}" style="width:${b.value}%"></div></div></div>`).join('')}
    <div class="panel grid-col-2"><div class="panel-header"><div class="panel-title">${icons.cpu} CPU & Memory Over Time</div></div><div class="panel-body"><div class="chart-container chart-container-lg"><canvas id="chart-sys-cpu"></canvas></div></div></div>
    <div class="panel grid-col-2"><div class="panel-header"><div class="panel-title">${icons.disk} Resource Usage</div></div><div class="panel-body"><div class="chart-container chart-container-lg"><canvas id="chart-sys-res"></canvas></div></div></div>
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.system} System Information</div></div>
      <div class="panel-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
          ${[['Uptime', s.uptime, icons.latency], ['Processes', s.processes, icons.cpu], ['Net In', s.networkIn+' GB/hr', icons.download], ['Net Out', s.networkOut+' GB/hr', icons.upload]].map(([l,v,ic]) => `<div class="metric-mini"><div class="metric-mini-icon" style="background:var(--accent-gradient-soft);color:var(--accent-primary)">${ic}</div><div class="metric-mini-info"><div class="metric-mini-label">${l}</div><div class="metric-mini-value">${v}</div></div></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

export function renderAlerts(alerts) {
  return `
  <div class="dashboard-grid">
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.alerts} Active Alerts</div><div class="panel-actions"><button class="btn btn-secondary btn-sm" id="btn-clear-alerts">${icons.check} Clear All</button></div></div>
      <div class="panel-body" style="padding:0;">
        ${alerts.length === 0 ? `<div class="empty-state">${icons.shield}<div class="empty-state-title">No Active Alerts</div><div class="empty-state-desc">All systems operating within normal parameters.</div></div>` :
        alerts.map(a => `<div class="alert-item"><div class="alert-item-dot" style="background:${a.severity==='critical'?'var(--status-danger)':a.severity==='warning'?'var(--status-warning)':'var(--status-info)'}"></div><div class="alert-item-content"><div class="alert-item-title">${a.title}</div><div class="alert-item-desc">${a.message}</div><div class="alert-item-time">${a.time}</div></div><span class="tag ${a.severity==='critical'?'tag-danger':a.severity==='warning'?'tag-warning':'tag-info'}">${a.severity}</span></div>`).join('')}
      </div>
    </div>
    <div class="panel grid-col-2"><div class="panel-header"><div class="panel-title">${icons.alerts} Alerts by Severity</div></div><div class="panel-body"><div class="chart-container"><canvas id="chart-alerts-sev"></canvas></div></div></div>
    <div class="panel grid-col-2"><div class="panel-header"><div class="panel-title">${icons.activity} Alert Frequency (24h)</div></div><div class="panel-body"><div class="chart-container"><canvas id="chart-alerts-freq"></canvas></div></div></div>
  </div>`;
}

export function renderSettings() {
  return `
  <div class="dashboard-grid">
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.settings} General Settings</div></div>
      <div class="panel-body">
        <div class="settings-group"><div class="settings-group-title">Monitoring</div>
          <div class="settings-row"><div><div class="settings-label">Polling Interval</div></div><select id="set-interval" style="width:140px"><option value="1000">1 second</option><option value="2000" selected>2 seconds</option><option value="5000">5 seconds</option><option value="10000">10 seconds</option></select></div>
          <div class="settings-row"><div><div class="settings-label">Enable Speed Test Scheduling</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
          <div class="settings-row"><div><div class="settings-label">Enable Packet Loss Monitoring</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
        </div>
        <div class="settings-group"><div class="settings-group-title">Notifications</div>
          <div class="settings-row"><div><div class="settings-label">Alert on High Packet Loss (&gt;2%)</div></div><label class="toggle"><input type="checkbox" checked id="set-pl-alert"><span class="toggle-slider"></span></label></div>
          <div class="settings-row"><div><div class="settings-label">Alert on High Latency (&gt;50ms)</div></div><label class="toggle"><input type="checkbox" checked id="set-lat-alert"><span class="toggle-slider"></span></label></div>
          <div class="settings-row"><div><div class="settings-label">Alert on CPU &gt; 90%</div></div><label class="toggle"><input type="checkbox" checked><span class="toggle-slider"></span></label></div>
        </div>
        <div class="settings-group"><div class="settings-group-title">Appearance</div>
          <div class="settings-row"><div><div class="settings-label">Theme</div></div><select id="set-theme" style="width:140px"><option value="dark">Dark</option><option value="light">Light</option></select></div>
        </div>
      </div>
    </div>
    <div class="panel grid-col-4">
      <div class="panel-header"><div class="panel-title">${icons.shield} About NetPulse</div></div>
      <div class="panel-body">
        <p style="color:var(--text-secondary);font-size:0.9rem;line-height:1.8">
          <strong>NetPulse</strong> is a comprehensive Network Performance Monitoring System built for educational purposes as a Computer Network project. Inspired by <a href="https://github.com/autobrr/netronome" target="_blank">Netronome</a>, it provides real-time network metrics, speed testing, packet loss analysis, traceroute visualization, system health monitoring, and alerting — all through a beautiful, modern web dashboard.<br/><br/>
          <strong>Key Features:</strong> Real-time bandwidth monitoring · Speed testing with gauge visualization · Packet loss & traceroute hop analysis · Network topology mapping · System resource monitoring · Configurable alerts & notifications · Dark/Light theme · Responsive design
        </p>
      </div>
    </div>
  </div>`;
}

export function drawTopology(canvas, hosts) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth;
  const H = canvas.height = canvas.offsetHeight;
  const dark = document.documentElement.getAttribute('data-theme') !== 'light';
  ctx.clearRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const nodes = [
    { x: cx, y: cy, label: 'Gateway Router', type: 'router', color: '#6366f1' },
    ...hosts.filter(h => h.type !== 'router').map((h, i, arr) => {
      const angle = (i / arr.length) * Math.PI * 2 - Math.PI / 2;
      const r = Math.min(W, H) * 0.32;
      return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, label: h.name, type: h.type, color: h.status === 'online' ? '#22c55e' : '#f59e0b', ip: h.ip };
    }),
  ];

  // Draw connections
  const time = Date.now();
  nodes.slice(1).forEach(n => {
    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    ctx.lineTo(n.x, n.y);
    ctx.strokeStyle = dark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -(time / 50) % 14; // Flowing data effect
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    // animated packet dot
    const t = (time % 2000) / 2000;
    const px = nodes[0].x + (n.x - nodes[0].x) * t;
    const py = nodes[0].y + (n.y - nodes[0].y) * t;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
  });

  // Draw nodes
  nodes.forEach(n => {
    // Breathing shadow for online
    if (n.status === 'online' || n.type === 'router') {
      ctx.shadowBlur = 15 + Math.sin(time / 200) * 5;
      ctx.shadowColor = n.color;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.beginPath();
    ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
    ctx.fillStyle = dark ? '#1a1f35' : '#fff';
    ctx.strokeStyle = n.color;
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // inner icon dot
    ctx.beginPath();
    ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = n.color;
    ctx.fill();

    // label
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = dark ? '#f1f5f9' : '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(n.label, n.x, n.y + 38);
    if (n.ip) {
      ctx.font = '400 9px JetBrains Mono, monospace';
      ctx.fillStyle = dark ? '#64748b' : '#94a3b8';
      ctx.fillText(n.ip, n.x, n.y + 50);
    }
  });
}
