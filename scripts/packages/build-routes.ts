//  scripts/packages/build-routes.ts
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
import fse from "fs-extra";
import { PKG_CFG } from "./packages.config.js";

async function main() {
  const files = await glob(path.join(PKG_CFG.outPackages, "*.json"));
  const routes: Record<string, string> = {};
  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    routes[data.meta.slug] = PKG_CFG.toRegistryImport(data.meta.service, data.meta.slug);
  }
  await fse.ensureDir(path.dirname(PKG_CFG.outRoutes));
  await fs.writeFile(PKG_CFG.outRoutes, JSON.stringify(routes, null, 2), "utf8");
  console.log("✔ built", PKG_CFG.outRoutes);
}
main().catch(e => { console.error(e); process.exit(1); });
