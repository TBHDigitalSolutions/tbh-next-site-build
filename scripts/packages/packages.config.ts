// scripts/packages/packages.config.ts
export const PKG_CFG = {
  // Content
  contentGlob: "content/packages/catalog/**/public.mdx",

  // Outputs
  outRoot:      "src/data/packages/__generated__",
  outPackages:  "src/data/packages/__generated__/packages",
  outIndex:     "src/data/packages/__generated__/index.json",
  outRoutes:    "src/data/packages/__generated__/routes.json",
  outCards:     "src/data/packages/__generated__/cards.json",
  outHealth:    "src/data/packages/__generated__/health.json",
  outHashes:    "src/data/packages/__generated__/hashes.json",
  outSearchDir: "src/data/packages/__generated__/search",

  // Registry base path template (ESM import path used by app)
  toRegistryImport(service: string, slug: string) {
    return `@/packages/registry/${service}/${slug}/base`;
  },

  // Behavior toggles
  includeHashes: true,
  includeHealth: true,
} as const;