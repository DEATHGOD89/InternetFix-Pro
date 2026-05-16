"use client";

import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";
import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface CommandCardProps {
  title: string;
  command: string;
  description: string;
  whenToUse: string;
  expectedResult: string;
  risk: "Safe" | "Moderate" | "High";
}

export function CommandCard({
  title,
  command,
  description,
  whenToUse,
  expectedResult,
  risk,
}: CommandCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskVariant = 
    risk === "Safe" ? "success" : 
    risk === "Moderate" ? "warning" : "danger";

  return (
    <GlassCard hoverEffect className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-neon-cyan" />
          {title}
        </h3>
        <Badge variant={riskVariant}>Risk: {risk}</Badge>
      </div>

      <div className="bg-[#0a0a0a] rounded-md border border-white/10 p-3 mb-4 flex justify-between items-center group">
        <code className="text-neon-cyan font-mono text-sm break-all">{command}</code>
        <button
          onClick={handleCopy}
          className="ml-4 p-2 rounded-md bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Copy command"
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <div className="space-y-3 text-sm text-gray-400 flex-grow">
        <p><strong className="text-gray-300">What it does:</strong> {description}</p>
        <p><strong className="text-gray-300">When to use:</strong> {whenToUse}</p>
        <p><strong className="text-gray-300">Expected result:</strong> {expectedResult}</p>
      </div>
    </GlassCard>
  );
}
