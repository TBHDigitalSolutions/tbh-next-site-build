// scripts/packages/registry/sync-registry.ts
/**
 * Ensure base.ts exists (always refreshed) & cards.ts exists (if missing).
 */
import path from "node:path";
import fs from "node:fs/promises";
import fse from "fs-extra";
import glob from "fast-glob";

async function main() {
  const files = await glob("src/data/packages/__generated__/packages/*.json");
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    const { service, slug } = data.meta;
    const dir = path.join("src/packages/registry", service, slug);
    await fse.ensureDir(dir);

    const baseContent =
`import json from "@/data/packages/__generated__/packages/${slug}.json";
import { PackageSchema } from "@/packages/lib/package-schema";
const base = PackageSchema.parse(json);
export default base;
`;

    await fs.writeFile(path.join(dir, "base.ts"), baseContent, "utf8");

    const cardsPath = path.join(dir, "cards.ts");
    const hasCards = await fse.pathExists(cardsPath);
    if (!hasCards) {
      const cardsContent =
`import base from "./base";
const card = {
  slug: base.meta.slug,
  title: base.meta.name,
  summary: base.hero?.summary,
  badges: base.meta.badges,
  tags: base.meta.tags,
  image: base.hero?.image,
} as const;
export default card;
`;
      await fs.writeFile(cardsPath, cardsContent, "utf8");
    }

    console.log("✔ synced", dir);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
