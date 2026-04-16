# 🌐 NetPulse

[![NetPulse Dashboard Preview](https://img.shields.io/badge/NetPulse-Network_Monitor-06b6d4?style=for-the-badge)](https://github.com/itsvishalyadav/NetPulse)

**NetPulse** is a professional, enterprise-grade mock Network Performance Dashboard and Educational Simulator. It was built specifically as a robust visual aid for Computer Networks (CN) academic projects. It visualizes and simulates core networking concepts such as TCP handshakes, payload streaming, routing delays, and buffer congestion.

---

## ✨ Features

* **Real-time Performance Metrics Display:** A polished, minimalist dashboard displaying current Download, Upload, Latency, and Packet Loss stats.
* **TCP Handshake & Download Simulator:** Visualizes a 3-way `SYN`, `SYN-ACK`, `ACK` handshake followed by a TCP "Slow Start" data burst showing real-time window scaling.
* **Persistent Upload Streams:** Simulates a long-standing `DATA` stream from Client to Server, featuring asynchronous `ACK` acknowledgments periodically returned through the pipeline.
* **Latency & RTT Processing Delay:** Demonstrates propagation logic by routing packets through a congested switch, visualizing the actual ⚙️ server computational processing time before the `PONG` returns. 
* **Buffer Overflow & Packet Loss:** Dynamically simulates router traffic. When the router becomes congested (flashing red), packet drops are visually represented mid-flight to clearly convey the concept of network buffer overflows.
* **Enterprise UI/UX:** Built without heavy frameworks using Vanilla JS + CSS, optimized with pure CSS keyframe animations, glassmorphism UI elements, and a stark "Vercel-style" contrast dark mode.

---

## 🚀 Getting Started Locally

You can run this project on any computer with Node.js installed.

### Prerequisites
* You must have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository** or download the source code:
   ```bash
   git clone https://github.com/itsvishalyadav/NetPulse.git
   cd NetPulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```

4. **View the Application**: Open your browser and navigate to the local host address provided in your terminal (usually `http://localhost:5173`).

---

## 🌍 Deploying using Vercel

Vercel is the easiest way to deploy this vanilla JS/Vite project directly to a live URL.

### Method 1: Using the Vercel Dashboard (GitHub Integration)
1. Push your code to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a free account.
3. Click "Add New Project" and authorize your GitHub account.
4. Import the `NetPulse` repository.
5. Vercel will automatically detect that it is a Vite application. Expand the "Build and Output Settings" if needed (default framework preset: `Vite` should be fine).
6. Click **Deploy**. Your live URL will be ready in under a minute!

### Method 2: Using the Vercel CLI (Terminal)
1. Install the Vercel CLI globally on your computer:
   ```bash
   npm i -g vercel
   ```
2. While inside your `NetPulse` project folder, simply type:
   ```bash
   vercel
   ```
3. Follow the CLI prompts to log in, link the project, and deploy.
4. Once tested, to deploy to production, run:
   ```bash
   vercel --prod
   ```

---

## 🛠️ Built With
* **HTML5 & Vanilla CSS3** (Custom Keyframes & Design Tokens)
* **Vanilla JavaScript (ES6)**
* **Vite** (Build Tool and Local Dev Server)
