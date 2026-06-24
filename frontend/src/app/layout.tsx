import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavigationWrapper from "@/components/NavigationWrapper";

export const metadata: Metadata = {
  title: "AgriSense AI — Farm Operating System for Small Farmers",
  description: "Coordinating multi-agent AI to assist Indian small farmers with crop planning, disease diagnosis, weather advisories, mandi price predictions, and government schemes.",
  keywords: ["AgriSense", "Agriculture AI", "Indian Farmers", "Crop disease doctor", "Mandi prices", "Agri OS", "Crop recommendation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className="min-h-screen bg-[#060a08] text-[#f2f7f4] flex flex-col md:flex-row">
        {/* Navigation panel */}
        <NavigationWrapper />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 md:p-8 md:pl-28 pb-24 md:pb-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
