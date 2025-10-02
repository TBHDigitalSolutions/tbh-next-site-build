// src/components/ui/molecules/FeatureList/index.ts
/**
 * Barrel re-export
 * -----------------------------------------------------------------------------
 * Enables ergonomic imports:
 *   import FeatureList from "@/components/ui/molecules/FeatureList/FeatureList";
 *   import { FeatureList } from "@/components/ui/molecules/FeatureList";
 * Also forwards the public types from the component module.
 */
export { default as FeatureList } from "./FeatureList";
export type {
  FeatureListProps,
  FeatureItem,
  FeatureState,
} from "./FeatureList";
