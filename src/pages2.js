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
          <strong>Key Features:</strong> Real-time bandwidth monitoring · Speed testing with gauge visualization · Packet loss & traceroute hop analysis · System resource monitoring · Configurable alerts & notifications · Dark/Light theme · Responsive design
        </p>
      </div>
    </div>
  </div>`;
}

