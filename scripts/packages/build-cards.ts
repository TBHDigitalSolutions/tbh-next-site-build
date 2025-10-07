// scripts/packages/build-cards.ts
import path from "node:path";
import fs from "node:fs/promises";
import glob from "fast-glob";
import fse from "fs-extra";
import { PKG_CFG } from "./packages.config.js";

type Card = {
  slug: string;
  title: string;
  summary?: string;
  badges?: string[];
  tags?: string[];
  image?: { src: string; alt: string };
  priceTeaser?: string;
};

function priceTeaser(p?: { one_time?: number|null; monthly?: number|null }) {
  if (!p) return;
  const one = p.one_time ?? 0, mon = p.monthly ?? 0;
  if (one > 0 && mon > 0) return `From $${one.toLocaleString()} + $${mon.toLocaleString()}/mo`;
  if (one > 0) return `From $${one.toLocaleString()}`;
  if (mon > 0) return `From $${mon.toLocaleString()}/mo`;
}

async function main() {
  const files = await glob(path.join(PKG_CFG.outPackages, "*.json"));
  const rows: Card[] = [];

  for (const f of files) {
    const data = JSON.parse(await fs.readFile(f, "utf8"));
    rows.push({
      slug: data.meta.slug,
      title: data.meta.name,
      summary: data.hero?.summary,
      badges: data.meta.badges,
      tags: data.meta.tags,
      image: data.hero?.image,
      priceTeaser: priceTeaser(data.details_and_trust?.pricing),
    });
  }

  await fse.ensureDir(path.dirname(PKG_CFG.outCards));
  await fs.writeFile(PKG_CFG.outCards, JSON.stringify(rows, null, 2), "utf8");
  console.log("✔ built", PKG_CFG.outCards);
}
main().catch(e => { console.error(e); process.exit(1); });
