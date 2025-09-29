// src/packages/registry/lead-generation-packages/lead-routing-distribution/card.ts
// registry/<family>/<sku>/card.ts
import { buildDefaultCard, buildRailCard } from "@/packages/lib/registry/mappers";
import { base } from "./base";

export const <sku>Card = buildDefaultCard(base);
export const <sku>CardRail = buildRailCard(base);
