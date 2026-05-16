import { CommandCard } from "@/components/ui/CommandCard";
import { Terminal } from "lucide-react";

export const metadata = {
  title: "CMD Fixes | InternetFix Pro",
  description: "Powerful Command Prompt fixes for DNS, Ping, and network resets.",
};

const COMMANDS = [
  {
    category: "DNS & Cache Repair",
    items: [
      {
        title: "Flush DNS",
        command: "ipconfig /flushdns",
        description: "Clears old, potentially corrupted internet address cache from your system.",
        whenToUse: "When websites aren't loading properly or you see 'DNS_PROBE_FINISHED_NXDOMAIN'.",
        expectedResult: "Forces your PC to find new, correct addresses for websites.",
        risk: "Safe" as const,
      },
      {
        title: "Register DNS",
        command: "ipconfig /registerdns",
        description: "Refreshes all DHCP leases and re-registers DNS names.",
        whenToUse: "When your computer isn't showing up on the local network or DNS is completely unresponsive.",
        expectedResult: "Re-establishes connection with the local router/DNS server.",
        risk: "Safe" as const,
      }
    ]
  },
  {
    category: "IP Address Reset",
    items: [
      {
        title: "Release IP",
        command: "ipconfig /release",
        description: "Drops your current IP address assigned by the router.",
        whenToUse: "First step in getting a fresh connection from your router.",
        expectedResult: "Temporary loss of internet connection as IP is dropped.",
        risk: "Moderate" as const,
      },
      {
        title: "Renew IP",
        command: "ipconfig /renew",
        description: "Requests a new IP address from the router.",
        whenToUse: "Run immediately after 'ipconfig /release' to get back online.",
        expectedResult: "A fresh local IP address and restored connection.",
        risk: "Moderate" as const,
      }
    ]
  },
  {
    category: "Deep Network Resets",
    items: [
      {
        title: "Winsock Reset",
        command: "netsh winsock reset",
        description: "Resets the Windows Socket API to default state.",
        whenToUse: "When nothing else works. Fixes deep-seated connection issues or malware damage.",
        expectedResult: "Requires a PC restart. Completely restores default networking protocols.",
        risk: "High" as const,
      },
      {
        title: "TCP/IP Reset",
        command: "netsh int ip reset",
        description: "Overwrites registry keys used by the TCP/IP stack.",
        whenToUse: "When you have a valid IP but still can't connect to the internet.",
        expectedResult: "Restores TCP/IP to installation state. Requires restart.",
        risk: "High" as const,
      }
    ]
  },
  {
    category: "Diagnostics & Testing",
    items: [
      {
        title: "Ping Google",
        command: "ping google.com -n 10",
        description: "Sends 10 packets of data to Google's servers to test connection stability.",
        whenToUse: "To check for packet loss or high ping during gaming.",
        expectedResult: "A summary showing min/max/average ping and any packet loss percentage.",
        risk: "Safe" as const,
      },
      {
        title: "Trace Route",
        command: "tracert 1.1.1.1",
        description: "Traces the exact path your data takes to reach Cloudflare's server.",
        whenToUse: "To find exactly where your connection is lagging (your house, ISP, or the server).",
        expectedResult: "A list of 'hops' with ping times for each step of the journey.",
        risk: "Safe" as const,
      }
    ]
  }
];

export default function CmdFixesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-4">
          <Terminal className="h-10 w-10 text-neon-cyan" />
          Command Prompt Fixes
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          The most powerful tools for fixing internet issues are already built into Windows. 
          Copy these commands, paste them into a Command Prompt (run as Administrator), and hit Enter.
        </p>
      </div>

      <div className="space-y-16">
        {COMMANDS.map((category, idx) => (
          <div key={idx}>
            <h2 className="text-2xl font-semibold text-white mb-6 pb-2 border-b border-white/10 inline-block">
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.items.map((cmd, cmdIdx) => (
                <CommandCard key={cmdIdx} {...cmd} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
