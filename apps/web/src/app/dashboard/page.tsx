"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AlertTriangle, Zap, Clock, CheckCircle2,
  ShieldX, Play, RefreshCw, ArrowRight, ChevronRight,
  TrendingUp, Activity
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const STAT_CARDS = [
  { key: "paymentExceptions", label: "Exceptions",        icon: AlertTriangle, color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20",   glow: "rgba(245,158,11,0.15)" },
  { key: "investigating",     label: "Investigating",     icon: Zap,           color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20",  glow: "rgba(99,102,241,0.15)" },
  { key: "awaitingApproval",  label: "Await Approval",    icon: Clock,         color: "text-amber-400",  bg: "bg-amber-500/10  border-amber-500/20",   glow: "rgba(245,158,11,0.15)" },
  { key: "verified",          label: "Verified",          icon: CheckCircle2,  color: "text-emerald-400",bg: "bg-emerald-500/10 border-emerald-500/20", glow: "rgba(16,185,129,0.15)" },
  { key: "blocked",           label: "Blocked",           icon: ShieldX,       color: "text-red-400",    bg: "bg-red-500/10    border-red-500/20",      glow: "rgba(239,68,68,0.15)"  },
];

function useCountUp(target: number, delay = 0) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      let s = 0;
      const step = target / 40;
      const id = setInterval(() => {
        s = Math.min(s + step, target);
        setVal(Math.round(s));
        if (s >= target) clearInterval(id);
      }, 20);
    }, delay);
    return () => clearTimeout(t);
  }, [target, delay]);
  return val;
}

function StatCard({ cfg, value, idx }: { cfg: typeof STAT_CARDS[0]; value: number; idx: number }) {
  const count = useCountUp(value, idx * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.07, duration: 0.5 }}
    >
      <SpotlightCard
        className={`relative p-5 rounded-xl border ${cfg.bg} overflow-hidden`}
        spotlightColor={cfg.glow}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={`w-8 h-8 rounded-lg border ${cfg.bg} flex items-center justify-center`}>
            <cfg.icon size={16} className={cfg.color} />
          </div>
          <TrendingUp size={12} className="text-white/15" />
        </div>
        <div className="text-3xl font-bold text-white font-mono mb-0.5"
          style={{ textShadow: `0 0 20px ${cfg.glow}` }}>
          {count}
        </div>
        <div className="text-xs text-white/35 font-medium">{cfg.label}</div>
      </SpotlightCard>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ paymentExceptions: 12, investigating: 0, awaitingApproval: 0, verified: 41, blocked: 3 });
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoId, setDemoId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/api/v1/dashboard/overview`).then(r => r.json()).then(d => d.data && setStats(d.data)).catch(() => {});
    fetch(`${API}/api/v1/investigations`).then(r => r.json()).then(d => d.data && setInvestigations(d.data)).catch(() => {});
  }, []);

  async function startDemo() {
    setDemoLoading(true);
    try {
      const res = await fetch(`${API}/api/v1/investigations/demo/start`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data?.investigationId) {
        setDemoId(data.data.investigationId);
        setStats(s => ({ ...s, investigating: s.investigating + 1 }));
        // Refresh investigations list
        setTimeout(() => {
          fetch(`${API}/api/v1/investigations`).then(r => r.json()).then(d => d.data && setInvestigations(d.data));
        }, 800);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(false);
    }
  }

  const statusColor: Record<string, string> = {
    investigating:    "badge-investigating",
    awaiting_approval:"badge-hold",
    completed:        "badge-verified",
    pending:          "badge-pending",
  };
  const statusLabel: Record<string, string> = {
    investigating:     "Investigating",
    awaiting_approval: "Awaiting Approval",
    completed:         "Completed",
    pending:           "Pending",
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white mb-1"
          >
            Payment Control Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-white/35"
          >
            Autonomous investigation dashboard
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => { fetch(`${API}/api/v1/investigations`).then(r => r.json()).then(d => d.data && setInvestigations(d.data)); }}
            className="btn-ghost text-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            onClick={startDemo}
            disabled={demoLoading}
            className="btn-primary text-sm"
          >
            {demoLoading ? (
              <><RefreshCw size={14} className="animate-spin" />Starting…</>
            ) : (
              <><Play size={14} />Run Demo Investigation</>
            )}
          </button>
        </motion.div>
      </div>

      {/* Demo started banner */}
      {demoId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-sm text-indigo-300 font-medium">Investigation started — TrueForge agents are working</span>
          </div>
          <Link href={`/dashboard/investigation/${demoId}`} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            View live <ArrowRight size={12} />
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {STAT_CARDS.map((cfg, i) => (
          <StatCard key={cfg.key} cfg={cfg} value={(stats as any)[cfg.key] || 0} idx={i} />
        ))}
      </div>

      {/* Investigations table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Active Investigations</span>
            {investigations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-xs text-indigo-400 font-mono">
                {investigations.length}
              </span>
            )}
          </div>
          <Link href="/dashboard/investigations" className="text-xs text-white/30 hover:text-white/60 flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {investigations.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/[0.07] flex items-center justify-center mx-auto mb-4">
              <Zap size={20} className="text-white/20" />
            </div>
            <p className="text-sm text-white/25 mb-1">No active investigations</p>
            <p className="text-xs text-white/15">Click "Run Demo Investigation" to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {investigations.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/dashboard/investigation/${inv.id}`}>
                  <div className="px-5 py-4 hover:bg-white/[0.03] transition-colors flex items-center gap-4 group">
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      inv.status === "investigating" ? "bg-indigo-400 animate-pulse" :
                      inv.status === "awaiting_approval" ? "bg-amber-400 animate-pulse" :
                      inv.status === "completed" ? "bg-emerald-400" :
                      "bg-white/20"
                    }`} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white">
                          INV-{inv.id.slice(-6).toUpperCase()}
                        </span>
                        <span className={statusColor[inv.status] || "badge-pending"}>
                          {statusLabel[inv.status] || inv.status}
                        </span>
                        {inv.recommendation && (
                          <span className={
                            inv.recommendation === "hold" ? "badge-hold" :
                            inv.recommendation === "block" ? "badge-block" :
                            "badge-verified"
                          }>
                            {inv.recommendation.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-white/30 font-mono">
                        Session: {inv.trueforgeSessionId || "—"} &nbsp;·&nbsp;
                        Started: {new Date(inv.startedAt).toLocaleTimeString()}
                      </div>
                    </div>

                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Demo banner if no investigations */}
      {investigations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] text-center"
        >
          <p className="text-sm text-white/40 mb-3">
            The demo case: <span className="text-indigo-300 font-mono">NovaStack / Acme Cloud Services / INV-48291 / ₹842,000</span>
          </p>
          <button onClick={startDemo} disabled={demoLoading} className="btn-primary mx-auto">
            <Play size={14} />
            {demoLoading ? "Starting…" : "Start Demo Investigation"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
