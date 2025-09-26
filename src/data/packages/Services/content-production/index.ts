// src/data/packages/Services/content-production/index.ts
// Aggregates all Content Production service packages into a single list.
// Each leaf folder default-exports a `ServicePackage`. This module composes
// them, provides quick lookups, and exports a default array for the SSOT façade.

import type { ServicePackage } from "../../_types/packages.types";

// --- Brand Collateral --------------------------------------------------------
import brandCompleteSystem from "./brand-collateral-services/content-brand-complete-system";
import brandEssentials from "./brand-collateral-services/content-brand-essentials";

// --- Content Management ------------------------------------------------------
import publishBasicCms from "./content-managment-packages/content-publish-basic-cms";
import publishEnterprise from "./content-managment-packages/content-publish-enterprise";
import publishProfessional from "./content-managment-packages/content-publish-professional";

// --- Copywriting -------------------------------------------------------------
import copyEnterprise from "./copywriting-packages/content-copy-enterprise";
import copyEssential from "./copywriting-packages/content-copy-essential";
import copyProfessional from "./copywriting-packages/content-copy-professional";

// --- Editorial Strategy ------------------------------------------------------
import editorialAdvanced from "./editorial-strategy-packages/content-editorial-advanced";
import editorialEnterprise from "./editorial-strategy-packages/content-editorial-enterprise";
import editorialStarter from "./editorial-strategy-packages/content-editorial-starter";

// --- Packaging Design --------------------------------------------------------
import packagingComplete from "./packaging-design-services/content-packaging-complete";
import packagingDigital from "./packaging-design-services/content-packaging-digital";
import packagingStarter from "./packaging-design-services/content-packaging-starter";

// --- Photography -------------------------------------------------------------
import photoCorporate from "./photography-packages/content-photo-corporate";
import photoEvent from "./photography-packages/content-photo-event";
import photoProductStarter from "./photography-packages/content-photo-product-starter";

// --- Presentation Design -----------------------------------------------------
import presentationExecutive from "./presentation-design-services/content-presentation-executive";
import presentationSalesSystem from "./presentation-design-services/content-presentation-sales-system";
import presentationStarter from "./presentation-design-services/content-presentation-starter";

// --- Sales Collateral --------------------------------------------------------
import salesEnterprise from "./sales-collateral-packages/content-sales-enterprise";
import salesEssential from "./sales-collateral-packages/content-sales-essential";
import salesProfessional from "./sales-collateral-packages/content-sales-professional";

// --- Video Production --------------------------------------------------------
import videoPromotional from "./video-production-packages/content-video-promotional";
import videoSocialPack from "./video-production-packages/content-video-social-pack";
import videoTrainingSystem from "./video-production-packages/content-video-training-system";

// --- Visual Design -----------------------------------------------------------
import visualDesignEnterprise from "./visual-design-packages/content-design-enterprise";
import visualDesignEssential from "./visual-design-packages/content-design-essential";
import visualDesignProfessional from "./visual-design-packages/content-design-professional";

// --- Specialized Packs -------------------------------------------------------
import campaignSeasonal from "./specialized/content-campaign-seasonal";
import contentLocalization from "./specialized/content-localization";
import contentPackHealthcare from "./specialized/content-pack-healthcare";
import contentPackTechnology from "./specialized/content-pack-technology";

// Compose (order is presentation-friendly; feel free to reorder)
export const CONTENT_PACKAGES: ServicePackage[] = [
  // Brand Collateral
  brandCompleteSystem,
  brandEssentials,

  // Content Management
  publishBasicCms,
  publishProfessional,
  publishEnterprise,

  // Copywriting
  copyEssential,
  copyProfessional,
  copyEnterprise,

  // Editorial Strategy
  editorialStarter,
  editorialAdvanced,
  editorialEnterprise,

  // Packaging Design
  packagingStarter,
  packagingDigital,
  packagingComplete,

  // Photography
  photoProductStarter,
  photoEvent,
  photoCorporate,

  // Presentation Design
  presentationStarter,
  presentationSalesSystem,
  presentationExecutive,

  // Sales Collateral
  salesEssential,
  salesProfessional,
  salesEnterprise,

  // Video Production
  videoSocialPack,
  videoPromotional,
  videoTrainingSystem,

  // Visual Design
  visualDesignEssential,
  visualDesignProfessional,
  visualDesignEnterprise,

  // Specialized
  campaignSeasonal,
  contentLocalization,
  contentPackHealthcare,
  contentPackTechnology,
];

// Fast lookups
export const CONTENT_BY_ID: Record<string, ServicePackage> = Object.fromEntries(
  CONTENT_PACKAGES.map((p) => [p.id, p]),
);

export const getContentPackage = (id: string): ServicePackage | undefined =>
  CONTENT_BY_ID[id];

// Default export for façade consumption
export default CONTENT_PACKAGES;
