// scripts/packages/validate-package-data.ts
/**
 * Validates all generated per-slug JSON files with Zod (runtime contract).
 */
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
// Path alias '@/*' should resolve via tsconfig
import { PackageSchema } from "@/packages/lib/package-schema";

async function main() {
  const files = await glob("src/data/packages/__generated__/packages/*.json");
  let failing = false;

  for (const f of files) {
    try {
      const data = JSON.parse(await fs.readFile(f, "utf8"));
      PackageSchema.parse(data);
      console.log("✔ validated", path.basename(f));
    } catch (e: any) {
      console.error("❌ schema validation failed for", f);
      console.error(e?.issues ?? e);
      failing = true;
    }
  }
  if (failing) process.exit(1);
}
main().catch(e => { console.error(e); process.exit(1); });
