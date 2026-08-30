"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export default function Home() {
  return (
    <div className="container-app">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-graphite/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold">BeforePay</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="button-primary"
            >
              Open Investigation
              <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.div variants={fadeIn}>
              <h1 className="text-6xl font-bold mb-4">
                Investigate Before
                <br />
                <span className="text-indigo">The Money Moves</span>
              </h1>
              <p className="text-xl text-graphite-light max-w-2xl mx-auto">
                An autonomous payment exception investigation agent that gathers evidence,
                identifies contradictions, and produces evidence-backed decisions.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="flex gap-4 justify-center pt-4">
              <Link href="/demo" className="button-primary">
                Watch Investigation
              </Link>
              <Link href="/dashboard" className="button-secondary">
                Start Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-graphite-light/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg border border-graphite/10"
            >
              <Zap className="text-indigo mb-4" size={32} />
              <h3>Real-Time Investigation</h3>
              <p className="text-graphite-light mt-2">
                Autonomous agents investigate payment exceptions in real-time, gathering evidence across all systems.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg border border-graphite/10"
            >
              <AlertCircle className="text-amber mb-4" size={32} />
              <h3>Evidence-Based Decisions</h3>
              <p className="text-graphite-light mt-2">
                Every decision is backed by traceable evidence with clear contradictions and gaps identified.
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="bg-white p-8 rounded-lg border border-graphite/10"
            >
              <Shield className="text-emerald mb-4" size={32} />
              <h3>Human Control</h3>
              <p className="text-graphite-light mt-2">
                Critical actions require explicit human approval. No money moves without authorization.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-indigo/10 border border-indigo/20 rounded-xl p-12">
          <h2>Ready to Investigate?</h2>
          <p className="text-graphite-light mt-4 mb-8">
            BeforePay investigates payment exceptions with agent-driven evidence analysis.
          </p>
          <Link href="/dashboard" className="button-primary">
            Start Investigation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-graphite/10 py-8 px-6 text-center text-graphite-light">
        <p>Built for TrueForge Hackathon • Powered by TrueForge Agent Runtime</p>
      </footer>
    </div>
  );
}
