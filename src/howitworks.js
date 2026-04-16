import { icons } from './icons.js';

export function renderHowItWorks() {
  return `
  <div class="how-it-works-grid">
    <!-- Download Speed -->
    <div class="panel sim-card">
      <div class="panel-header">
        <div class="panel-title">${icons.download} Download Speed Concept</div>
        <button class="btn btn-primary btn-sm" id="btn-sim-dl">${icons.play} Play Simulation</button>
      </div>
      <div class="panel-body">
        <p class="sim-desc">Measures the throughput from the Server to the Client over a TCP connection.</p>
        <div class="sim-arena" id="arena-dl">
          <div class="sim-node client">${icons.dashboard}<span>Client</span></div>
          <div class="sim-path"></div>
          <div class="sim-node server">${icons.server}<span>Server</span></div>
        </div>
        <div class="sim-log" id="log-dl">Ready. Click Play to start.</div>
        <div class="sim-stats">
          <div class="stat-row"><span>Total Data Received:</span><strong id="stat-dl-data">0 Mb</strong></div>
          <div class="stat-row"><span>Time Taken:</span><strong id="stat-dl-time">0.0 s</strong></div>
          <div class="stat-formula">
            <div class="formula-top">Total Data Received</div>
            <div class="formula-divider"></div>
            <div class="formula-bottom">Time Taken</div>
            <div class="formula-equals">= <span id="stat-dl-res" class="highlight">? Mbps</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Speed -->
    <div class="panel sim-card">
      <div class="panel-header">
        <div class="panel-title">${icons.upload} Upload Speed Concept</div>
        <button class="btn btn-primary btn-sm" id="btn-sim-ul">${icons.play} Play Simulation</button>
      </div>
      <div class="panel-body">
        <p class="sim-desc">Measures the throughput from the Client sending a payload to the Server.</p>
        <div class="sim-arena" id="arena-ul">
          <div class="sim-node client">${icons.dashboard}<span>Client</span></div>
          <div class="sim-path"></div>
          <div class="sim-node server">${icons.server}<span>Server</span></div>
        </div>
        <div class="sim-log" id="log-ul">Ready. Click Play to start.</div>
        <div class="sim-stats">
          <div class="stat-row"><span>Total Data Sent:</span><strong id="stat-ul-data">0 Mb</strong></div>
          <div class="stat-row"><span>Time Taken:</span><strong id="stat-ul-time">0.0 s</strong></div>
          <div class="stat-formula">
            <div class="formula-top">Total Data Sent</div>
            <div class="formula-divider"></div>
            <div class="formula-bottom">Time Taken</div>
            <div class="formula-equals">= <span id="stat-ul-res" class="highlight">? Mbps</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Latency (RTT) -->
    <div class="panel sim-card">
      <div class="panel-header">
        <div class="panel-title">${icons.latency} Latency Concept (RTT)</div>
        <button class="btn btn-primary btn-sm" id="btn-sim-lat">${icons.play} Play Simulation</button>
      </div>
      <div class="panel-body">
        <p class="sim-desc">Measures Round Trip Time (RTT): time taken for a ping to reach the server and come back.</p>
        <div class="sim-arena" id="arena-lat">
          <div class="sim-node client">${icons.dashboard}<span>Client</span></div>
          <div class="sim-path"><div class="sim-router" title="Router / Cloud">${icons.router}</div></div>
          <div class="sim-node server">${icons.server}<span>Server</span></div>
        </div>
        <div class="sim-log" id="log-lat">Ready. Click Play to start.</div>
        <div class="sim-stats">
          <div class="stat-row"><span>T(request) Start:</span><strong id="stat-lat-start">0 ms</strong></div>
          <div class="stat-row"><span>T(response) End:</span><strong id="stat-lat-end">0 ms</strong></div>
          <div class="stat-formula" style="flex-direction:row;align-items:center;">
             <span>T(response) - T(request)</span>
             <span style="margin:0 10px;">=</span>
             <strong id="stat-lat-res" class="highlight">? ms</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Packet Loss -->
    <div class="panel sim-card">
      <div class="panel-header">
        <div class="panel-title">${icons.packet} Packet Loss Concept</div>
        <button class="btn btn-primary btn-sm" id="btn-sim-pl">${icons.play} Play Simulation</button>
      </div>
      <div class="panel-body">
        <p class="sim-desc">Simulates network congestion where some packets are dropped and never reach the server.</p>
        <div class="sim-arena" id="arena-pl">
          <div class="sim-node client">${icons.dashboard}<span>Client</span></div>
          <div class="sim-path"><div class="sim-router" title="Router / Cloud">${icons.cloud}</div></div>
          <div class="sim-node server">${icons.server}<span>Server</span></div>
        </div>
        <div class="sim-log" id="log-pl">Ready. Click Play to start.</div>
        <div class="sim-stats">
          <div class="stat-row"><span>Packets Sent:</span><strong id="stat-pl-sent">0</strong></div>
          <div class="stat-row"><span>Packets Received:</span><strong id="stat-pl-recv">0</strong></div>
          <div class="stat-formula">
            <div class="formula-top">(Sent - Received)</div>
            <div class="formula-divider"></div>
            <div class="formula-bottom">Sent</div>
            <div class="formula-equals">× 100 = <span id="stat-pl-res" class="highlight">? %</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

// Global simulation timeouts array to clear on navigating away
let simTimeouts = [];

export function initHowItWorks() {
  document.getElementById('btn-sim-dl')?.addEventListener('click', runSimDownload);
  document.getElementById('btn-sim-ul')?.addEventListener('click', runSimUpload);
  document.getElementById('btn-sim-lat')?.addEventListener('click', runSimLatency);
  document.getElementById('btn-sim-pl')?.addEventListener('click', runSimPacketLoss);
}

export function cleanupSimulations() {
  simTimeouts.forEach(t => clearTimeout(t));
  simTimeouts = [];
}

// Utility to create moving packets
function createPacket(arenaId, type, duration, delay, direction = 'right', colorClass = 'packet-success', label = '') {
  const arena = document.getElementById(arenaId);
  const path = arena.querySelector('.sim-path');
  const pkt = document.createElement('div');
  pkt.className = `sim-pkt ${colorClass}`;
  
  if (label) {
    pkt.innerHTML = `<div class="packet-label">${label}</div>`;
  }
  
  if (direction === 'right') {
    pkt.style.left = '0%';
    setTimeout(() => { pkt.style.transition = `left ${duration}ms linear`; pkt.style.left = '100%'; }, delay + 50);
  } else {
    pkt.style.left = '100%';
    setTimeout(() => { pkt.style.transition = `left ${duration}ms linear`; pkt.style.left = '0%'; }, delay + 50);
  }
  
  path.appendChild(pkt);
  
  setTimeout(() => {
    if (pkt.parentNode) pkt.parentNode.removeChild(pkt);
  }, delay + duration + 100);
  
  return pkt;
}

// 1. Download
function runSimDownload() {
  const btn = document.getElementById('btn-sim-dl');
  btn.disabled = true;
  document.getElementById('stat-dl-res').textContent = '? Mbps';
  const log = document.getElementById('log-dl');
  const sData = document.getElementById('stat-dl-data');
  const sTime = document.getElementById('stat-dl-time');

  log.innerHTML = "1. <span style='color:var(--text-primary)'>TCP Handshake</span>: SYN &rarr; SYN-ACK &larr; ACK &rarr;";
  createPacket('arena-dl', 'syn', 1500, 0, 'right', 'packet-info', 'SYN');
  createPacket('arena-dl', 'synack', 1500, 1500, 'left', 'packet-info', 'SYN-ACK');
  createPacket('arena-dl', 'ack', 1500, 3000, 'right', 'packet-success', 'ACK+GET');

  let time = 0;
  let data = 0;
  sData.textContent = "0 Mb";
  sTime.textContent = "0.0 s";

  simTimeouts.push(setTimeout(() => {
    log.innerHTML = "2. <span style='color:var(--status-danger)'>TCP Slow Start</span>: Speed ramping up over time...";
    
    // Animate multiple packets leftward with increasing density
    for(let i=0; i<30; i++) {
        // Slower buildup
        const expDelay = Math.pow(i, 2) * 8; 
        createPacket('arena-dl', 'data', Math.random()*400 + 800, expDelay, 'left', 'packet-success', 'DATA');
    }
    
    // Animate stats
    const tInterval = setInterval(() => {
       time += 0.1;
       data += (64 / 70); // 64Mb over 7s approx
       sData.textContent = data.toFixed(1) + " Mb";
       sTime.textContent = time.toFixed(1) + " s";
       if (time >= 7.0) clearInterval(tInterval);
    }, 100);

    simTimeouts.push(setTimeout(() => {
      log.textContent = "3. Measurement complete. Computing throughput...";
      document.getElementById('stat-dl-res').textContent = (64.0 / 7.0).toFixed(1) + " Mbps";
      btn.disabled = false;
    }, 7500));
  }, 4800));
}

// 2. Upload
function runSimUpload() {
  const btn = document.getElementById('btn-sim-ul');
  btn.disabled = true;
  document.getElementById('stat-ul-res').textContent = '? Mbps';
  const log = document.getElementById('log-ul');
  const sData = document.getElementById('stat-ul-data');
  const sTime = document.getElementById('stat-ul-time');

  log.textContent = "1. Client begins sending large POST payload...";
  sData.textContent = "0 Mb";
  sTime.textContent = "0.0 s";
  
  let time = 0;
  let data = 0;

  // Animate packets rightward
  for(let i=0; i<20; i++) {
      createPacket('arena-ul', 'data', Math.random()*500 + 1000, i * 400, 'right', 'packet-success', 'DATA');
      // Server returns occasional ACKs during stream
      if (i > 0 && i % 4 === 0) {
          createPacket('arena-ul', 'ack', 1200, (i * 400) + 1000, 'left', 'packet-info', 'ACK');
      }
  }

  const tInterval = setInterval(() => {
      time += 0.1;
      data += (32 / 80); // 32Mb over 8s
      if(time <= 8.0) {
          sData.textContent = data.toFixed(1) + " Mb";
          sTime.textContent = time.toFixed(1) + " s";
      }
  }, 100);

  simTimeouts.push(setTimeout(() => {
    log.innerHTML = "2. All fragments received and <span style='color:var(--status-info);font-weight:bold'>ACK</span>'d. Complete.";
    simTimeouts.push(setTimeout(() => {
        clearInterval(tInterval);
        sData.textContent = "32.0 Mb";
        sTime.textContent = "8.0 s";
        document.getElementById('stat-ul-res').textContent = (32.0 / 8.0).toFixed(1) + " Mbps";
        btn.disabled = false;
    }, 1000));
  }, 9500));
}

// 3. Latency
function runSimLatency() {
  const btn = document.getElementById('btn-sim-lat');
  btn.disabled = true;
  document.getElementById('stat-lat-res').textContent = '? ms';
  const log = document.getElementById('log-lat');
  const sStart = document.getElementById('stat-lat-start');
  const sEnd = document.getElementById('stat-lat-end');
  const srvNode = document.getElementById('arena-lat').querySelector('.server');

  log.textContent = "1. Client sends ICMP Ping. Propagating...";
  const startTime = Date.now();
  sStart.textContent = startTime.toString().slice(-6) + " ms";
  sEnd.textContent = "—";

  // Packet Right
  createPacket('arena-lat', 'ping', 1500, 0, 'right', 'packet-info', 'PING');

  simTimeouts.push(setTimeout(() => {
    log.textContent = "2. Queued at Router, now Processing at Server...";
    srvNode.classList.add('processing');
    
    simTimeouts.push(setTimeout(() => {
      srvNode.classList.remove('processing');
      log.textContent = "3. Server dispatches Pong reply...";
      createPacket('arena-lat', 'pong', 1500, 0, 'left', 'packet-success', 'PONG');

      simTimeouts.push(setTimeout(() => {
          const fakeRTT = Math.floor(Math.random() * 40 + 20); // 20-60ms
          sStart.textContent = "t";
          sEnd.textContent = `t + ${fakeRTT}`;
          document.getElementById('stat-lat-res').textContent = fakeRTT + " ms";
          log.textContent = "4. Round Trip received. RTT calculated.";
          btn.disabled = false;
      }, 1500));
    }, 1500)); // 1500ms processing delay / queue wait
  }, 1500)); // 1500ms travel time
}

// 4. Packet Loss
function runSimPacketLoss() {
  const btn = document.getElementById('btn-sim-pl');
  btn.disabled = true;
  document.getElementById('stat-pl-res').textContent = '? %';
  const log = document.getElementById('log-pl');
  const sSent = document.getElementById('stat-pl-sent');
  const sRecv = document.getElementById('stat-pl-recv');
  const arena = document.getElementById('arena-pl');
  const router = arena.querySelector('.sim-router');

  log.textContent = "1. Sending 10 Ping requests to server...";
  let sent = 0;
  let recv = 0;
  sSent.textContent = "0";
  sRecv.textContent = "0";
  router.classList.remove('congested');

  let i = 0;
  const tInterval = setInterval(() => {
      sent++;
      sSent.textContent = sent;

      const isLost = (i === 3 || i === 7); // Hardcoded simulate 2 dropped packets
      const duration = 2000; // time to cross arena
      const pkt = createPacket('arena-pl', 'ping', duration, 0, 'right', isLost ? 'packet-danger' : 'packet-info', isLost ? 'DROP' : 'PING');
      
      if (isLost) {
          // Packet hits router at 50% time
          setTimeout(() => {
              if(pkt) {
                  pkt.style.transition = ""; // Stop moving
                  // Convert to X mark
                  pkt.className = 'packet-drop-x';
                  pkt.innerHTML = 'X';
              }
              // Router visual buffer overflow glow
              router.classList.add('congested');
              setTimeout(() => router.classList.remove('congested'), 600); // Pulse once
          }, duration / 2);
      } else {
          // Reaches server and counts as received
          setTimeout(() => {
              recv++;
              sRecv.textContent = recv;
          }, duration);
      }
      
      i++;
      if (i >= 10) clearInterval(tInterval);
  }, 600);

  simTimeouts.push(setTimeout(() => {
      log.innerHTML = "2. Two packets dropped due to <span class='text-danger fw-600'>Buffer Congestion</span>! Calculating loss...";
      const loss = ((10 - 8) / 10) * 100;
      document.getElementById('stat-pl-res').textContent = loss.toFixed(0) + " %";
      btn.disabled = false;
  }, 10 * 600 + 2200));
}

