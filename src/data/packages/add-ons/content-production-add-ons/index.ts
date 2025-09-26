import type { AddOn } from "../../_types/packages.types";

// Individual add-ons
import contentBrandIdentityKit from "./content-brand-identity-kit";
import contentAuditStrategy from "./content-audit-strategy";
import contentProfessionalPhotography from "./content-professional-photography";
import contentVideoProduction from "./content-video-production";

import contentSocialStarter from "./content-social-starter";
import contentSocialGrowth from "./content-social-growth";
import contentSocialAuthority from "./content-social-authority";

import contentPodcastStarter from "./content-podcast-starter";
import contentPodcastGrowth from "./content-podcast-growth";
import contentAudioBrandedSeries from "./content-audio-branded-series";

import contentAcceleratorRapid from "./content-accelerator-rapid";
import contentAcceleratorRepurpose from "./content-accelerator-repurpose";
import contentAcceleratorBrandCompliance from "./content-accelerator-brand-compliance";

// Array (ordered) if you want to iterate in UIs
export const CONTENT_ADDONS_LIST: AddOn[] = [
  contentBrandIdentityKit,
  contentAuditStrategy,
  contentProfessionalPhotography,
  contentVideoProduction,
  contentSocialStarter,
  contentSocialGrowth,
  contentSocialAuthority,
  contentPodcastStarter,
  contentPodcastGrowth,
  contentAudioBrandedSeries,
  contentAcceleratorRapid,
  contentAcceleratorRepurpose,
  contentAcceleratorBrandCompliance,
];

// ID → AddOn map
export const CONTENT_ADDONS: Record<string, AddOn> = Object.fromEntries(
  CONTENT_ADDONS_LIST.map(a => [a.id, a])
);

// Default export for convenience
export default CONTENT_ADDONS;

export type { AddOn } from "../../_types/packages.types";