"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Zap, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/v1/investigations`)
      .then(r => r.json())
      .then(d => { if (d.data) setInvestigations(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">All Investigations</h1>
          <p className="text-sm text-white/35">Complete investigation history</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <RefreshCw size={20} className="text-white/20 animate-spin" />
        </div>
      ) : investigations.length === 0 ? (
        <div className="text-center py-20">
          <Zap size={24} className="text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No investigations yet.</p>
          <Link href="/dashboard" className="text-indigo-400 text-sm mt-2 inline-block hover:text-indigo-300">
            Go start one →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {investigations.map((inv, i) => (
            <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/dashboard/investigation/${inv.id}`}>
                <div className="p-4 rounded-xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14] hover:bg-white/[0.04] transition-all flex items-center gap-4 group">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    inv.status === "investigating" ? "bg-indigo-400 animate-pulse" :
                    inv.status === "awaiting_approval" ? "bg-amber-400 animate-pulse" :
                    inv.status === "completed" ? "bg-emerald-400" : "bg-white/20"
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-0.5">INV-{inv.id.slice(-6).toUpperCase()}</div>
                    <div className="text-xs text-white/30 font-mono">{inv.trueforgeSessionId || "—"} · {new Date(inv.startedAt).toLocaleString()}</div>
                  </div>
                  {inv.recommendation && (
                    <span className={`text-xs font-mono font-bold ${
                      inv.recommendation === "verified" ? "text-emerald-400" :
                      inv.recommendation === "hold" ? "text-amber-400" : "text-red-400"
                    }`}>{inv.recommendation.toUpperCase()}</span>
                  )}
                  <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
