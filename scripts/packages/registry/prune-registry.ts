// scripts/packages/registry/prune-registry.ts
/**
 * Remove registry folders without a generated JSON counterpart.
 */
import path from "node:path";
import fs from "node:fs/promises";
import fse from "fs-extra";
import glob from "fast-glob";

async function main() {
  const jsonFiles = await glob("src/data/packages/__generated__/packages/*.json");
  const valid = new Set(jsonFiles.map(f => f.split("/").at(-1)!.replace(".json","")));

  const regRoots = await glob("src/packages/registry/*", { onlyDirectories: true });
  for (const serviceDir of regRoots) {
    const slugs = await glob(path.join(serviceDir, "*"), { onlyDirectories: true });
    for (const slugDir of slugs) {
      const slug = slugDir.split("/").at(-1)!;
      if (!valid.has(slug)) {
        await fse.remove(slugDir);
        console.log("🗑  pruned", slugDir);
      }
    }
  }
}
main().catch(e => { console.error(e); process.exit(1); });
