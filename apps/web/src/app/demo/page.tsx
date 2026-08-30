"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Play, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2,
  Lock, Shield, BarChart3, FileText, Building2,
  Zap, GitBranch, ChevronRight, RefreshCw
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const STEPS = [
  {
    step: 1,
    agent: "Exception",
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "Payment Exception Flagged",
    desc: "Invoice from Acme Cloud Services exceeds contract ceiling by ₹292,000 (+67.4%)",
    detail: "INV-48291 · ₹842,000 vs ₹550,000 contract ceiling",
  },
  {
    step: 2,
    agent: "Controller",
    icon: GitBranch,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    title: "TrueForge Controller Activated",
    desc: "Investigation session created. Controller agent delegates to specialized agents.",
    detail: "Session: bp_7f9a2b1c · Status: ACTIVE",
  },
  {
    step: 3,
    agent: "Ledger",
    icon: BarChart3,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Ledger Agent: Financial Analysis",
    desc: "Retrieves 12 months of payment history. Runs sandbox statistical analysis.",
    detail: "67.4% variance · 3.2σ deviation · Historical median: ₹503K",
  },
  {
    step: 4,
    agent: "Counsel",
    icon: FileText,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "Counsel Agent: Contract Review",
    desc: "Checks active contract v3. Confirms ceiling violation. No amendment found.",
    detail: "Contract v3 · Ceiling: ₹550K · Violation: +₹292K · PO: insufficient",
  },
  {
    step: 5,
    agent: "Signal",
    icon: Building2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "Signal Agent: Vendor Verification",
    desc: "Bank account changed 3 days ago. Authorization source: email only.",
    detail: "HDFC ****4821 → ICICI ****9137 · Authorization: PARTIAL",
  },
  {
    step: 6,
    agent: "Controller",
    icon: Lock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Approval Checkpoint",
    desc: "Agent pauses. 2 contradictions detected. Human approval required to continue.",
    detail: "🔒 Awaiting human approval before verification email",
  },
];

export default function DemoPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [launching, setLaunching] = useState(false);
  const [liveId, setLiveId] = useState<string | null>(null);

  async function start() {
    setStarted(true);
    // Animate steps one by one
    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, i === 0 ? 300 : 700));
      setCurrentStep(i);
    }
  }

  async function launchLive() {
    setLaunching(true);
    try {
      const res = await fetch(`${API}/api/v1/investigations/demo/start`, { method: "POST" });
      const data = await res.json();
      if (data.success && data.data?.investigationId) {
        setLiveId(data.data.investigationId);
        setTimeout(() => router.push(`/dashboard/investigation/${data.data.investigationId}`), 600);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={15} />
          Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Shield size={11} className="text-white" />
          </div>
          <span className="font-bold text-sm text-white">BeforePay</span>
        </div>
        <Link href="/dashboard" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
          Dashboard <ArrowRight size={13} />
        </Link>
      </nav>

      {/* Content */}
      <main className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              NovaStack × Acme Cloud Services · Demo Case
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Watch BeforePay<br />
              <span className="text-gradient">Work the Case</span>
            </h1>
            <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed mb-8">
              ₹842,000 invoice. Contract ceiling: ₹550,000. Bank changed 3 days ago.
              Suspicious — but not trivially fraudulent.
            </p>

            {!started ? (
              <button
                onClick={start}
                className="btn-primary text-base px-8 py-3.5 mx-auto"
              >
                <Play size={16} />
                Start Demo Flow
              </button>
            ) : (
              <div className="flex items-center gap-2 justify-center text-xs text-indigo-400 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Investigation running…
              </div>
            )}
          </motion.div>

          {/* Case data */}
          {!started && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
                {[
                  { label: "Invoice",   value: "₹842,000",   color: "text-red-400" },
                  { label: "Ceiling",   value: "₹550,000",   color: "text-white/70" },
                  { label: "Variance",  value: "+67.4%",     color: "text-amber-400" },
                  { label: "Bank ∆",    value: "3 days ago", color: "text-amber-400" },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] text-center">
                    <div className={`text-xl font-bold font-mono ${item.color} mb-1`}>{item.value}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Steps */}
          {started && (
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const visible = i <= currentStep;
                const active  = i === currentStep;
                const Icon = step.icon;

                return (
                  <AnimatePresence key={step.step}>
                    {visible && (
                      <motion.div
                        initial={{ opacity: 0, x: -24, scale: 0.97 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                      >
                        <SpotlightCard
                          className={`relative p-5 rounded-xl border ${step.bg} overflow-hidden`}
                          spotlightColor="rgba(99,102,241,0.08)"
                        >
                          {active && (
                            <div className="absolute inset-0 rounded-xl"
                              style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.04), transparent)" }} />
                          )}
                          <div className="relative flex gap-4">
                            <div className={`w-10 h-10 rounded-xl border ${step.bg} flex items-center justify-center flex-shrink-0`}>
                              <Icon size={18} className={step.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-mono font-semibold ${step.color} uppercase tracking-wider`}>
                                  {step.agent}
                                </span>
                                <span className="text-[10px] text-white/20">Step {step.step}</span>
                                {active && (
                                  <span className="ml-auto flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
                                    <Zap size={9} />ACTIVE
                                  </span>
                                )}
                                {!active && (
                                  <CheckCircle2 size={12} className="ml-auto text-emerald-400/60" />
                                )}
                              </div>
                              <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                              <p className="text-xs text-white/45 leading-relaxed mb-2">{step.desc}</p>
                              <div className="inline-block px-2.5 py-1 rounded-md bg-black/40 border border-white/[0.08] text-[10px] font-mono text-white/30">
                                {step.detail}
                              </div>
                            </div>
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}

              {/* Final CTA */}
              {currentStep >= STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6"
                >
                  <div className="p-6 rounded-2xl border border-amber-500/30 bg-[#0f0d06] text-center"
                    style={{ boxShadow: "0 0 60px rgba(245,158,11,0.12)" }}
                  >
                    <Lock size={28} className="text-amber-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Investigation Paused</h3>
                    <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
                      2 contradictions found. The agent cannot continue without human approval.
                      Open the live dashboard to approve the verification action.
                    </p>

                    <div className="flex gap-3 justify-center flex-wrap">
                      <button
                        onClick={launchLive}
                        disabled={launching}
                        className="btn-primary"
                      >
                        {launching ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                        {liveId ? "Opening…" : "Launch Live Investigation"}
                      </button>
                      <Link href="/dashboard" className="btn-ghost border border-white/10">
                        Open Dashboard <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  <p className="text-center text-xs text-white/20 mt-4">
                    BeforePay principle: <span className="text-white/35">Money never moves without you.</span>
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
