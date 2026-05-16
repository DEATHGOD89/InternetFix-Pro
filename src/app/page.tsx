import { NeonButton } from "@/components/ui/NeonButton";
import { TerminalWindow } from "@/components/ui/TerminalWindow";
import { GlassCard } from "@/components/ui/GlassCard";
import Link from "next/link";
import { Activity, Terminal, Wifi, Zap, Globe, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        
        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-grid-animated" style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-32 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 w-full">
        
        {/* Hero Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neon-cyan mb-6">
            <Zap className="h-4 w-4" />
            <span>Advanced Network Troubleshooting</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Fix Slow Internet <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              Like a Pro
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
            Test speed, repair network issues, optimize gaming ping, and learn powerful CMD & PowerShell internet fixes in seconds. No IT degree required.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link href="/speed-test">
              <NeonButton size="lg" variant="cyan" className="w-full sm:w-auto">
                <Activity className="h-5 w-5" />
                Start Speed Test
              </NeonButton>
            </Link>
            <Link href="/cmd-fixes">
              <NeonButton size="lg" variant="ghost" className="w-full sm:w-auto">
                <Terminal className="h-5 w-5" />
                Explore Fixes
              </NeonButton>
            </Link>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="flex-1 w-full max-w-lg lg:max-w-none relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-neon-cyan/20 to-neon-blue/20 blur-2xl rounded-full"></div>
          
          <div className="relative space-y-6">
            <TerminalWindow 
              command="ping google.com -n 4"
              output={[
                "Pinging google.com [142.250.190.46] with 32 bytes of data:",
                "Reply from 142.250.190.46: bytes=32 time=12ms TTL=116",
                "Reply from 142.250.190.46: bytes=32 time=11ms TTL=116",
                "Reply from 142.250.190.46: bytes=32 time=13ms TTL=116",
                "Reply from 142.250.190.46: bytes=32 time=11ms TTL=116",
                "",
                "Ping statistics for 142.250.190.46:",
                "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),",
                "Approximate round trip times in milli-seconds:",
                "    Minimum = 11ms, Maximum = 13ms, Average = 11ms"
              ]}
              delay={500}
            />

            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-cyan/10">
                  <Wifi className="h-6 w-6 text-neon-cyan" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">Connection</div>
                  <div className="font-bold text-white">Stable</div>
                </div>
              </GlassCard>
              <GlassCard className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neon-blue/10">
                  <Globe className="h-6 w-6 text-neon-blue" />
                </div>
                <div>
                  <div className="text-sm text-gray-400">DNS</div>
                  <div className="font-bold text-white">Optimized</div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

      </div>

      {/* Features Section */}
      <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-md border-y border-white/5 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Powerful Tools at Your Fingertips</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to diagnose and fix network problems, bundled into one premium interface.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Terminal className="h-8 w-8 text-neon-cyan" />}
              title="CMD & PowerShell"
              description="One-click copy for the most powerful networking commands to flush DNS, renew IP, and reset adapters."
              link="/cmd-fixes"
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-neon-blue" />}
              title="Gaming Optimization"
              description="Reduce ping, fix packet loss, and find the best DNS servers for Valorant, CS2, and more."
              link="/gaming-boost"
            />
            <FeatureCard 
              icon={<Wifi className="h-8 w-8 text-neon-cyan" />}
              title="WiFi Repair"
              description="Learn how to position your router, choose the right channels, and eliminate interference."
              link="/wifi-optimization"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, link }: { icon: React.ReactNode, title: string, description: string, link: string }) {
  return (
    <Link href={link}>
      <GlassCard hoverEffect className="p-8 h-full flex flex-col">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm flex-grow">{description}</p>
        <div className="mt-6 flex items-center text-neon-cyan text-sm font-medium">
          Explore <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </GlassCard>
    </Link>
  );
}
