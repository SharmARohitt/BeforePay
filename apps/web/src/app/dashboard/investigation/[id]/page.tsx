"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Zap, CheckCircle2, AlertTriangle, Clock, Lock,
  RefreshCw, Shield, ShieldX, FileText, Building2, CreditCard,
  Mail, BarChart3, GitBranch, ChevronRight, Eye, X, Check,
  TrendingUp, Activity, Layers, Info
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/* ── Types ─────────────────────────────────────────────────── */
interface InvEvent {
  id: string; type: string; agent?: string; tool?: string;
  message: string; metadata?: Record<string, any>; timestamp: string;
}
interface EvidenceItem {
  id: string; sourceType: string; sourceId: string; claim: string;
  value: string; confidence: string | number;
  supports?: string[]; contradicts?: string[];
}
interface Approval {
  id: string; action: string; description?: string; status: string;
  metadata?: Record<string, any>; requestedAt: string;
}
interface Investigation {
  id: string; status: string; trueforgeSessionId?: string;
  recommendation?: string; confidence?: string; summary?: string;
  startedAt: string; completedAt?: string; paymentExceptionId: string;
}

/* ── Agent icon map ─────────────────────────────────────────── */
const AGENT_META: Record<string, { color: string; bg: string; icon: any }> = {
  controller: { color: "text-indigo-400",  bg: "bg-indigo-500/15",  icon: GitBranch },
  ledger:     { color: "text-blue-400",    bg: "bg-blue-500/15",    icon: BarChart3 },
  counsel:    { color: "text-violet-400",  bg: "bg-violet-500/15",  icon: FileText },
  signal:     { color: "text-cyan-400",    bg: "bg-cyan-500/15",    icon: Building2 },
  system:     { color: "text-white/40",    bg: "bg-white/5",        icon: Shield },
};

const EVENT_ICONS: Record<string, { icon: any; color: string }> = {
  investigation_started: { icon: Zap,          color: "text-indigo-400" },
  agent_started:         { icon: Activity,     color: "text-blue-400" },
  agent_completed:       { icon: CheckCircle2, color: "text-emerald-400" },
  tool_called:           { icon: ChevronRight, color: "text-white/40" },
  tool_completed:        { icon: Check,        color: "text-emerald-400" },
  tool_failed:           { icon: X,            color: "text-red-400" },
  sandbox_started:       { icon: Layers,       color: "text-blue-400" },
  sandbox_completed:     { icon: CheckCircle2, color: "text-blue-400" },
  evidence_created:      { icon: Shield,       color: "text-indigo-400" },
  contradiction_found:   { icon: AlertTriangle,color: "text-amber-400" },
  evidence_gap_found:    { icon: Info,         color: "text-amber-400" },
  approval_requested:    { icon: Lock,         color: "text-amber-400" },
  approval_approved:     { icon: CheckCircle2, color: "text-emerald-400" },
  action_executed:       { icon: Zap,          color: "text-indigo-400" },
  session_resumed:       { icon: RefreshCw,    color: "text-indigo-400" },
  decision_created:      { icon: TrendingUp,   color: "text-emerald-400" },
  investigation_completed:{ icon: CheckCircle2,color: "text-emerald-400" },
};

function EvidenceBadge({ type }: { type: string }) {
  const map: Record<string,string> = {
    invoice: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
    contract:"bg-violet-500/15 text-violet-300 border-violet-500/25",
    vendor:  "bg-cyan-500/15   text-cyan-300   border-cyan-500/25",
    bank:    "bg-amber-500/15  text-amber-300  border-amber-500/25",
    po:      "bg-green-500/15  text-green-300  border-green-500/25",
    email:   "bg-pink-500/15   text-pink-300   border-pink-500/25",
    system:  "bg-white/10      text-white/50   border-white/15",
    sandbox: "bg-blue-500/15   text-blue-300   border-blue-500/25",
    inference:"bg-purple-500/15 text-purple-300 border-purple-500/25",
  };
  const SRC_ICONS: Record<string, any> = {
    invoice: FileText, contract: FileText, vendor: Building2,
    bank: CreditCard, email: Mail, po: FileText,
  };
  const Ic = SRC_ICONS[type] || Shield;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border ${map[type] || map.system}`}>
      <Ic size={9} />
      {type.toUpperCase()}
    </span>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-white/[0.08] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/40 w-8 text-right">{pct}%</span>
    </div>
  );
}

function StatusBadge({ status, recommendation }: { status: string; recommendation?: string }) {
  if (recommendation) {
    const map: Record<string,string> = {
      verified: "badge-verified",
      hold:     "badge-hold",
      block:    "badge-block",
    };
    return (
      <span className={`${map[recommendation] || "badge-pending"} text-sm px-3 py-1`}>
        {recommendation === "verified" ? "🟢" : recommendation === "hold" ? "🟡" : "🔴"} {recommendation.toUpperCase()}
      </span>
    );
  }
  const map: Record<string,string> = {
    investigating:     "badge-investigating",
    awaiting_approval: "badge-hold",
    completed:         "badge-verified",
    pending:           "badge-pending",
  };
  const labels: Record<string,string> = {
    investigating: "Investigating",
    awaiting_approval: "Awaiting Approval",
    completed: "Completed",
    pending: "Pending",
  };
  return <span className={`${map[status] || "badge-pending"} text-sm px-3 py-1`}>{labels[status] || status}</span>;
}

/* ── Main page ──────────────────────────────────────────────── */
export default function InvestigationPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [inv, setInv] = useState<Investigation | null>(null);
  const [events, setEvents] = useState<InvEvent[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [pendingApproval, setPendingApproval] = useState<Approval | null>(null);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline"|"evidence">("timeline");
  const timelineEndRef = useRef<HTMLDivElement>(null);
  const evtSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll timeline
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // SSE stream
  useEffect(() => {
    const es = new EventSource(`${API}/api/v1/investigations/${id}/stream`);
    evtSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "event") {
          setEvents(prev => {
            const exists = prev.find(x => x.id === msg.payload.id);
            return exists ? prev : [...prev, msg.payload];
          });
        } else if (msg.type === "state") {
          setInv(msg.payload);
        } else if (msg.type === "evidence") {
          setEvidenceItems(prev => {
            const exists = prev.find(x => x.id === msg.payload.id);
            return exists ? prev : [...prev, msg.payload];
          });
        } else if (msg.type === "approval") {
          if (msg.payload.status === "pending") setPendingApproval(msg.payload);
        } else if (msg.type === "decision") {
          setInv(p => p ? { ...p, recommendation: msg.payload.recommendation, confidence: msg.payload.confidence, summary: msg.payload.summary } : p);
          setPendingApproval(null);
        }
      } catch {}
    };

    // Initial load
    fetch(`${API}/api/v1/investigations/${id}`).then(r => r.json()).then(d => d.data && setInv(d.data));
    fetch(`${API}/api/v1/investigations/${id}/evidence`).then(r => r.json()).then(d => d.data && setEvidenceItems(d.data));
    fetch(`${API}/api/v1/investigations/${id}/approvals`).then(r => r.json()).then(d => {
      if (d.data) {
        const pending = d.data.find((a: Approval) => a.status === "pending");
        if (pending) setPendingApproval(pending);
      }
    });

    return () => { es.close(); };
  }, [id]);

  async function handleApprove(approved: boolean) {
    if (!pendingApproval || !inv) return;
    setApproving(true);
    try {
      await fetch(`${API}/api/v1/investigations/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          approvedBy: "human_operator",
          approvalId: pendingApproval.id,
        }),
      });
      if (approved) setPendingApproval(null);
    } catch (e) { console.error(e); }
    finally { setApproving(false); }
  }

  const supported   = evidenceItems.filter(e => !e.contradicts?.length && !String(e.value).includes("partial"));
  const contradicted= evidenceItems.filter(e => e.contradicts && e.contradicts.length > 0);
  const unknown     = evidenceItems.filter(e => Number(e.confidence) < 0.7 && !(e.contradicts?.length));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Top bar ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/[0.07] flex items-center gap-4 bg-[#0a0a0a]/60">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={15} />
          Dashboard
        </Link>
        <div className="w-px h-4 bg-white/10" />
        {inv && (
          <>
            <StatusBadge status={inv.status} recommendation={inv.recommendation} />
            <span className="text-sm font-medium text-white">
              INV-{id.slice(-6).toUpperCase()}
            </span>
            {inv.trueforgeSessionId && (
              <span className="font-mono text-xs text-white/25 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.07]">
                {inv.trueforgeSessionId}
              </span>
            )}
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {inv?.status === "investigating" && (
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* ── Three-column layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Timeline / Evidence tabs */}
        <div className="flex-1 min-w-0 flex flex-col border-r border-white/[0.06] overflow-hidden">
          {/* Tab bar */}
          <div className="flex-shrink-0 flex items-center gap-1 px-4 py-2.5 border-b border-white/[0.06]">
            {(["timeline", "evidence"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {tab === "timeline" ? `Timeline (${events.length})` : `Evidence (${evidenceItems.length})`}
              </button>
            ))}
          </div>

          {/* Timeline */}
          {activeTab === "timeline" && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <RefreshCw size={20} className="text-white/15 animate-spin mb-3" />
                  <p className="text-sm text-white/20">Waiting for agent activity…</p>
                </div>
              ) : (
                events.map((evt, i) => {
                  const meta = AGENT_META[evt.agent || "system"] || AGENT_META.system;
                  const evtIcon = EVENT_ICONS[evt.type] || { icon: Activity, color: "text-white/40" };
                  const EvtIc = evtIcon.icon;
                  const AgentIc = meta.icon;
                  const isApproval = evt.type === "approval_requested";
                  const isContradiction = evt.type === "contradiction_found";

                  return (
                    <motion.div
                      key={evt.id || i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.3) }}
                      className={`flex gap-3 p-3 rounded-lg transition-all ${
                        isApproval ? "bg-amber-500/[0.08] border border-amber-500/20" :
                        isContradiction ? "bg-red-500/[0.06] border border-red-500/15" :
                        "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                        <div className={`w-6 h-6 rounded-full ${meta.bg} border border-white/[0.08] flex items-center justify-center flex-shrink-0`}>
                          <EvtIc size={11} className={evtIcon.color} />
                        </div>
                        {i < events.length - 1 && <div className="w-px flex-1 bg-white/[0.05] min-h-[8px]" />}
                      </div>

                      <div className="flex-1 min-w-0 pb-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          {evt.agent && (
                            <span className={`text-[10px] font-mono font-semibold ${meta.color} uppercase tracking-wider`}>
                              {evt.agent}
                            </span>
                          )}
                          <span className="text-[10px] text-white/20 ml-auto font-mono">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${
                          isContradiction ? "text-amber-300" :
                          isApproval ? "text-amber-200" :
                          "text-white/60"
                        }`}>
                          {evt.message}
                        </p>
                        {evt.metadata && evt.type === "sandbox_completed" && (
                          <div className="mt-1.5 p-2 rounded-md bg-blue-500/[0.08] border border-blue-500/15 text-[10px] font-mono text-blue-300">
                            Z-score: {evt.metadata.zScore} &nbsp;·&nbsp; Outlier: {evt.metadata.isOutlier ? "YES" : "NO"}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={timelineEndRef} />
            </div>
          )}

          {/* Evidence */}
          {activeTab === "evidence" && (
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {evidenceItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Shield size={20} className="text-white/15 mb-3" />
                  <p className="text-sm text-white/20">Evidence collecting…</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {evidenceItems.map((evid, i) => {
                    const conf = Number(evid.confidence);
                    const isContradicted = evid.contradicts && evid.contradicts.length > 0;
                    const isLowConf = conf < 0.7;

                    return (
                      <motion.div
                        key={evid.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <SpotlightCard
                          className={`p-3 rounded-xl border transition-all ${
                            isContradicted ? "border-amber-500/25 bg-amber-500/[0.05]" :
                            isLowConf ? "border-white/[0.07] bg-white/[0.02]" :
                            "border-white/[0.07] bg-white/[0.02]"
                          }`}
                          spotlightColor="rgba(99,102,241,0.08)"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <EvidenceBadge type={evid.sourceType} />
                            {isContradicted && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
                                <AlertTriangle size={8} /> CONFLICT
                              </span>
                            )}
                            {isLowConf && !isContradicted && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono text-white/30 bg-white/5 border border-white/10">
                                ? UNCERTAIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed mb-2">{evid.claim}</p>
                          <ConfidenceBar value={conf} />
                        </SpotlightCard>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Decision + Approval */}
        <div className="w-[320px] flex-shrink-0 flex flex-col overflow-y-auto p-4 gap-4">

          {/* Approval Gate */}
          <AnimatePresence>
            {pendingApproval && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-amber-500/30 bg-[#0f0d06] overflow-hidden"
                style={{ boxShadow: "0 0 40px rgba(245,158,11,0.15)" }}
              >
                {/* Header */}
                <div className="px-4 py-3 bg-amber-500/[0.08] border-b border-amber-500/20 flex items-center gap-2">
                  <div className="relative">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Lock size={11} className="text-amber-400" />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-amber-400 tracking-wider">APPROVAL REQUIRED</span>
                </div>

                <div className="p-4 space-y-3">
                  {[
                    { label: "ACTION", value: pendingApproval.action?.replace(/_/g, " ").toUpperCase() },
                    { label: "RECIPIENT", value: pendingApproval.metadata?.recipient, mono: true },
                    { label: "RISK", value: String(pendingApproval.metadata?.risk || "low").toUpperCase(),
                      color: "text-emerald-400" },
                  ].map(item => item.value && (
                    <div key={item.label}>
                      <div className="text-[9px] text-white/25 font-mono tracking-widest mb-0.5">{item.label}</div>
                      <div className={`text-sm font-medium ${item.color || "text-white/80"} ${item.mono ? "font-mono text-xs" : ""}`}>
                        {item.value}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-white/[0.07]">
                    <div className="text-[9px] text-white/25 font-mono tracking-widest mb-1">REASON</div>
                    <p className="text-xs text-white/50 leading-relaxed">
                      {pendingApproval.metadata?.reason || pendingApproval.description}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(false)}
                      disabled={approving}
                      className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleApprove(true)}
                      disabled={approving}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold text-black transition-all flex items-center justify-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 0 16px rgba(245,158,11,0.4)" }}
                    >
                      {approving ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve & Send
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recommendation Card */}
          {inv && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
            >
              <div className="text-[10px] text-white/25 font-mono tracking-widest mb-3">RECOMMENDATION</div>
              {inv.recommendation ? (
                <>
                  <div className={`text-2xl font-bold mb-1 font-mono ${
                    inv.recommendation === "verified" ? "text-emerald-400" :
                    inv.recommendation === "hold" ? "text-amber-400" :
                    "text-red-400"
                  }`}
                    style={{ textShadow: inv.recommendation === "hold" ? "0 0 20px rgba(245,158,11,0.4)" : "" }}
                  >
                    {inv.recommendation === "verified" ? "🟢 VERIFIED" :
                     inv.recommendation === "hold" ? "🟡 HOLD" : "🔴 BLOCK"}
                  </div>
                  {inv.confidence && (
                    <div className="text-xs text-white/30 mb-3">Confidence: <span className="text-white/60 font-mono">{inv.confidence.toUpperCase()}</span></div>
                  )}
                  {inv.summary && (
                    <p className="text-xs text-white/40 leading-relaxed">{inv.summary}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-white/25">
                  <RefreshCw size={13} className={inv.status === "investigating" ? "animate-spin" : ""} />
                  <span className="text-xs">
                    {inv.status === "investigating" ? "Investigation in progress…" :
                     inv.status === "awaiting_approval" ? "Awaiting human approval" :
                     "Pending"}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Evidence Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
          >
            <div className="text-[10px] text-white/25 font-mono tracking-widest mb-3">EVIDENCE SUMMARY</div>
            <div className="space-y-2">
              {[
                { label: "Supported",    value: supported.length,    color: "text-emerald-400", dot: "bg-emerald-400" },
                { label: "Contradicted", value: contradicted.length, color: "text-amber-400",   dot: "bg-amber-400" },
                { label: "Uncertain",    value: unknown.length,      color: "text-white/40",    dot: "bg-white/20" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    <span className="text-xs text-white/40">{item.label}</span>
                  </div>
                  <span className={`text-sm font-mono font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* TrueForge session panel */}
          {inv?.trueforgeSessionId && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[10px] font-mono text-indigo-400 tracking-widest font-semibold">TRUEFORGE SESSION</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-white/25">Session</span>
                  <span className="text-indigo-300">{inv.trueforgeSessionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/25">Events</span>
                  <span className="text-white/50">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/25">Evidence</span>
                  <span className="text-white/50">{evidenceItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/25">Status</span>
                  <span className={inv.status === "investigating" ? "text-indigo-300" : "text-white/50"}>
                    {inv.status.toUpperCase().replace("_"," ")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Investigation started at */}
          {inv && (
            <div className="text-[10px] font-mono text-white/15 text-center">
              Started {new Date(inv.startedAt).toLocaleString()}
              {inv.completedAt && <> · Completed {new Date(inv.completedAt).toLocaleString()}</>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
