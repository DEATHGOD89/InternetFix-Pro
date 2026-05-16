"use client";

import { useState, useEffect, useRef } from "react";
import { SpeedGauge } from "@/components/ui/SpeedGauge";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Activity, Server, Shield, AlertCircle, RefreshCw, Zap, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TestState = "idle" | "probing" | "pinging" | "downloading" | "uploading" | "finished" | "error";

export default function SpeedTestPage() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [ping, setPing] = useState(0);
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const measurePing = async () => {
    const pings: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        const res = await fetch(`/api/speedtest?ping=true&t=${Math.random()}`, { method: 'HEAD', cache: 'no-store' });
        if (!res.ok) throw new Error("Server unreachable");
        pings.push(performance.now() - start);
      } catch (e) { throw e; }
      await new Promise(r => setTimeout(r, 100));
    }
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
    setPing(Math.round(avg));
    return avg;
  };

  /**
   * PROBE: A quick 1.5s test to estimate bandwidth and select the correct payload size
   */
  const probeBandwidth = async (): Promise<number> => {
    console.log("--- PROBING BANDWIDTH ---");
    const start = performance.now();
    let bytes = 0;
    try {
        const response = await fetch(`/api/speedtest?size=${50 * 1024 * 1024}&probe=true`, { cache: 'no-store' });
        const reader = response.body?.getReader();
        if (!reader) return 10; // Default fallback 10Mbps
        
        const timeout = setTimeout(() => reader.cancel(), 1500);
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            bytes += value.byteLength;
        }
        clearTimeout(timeout);
    } catch(e) {}
    const elapsed = (performance.now() - start) / 1000;
    const mbps = (bytes * 8) / elapsed / 1000000;
    console.log(`Probe Result: ~${mbps.toFixed(2)} Mbps`);
    return mbps;
  };

  const measureDownload = async (estimatedMbps: number) => {
    console.log("--- DOWNLOAD START (ADAPTIVE) ---");
    // ADAPTIVE PAYLOAD: Ensure transfer lasts ~8-10 seconds
    // (Mbps * 1,000,000 / 8 bits) * 10 seconds
    const targetPayloadBytes = (estimatedMbps * 1000000 / 8) * 10;
    const payloadPerStream = Math.min(250 * 1024 * 1024, Math.max(50 * 1024 * 1024, Math.floor(targetPayloadBytes / 4)));
    console.log(`Selecting Payload: ${payloadPerStream / (1024 * 1024)}MB per stream`);

    const streams = 4;
    let totalBytes = 0;
    let streamEndTimes: number[] = [];
    const startTime = performance.now();

    const runStream = async (id: number) => {
        const res = await fetch(`/api/speedtest?size=${payloadPerStream}&s=${id}&t=${Math.random()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Download stream failed");
        const reader = res.body!.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytes += value.byteLength;
        }
        streamEndTimes.push(performance.now());
    };

    const streamPromises = Array.from({length: streams}).map((_, i) => runStream(i));

    return new Promise<number>((resolve, reject) => {
        const interval = setInterval(() => {
            const now = performance.now();
            const elapsed = (now - startTime) / 1000;
            const currentMbps = (totalBytes * 8) / elapsed / 1000000;
            if (elapsed > 1) setDownload(currentMbps);
            
            if (streamEndTimes.length === streams) {
                clearInterval(interval);
                const finalTime = (Math.max(...streamEndTimes) - startTime) / 1000;
                const finalMbps = (totalBytes * 8) / finalTime / 1000000;
                console.log(`FINAL DL: ${totalBytes} bytes in ${finalTime.toFixed(2)}s = ${finalMbps.toFixed(2)} Mbps`);
                setDownload(finalMbps);
                resolve(finalMbps);
            }
        }, 100);

        Promise.all(streamPromises).catch(reject);
    });
  };

  const measureUpload = async (estimatedMbps: number) => {
    console.log("--- UPLOAD START (ADAPTIVE) ---");
    const targetPayloadBytes = (estimatedMbps * 1000000 / 8) * 8; // Aim for 8s
    const payloadPerStream = Math.min(200 * 1024 * 1024, Math.max(20 * 1024 * 1024, Math.floor(targetPayloadBytes / 4)));
    
    const data = new Uint8Array(payloadPerStream);
    // Fill buffer in 64KB chunks to avoid QuotaExceededError
    const quota = 65536;
    for (let i = 0; i < data.length; i += quota) {
      crypto.getRandomValues(data.subarray(i, Math.min(i + quota, data.length)));
    }
    const blob = new Blob([data]);

    const streams = 4;
    let totalBytesLoaded = 0;
    let streamEndTimes: number[] = [];
    const startTime = performance.now();

    const runStream = (id: number) => {
        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `/api/speedtest?s=${id}&t=${Math.random()}`, true);
            let lastLoaded = 0;
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    totalBytesLoaded += (e.loaded - lastLoaded);
                    lastLoaded = e.loaded;
                }
            };
            xhr.onload = () => { streamEndTimes.push(performance.now()); resolve(); };
            xhr.onerror = reject;
            xhr.send(blob);
        });
    }

    const streamPromises = Array.from({length: streams}).map((_, i) => runStream(i));

    return new Promise<number>((resolve, reject) => {
        const interval = setInterval(() => {
            const now = performance.now();
            const elapsed = (now - startTime) / 1000;
            const currentMbps = (totalBytesLoaded * 8) / elapsed / 1000000;
            if (elapsed > 1) setUpload(currentMbps);
            
            if (streamEndTimes.length === streams) {
                clearInterval(interval);
                const finalTime = (Math.max(...streamEndTimes) - startTime) / 1000;
                const finalMbps = (totalBytesLoaded * 8) / finalTime / 1000000;
                console.log(`FINAL UL: ${totalBytesLoaded} bytes in ${finalTime.toFixed(2)}s = ${finalMbps.toFixed(2)} Mbps`);
                setUpload(finalMbps);
                resolve(finalMbps);
            }
        }, 100);
        Promise.all(streamPromises).catch(reject);
    });
  };

  const startTest = async () => {
    setError(null); setPing(0); setDownload(0); setUpload(0);
    try {
        setTestState("probing");
        const est = await probeBandwidth();
        
        setTestState("pinging");
        await measurePing();

        setTestState("downloading");
        const finalDl = await measureDownload(est);

        setTestState("uploading");
        await measureUpload(finalDl); // Use DL result to guess UL payload

        setTestState("finished");
    } catch (e) {
        setError("Test failed. Check your connection.");
        setTestState("error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 mb-4">
          <Zap className="h-10 w-10 text-neon-cyan" />
          Pro Speed Engine v3
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Adaptive Payload Scaling & Precise Stop-Timing for professional-grade accuracy.
        </p>
      </div>

      <GlassCard className="w-full max-w-4xl p-8 relative overflow-hidden">
        <div className={`absolute inset-0 opacity-10 pointer-events-none bg-grid-animated ${testState !== 'idle' && testState !== 'finished' ? 'opacity-30' : ''}`} style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-12">
            <SpeedGauge value={download} max={Math.max(100, download * 1.2)} label="Download" unit="Mbps" color="cyan" isTesting={testState === "downloading"} />
            <SpeedGauge value={upload} max={Math.max(100, upload * 1.2)} label="Upload" unit="Mbps" color="blue" isTesting={testState === "uploading"} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
            <StatBox label="Ping" value={testState !== "idle" ? Math.round(ping).toString() : "-"} unit="ms" icon={<Activity className="h-4 w-4 text-green-400" />} />
            <StatBox label="Engine" value="Adaptive v3" unit="" icon={<Server className="h-4 w-4 text-purple-400" />} />
            <StatBox label="Streams" value="4 x 4" unit="" icon={<TrendingUp className="h-4 w-4 text-yellow-400" />} />
            <StatBox label="Timing" value="Precise" unit="" icon={<Shield className="h-4 w-4 text-neon-blue" />} />
          </div>

          <AnimatePresence mode="wait">
            {testState === "error" ? (
              <NeonButton size="md" variant="cyan" onClick={startTest}>Retry Test</NeonButton>
            ) : testState === "idle" || testState === "finished" ? (
              <NeonButton size="lg" onClick={startTest}>
                {testState === "finished" ? "Run Diagnostic Again" : "Start Real-Time Analysis"}
              </NeonButton>
            ) : (
              <div className="flex items-center gap-3 text-neon-cyan font-mono text-sm tracking-widest">
                <div className="w-2 h-2 bg-neon-cyan rounded-full animate-ping"></div>
                {testState.toUpperCase()}...
              </div>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>
      {error && <p className="mt-4 text-red-400 font-mono">{error}</p>}
    </div>
  );
}

function StatBox({ label, value, unit, icon }: { label: string, value: string, unit: string, icon: React.ReactNode }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-medium uppercase tracking-tighter">{icon}{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{value}</span>
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
