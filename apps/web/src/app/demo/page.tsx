"use client";

import React, { useState } from "react";
import { Play, AlertCircle, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Demo() {
  const [started, setStarted] = useState(false);

  const steps = [
    {
      number: 1,
      title: "Payment Exception Flagged",
      description: "Invoice from Acme Cloud Services exceeds contract ceiling by ₹292,000",
      detail: "₹842K vs ₹550K limit",
    },
    {
      number: 2,
      title: "Investigation Started",
      description: "TrueForge Controller Agent receives exception",
      detail: "Session initiated",
    },
    {
      number: 3,
      title: "Ledger Analysis",
      description: "Financial analysis reveals 67.4% variance from historical average",
      detail: "Statistical outlier detected",
    },
    {
      number: 4,
      title: "Counsel Analysis",
      description: "Contract ceiling violation confirmed - no amendment found",
      detail: "Contract compliance issue",
    },
    {
      number: 5,
      title: "Signal Verification",
      description: "Bank account changed 3 days ago - partial authorization verification",
      detail: "Contradictory evidence found",
    },
    {
      number: 6,
      title: "Approval Checkpoint",
      description: "Agent pauses - human approval required for verification action",
      detail: "Awaiting human decision",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-graphite/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-indigo transition-colors">
            BeforePay
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-indigo hover:text-indigo/80">
            Open Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Demo: Payment Investigation</h1>
            <p className="text-xl text-graphite-light mb-8">
              Watch BeforePay investigate the NovaStack payment exception in real-time
            </p>

            {!started && (
              <button
                onClick={() => setStarted(true)}
                className="button-primary text-lg px-8 py-3 inline-flex items-center gap-2"
              >
                <Play size={20} />
                Start Investigation
              </button>
            )}
          </motion.div>

          {/* Investigation Flow */}
          {started && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-white border-2 border-graphite/10 rounded-lg p-6 hover:border-indigo/30 transition-colors"
                >
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo text-white flex items-center justify-center font-bold">
                        {step.number}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className="w-0.5 h-16 bg-indigo/20 my-2"></div>
                      )}
                    </div>

                    <div className="flex-1 pt-1">
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-graphite-light mb-2">{step.description}</p>
                      <div className="inline-block px-3 py-1 bg-graphite-light/10 rounded text-xs font-medium text-graphite-light">
                        {step.detail}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: steps.length * 0.15 }}
                className="mt-8 text-center"
              >
                <div className="bg-indigo/10 border border-indigo/30 rounded-lg p-8 mb-6">
                  <AlertCircle className="inline-block text-indigo mb-3" size={32} />
                  <h3 className="text-xl font-bold mb-2">Awaiting Approval</h3>
                  <p className="text-graphite-light mb-6">
                    The agent has paused at an approval checkpoint. A human must authorize the next action.
                  </p>
                  <Link
                    href="/dashboard/investigation/inv_001"
                    className="button-primary inline-flex items-center gap-2"
                  >
                    <Check size={18} />
                    View Investigation & Approve
                  </Link>
                </div>

                <p className="text-sm text-graphite-light">
                  This demonstrates BeforePay's core principle: <strong>Money never moves without human approval</strong>
                </p>
              </motion.div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
