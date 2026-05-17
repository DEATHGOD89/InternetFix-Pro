"use client";

import { useState, useEffect, useRef } from "react";
import { SpeedGauge } from "@/components/ui/SpeedGauge";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Activity, Server, Shield, Zap, TrendingUp } from "lucide-react";
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
   * PROBE: A quick 1.5s test to warm up connection.
   */
  const probeBandwidth = async (): Promise<number> => {
    console.log("--- PROBING BANDWIDTH ---");
    const start = performance.now();
    let bytes = 0;
    try {
        const response = await fetch(`/api/speedtest?size=${50 * 1024 * 1024}&probe=true`, { cache: 'no-store' });
        const reader = response.body?.getReader();
        if (!reader) return 10;
        
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

  const measureDownload = async () => {
    console.log("--- DOWNLOAD START (TIME-LIMITED) ---");
    // Request a very large payload so the stream naturally outlasts our 10-second limit
    const payloadPerStream = 250 * 1024 * 1024; 
    const streams = 4;
    let totalBytes = 0;
    const startTime = performance.now();
    const DURATION_MS = 10000; // 10 seconds max duration

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const runStream = async (id: number) => {
        try {
            const res = await fetch(`/api/speedtest?size=${payloadPerStream}&s=${id}&t=${Math.random()}`, { 
                cache: "no-store",
                signal: abortController.signal
            });
            if (!res.ok) throw new Error("Download stream failed");
            const reader = res.body!.getReader();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                totalBytes += value.byteLength;
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("Stream error:", e);
            }
        }
    };

    const streamPromises = Array.from({length: streams}).map((_, i) => runStream(i));

    return new Promise<number>((resolve) => {
        let lastBytes = 0;
        let lastTime = performance.now();

        const interval = setInterval(() => {
            const now = performance.now();
            const elapsedSinceLast = (now - lastTime) / 1000;
            const bytesSinceLast = totalBytes - lastBytes;

            if (elapsedSinceLast > 0) {
                const currentMbps = (bytesSinceLast * 8) / elapsedSinceLast / 1000000;
                if (currentMbps > 0) {
                    setDownload(currentMbps);
                }
            }
            lastBytes = totalBytes;
            lastTime = now;

            // Check if duration exceeded
            if (now - startTime >= DURATION_MS) {
                clearInterval(interval);
                abortController.abort(); // Stop all streams
                
                const finalTime = (now - startTime) / 1000;
                const finalMbps = (totalBytes * 8) / finalTime / 1000000;
                
                console.log(`FINAL DL: ${totalBytes} bytes in ${finalTime.toFixed(2)}s = ${finalMbps.toFixed(2)} Mbps`);
                
                setDownload(finalMbps);
                resolve(finalMbps);
            }
        }, 200);

        // If streams somehow finish before 10s
        Promise.all(streamPromises).then(() => {
            if (performance.now() - startTime < DURATION_MS) {
                clearInterval(interval);
                const finalTime = (performance.now() - startTime) / 1000;
                // Prevent division by very small numbers
                const safeFinalTime = Math.max(0.1, finalTime);
                const finalMbps = (totalBytes * 8) / safeFinalTime / 1000000;
                setDownload(finalMbps);
                resolve(finalMbps);
            }
        });
    });
  };

  const measureUpload = async () => {
    console.log("--- UPLOAD START (TIME-LIMITED) ---");
    const payloadPerStream = 50 * 1024 * 1024; // 50MB per stream
    
    // Generate data once
    const data = new Uint8Array(payloadPerStream);
    const quota = 65536;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      for (let i = 0; i < data.length; i += quota) {
        crypto.getRandomValues(data.subarray(i, Math.min(i + quota, data.length)));
      }
    }
    const blob = new Blob([data]);

    const streams = 4;
    let totalBytesLoaded = 0;
    const startTime = performance.now();
    const DURATION_MS = 10000;

    const xhrList: XMLHttpRequest[] = [];

    const runStream = (id: number) => {
        return new Promise<void>((resolve) => {
            const xhr = new XMLHttpRequest();
            xhrList.push(xhr);
            xhr.open('POST', `/api/speedtest?s=${id}&t=${Math.random()}`, true);
            let lastLoaded = 0;
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    totalBytesLoaded += (e.loaded - lastLoaded);
                    lastLoaded = e.loaded;
                }
            };
            xhr.onload = () => resolve();
            xhr.onerror = () => resolve(); // Ignore abort errors
            xhr.onabort = () => resolve();
            xhr.send(blob);
        });
    }

    const streamPromises = Array.from({length: streams}).map((_, i) => runStream(i));

    return new Promise<number>((resolve) => {
        let lastBytes = 0;
        let lastTime = performance.now();

        const interval = setInterval(() => {
            const now = performance.now();
            const elapsedSinceLast = (now - lastTime) / 1000;
            const bytesSinceLast = totalBytesLoaded - lastBytes;

            if (elapsedSinceLast > 0) {
                const currentMbps = (bytesSinceLast * 8) / elapsedSinceLast / 1000000;
                if (currentMbps > 0) setUpload(currentMbps);
            }
            lastBytes = totalBytesLoaded;
            lastTime = now;

            if (now - startTime >= DURATION_MS) {
                clearInterval(interval);
                xhrList.forEach(xhr => xhr.abort());
                
                const finalTime = (now - startTime) / 1000;
                const finalMbps = (totalBytesLoaded * 8) / finalTime / 1000000;
                console.log(`FINAL UL: ${totalBytesLoaded} bytes in ${finalTime.toFixed(2)}s = ${finalMbps.toFixed(2)} Mbps`);
                setUpload(finalMbps);
                resolve(finalMbps);
            }
        }, 200);

        Promise.all(streamPromises).then(() => {
            if (performance.now() - startTime < DURATION_MS) {
                clearInterval(interval);
                const finalTime = (performance.now() - startTime) / 1000;
                const safeFinalTime = Math.max(0.1, finalTime);
                const finalMbps = (totalBytesLoaded * 8) / safeFinalTime / 1000000;
                setUpload(finalMbps);
                resolve(finalMbps);
            }
        });
    });
  };

  const startTest = async () => {
    setError(null); setPing(0); setDownload(0); setUpload(0);
    try {
        setTestState("probing");
        await probeBandwidth();
        
        setTestState("pinging");
        await measurePing();

        setTestState("downloading");
        await measureDownload();

        setTestState("uploading");
        await measureUpload();

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
          Pro Speed Engine v4
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Time-Limited Analysis & Edge Optimized Routing for professional-grade accuracy.
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
            <StatBox label="Engine" value="Edge Time-Limited" unit="" icon={<Server className="h-4 w-4 text-purple-400" />} />
            <StatBox label="Streams" value="4 x 4" unit="" icon={<TrendingUp className="h-4 w-4 text-yellow-400" />} />
            <StatBox label="Timing" value="Strict 10s" unit="" icon={<Shield className="h-4 w-4 text-neon-blue" />} />
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
