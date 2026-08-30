"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Search, FileText, Building2,
  ShieldAlert, Activity, Settings, Zap, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",            icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/investigations", icon: Search,         label: "Investigations" },
  { href: "/dashboard/payments",   icon: FileText,      label: "Payments" },
  { href: "/dashboard/vendors",    icon: Building2,     label: "Vendors" },
  { href: "/dashboard/evidence",   icon: ShieldAlert,   label: "Evidence" },
  { href: "/dashboard/activity",   icon: Activity,      label: "Activity" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-[#0a0a0a]">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-7 h-7">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 opacity-90" />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative flex items-center justify-center w-full h-full">
                <ShieldAlert size={14} className="text-white" />
              </div>
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white">BeforePay</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150 ${
                    active
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  <item.icon size={15} className={active ? "text-indigo-400" : ""} />
                  {item.label}
                  {active && <ChevronRight size={12} className="ml-auto text-indigo-400/60" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div className="px-3 pb-4 space-y-2">
          <Link href="/dashboard/settings">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all">
              <Settings size={15} />
              Settings
            </div>
          </Link>

          {/* TrueForge status */}
          <div className="mx-2 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1">
              <div className="relative flex items-center justify-center w-4 h-4">
                <div className="absolute w-4 h-4 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="relative w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>
              <span className="text-[11px] font-mono text-indigo-400 font-medium">TRUEFORGE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-indigo-400/60" />
              <span className="text-[10px] text-white/30">Agent Runtime v2</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex-shrink-0 h-14 border-b border-white/[0.06] flex items-center px-6 gap-4 bg-[#0a0a0a]/80 backdrop-blur-sm">
          <div className="flex-1" />
          {/* Status pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium text-emerald-400">Systems Operational</span>
          </div>
          {/* Demo mode badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="text-[11px] font-medium text-amber-400">DEMO MODE</span>
          </div>
          {/* User */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">JD</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
