// Network data engine with REAL measurements where possible + simulation fallback

export class NetworkDataEngine {
  constructor() {
    this.history = { download: [], upload: [], latency: [], packetLoss: [], jitter: [] };
    this.maxHistory = 60;
    this.alerts = [];
    this.lastPing = 0;
    this.lastJitter = 0;
    this.realConnection = this._getRealConnection();

    this.hosts = [
      { ip: '192.168.1.1', name: 'Gateway Router', status: 'online', type: 'router' },
      { ip: '192.168.1.10', name: 'Web Server', status: 'online', type: 'server' },
      { ip: '192.168.1.20', name: 'Database Server', status: 'online', type: 'server' },
      { ip: '192.168.1.30', name: 'File Server', status: 'warning', type: 'server' },
      { ip: '10.0.0.1', name: 'ISP Gateway', status: 'online', type: 'cloud' },
      { ip: '192.168.1.50', name: 'IoT Hub', status: 'online', type: 'device' },
    ];
    this.hops = this._genHops();
    this._seed();

    // Start real ping measurement loop
    this._measureRealPing();
    setInterval(() => this._measureRealPing(), 3000);
  }

  // --- Real Network Measurement: Connection API ---
  _getRealConnection() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      return {
        available: true,
        downlink: conn.downlink || 0,       // Mbps estimate
        rtt: conn.rtt || 0,                 // Round-trip time ms
        effectiveType: conn.effectiveType || 'unknown', // 4g, 3g, 2g, slow-2g
        type: conn.type || 'unknown',       // wifi, cellular, ethernet
      };
    }
    return { available: false, downlink: 0, rtt: 0, effectiveType: 'unknown', type: 'unknown' };
  }

  // --- Real Network Measurement: Ping via Fetch ---
  async _measureRealPing() {
    const targets = [
      'https://www.google.com/favicon.ico',
      'https://www.cloudflare.com/favicon.ico',
      'https://httpbin.org/get',
    ];
    const target = targets[Math.floor(Math.random() * targets.length)];
    const prevPing = this.lastPing;

    try {
      const start = performance.now();
      await fetch(target, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      const end = performance.now();
      const rtt = end - start;

      this.lastPing = rtt;
      this.lastJitter = Math.abs(rtt - prevPing);
      this._realPingSuccess = true;
    } catch (e) {
      // Fetch failed (CORS, timeout, offline) — flag it
      this._realPingSuccess = false;
      this.lastPing = prevPing || 15 + Math.random() * 10;
      this.lastJitter = 1 + Math.random() * 3;
    }
  }

  // --- Real Network Measurement: Download Speed ---
  async measureRealDownloadSpeed() {
    // Download a known file and measure throughput
    const testFiles = [
      { url: 'https://speed.cloudflare.com/__down?bytes=5000000', size: 5000000 },
      { url: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png', size: 13504 },
    ];

    for (const file of testFiles) {
      try {
        const start = performance.now();
        const response = await fetch(file.url, { cache: 'no-store', mode: 'cors', signal: AbortSignal.timeout(10000) });
        const blob = await response.blob();
        const end = performance.now();

        const durationSec = (end - start) / 1000;
        const bits = blob.size * 8;
        const mbps = (bits / durationSec) / 1_000_000;

        return { mbps: Math.min(mbps, 1000), duration: durationSec, bytes: blob.size, source: 'real' };
      } catch (e) {
        continue; // try next file
      }
    }

    // All failed — return estimate from Connection API
    const conn = this._getRealConnection();
    if (conn.available && conn.downlink > 0) {
      return { mbps: conn.downlink, duration: 0, bytes: 0, source: 'connection-api' };
    }

    return { mbps: 80 + Math.random() * 40, duration: 0, bytes: 0, source: 'simulated' };
  }

  // --- Seed initial history ---
  _seed() {
    const conn = this._getRealConnection();
    const baseDl = conn.available && conn.downlink > 0 ? conn.downlink : 85;
    const baseRtt = conn.available && conn.rtt > 0 ? conn.rtt : 12;

    for (let i = 0; i < 30; i++) {
      const dl = Math.max(1, baseDl + (Math.random() - 0.5) * baseDl * 0.3);
      this.history.download.push(dl);
      this.history.upload.push(Math.max(0.5, dl * (0.35 + Math.random() * 0.25)));
      this.history.latency.push(Math.max(1, baseRtt + (Math.random() - 0.5) * baseRtt * 0.5));
      this.history.packetLoss.push(Math.max(0, Math.random() * 1.5));
      this.history.jitter.push(Math.max(0.1, 1 + Math.random() * 4));
    }
  }

  _genHops() {
    return [
      { hop: 1, host: '192.168.1.1 (Local Gateway)', ip: '192.168.1.1', avg: 1.2, min: 0.8, max: 2.1, loss: 0 },
      { hop: 2, host: 'isp-gw.provider.net', ip: '10.0.0.1', avg: 4.5, min: 3.2, max: 6.8, loss: 0 },
      { hop: 3, host: 'core-r1.provider.net', ip: '172.16.0.1', avg: 8.3, min: 6.1, max: 12.4, loss: 0.2 },
      { hop: 4, host: 'edge-r2.provider.net', ip: '172.16.1.5', avg: 11.7, min: 9.5, max: 15.2, loss: 0 },
      { hop: 5, host: 'peering.exchange.net', ip: '203.0.113.1', avg: 15.4, min: 12.1, max: 19.8, loss: 0.5 },
      { hop: 6, host: 'cdn-node.target.com', ip: '198.51.100.10', avg: 18.2, min: 14.6, max: 22.5, loss: 0 },
      { hop: 7, host: 'target-server.com', ip: '93.184.216.34', avg: 20.1, min: 16.8, max: 25.3, loss: 0 },
    ];
  }

  // --- Tick: called every interval to update data ---
  tick() {
    const push = (arr, val) => { arr.push(val); if (arr.length > this.maxHistory) arr.shift(); };

    // Use real ping if available, otherwise walk randomly
    const realLat = this._realPingSuccess ? this.lastPing : null;
    const latVal = realLat !== null ? realLat : Math.max(2, this.history.latency.at(-1) + (Math.random() - 0.48) * 5);
    push(this.history.latency, latVal);

    const realJitter = this._realPingSuccess ? this.lastJitter : null;
    const jitVal = realJitter !== null ? realJitter : Math.max(0.2, 1 + Math.random() * 5);
    push(this.history.jitter, jitVal);

    // Download/Upload: use Connection API estimate if available, else simulate
    const conn = this._getRealConnection();
    let dlBase = this.history.download.at(-1);
    if (conn.available && conn.downlink > 0) {
      // Blend toward real value with some noise
      dlBase = conn.downlink + (Math.random() - 0.5) * conn.downlink * 0.15;
    } else {
      dlBase = dlBase + (Math.random() - 0.48) * 8;
    }
    const currentDl = Math.max(1, Math.min(500, dlBase));
    push(this.history.download, currentDl);
    
    // Upload tracks download at ~35-60%, with a hard cap ensuring it stays lower
    const currentUl = Math.max(0.5, currentDl * (0.35 + Math.random() * 0.25));
    push(this.history.upload, currentUl);

    // Packet loss: simulated (can't measure from browser)
    push(this.history.packetLoss, Math.max(0, Math.random() * (Math.random() > 0.9 ? 5 : 1.2)));

    // Update hop latencies with slight drift
    this.hops.forEach(h => {
      h.avg = Math.max(0.3, h.avg + (Math.random() - 0.5) * 1.5);
      h.min = Math.min(h.min, h.avg * 0.7);
      h.max = Math.max(h.max, h.avg * 1.4);
      h.loss = Math.max(0, Math.min(10, h.loss + (Math.random() - 0.5) * 0.3));
    });

    // Update connection info
    this.realConnection = this._getRealConnection();

    // Random host status flicker
    if (Math.random() > 0.95) {
      const h = this.hosts[Math.floor(Math.random() * this.hosts.length)];
      h.status = h.status === 'online' ? 'warning' : 'online';
    }

    return this.getSnapshot();
  }

  getSnapshot() {
    const dl = this.history.download;
    const ul = this.history.upload;
    const lat = this.history.latency;
    const pl = this.history.packetLoss;
    const jit = this.history.jitter;

    return {
      download: { current: dl.at(-1), avg: dl.reduce((a,b)=>a+b,0)/dl.length, history: [...dl] },
      upload: { current: ul.at(-1), avg: ul.reduce((a,b)=>a+b,0)/ul.length, history: [...ul] },
      latency: { current: lat.at(-1), avg: lat.reduce((a,b)=>a+b,0)/lat.length, history: [...lat], isReal: this._realPingSuccess },
      packetLoss: { current: pl.at(-1), avg: pl.reduce((a,b)=>a+b,0)/pl.length, history: [...pl] },
      jitter: { current: jit.at(-1), avg: jit.reduce((a,b)=>a+b,0)/jit.length, history: [...jit], isReal: this._realPingSuccess },
      system: this._sysMetrics(),
      hosts: this.hosts,
      hops: this.hops,
      connection: this.realConnection,
      dataSource: {
        latency: this._realPingSuccess ? 'real' : 'simulated',
        bandwidth: this.realConnection.available ? 'connection-api' : 'simulated',
        packetLoss: 'simulated',
        system: 'simulated',
        hops: 'simulated',
      },
      timestamp: Date.now(),
    };
  }

  _sysMetrics() {
    const t = Date.now() / 1000;
    return {
      cpu: 25 + Math.sin(t/10)*15 + Math.random()*10,
      memory: 55 + Math.sin(t/20)*10 + Math.random()*5,
      disk: 62 + Math.sin(t/60)*3,
      temp: 48 + Math.sin(t/15)*8 + Math.random()*3,
      uptime: '14d 7h 23m',
      processes: 142 + Math.floor(Math.random()*20),
      networkIn: (2.4 + Math.random()*1.5).toFixed(1),
      networkOut: (0.8 + Math.random()*0.6).toFixed(1),
    };
  }

  // --- Speed Test with real download measurement ---
  async runSpeedTest(onProgress) {
    let phase = 'download';
    let progress = 0;

    // Phase 1: Real download speed measurement
    onProgress({ phase: 'download', progress: 5, currentSpeed: 0 });

    const dlResult = await this.measureRealDownloadSpeed();
    const dlSpeed = dlResult.mbps;
    const dlSource = dlResult.source;

    // Animate the progress for download phase
    await this._animateProgress(onProgress, 'download', dlSpeed);

    // Phase 2: Upload (simulated — no server endpoint to upload to)
    const ulSpeed = dlSpeed * (0.3 + Math.random() * 0.2);
    await this._animateProgress(onProgress, 'upload', ulSpeed);

    // Ping from real measurement
    const ping = this._realPingSuccess ? this.lastPing : 5 + Math.random() * 15;
    const jitter = this._realPingSuccess ? this.lastJitter : 1 + Math.random() * 4;

    return {
      download: dlSpeed,
      upload: ulSpeed,
      ping,
      jitter,
      server: 'Auto (Cloudflare Edge)',
      source: {
        download: dlSource,
        upload: 'simulated',
        ping: this._realPingSuccess ? 'real' : 'simulated',
      },
    };
  }

  async _animateProgress(onProgress, phase, finalSpeed) {
    return new Promise(resolve => {
      const startTime = Date.now();
      const duration = 5000 + Math.random() * 2000; // 5 to 7 seconds per phase
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        let progress = Math.min(100, (elapsed / duration) * 100);
        
        if (progress >= 100) {
          clearInterval(interval);
          onProgress({ phase, progress: 100, currentSpeed: finalSpeed });
          resolve();
          return;
        }
        
        // Add realistic noise to the speed during animation
        const noiseMult = 0.85 + Math.random() * 0.3;
        const eased = finalSpeed * (progress / 100) * noiseMult;
        onProgress({ phase, progress, currentSpeed: Math.min(eased, finalSpeed * 1.1) });
      }, 50); // Updates every 50ms for smooth UI binding
    });
  }
}
