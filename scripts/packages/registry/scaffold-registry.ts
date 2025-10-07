// scripts/packages/registry/scaffold-registry.ts
/**
 * Create a new registry stub folder for a given service/slug.
 * Usage: tsx scripts/packages/registry/scaffold-registry.ts --service seo --slug keyword-audits
 */
import path from "node:path";
import fs from "node:fs/promises";
import fse from "fs-extra";

const svcIdx = process.argv.indexOf("--service");
const slugIdx = process.argv.indexOf("--slug");
const service = svcIdx > -1 ? process.argv[svcIdx + 1] : undefined;
const slug    = slugIdx > -1 ? process.argv[slugIdx + 1] : undefined;

if (!service || !slug) {
  console.error('Usage: --service <service> --slug <slug>');
  process.exit(1);
}

async function main() {
  const dir = path.join("src/packages/registry", service, slug);
  await fse.ensureDir(dir);
  const base = `import json from "@/data/packages/__generated__/packages/${slug}.json";\nimport { PackageSchema } from "@/packages/lib/package-schema";\nexport default PackageSchema.parse(json);\n`;
  await fs.writeFile(path.join(dir, "base.ts"), base, "utf8");

  const cards = `import base from "./base";\nexport default {\n  slug: base.meta.slug,\n  title: base.meta.name,\n  summary: base.hero?.summary,\n  badges: base.meta.badges,\n  tags: base.meta.tags,\n  image: base.hero?.image,\n} as const;\n`;
  await fs.writeFile(path.join(dir, "cards.ts"), cards, "utf8");

  console.log("✔ scaffolded", dir);
}
main().catch(e => { console.error(e); process.exit(1); });
