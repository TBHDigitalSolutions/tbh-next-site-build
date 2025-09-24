// ============================================================================
// /src/data/packages/_types/generated.ts  (build outputs)
// ============================================================================
export type BundleContent = {
  slug: string;
  html?: string; // compiled MDX output (single safe injection point)
};

export type BundlesEnrichedJson = Array<
  // minimally require slug; additional resolved props are allowed
  { slug: string } & Partial<import("./domain").Bundle> & { content?: BundleContent }
>;

export type PackagesSearchRecord = {
  type: "bundle" | "package" | "addon";
  id: string; // bundle.slug | ServicePackage.id | AddOn.id
  name: string; // bundle.title | package.name | addon.name
  summary?: string;
  service?: ServiceSlug;
  tags?: string[];
  tier?: Tier;
  hasPrice?: boolean;
};

