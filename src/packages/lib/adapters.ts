// src/packages/lib/adapters.ts
/**
 * Adapters (shim)
 * -----------------------------------------------------------------------------
 * Central place to map domain entities into UI-friendly props.
 * Satisfies imports like "@/packages/lib/adapters" used by templates.
 */

import type { Money } from "@/packages/lib/package-types";

export type PackageCardProps = {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  tags?: string[];
  badge?: string;
  price?: Money;
  href?: string;
  variant?: "default" | "rail";
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

/**
 * Map a loosely-typed package/bundle into a UI card shape.
 * Avoids throwing on partial/legacy shapes.
 */
export function toPackageCard(input: any): PackageCardProps {
  const slug: string | undefined = input?.slug ?? input?.id ?? undefined;
  const name: string = input?.name ?? input?.title ?? slug ?? "Package";
  const description: string | undefined = input?.summary ?? input?.description ?? undefined;

  // Canonical Money (SSOT)
  const price: Money | undefined = input?.price;

  // Default href if you follow /packages/[slug]
  const href = typeof slug === "string" && slug.length > 0 ? `/packages/${slug}` : undefined;

  const tags: string[] | undefined =
    Array.isArray(input?.tags) ? input.tags :
    Array.isArray(input?.services) ? input.services :
    undefined;

  return {
    id: slug ?? name.toLowerCase().replace(/\s+/g, "-"),
    slug,
    name,
    description,
    tags,
    price,
    href,
    variant: "default",
  };
}
