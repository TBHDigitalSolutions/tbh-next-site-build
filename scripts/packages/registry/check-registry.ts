// scripts/packages/registry/check-registry.ts
/**
 * CI parity check: registry slugs exactly match generated slugs.
 */
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";

async function main() {
  const jsonFiles = await glob("src/data/packages/__generated__/packages/*.json");
  const generated = new Set(jsonFiles.map(f => f.split("/").at(-1)!.replace(".json","")));

  const regSlugs: string[] = [];
  const regRoots = await glob("src/packages/registry/*", { onlyDirectories: true });
  for (const serviceDir of regRoots) {
    const slugs = await glob(path.join(serviceDir, "*"), { onlyDirectories: true });
    regSlugs.push(...slugs.map(s => s.split("/").at(-1)!));
  }
  const reg = new Set(regSlugs);

  const missing = [...generated].filter(s => !reg.has(s));
  const extra   = [...reg].filter(s => !generated.has(s));

  if (missing.length || extra.length) {
    console.error("❌ Registry check failed");
    if (missing.length) console.error("Missing in registry:", missing.join(", "));
    if (extra.length)   console.error("Extra in registry:", extra.join(", "));
    process.exit(1);
  }
  console.log("✔ registry matches generated slugs");
}
main().catch(e => { console.error(e); process.exit(1); });
