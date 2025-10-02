// src/packages/lib/registry/schemas.ts
import { z } from "zod";

/** Money SSOT */
export const MoneySchema = z.object({
  monthly: z.number().positive().finite().optional(),
  oneTime: z.number().positive().finite().optional(),
  currency: z.literal("USD").default("USD"),
}).refine(p => p.monthly != null || p.oneTime != null, { message: "price must include monthly or oneTime" });

/** Frontmatter for public.mdx */
export const PackageMarkdownSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  service: z.string().min(1),               // must match taxonomy key
  subservice: z.string().min(1),            // must match L2 slug for that service
  subsubservice: z.string().optional(),     // optional L3 label

  tags: z.array(z.string()).default([]),
  badges: z.array(z.string()).default([]),
  tier: z.string().optional(),
  image: z.object({ src: z.string(), alt: z.string() }).optional(),

  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).default({}),

  summary: z.string().min(1),
  description: z.string().optional(),       // hero long copy

  painPoints: z.array(z.string()).optional(),
  purposeHtml: z.string().optional(),
  icp: z.string().optional(),
  outcomes: z.array(z.string()).min(1),

  features: z.array(z.string()).default([]),
  includesGroups: z.array(z.object({
    title: z.string().min(1),
    items: z.array(z.string().min(1)).min(1),
  })).optional(),
  includesTable: z.any().optional(),        // fallback shape allowed if groups absent
  deliverables: z.array(z.string()).optional(),

  price: MoneySchema,
  priceBand: z.object({
    tagline: z.string().optional(),
    baseNote: z.enum(["proposal", "final"]).optional(),
    finePrint: z.string().optional(),
  }).optional(),

  extras: z.object({
    timeline: z.object({
      setup: z.string().optional(),
      launch: z.string().optional(),
      ongoing: z.string().optional(),
    }).optional(),
    requirements: z.array(z.string()).optional(),
    ethics: z.array(z.string()).optional(),
  }).optional(),

  notes: z.string().optional(),
  faqs: z.array(z.object({
    q: z.string().optional(),
    a: z.string().optional(),
    question: z.string().optional(),
    answer: z.string().optional(),
  })).optional(),

  crossSell: z.array(z.string()).optional(),
  addOns: z.array(z.string()).optional(),

  authoredAt: z.string().optional(),
  templateVersion: z.string().optional(),
}).superRefine((pkg, ctx) => {
  if (!pkg.includesGroups && !pkg.includesTable) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide includesGroups or includesTable" });
  }
});

/** internal.json */
export const InternalPricingSchema = z.object({
  tiers: z.array(z.object({
    name: z.string(),
    price: MoneySchema.partial().extend({ currency: z.literal("USD").default("USD") }),
  })).default([]),
  opsNotes: z.string().optional(),
  salesNotes: z.string().optional(),
  estimation: z.object({
    hours: z.number().optional(),
    roles: z.array(z.string()).optional(),
  }).optional(),
}).default({});