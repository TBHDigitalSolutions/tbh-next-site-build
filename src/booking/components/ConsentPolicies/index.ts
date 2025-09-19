// src/booking/components/ConsentPolicies/index.ts
// Barrel export for ConsentPolicies component

export { default as ConsentPolicies } from "./ConsentPolicies";
export type * from "./ConsentPolicies.types";

// Re-export commonly used types for convenience
export type {
  ConsentPoliciesProps,
  ConsentItem,
  ConsentState,
  ConsentStatus,
  ConsentType,
  PolicyType,
  PolicyDocument,
  ConsentValidation,
  ConsentAnalytics,
  ConsentPreferences,
} from "./ConsentPolicies.types";