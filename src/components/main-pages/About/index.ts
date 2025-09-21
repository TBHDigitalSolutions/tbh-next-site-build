// src/components/main-pages/About/index.ts
// Barrel for About page components. Keeps import paths terse and consistent.

/** Hero */
export { default as AboutHero } from "./AboutHero";
export type { AboutHeroProps } from "./AboutHero";

/** Capabilities grid */
export { default as CapabilitiesGrid } from "./CapabilitiesGrid";
export type { CapabilitiesGridProps, Capability } from "./CapabilitiesGrid";

/** Company story (wrapper + content) */
export { default as CompanyStory } from "./CompanyStory";
export { default as CompanyStoryContent } from "./CompanyStory/CompanyStoryContent";

/** Core values */
export { default as CoreValues } from "./CoreValues";
export type { CoreValuesProps } from "./CoreValues";

/** Join-Us CTA */
export { default as JoinUsCTA } from "./JoinUsCTA";
export type { JoinUsCTAProps } from "./JoinUsCTA";

/** Team grid */
export { default as TeamGrid } from "./TeamGrid";
export type { TeamGridProps } from "./TeamGrid";
