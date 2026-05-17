"use client";

import { useState, useEffect, useRef } from "react";
import { SpeedGauge } from "@/components/ui/SpeedGauge";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { Activity, Server, Shield, Zap, TrendingUp, Wifi, MonitorPlay, Gamepad2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TestState = "idle" | "pinging" | "downloading" | "uploading" | "finished" | "error";

export default function SpeedTestPage() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [download, setDownload] = useState(0);
  const [upload, setUpload] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  // Prevent memory leaks on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const measurePingAndJitter = async () => {
    let pings: number[] = [];
    
    // Fallback strategy: Try multiple endpoints if one fails (Netlify routing resilience)
    const endpoints = [
      `/favicon.ico`,              // Primary: Static asset (served from CDN edge for accurate latency)
      `/api/ping`,                 // Fallback 1: Lightweight Edge API
      `/api/speedtest?ping=true`   // Fallback 2: Old endpoint
    ];

    let success = false;

    for (let retry = 0; retry < endpoints.length; retry++) {
      pings = [];
      const endpoint = endpoints[retry];
      console.log(`[Ping] Attempt ${retry + 1}: Testing ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout per batch

      try {
        for (let i = 0; i < 10; i++) {
          const start = performance.now();
          // Use a cache-busting timestamp
          const res = await fetch(`${endpoint}?cb=${Date.now()}_${i}`, { 
              method: 'HEAD', 
              cache: 'no-store',
              signal: controller.signal
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          
          pings.push(performance.now() - start);
          // Short pause between pings
          await new Promise(r => setTimeout(r, 50));
        }
        clearTimeout(timeoutId);
        
        if (pings.length > 0) {
            success = true;
            break; // Success, exit retry loop
        }
      } catch (e: any) {
        clearTimeout(timeoutId);
        console.warn(`[Ping] Attempt ${retry + 1} (${endpoint}) failed:`, e.name === 'AbortError' ? 'Timeout' : e.message);
      }
    }

    if (!success || pings.length === 0) {
      console.error("[Ping] All ping attempts failed. Gracefully continuing test.");
      setPing(0);
      setJitter(0);
      return; // Do not throw, allow the rest of the test (DL/UL) to proceed
    }

    // Calculate Average Ping
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    
    // Calculate Jitter (average absolute difference between consecutive pings)
    let totalJitter = 0;
    for (let i = 1; i < pings.length; i++) {
        totalJitter += Math.abs(pings[i] - pings[i-1]);
    }
    const avgJitter = pings.length > 1 ? totalJitter / (pings.length - 1) : 0;

    setPing(Math.round(avgPing));
    setJitter(Math.round(avgJitter * 10) / 10);
  };

  const measureDownload = async () => {
    const DURATION_SEC = 10;
    const streams = 4;
    let totalBytes = 0;
    const startTime = performance.now();

    const runStream = async () => {
      while ((performance.now() - startTime) / 1000 < DURATION_SEC) {
        try {
          // Fetch the pre-generated 25MB static file
          const res = await fetch(`/speedtest/25mb.bin?cb=${Date.now()}_${Math.random()}`, {
            cache: "no-store",
          });
          const reader = res.body?.getReader();
          if (!reader) break;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            totalBytes += value.byteLength;

            // Instantly cancel if we've hit our time limit
            if ((performance.now() - startTime) / 1000 >= DURATION_SEC) {
              reader.cancel();
              break;
            }
          }
        } catch (e) {
          // Ignore network abort errors and loop to try again if there's still time
        }
      }
    };

    // Start parallel fetch streams
    Array.from({length: streams}).forEach(() => runStream());

    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            const elapsed = (performance.now() - startTime) / 1000;
            
            // Update live UI (Total Bytes / Total Elapsed Time)
            if (elapsed > 0.1) {
                const currentMbps = (totalBytes * 8) / elapsed / 1000000;
                setDownload(currentMbps);
            }

            // Stop condition
            if (elapsed >= DURATION_SEC) {
                clearInterval(interval);
                const finalTime = (performance.now() - startTime) / 1000;
                const finalMbps = (totalBytes * 8) / finalTime / 1000000;
                
                setDownload(finalMbps);
                console.log(`[DL] Total: ${(totalBytes/1024/1024).toFixed(2)} MB in ${finalTime.toFixed(2)}s -> ${finalMbps.toFixed(2)} Mbps`);
                resolve();
            }
        }, 100);
    });
  };

  const measureUpload = async () => {
    const DURATION_SEC = 10;
    const streams = 4;
    // Small chunk size (2MB) continuously pushed in a loop
    const chunkSize = 2 * 1024 * 1024; 
    const data = new Uint8Array(chunkSize);
    const quota = 65536;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        for (let i = 0; i < data.length; i += quota) {
            crypto.getRandomValues(data.subarray(i, Math.min(i + quota, data.length)));
        }
    }
    const blob = new Blob([data]);

    let totalBytesLoaded = 0;
    const xhrList: XMLHttpRequest[] = [];
    const startTime = performance.now();

    const runStream = async () => {
      while ((performance.now() - startTime) / 1000 < DURATION_SEC) {
        await new Promise<void>((resolveStream) => {
            const xhr = new XMLHttpRequest();
            xhrList.push(xhr);
            xhr.open('POST', `/api/upload-test?cb=${Date.now()}_${Math.random()}`, true);
            
            let lastLoaded = 0;
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    totalBytesLoaded += (e.loaded - lastLoaded);
                    lastLoaded = e.loaded;
                }
            };
            xhr.onload = () => resolveStream();
            xhr.onerror = () => resolveStream();
            xhr.onabort = () => resolveStream();
            xhr.send(blob);
        });
      }
    };

    // Start all XHR uploads continuously
    Array.from({length: streams}).forEach(() => runStream());

    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            const elapsed = (performance.now() - startTime) / 1000;

            if (elapsed > 0.1) {
                const currentMbps = (totalBytesLoaded * 8) / elapsed / 1000000;
                setUpload(currentMbps);
            }

            if (elapsed >= DURATION_SEC) {
                clearInterval(interval);
                xhrList.forEach(x => x.abort()); // Sever any hanging chunks

                const finalTime = (performance.now() - startTime) / 1000;
                const finalMbps = (totalBytesLoaded * 8) / finalTime / 1000000;
                
                setUpload(finalMbps);
                console.log(`[UL] Total: ${(totalBytesLoaded/1024/1024).toFixed(2)} MB in ${finalTime.toFixed(2)}s -> ${finalMbps.toFixed(2)} Mbps`);
                resolve();
            }
        }, 100);
    });
  };

  const startTest = async () => {
    if (!navigator.onLine) {
        setErrorMsg("Your browser is offline. Please check your connection.");
        setTestState("error");
        return;
    }

    setErrorMsg(null); 
    setPing(0); setJitter(0); setDownload(0); setUpload(0);
    
    try {
        setTestState("pinging");
        console.log("--- STARTING PING ---");
        await measurePingAndJitter();

        setTestState("downloading");
        console.log("--- STARTING DOWNLOAD ---");
        await measureDownload();

        setTestState("uploading");
        console.log("--- STARTING UPLOAD ---");
        await measureUpload();

        setTestState("finished");
        console.log("--- TEST COMPLETE ---");
    } catch (e: any) {
        console.error("Speed Test Error:", e);
        setErrorMsg(e.message || "Test failed. Ensure the server is reachable.");
        setTestState("error");
        if (abortControllerRef.current) abortControllerRef.current.abort();
    }
  };

  // Suitability calculation logic
  const getQualityRating = () => {
    if (download > 500 && upload > 100 && ping < 20) return { label: "Excellent", color: "text-cyan-400" };
    if (download > 100 && upload > 20 && ping < 50) return { label: "Good", color: "text-green-400" };
    if (download > 25 && upload > 5 && ping < 100) return { label: "Fair", color: "text-yellow-400" };
    return { label: "Poor", color: "text-red-400" };
  };

  const getStreamingSuitability = () => {
    if (download >= 25) return "4K UHD Ready";
    if (download >= 5) return "1080p HD Ready";
    return "SD Quality Only";
  };

  const getGamingSuitability = () => {
    if (ping < 30 && jitter < 5) return "Optimal (Competitive)";
    if (ping < 60 && jitter < 15) return "Good (Casual)";
    return "Suboptimal (Lag Likely)";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-white flex items-center justify-center gap-3 mb-4 tracking-tighter">
          <Zap className="h-10 w-10 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
          Pro Speed Engine
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Industrial-grade bandwidth analysis with real-time UI coupling and extreme accuracy.
        </p>
      </div>

      <GlassCard className="w-full max-w-5xl p-8 md:p-12 relative overflow-hidden shadow-2xl border-white/10">
        {/* Animated Background Grid during testing */}
        <div className={`absolute inset-0 opacity-10 pointer-events-none transition-opacity duration-1000 ${testState === 'downloading' || testState === 'uploading' ? 'opacity-30' : ''}`} style={{
          backgroundImage: `linear-gradient(to right, rgba(34, 211, 238, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(34, 211, 238, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Gauges Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 mb-16 w-full">
            <SpeedGauge 
                value={download} 
                label="Download" 
                unit="Mbps" 
                color="cyan" 
                isTesting={testState === "downloading"} 
            />
            <SpeedGauge 
                value={upload} 
                label="Upload" 
                unit="Mbps" 
                color="blue" 
                isTesting={testState === "uploading"} 
            />
          </div>

          {/* Core Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
            <StatBox label="Ping" value={testState !== "idle" ? ping.toString() : "-"} unit="ms" icon={<Activity className="h-4 w-4 text-green-400" />} isActive={testState === 'pinging'} />
            <StatBox label="Jitter" value={testState !== "idle" ? jitter.toString() : "-"} unit="ms" icon={<Wifi className="h-4 w-4 text-purple-400" />} isActive={testState === 'pinging'} />
            <StatBox label="Engine" value="Edge HTTP" unit="" icon={<Server className="h-4 w-4 text-cyan-400" />} isActive={testState === 'downloading' || testState === 'uploading'} />
            <StatBox label="Timing" value="Strict 10s" unit="" icon={<Shield className="h-4 w-4 text-blue-400" />} isActive={testState === 'downloading' || testState === 'uploading'} />
          </div>

          {/* Final Results Summary Panel */}
          <AnimatePresence>
            {testState === "finished" && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-6 mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
                >
                    <div>
                        <div className="text-gray-400 text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Zap className="h-4 w-4"/> Network Rating</div>
                        <div className={`text-2xl font-black ${getQualityRating().color}`}>{getQualityRating().label}</div>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0">
                        <div className="text-gray-400 text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><MonitorPlay className="h-4 w-4"/> Streaming</div>
                        <div className="text-xl font-bold text-white">{getStreamingSuitability()}</div>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0">
                        <div className="text-gray-400 text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Gamepad2 className="h-4 w-4"/> Gaming</div>
                        <div className="text-xl font-bold text-white">{getGamingSuitability()}</div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button & Status */}
          <div className="min-h-[80px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                {testState === "error" ? (
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-red-400 font-mono mb-4 bg-red-950/30 p-3 rounded border border-red-900/50">
                            <AlertTriangle className="h-5 w-5" /> {errorMsg}
                        </div>
                        <NeonButton size="md" variant="cyan" onClick={startTest}>Retry Connection</NeonButton>
                    </div>
                ) : testState === "idle" || testState === "finished" ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                    <NeonButton size="lg" onClick={startTest}>
                        {testState === "finished" ? "Run Diagnostic Again" : "Start Global Analysis"}
                    </NeonButton>
                </motion.div>
                ) : (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex items-center gap-3 text-cyan-400 font-mono text-lg tracking-widest uppercase">
                        <div className="relative flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                        </div>
                        {testState === 'pinging' ? 'Analyzing Latency...' : testState === 'downloading' ? 'Testing Download...' : 'Testing Upload...'}
                    </div>
                    {/* Live Progress Bar indicator */}
                    <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-cyan-400"
                            initial={{ width: "0%" }}
                            animate={{ 
                                width: testState === 'pinging' ? "33%" : testState === 'downloading' ? "66%" : "100%" 
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
          </div>

        </div>
      </GlassCard>
    </div>
  );
}

function StatBox({ label, value, unit, icon, isActive }: { label: string, value: string, unit: string, icon: React.ReactNode, isActive?: boolean }) {
  return (
    <div className={`bg-black/40 border rounded-lg p-4 flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-white/10'}`}>
      <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-medium uppercase tracking-tighter">{icon}{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold transition-colors duration-300 ${isActive ? 'text-cyan-400' : 'text-white'}`}>{value}</span>
        {unit && <span className="text-xs text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}
