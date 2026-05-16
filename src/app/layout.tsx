import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InternetFix Pro | Fix Slow Internet Like a Pro",
  description: "Test speed, repair network issues, optimize gaming ping, and learn powerful CMD & PowerShell internet fixes in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.variable} min-h-full flex flex-col bg-background text-foreground`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
