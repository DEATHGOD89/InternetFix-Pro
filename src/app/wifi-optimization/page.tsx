"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Wifi, Radio, Smartphone, Waves } from "lucide-react";
import { motion } from "framer-motion";

const TIPS = [
  {
    title: "Central Placement",
    description: "Place your router in the center of your home, not tucked away in a corner or closet. Wi-Fi signals radiate outward.",
    icon: <Radio className="h-6 w-6 text-neon-cyan" />
  },
  {
    title: "Elevate the Router",
    description: "Routers spread signals downward. Placing it on a high shelf or mounting it on a wall improves coverage.",
    icon: <Waves className="h-6 w-6 text-neon-blue" />
  },
  {
    title: "Avoid Interference",
    description: "Keep the router away from microwaves, baby monitors, cordless phones, and thick brick or concrete walls.",
    icon: <Smartphone className="h-6 w-6 text-purple-400" />
  }
];

export default function WifiOptimizationPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3 mb-4">
          <Wifi className="h-10 w-10 text-neon-cyan" />
          Wi-Fi Optimization
        </h1>
        <p className="text-gray-400 text-lg max-w-3xl">
          Get the most out of your wireless connection. Learn how to position your router, choose the right bands, and eliminate dead zones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        
        {/* Visual Guide */}
        <GlassCard className="p-8 flex flex-col items-center justify-center min-h-[400px] overflow-hidden relative">
          <div className="text-center z-10 mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Signal Propagation</h3>
            <p className="text-gray-400 text-sm">Watch how waves travel through your home.</p>
          </div>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Animated Waves */}
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute border border-neon-cyan rounded-full opacity-0"
                animate={{
                  width: ["50px", "300px"],
                  height: ["50px", "300px"],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut",
                }}
              />
            ))}
            
            <div className="relative z-10 bg-[#0a0a0a] p-4 rounded-full border border-white/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Radio className="h-10 w-10 text-neon-cyan" />
            </div>
          </div>
        </GlassCard>

        {/* 2.4 vs 5GHz */}
        <div className="space-y-6">
          <GlassCard hoverEffect className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                5 GHz Band
              </h3>
              <Badge variant="success">Recommended</Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Offers much faster speeds and less interference, but has a shorter range.
            </p>
            <ul className="text-sm space-y-2 text-gray-300">
              <li><strong className="text-white">Best for:</strong> Gaming, 4K Streaming, PC, Consoles</li>
              <li><strong className="text-white">Range:</strong> ~50 feet indoors</li>
            </ul>
          </GlassCard>

          <GlassCard hoverEffect className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                2.4 GHz Band
              </h3>
              <Badge variant="warning">Fallback</Badge>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Slower speeds, but can easily pass through walls and travel farther distances.
            </p>
            <ul className="text-sm space-y-2 text-gray-300">
              <li><strong className="text-white">Best for:</strong> Smart Home Devices, Old Phones, Distant Rooms</li>
              <li><strong className="text-white">Range:</strong> ~150 feet indoors</li>
            </ul>
          </GlassCard>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white mb-6">Router Placement Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIPS.map((tip, idx) => (
            <GlassCard key={idx} className="p-6">
              <div className="mb-4">{tip.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
              <p className="text-sm text-gray-400">{tip.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
