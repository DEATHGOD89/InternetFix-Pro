import Link from "next/link";
import { Code, MessageCircle, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/50 overflow-hidden">
      {/* Decorative Network Mesh Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-animated" style={{
        backgroundImage: `radial-gradient(circle at 50% 100%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), 
                          linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), 
                          linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-bold text-xl tracking-tight">
                InternetFix <span className="neon-text-blue">Pro</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm">
              The ultimate platform to diagnose, troubleshoot, and optimize your internet connection using professional tools and commands.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/speed-test" className="hover:text-neon-cyan transition-colors">Speed Test</Link></li>
              <li><Link href="/cmd-fixes" className="hover:text-neon-cyan transition-colors">CMD Commands</Link></li>
              <li><Link href="/gaming-boost" className="hover:text-neon-cyan transition-colors">Gaming Boost</Link></li>
              <li><Link href="/tutorials" className="hover:text-neon-cyan transition-colors">Tutorials</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
                <span className="sr-only">GitHub</span>
                <Code className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
                <span className="sr-only">Twitter</span>
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors">
                <span className="sr-only">Discord</span>
                <Share2 className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} InternetFix Pro. All rights reserved.</p>
          <div className="space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
