"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TerminalWindowProps {
  command: string;
  output?: string[];
  typingSpeed?: number;
  className?: string;
  delay?: number;
}

export function TerminalWindow({
  command,
  output = [],
  typingSpeed = 50,
  className,
  delay = 0,
}: TerminalWindowProps) {
  const [displayedCommand, setDisplayedCommand] = useState("");
  const [showOutput, setShowOutput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const startTyping = () => {
      setIsTyping(true);
      let i = 0;
      const typeChar = () => {
        if (i < command.length) {
          setDisplayedCommand(command.slice(0, i + 1));
          i++;
          timeout = setTimeout(typeChar, typingSpeed + (Math.random() * 30 - 15)); // Add slight randomness
        } else {
          setIsTyping(false);
          timeout = setTimeout(() => setShowOutput(true), 400); // Wait before showing output
        }
      };
      typeChar();
    };

    timeout = setTimeout(startTyping, delay);

    return () => clearTimeout(timeout);
  }, [command, delay, typingSpeed]);

  return (
    <div className={cn("rounded-lg overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-lg font-mono text-sm", className)}>
      {/* Terminal Header */}
      <div className="flex items-center px-4 py-2 bg-[#1e293b]/50 border-b border-white/5">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <div className="mx-auto text-xs text-gray-400 select-none">Command Prompt</div>
      </div>
      
      {/* Terminal Body */}
      <div className="p-4 text-gray-300 min-h-[120px]">
        <div className="flex items-start">
          <span className="text-neon-cyan mr-2 select-none">C:\Users\Admin&gt;</span>
          <span className="text-white">
            {displayedCommand}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-white ml-1 align-middle"
              />
            )}
          </span>
        </div>
        
        {showOutput && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 space-y-1 text-gray-400"
          >
            {output.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
            {!isTyping && (
              <div className="flex items-start mt-2">
                 <span className="text-neon-cyan mr-2 select-none">C:\Users\Admin&gt;</span>
                 <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-4 bg-white align-middle"
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
