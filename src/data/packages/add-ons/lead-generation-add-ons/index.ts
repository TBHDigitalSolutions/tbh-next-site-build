// src/data/packages/add-ons/lead-generation-add-ons/index.ts

import type { AddOn } from "../../_types/packages.types";

// Add-ons in this folder
import leadgenLeadMagnet from "./leadgen-lead-magnet";
import leadgenWebinarSuccess from "./leadgen-webinar-success";
import leadgenAuditOptimization from "./leadgen-audit-optimization";
import leadgenAdvancedAttribution from "./leadgen-advanced-attribution";
import leadgenABM from "./leadgen-abm";
import leadgenInternational from "./leadgen-international";
import leadgenRapidLaunch from "./leadgen-accelerator-rapid-launch";

// Primary export: array (matches consumers that import default as AddOn[])
export const LEADGEN_ADDONS: AddOn[] = [
  leadgenLeadMagnet,
  leadgenWebinarSuccess,
  leadgenAuditOptimization,
  leadgenAdvancedAttribution,
  leadgenABM,
  leadgenInternational,
  leadgenRapidLaunch,
];

// Helpful by-id map (named export)
export const LEADGEN_ADDONS_BY_ID: Record<string, AddOn> = Object.fromEntries(
  LEADGEN_ADDONS.map((a) => [a.id, a]),
);

export default LEADGEN_ADDONS;

// Re-export type for convenience in nearby files
export type { AddOn } from "../../_types/packages.types";
