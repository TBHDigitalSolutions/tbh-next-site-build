// src/data/page/services-pages/schema.ts
import { z } from "zod";

export const Pillar = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  deliverables: z.array(z.string()).optional(),
  icon: z.string().optional(),
});

export const Capabilities = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  cards: z.array(z.object({ id: z.string(), title: z.string(), href: z.string() })).optional(),
  bullets: z.array(z.object({ label: z.string(), href: z.string().optional() })).optional(),
  pillars: z.array(Pillar).optional(),
});

export const Hero = z.object({
  content: z.object({
    eyebrow: z.string().optional(),
    title: z.string(),
    subtitle: z.string().optional(),
    primaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
    secondaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
  }),
});

export const PricingTier = z.object({
  id: z.string().optional(),
  name: z.string(),
  price: z.union([z.number(), z.string()]),
  period: z.string().optional(),
  features: z.array(z.string()).default([]),
  cta: z.object({ label: z.string(), href: z.string() }).optional(),
  popular: z.boolean().optional(),
});

export const Pricing = z.object({
  kind: z.enum(["tiers", "range", "custom"]).default("tiers"),
  title: z.string().optional(),
  tiers: z.array(PricingTier).optional(),
  comparison: z.any().optional(),
});

export const Workflow = z.object({
  variant: z.enum(["timeline", "flow", "diagram"]).default("timeline"),
  steps: z.array(z.object({ title: z.string(), description: z.string().optional(), duration: z.string().optional() })),
});

export const SubServiceMeta = z.object({
  scope: z.object({
    includes: z.array(z.string()).optional(),
    deliverables: z.array(z.string()).optional(),
    addons: z.array(z.string()).optional(),
  }).optional(),
  results: z.any().optional(),
  pricingCallout: z.object({
    variant: z.enum(["addon", "included", "custom"]).optional(),
    label: z.string().optional(),
    amount: z.string().optional(),
    note: z.string().optional(),
    cta: z.object({ label: z.string(), href: z.string() }).optional(),
  }).optional(),
});

export const PageData = z.object({
  kind: z.enum(["hub", "service", "subservice"]),
  slug: z.string(),
  title: z.string().optional(),
  hero: Hero,
  twoColVideo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    videoUrl: z.string().url().optional(),
    imageUrl: z.string().optional(),
    cta: z.object({ label: z.string(), href: z.string() }).optional(),
  }).optional(),
  capabilities: Capabilities.optional(),
  pricing: Pricing.optional(), // used only by L2 leaf
  cta: z.object({
    title: z.string().optional(),
    primaryCta: z.object({ label: z.string(), href: z.string() }).optional(),
  }).optional(),
}).and(SubServiceMeta.partial());
