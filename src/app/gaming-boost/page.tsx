import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Gamepad2, Zap, Shield, Crosshair, Network } from "lucide-react";

export const metadata = {
  title: "Gaming Boost | InternetFix Pro",
  description: "Optimize your network for gaming. Reduce ping, fix packet loss, and find the best settings for Valorant, Fortnite, and more.",
};

const GAMES = [
  {
    name: "Valorant",
    servers: "Riot Games (Anycast)",
    bestDns: "1.1.1.1 (Cloudflare)",
    cmdFix: "ipconfig /flushdns",
    tips: ["Use Ethernet", "Close background downloads", "Set High Priority in Task Manager"]
  },
  {
    name: "Fortnite",
    servers: "AWS (Amazon Web Services)",
    bestDns: "8.8.8.8 (Google)",
    cmdFix: "netsh interface tcp show global",
    tips: ["Limit client send rate", "Disable cosmetic streaming", "Use wired connection"]
  },
  {
    name: "CS2",
    servers: "Valve Steam Datagram Relay (SDR)",
    bestDns: "1.1.1.1 (Cloudflare)",
    cmdFix: "ping google.com -t",
    tips: ["Set bandwidth limit in game to Unrestricted", "Check for packet loss", "Update network drivers"]
  },
  {
    name: "Call of Duty: Warzone",
    servers: "Demonware",
    bestDns: "8.8.8.8 (Google) or 1.1.1.1",
    cmdFix: "ipconfig /renew",
    tips: ["Open NAT Type (Port Forwarding)", "Disable crossplay if laggy", "Use QoS on router"]
  }
];

export default function GamingBoostPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-4">
          <Gamepad2 className="h-10 w-10 text-neon-cyan" />
          Gaming Network Boost
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Every millisecond counts. Discover the best settings, DNS servers, and network tweaks to reduce your ping and eliminate packet loss.
        </p>
      </div>

      {/* Core Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <GlassCard className="p-6">
          <div className="mb-4 p-3 bg-neon-blue/10 w-max rounded-lg">
            <Zap className="h-6 w-6 text-neon-blue" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Reduce Ping</h3>
          <p className="text-sm text-gray-400 mb-4">
            Lower your latency by choosing the fastest DNS server, using an Ethernet cable, and stopping background network usage.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-4 p-3 bg-red-500/10 w-max rounded-lg">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Fix Packet Loss</h3>
          <p className="text-sm text-gray-400 mb-4">
            Packet loss causes "teleporting" and missed shots. Fix it by replacing damaged cables, restarting your router, or running pathping.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-4 p-3 bg-green-500/10 w-max rounded-lg">
            <Network className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ethernet Priority</h3>
          <p className="text-sm text-gray-400 mb-4">
            Wi-Fi is prone to interference. A Cat 6 Ethernet cable provides a dedicated, full-duplex connection for stable gaming.
          </p>
        </GlassCard>
      </div>

      {/* Game Specific Recommendations */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-8 flex items-center gap-2">
          <Crosshair className="h-6 w-6 text-neon-cyan" />
          Game-Specific Optimizations
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {GAMES.map((game, idx) => (
            <GlassCard key={idx} hoverEffect className="p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">{game.name}</h3>
                <Badge variant="info">Pro Tips</Badge>
              </div>
              
              <div className="space-y-4 mb-6 flex-grow">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recommended DNS</div>
                  <div className="text-neon-cyan font-mono">{game.bestDns}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pre-Game CMD</div>
                  <code className="bg-black/50 px-2 py-1 rounded border border-white/10 text-gray-300 font-mono text-sm">
                    {game.cmdFix}
                  </code>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Server Infrastructure</div>
                  <div className="text-gray-300">{game.servers}</div>
                </div>
              </div>
              
              <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">Quick Checks:</h4>
                <ul className="space-y-2">
                  {game.tips.map((tip, tipIdx) => (
                    <li key={tipIdx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-neon-blue mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
