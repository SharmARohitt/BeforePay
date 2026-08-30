"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Eye,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Dashboard() {
  const [investigations, setInvestigations] = useState([
    {
      id: "inv_001",
      caseNumber: "INV-48291",
      vendor: "Acme Cloud Services",
      invoice: "INV-48291",
      amount: "₹842,000",
      status: "investigating",
      severity: "high",
      startedAt: new Date(),
    },
  ]);

  const stats = [
    { label: "Exceptions", value: 12, icon: AlertCircle, color: "text-amber" },
    {
      label: "Investigating",
      value: 4,
      icon: Zap,
      color: "text-indigo",
    },
    {
      label: "Awaiting Approval",
      value: 2,
      icon: Clock,
      color: "text-amber",
    },
    { label: "Verified", value: 41, icon: CheckCircle, color: "text-emerald" },
    { label: "Blocked", value: 3, icon: Shield, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-graphite/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">BeforePay</h1>
            <p className="text-sm text-graphite-light">Payment Investigation Control Center</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald/10 rounded-full border border-emerald/20">
              <div className="w-2 h-2 bg-emerald rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald font-medium">Systems Operational</span>
            </div>
            <button className="p-2 hover:bg-graphite-light/10 rounded-lg">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        {/* Stats Grid */}
        <section className="max-w-7xl mx-auto px-6 mb-8">
          <div className="grid grid-cols-5 gap-4">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-graphite/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-graphite-light">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Active Investigations */}
        <section className="max-w-7xl mx-auto px-6">
          <h2 className="text-xl font-bold mb-4">Active Investigations</h2>

          <div className="space-y-3">
            {investigations.map((inv) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                className="bg-white border border-graphite/10 rounded-lg p-4 cursor-pointer hover:border-indigo/30 hover:shadow-sm transition-all"
              >
                <Link href={`/dashboard/investigation/${inv.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{inv.caseNumber}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            inv.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {inv.severity.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            inv.status === "investigating"
                              ? "bg-indigo/10 text-indigo"
                              : "bg-amber/10 text-amber"
                          }`}
                        >
                          {inv.status === "investigating"
                            ? "🔄 Investigating"
                            : "⏸ Awaiting Approval"}
                        </span>
                      </div>
                      <p className="text-sm text-graphite-light mb-2">
                        {inv.vendor} • {inv.invoice} • {inv.amount}
                      </p>
                      <div className="flex items-center gap-6 text-xs text-graphite-light">
                        <span>Started: {inv.startedAt.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <Eye className="text-indigo" size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-graphite/10 py-4 px-6 text-center text-sm text-graphite-light">
        <p>
          Powered by{" "}
          <span className="font-semibold">TrueForge Agent Runtime</span> •
          Built for autonomous payment investigation
        </p>
      </footer>
    </div>
  );
}
