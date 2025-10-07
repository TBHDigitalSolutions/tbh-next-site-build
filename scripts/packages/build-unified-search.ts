// scripts/packages/build-unified-search.ts
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
import fse from "fs-extra";
import { PKG_CFG } from "./packages.config.js";

type Doc = {
  id: string; slug: string; service?: string; name?: string;
  summary?: string; tags?: string[]; badges?: string[];
};
type Index = { vocab: Record<string, number[]>; docs: Doc[] };

function tokenize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/).filter(Boolean);
}

async function main() {
  const files = await glob(path.join(PKG_CFG.outPackages, "*.json"));
  const docs: Doc[] = [];
  const vocab: Record<string, number[]> = {};

  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    const d: Doc = {
      id: data.meta.id,
      slug: data.meta.slug,
      service: data.meta.service,
      name: data.meta.name,
      summary: data.hero?.summary,
      tags: data.meta.tags ?? [],
      badges: data.meta.badges ?? [],
    };
    const idx = docs.push(d) - 1;

    const bag: string[] = [
      data.meta.name,
      data.hero?.summary ?? "",
      ...(data.meta.tags ?? []),
      ...(data.meta.badges ?? []),
      ...(data.what_you_get?.features ?? []).map((x:any)=> typeof x==="string" ? x : x?.label).filter(Boolean),
      ...(data.what_you_get?.includes ?? []).flatMap((g:any)=> g.items).map((x:any)=> typeof x==="string" ? x : x?.label).filter(Boolean),
    ].filter(Boolean);

    for (const t of new Set(bag.flatMap(tokenize))) (vocab[t] ||= []).push(idx);
  }

  const outFile = path.join(PKG_CFG.outSearchDir, "unified.search.json");
  await fse.ensureDir(path.dirname(outFile));
  await fs.writeFile(outFile, JSON.stringify(<Index>{ vocab, docs }, null, 2), "utf8");
  console.log("✔ built", outFile);
}
main().catch(e => { console.error(e); process.exit(1); });
