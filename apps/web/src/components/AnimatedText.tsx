"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  type?: "words" | "chars" | "lines";
}

export function SplitText({ text, className = "", delay = 0, stagger = 0.04, type = "words" }: AnimatedTextProps) {
  const units = type === "chars" ? text.split("") : text.split(" ");

  return (
    <span className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`} aria-label={text}>
      {units.map((unit, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + i * stagger,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block"
          aria-hidden="true"
        >
          {unit}{type === "words" ? "" : ""}
        </motion.span>
      ))}
    </span>
  );
}

export function BlurReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(12px)", y: 16 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ value, duration = 1.5, delay = 0, prefix = "", suffix = "" }: {
  value: number; duration?: number; delay?: number; prefix?: string; suffix?: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      {prefix}
      <motion.span
        initial={{ textContent: "0" } as any}
        animate={{ textContent: String(value) } as any}
        transition={{ duration, delay, ease: "easeOut" }}
      >
        {value}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

export function GlowText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`relative ${className}`}
      style={{
        textShadow: "0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.3)",
      }}
    >
      {children}
    </span>
  );
}
