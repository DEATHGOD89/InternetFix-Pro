import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Globe, ShieldCheck, Zap, Activity } from "lucide-react";

export const metadata = {
  title: "DNS Tools | InternetFix Pro",
  description: "Find the best DNS servers for speed, privacy, and gaming. Compare Google DNS, Cloudflare, and more.",
};

const DNS_PROVIDERS = [
  {
    name: "Cloudflare",
    primary: "1.1.1.1",
    secondary: "1.0.0.1",
    speed: "Excellent",
    privacy: "High",
    gaming: "Excellent",
    description: "The fastest general-purpose DNS. Does not log your IP address. Best overall choice for gaming and browsing.",
    icon: <Zap className="h-8 w-8 text-neon-cyan" />,
    color: "cyan"
  },
  {
    name: "Google Public DNS",
    primary: "8.8.8.8",
    secondary: "8.8.4.4",
    speed: "Excellent",
    privacy: "Moderate",
    gaming: "Great",
    description: "Highly reliable and fast, backed by Google's massive infrastructure. Good alternative if Cloudflare fails.",
    icon: <Globe className="h-8 w-8 text-blue-400" />,
    color: "blue"
  },
  {
    name: "Quad9",
    primary: "9.9.9.9",
    secondary: "149.112.112.112",
    speed: "Good",
    privacy: "High",
    gaming: "Good",
    description: "Automatically blocks malicious domains. Excellent choice for security-conscious users and home networks.",
    icon: <ShieldCheck className="h-8 w-8 text-green-400" />,
    color: "green"
  },
  {
    name: "OpenDNS (Cisco)",
    primary: "208.67.222.222",
    secondary: "208.67.220.220",
    speed: "Good",
    privacy: "Moderate",
    gaming: "Moderate",
    description: "Offers family shield options to block adult content. Good for households with children.",
    icon: <Activity className="h-8 w-8 text-orange-400" />,
    color: "orange"
  }
];

export default function DnsToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-4">
          <Globe className="h-10 w-10 text-neon-cyan" />
          DNS Tools & Recommendations
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Your ISP's default DNS is often slow and logs your data. Changing your DNS is the easiest way to improve browsing speed, privacy, and game latency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {DNS_PROVIDERS.map((dns, idx) => (
          <GlassCard key={idx} hoverEffect className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg bg-black/50 border border-white/5`}>
                  {dns.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{dns.name}</h3>
                </div>
              </div>
              <Badge variant={dns.name === "Cloudflare" ? "success" : "default"}>
                {dns.name === "Cloudflare" ? "Top Pick" : "Alternative"}
              </Badge>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-[#0a0a0a] p-3 rounded-lg border border-white/10 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Primary</div>
                <div className="text-neon-cyan font-mono font-bold text-lg">{dns.primary}</div>
              </div>
              <div className="flex-1 bg-[#0a0a0a] p-3 rounded-lg border border-white/10 text-center">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Secondary</div>
                <div className="text-neon-cyan font-mono font-bold text-lg">{dns.secondary}</div>
              </div>
            </div>

            <p className="text-gray-400 text-sm mb-6 flex-grow">{dns.description}</p>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Speed</div>
                <div className="text-sm font-semibold text-white">{dns.speed}</div>
              </div>
              <div className="text-center border-l border-white/10">
                <div className="text-xs text-gray-500 mb-1">Privacy</div>
                <div className="text-sm font-semibold text-white">{dns.privacy}</div>
              </div>
              <div className="text-center border-l border-white/10">
                <div className="text-xs text-gray-500 mb-1">Gaming</div>
                <div className="text-sm font-semibold text-white">{dns.gaming}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold text-white mb-4">How to Change Your DNS (Windows)</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-300">
          <li>Press <kbd className="bg-black/50 px-2 py-1 rounded border border-white/10 font-mono text-sm">Win + R</kbd>, type <code className="text-neon-cyan">ncpa.cpl</code>, and hit Enter.</li>
          <li>Right-click your active connection (Wi-Fi or Ethernet) and select <strong>Properties</strong>.</li>
          <li>Select <strong>Internet Protocol Version 4 (TCP/IPv4)</strong> and click <strong>Properties</strong>.</li>
          <li>Choose "Use the following DNS server addresses".</li>
          <li>Enter the Primary and Secondary addresses from your chosen provider above.</li>
          <li>Click OK. Then, open CMD and run <code className="text-neon-cyan ml-1">ipconfig /flushdns</code>.</li>
        </ol>
      </GlassCard>
    </div>
  );
}
