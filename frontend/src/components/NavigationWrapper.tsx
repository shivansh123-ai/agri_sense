"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Scan, 
  MessageSquare, 
  TrendingUp, 
  CalendarCheck,
  Sprout
} from "lucide-react";

export default function NavigationWrapper() {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "AI Chat & Scanner",
      href: "/chat",
      icon: MessageSquare,
    },
    {
      name: "Market Trends",
      href: "/market",
      icon: TrendingUp,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CalendarCheck,
    },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col items-center fixed top-0 left-0 h-full w-20 bg-[#070e0b]/80 border-r border-[#10b981]/15 py-6 z-50 backdrop-blur-md">
        {/* Brand Logo */}
        <div className="mb-10 text-[#10b981] animate-pulse">
          <Sprout className="w-8 h-8" />
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-6 w-full px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative group flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-[#10b981]/15 text-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)] border border-[#10b981]/30" 
                    : "text-[#a3b899] hover:bg-[#10b981]/5 hover:text-[#10b981]"
                }`}
              >
                <Icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <span className="absolute left-24 scale-0 group-hover:scale-100 transition-all duration-200 bg-[#0b1411] text-[#f2f7f4] text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#10b981]/20 shadow-xl whitespace-nowrap pointer-events-none z-50">
                  {item.name}
                </span>

                {/* Left Active Bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#10b981] rounded-r-md"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Extra Info/Icon at bottom */}
        <div className="text-xs text-[#52775f] text-center font-medium">
          v1.0
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070e0b]/90 border-t border-[#10b981]/15 flex items-center justify-around px-4 z-50 backdrop-blur-md">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "text-[#10b981]" 
                  : "text-[#a3b899]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
