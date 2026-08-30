"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Eye,
  Lock,
  Link as LinkIcon,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function InvestigationDetail({
  params,
}: {
  params: { id: string };
}) {
  const [investigation, setInvestigation] = useState({
    id: params.id,
    caseNumber: "INV-48291",
    vendor: "Acme Cloud Services",
    invoice: "INV-48291",
    amount: 842000,
    contractCeiling: 550000,
    status: "awaiting_approval",
    severity: "high",
    startedAt: new Date(Date.now() - 5 * 60 * 1000),
    trueforgeSessionId: "sess_7f9a2b1c",
  });

  const [events, setEvents] = useState([
    {
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      agent: "Controller",
      status: "completed",
      message: "Investigation started",
      icon: Zap,
    },
    {
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      agent: "Ledger",
      status: "completed",
      message: "Financial analysis: Invoice is ₹292K above ceiling (+67.4%)",
      icon: CheckCircle,
    },
    {
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      agent: "Counsel",
      status: "completed",
      message: "Contract compliance check: VIOLATION",
      icon: CheckCircle,
    },
    {
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      agent: "Signal",
      status: "completed",
      message: "Bank change detected: 3 days ago (HDFC → ICICI)",
      icon: AlertCircle,
    },
    {
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      agent: "Controller",
      status: "pending",
      message: "🔒 Awaiting human approval for verification email",
      icon: Lock,
    },
  ]);

  const [approval, setApproval] = useState({
    pending: true,
    action: "send_vendor_email",
    recipient: "jane.doe@acmecloud.com",
    subject: "Payment Exception Verification",
    risk: "low",
  });

  const evidenceItems = [
    {
      type: "Contract",
      claim: "Monthly ceiling: ₹550,000",
      confidence: 0.99,
      status: "supported",
    },
    {
      type: "Invoice",
      claim: "Current amount: ₹842,000",
      confidence: 1.0,
      status: "supported",
    },
    {
      type: "Financial",
      claim: "Exceeds ceiling by ₹292,000 (+67.4%)",
      confidence: 0.98,
      status: "contradicted",
    },
    {
      type: "Bank",
      claim: "Account changed 3 days ago",
      confidence: 0.95,
      status: "contradicted",
    },
    {
      type: "Vendor",
      claim: "Bank change authorized by Jane Doe",
      confidence: 0.6,
      status: "unknown",
    },
  ];

  return (
    <div className="min-h-screen bg-graphite-light/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-graphite/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 hover:text-indigo">
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold">{investigation.caseNumber}</h1>
            <p className="text-sm text-graphite-light">
              {investigation.vendor} • {new Date(investigation.startedAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-graphite-light">Session</p>
            <p className="font-mono text-xs">{investigation.trueforgeSessionId}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-6">
          {/* Left: Timeline */}
          <div className="col-span-2 space-y-6">
            {/* Investigation Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg border border-graphite/10 p-6"
            >
              <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b border-graphite/10">
                <div>
                  <p className="text-sm text-graphite-light mb-1">Invoice Amount</p>
                  <p className="text-2xl font-bold">₹{investigation.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-graphite-light mb-1">Contract Ceiling</p>
                  <p className="text-2xl font-bold">
                    ₹{investigation.contractCeiling.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-graphite-light mb-1">Variance</p>
                  <p className="text-2xl font-bold text-red-600">
                    +₹{(investigation.amount - investigation.contractCeiling).toLocaleString()}{" "}
                  </p>
                  <p className="text-sm text-red-600">
                    (+{(((investigation.amount - investigation.contractCeiling) / investigation.contractCeiling) * 100).toFixed(1)}%)
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Key Findings</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>Invoice exceeds contract ceiling by ₹292,000</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="text-amber flex-shrink-0 mt-0.5" size={16} />
                    <span>Bank account changed 3 days ago (HDFC → ICICI)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="text-amber flex-shrink-0 mt-0.5" size={16} />
                    <span>No matching PO covers the invoice amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="text-emerald flex-shrink-0 mt-0.5" size={16} />
                    <span>Vendor verified and known (Acme Cloud Services)</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Agent Activity Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg border border-graphite/10 p-6"
            >
              <h2 className="text-lg font-bold mb-6">Agent Activity</h2>

              <div className="space-y-4">
                {events.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4 pb-4 border-b border-graphite/5 last:border-0 last:pb-0"
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.status === "pending"
                              ? "bg-amber/10 animate-pulse"
                              : "bg-emerald/10"
                          }`}
                        >
                          <Icon
                            size={18}
                            className={
                              event.status === "pending"
                                ? "text-amber"
                                : "text-emerald"
                            }
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm">{event.agent}</p>
                          <p className="text-xs text-graphite-light">
                            {event.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm text-graphite-light">{event.message}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Evidence Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg border border-graphite/10 p-6"
            >
              <h2 className="text-lg font-bold mb-6">Evidence Summary</h2>

              <div className="space-y-3">
                {evidenceItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-graphite-light/5 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-1 bg-white rounded border border-graphite/10">
                          {item.type}
                        </span>
                        {item.status === "supported" && (
                          <CheckCircle size={16} className="text-emerald" />
                        )}
                        {item.status === "contradicted" && (
                          <AlertCircle size={16} className="text-red-600" />
                        )}
                        {item.status === "unknown" && (
                          <AlertCircle size={16} className="text-amber" />
                        )}
                      </div>
                      <p className="text-sm">{item.claim}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-graphite-light">Confidence</p>
                      <p className="font-semibold">
                        {(item.confidence * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Approval Gate / Decision */}
          <div className="space-y-6">
            {approval.pending && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border-2 border-amber/30 p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-4 text-amber">
                  <Lock size={20} />
                  <h2 className="font-bold">APPROVAL REQUIRED</h2>
                </div>

                <div className="space-y-4 pb-4 border-b border-graphite/10">
                  <div>
                    <p className="text-xs text-graphite-light mb-1">ACTION</p>
                    <p className="font-semibold">Send Verification Email</p>
                  </div>

                  <div>
                    <p className="text-xs text-graphite-light mb-1">RECIPIENT</p>
                    <p className="font-mono text-sm">{approval.recipient}</p>
                  </div>

                  <div>
                    <p className="text-xs text-graphite-light mb-1">WHY</p>
                    <p className="text-sm">
                      Verify bank account change authorization from known contact
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-graphite-light mb-1">RISK LEVEL</p>
                    <span className="px-2 py-1 bg-emerald/10 text-emerald text-xs font-medium rounded">
                      {approval.risk.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button className="w-full py-2 px-4 bg-emerald text-white font-medium rounded-lg hover:bg-emerald/90 transition-colors">
                    Approve & Send
                  </button>
                  <button className="w-full py-2 px-4 border border-graphite/20 text-graphite font-medium rounded-lg hover:bg-graphite-light/5 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            {/* Decision Card Template */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg border border-graphite/10 p-6"
            >
              <h3 className="font-bold mb-4">Recommendation</h3>
              <div className="text-center mb-4 p-4 bg-amber/10 rounded-lg border border-amber/20">
                <p className="text-xs text-graphite-light mb-1">CURRENT STATUS</p>
                <p className="text-2xl font-bold text-amber">🟡 HOLD</p>
                <p className="text-xs text-graphite-light mt-1">Awaiting verification</p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-semibold">Evidence Summary</p>
                <ul className="space-y-1 text-graphite-light text-xs">
                  <li>• 2 high-confidence contradictions</li>
                  <li>• 1 critical evidence gap (bank authorization)</li>
                  <li>• Awaiting vendor response</li>
                </ul>
              </div>
            </motion.div>

            {/* TrueForge Badge */}
            <div className="bg-graphite-light/10 border border-graphite/20 rounded-lg p-4 text-center">
              <p className="text-xs text-graphite-light mb-2">Powered by</p>
              <p className="font-semibold text-sm">TrueForge Agent Runtime</p>
              <p className="text-xs text-graphite-light mt-1">Real-time autonomous investigation</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
