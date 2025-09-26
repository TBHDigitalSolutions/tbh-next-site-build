import type { PackageBundle } from "../../_types/packages.types";

/**
 * B2B Enterprise Lead Pipeline
 * Components: Enterprise channel optimization + advanced scoring/routing + multi-touch nurturing.
 * Recommends ABM + Advanced Attribution as add-ons.
 */
const bundle: PackageBundle & { addOnRecommendations?: string[] } = {
  id: "bundle-leadgen-b2b-enterprise",
  name: "B2B Enterprise Lead Pipeline",
  components: [
    "leadgen-channel-enterprise",
    "leadgen-scoring-enterprise",
    "leadgen-routing-enterprise",
    "leadgen-nurture-enterprise",
  ],
  // Explicit add-on recommendations (IDs from /add-ons/lead-generation)
  addOnRecommendations: ["leadgen-abm", "leadgen-advanced-attribution"],
  price: { oneTime: 35000, monthly: 28500, currency: "USD" },
};

export default bundle;
