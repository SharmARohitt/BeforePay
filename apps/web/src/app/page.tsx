"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Shield, Zap, AlertCircle, CheckCircle2,
  Lock, Play, ChevronDown, Layers, GitBranch, Eye
} from "lucide-react";
import dynamic from "next/dynamic";
import SpotlightCard from "@/components/SpotlightCard";
import { SplitText, BlurReveal, GlowText } from "@/components/AnimatedText";

const EvidenceOrb = dynamic(() => import("@/components/EvidenceOrb"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-transparent" />,
});

// Animated counter hook
function useCountUp(target: number, duration = 1500, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = target / (duration / 16);
      const id = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(Math.floor(start));
        if (start >= target) clearInterval(id);
      }, 16);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return count;
}

const FLOW_STEPS = [
  { label: "PAYMENT EXCEPTION", icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { label: "INVESTIGATE",        icon: Search2,     color: "text-indigo-400",bg: "bg-indigo-500/10 border-indigo-500/20" },
  { label: "COLLECT EVIDENCE",   icon: Layers,      color: "text-blue-400",  bg: "bg-blue-500/10 border-blue-500/20" },
  { label: "CORRELATE & VERIFY", icon: GitBranch,   color: "text-violet-400",bg: "bg-violet-500/10 border-violet-500/20" },
  { label: "HUMAN APPROVAL",     icon: Lock,        color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  { label: "FINAL DECISION",     icon: CheckCircle2,color: "text-emerald-400",bg:"bg-emerald-500/10 border-emerald-500/20" },
];
function Search2(p: any) { return <Eye {...p} />; }

const FEATURES = [
  {
    icon: Zap,
    title: "Autonomous Investigation",
    desc: "Specialized agents — Ledger, Counsel, Signal — work in parallel to build a complete evidence picture.",
    color: "indigo",
  },
  {
    icon: AlertCircle,
    title: "Contradiction Detection",
    desc: "Evidence Engine cross-references every claim. Contradictions surface immediately with source tracing.",
    color: "amber",
  },
  {
    icon: Lock,
    title: "Human Control",
    desc: "Every external action requires explicit approval. Money never moves behind your back.",
    color: "emerald",
  },
  {
    icon: Eye,
    title: "Evidence Transparency",
    desc: "Every finding is traceable to its source. Click any claim to see exactly where it came from.",
    color: "violet",
  },
];

const STATS = [
  { value: 842000, label: "Invoice under investigation", prefix: "₹", format: true },
  { value: 67,     label: "Variance from contract ceiling", suffix: "%" },
  { value: 3,      label: "Days since bank account change" },
  { value: 2,      label: "Contradictions detected" },
];

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const count = useCountUp(stat.value, 1800, 200 + index * 150);
  const display = stat.format
    ? `₹${(count / 1000).toFixed(0)}K`
    : `${stat.prefix || ""}${count}${stat.suffix || ""}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
    >
      <SpotlightCard className="p-6 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:border-white/[0.14] transition-all duration-300">
        <div className="text-3xl font-bold font-mono text-white mb-1" style={{
          textShadow: "0 0 20px rgba(99,102,241,0.4)"
        }}>
          {display}
        </div>
        <div className="text-sm text-white/40">{stat.label}</div>
      </SpotlightCard>
    </motion.div>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const orbScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] overflow-x-hidden">
      {/* Dynamic spotlight background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.04), transparent 50%)`,
        }}
      />

      {/* Grid background */}
      <div className="fixed inset-0 bg-grid opacity-40 pointer-events-none z-0" />

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between glass rounded-2xl px-5 py-3 border border-white/[0.08]"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative w-7 h-7">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 blur-md opacity-60 animate-pulse-glow" />
                <div className="relative flex items-center justify-center w-full h-full">
                  <Shield size={14} className="text-white" />
                </div>
              </div>
              <span className="font-bold text-white tracking-tight">BeforePay</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              <a href="#how-it-works" className="btn-ghost text-xs">How it works</a>
              <a href="#evidence" className="btn-ghost text-xs">Evidence Engine</a>
              <a href="#demo" className="btn-ghost text-xs">Demo</a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
              <Link href="/demo" className="btn-primary text-sm">
                Start Investigation
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-12 overflow-hidden">
        {/* Radial glow behind orb */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div style={{ y: heroY, opacity: heroOpacity }}>
            {/* Badge */}
            <BlurReveal delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-300 font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                TrueForge Hackathon 2026 — Built with TrueForge Agent Runtime
              </div>
            </BlurReveal>

            {/* Headline */}
            <h1 className="text-[56px] md:text-[68px] font-bold leading-[1.05] tracking-tight mb-6">
              <SplitText
                text="Investigate"
                delay={0.2}
                stagger={0.05}
                className="text-white"
              />
              <br />
              <span className="block mt-1">
                <SplitText
                  text="Before The"
                  delay={0.4}
                  stagger={0.05}
                  className="text-white/40"
                />
              </span>
              <br />
              <span className="block -mt-1">
                <SplitText
                  text="Money Moves"
                  delay={0.6}
                  stagger={0.05}
                  className="text-gradient"
                />
              </span>
            </h1>

            <BlurReveal delay={0.9}>
              <p className="text-lg text-white/50 leading-relaxed max-w-lg mb-10">
                An autonomous payment investigation agent that gathers evidence, 
                exposes contradictions, and keeps every financial decision 
                under human control.
              </p>
            </BlurReveal>

            <BlurReveal delay={1.1}>
              <div className="flex flex-wrap items-center gap-4">
                <Link href="/demo" className="btn-primary text-base px-6 py-3 group">
                  <Play size={16} className="group-hover:scale-110 transition-transform" />
                  Watch Investigation
                </Link>
                <Link href="/dashboard" className="btn-ghost border border-white/10 text-base px-6 py-3">
                  Open Dashboard
                  <ArrowRight size={16} />
                </Link>
              </div>
            </BlurReveal>

            {/* Trust signals */}
            <BlurReveal delay={1.3}>
              <div className="mt-10 flex items-center gap-6 text-xs text-white/25">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  No real funds
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Full audit trail
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Human approval required
                </span>
              </div>
            </BlurReveal>
          </motion.div>

          {/* Right: 3D Evidence Orb */}
          <motion.div
            style={{ scale: orbScale }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="relative h-[500px] lg:h-[580px]"
          >
            {/* Glow rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full border border-indigo-500/10 animate-spin-slow" />
              <div className="absolute w-96 h-96 rounded-full border border-indigo-500/05 animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "12s" }} />
            </div>

            <Suspense fallback={null}>
              <EvidenceOrb className="w-full h-full" />
            </Suspense>

            {/* Floating labels */}
            {[
              { label: "Invoice",  x: "60%", y: "20%", delay: 0.8 },
              { label: "Contract", x: "80%", y: "50%", delay: 1.0 },
              { label: "Bank",     x: "15%", y: "65%", delay: 1.2 },
              { label: "Vendor",   x: "55%", y: "78%", delay: 1.4 },
            ].map((tag) => (
              <motion.div
                key={tag.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: tag.delay, duration: 0.4 }}
                className="absolute pointer-events-none"
                style={{ left: tag.x, top: tag.y }}
              >
                <div className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[10px] font-mono text-white/50 backdrop-blur-sm">
                  {tag.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/20 tracking-widest uppercase">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown size={16} className="text-white/20" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <BlurReveal>
            <p className="text-center text-xs font-mono text-white/25 tracking-widest uppercase mb-8">
              NovaStack Demo Case
            </p>
          </BlurReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => <StatCard key={i} stat={stat} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <BlurReveal>
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-indigo-400 tracking-widest uppercase mb-3">The Investigation Loop</p>
              <h2 className="text-4xl font-bold text-white mb-4">How BeforePay Works</h2>
              <p className="text-white/40 max-w-xl mx-auto">
                Every payment exception triggers a structured investigation. No black boxes.
              </p>
            </div>
          </BlurReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-indigo-500/40 via-indigo-500/20 to-transparent hidden md:block" />

            <div className="space-y-3">
              {FLOW_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <SpotlightCard
                    className={`flex items-center gap-5 p-4 rounded-xl border ${step.bg} cursor-default`}
                    spotlightColor="rgba(99,102,241,0.08)"
                  >
                    <div className={`w-8 h-8 rounded-full border ${step.bg} flex items-center justify-center flex-shrink-0`}>
                      <step.icon size={16} className={step.color} />
                    </div>
                    <div>
                      <span className={`font-mono text-sm font-semibold ${step.color}`}>{step.label}</span>
                    </div>
                    <div className="ml-auto text-xs font-mono text-white/20">0{i + 1}</div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="evidence" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <BlurReveal>
            <div className="text-center mb-16">
              <p className="text-xs font-mono text-indigo-400 tracking-widest uppercase mb-3">Core Capabilities</p>
              <h2 className="text-4xl font-bold text-white mb-4">
                Built for <GlowText>Financial Precision</GlowText>
              </h2>
            </div>
          </BlurReveal>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <SpotlightCard
                  className="p-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all duration-300 h-full"
                  spotlightColor={`rgba(99,102,241,0.1)`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-${f.color}-500/10 border border-${f.color}-500/20 flex items-center justify-center mb-4`}>
                    <f.icon size={20} className={`text-${f.color}-400`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APPROVAL PREVIEW ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <BlurReveal>
            <div className="text-center mb-12">
              <p className="text-xs font-mono text-amber-400 tracking-widest uppercase mb-3">Human-in-the-Loop</p>
              <h2 className="text-4xl font-bold text-white mb-4">
                Money never moves <br />
                <span className="text-gradient">without you</span>
              </h2>
            </div>
          </BlurReveal>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="max-w-md mx-auto"
          >
            <div className="relative p-6 rounded-2xl border border-amber-500/30 bg-[#0f0d06]"
              style={{ boxShadow: "0 0 60px rgba(245,158,11,0.12), inset 0 0 30px rgba(245,158,11,0.04)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Lock size={14} className="text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-mono text-amber-400 font-semibold tracking-wider">HUMAN APPROVAL REQUIRED</div>
                  <div className="text-xs text-white/30">Investigation paused</div>
                </div>
                <div className="ml-auto">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse block" />
                </div>
              </div>

              <div className="space-y-4 pb-5 mb-5 border-b border-white/[0.07]">
                {[
                  { label: "ACTION", value: "Send Verification Email" },
                  { label: "RECIPIENT", value: "jane.doe@acmecloud.com", mono: true },
                  { label: "RISK", value: "LOW", color: "text-emerald-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between">
                    <span className="text-[10px] text-white/30 tracking-wider font-mono">{item.label}</span>
                    <span className={`text-sm font-medium ${item.color || "text-white/80"} ${item.mono ? "font-mono text-xs" : ""}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-white/40 mb-5 leading-relaxed">
                Conflicting bank-change evidence requires independent vendor confirmation.
              </p>

              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-white/50 hover:text-white/70 transition-colors">
                  Cancel
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-black hover:opacity-90 transition-opacity"
                  style={{ boxShadow: "0 0 20px rgba(245,158,11,0.3)" }}>
                  Approve & Send
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative p-12 rounded-3xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 0 80px rgba(99,102,241,0.15)"
              }}
            >
              <div className="absolute inset-0 bg-dots opacity-20" />
              <div className="relative z-10">
                <p className="text-xs font-mono text-indigo-400 tracking-widest uppercase mb-4">Ready to Investigate</p>
                <h2 className="text-5xl font-bold text-white mb-4">
                  BeforePay
                </h2>
                <p className="text-lg text-white/40 mb-8">Investigate before the money moves.</p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/demo" className="btn-primary text-base px-8 py-3.5">
                    <Play size={16} />
                    Run Demo Investigation
                  </Link>
                  <Link href="/dashboard" className="btn-ghost border border-white/10 text-base px-8 py-3.5">
                    Open Dashboard
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-white/20">
          <span className="font-mono">BeforePay — TrueForge Hackathon 2026</span>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>Powered by TrueForge Agent Runtime</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
