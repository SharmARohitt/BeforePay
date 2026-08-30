/**
 * BeforePay Agent Module
 * Core orchestration and evidence analysis for TrueForge integration
 */

export * from "./controller.js";
export * from "./evidence-engine.js";
export * from "./approval.js";

// Re-export types
export type {
  Investigation,
  InvestigationStatus,
  InvestigationRecommendation,
  Evidence,
  Approval,
  DecisionPackage,
} from "@beforepay/types";
