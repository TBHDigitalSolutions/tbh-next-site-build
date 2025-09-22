// documents/domains/packages/scripts/build-doc-index.ts
// Node 20+, ESM. Run with: npx tsx documents/domains/packages/scripts/build-doc-index.ts
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

type DocMeta = {
  file: string;
  relPath: string;
  title?: string;
  domain?: string;
  fileNameDecl?: string;
  mainPart?: string;
  qualifier?: string;
  date?: string;
  sizeBytes: number;
  mtimeIso: string;
};

type DirIndex = {
  dir: string;
  relDir: string;
  lastUpdated: string;
  docs: DocMeta[];
  subdirs: string[];
};

const ROOT = path.resolve(process.cwd(), "documents/domains/packages");

const REQUIRED_HEADER_KEYS = [
  "Official Title",
  "Domain",
  "File Name",
  "Main Part",
  "Qualifier",
  "Date",
  // Spotlight Comments & Summary are nice to have; we don't break index if missing
] as const;

function isMarkdown(file: string) {
  return file.toLowerCase().endsWith(".md");
}

function parseHeader(md: string) {
  // Expect the visible header block near the top like:
  // **Official Title:** ...
  const grab = (label: string) => {
    const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`);
    return md.match(re)?.[1]?.trim();
  };
  return {
    title: grab("Official Title"),
    domain: grab("Domain"),
    fileNameDecl: grab("File Name"),
    mainPart: grab("Main Part"),
    qualifier: grab("Qualifier"),
    date: grab("Date"),
  };
}

async function ensureGenerated(dir: string) {
  const gen = path.join(dir, "_generated");
  await fsp.mkdir(gen, { recursive: true });
  return gen;
}

async function listDir(dir: string) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  return entries.filter((e) => e.name !== "_generated"); // skip generated folders
}

async function buildIndexForDir(dir: string, root = ROOT): Promise<DirIndex> {
  const relDir = path.relative(root, dir) || ".";
  const entries = await listDir(dir);

  const docs: DocMeta[] = [];
  const subdirs: string[] = [];

  for (const e of entries) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) {
      subdirs.push(e.name);
      // descend (depth-first)
      await buildIndexForDir(abs, root);
    } else if (e.isFile() && isMarkdown(e.name)) {
      const relPath = path.relative(root, abs);
      const stat = await fsp.stat(abs);
      const text = await fsp.readFile(abs, "utf8");
      const meta = parseHeader(text);
      docs.push({
        file: e.name,
        relPath,
        title: meta.title,
        domain: meta.domain,
        fileNameDecl: meta.fileNameDecl,
        mainPart: meta.mainPart,
        qualifier: meta.qualifier,
        date: meta.date,
        sizeBytes: stat.size,
        mtimeIso: stat.mtime.toISOString(),
      });
    }
  }

  // write the index.json for this directory
  const outDir = await ensureGenerated(dir);
  const idx: DirIndex = {
    dir,
    relDir,
    lastUpdated: new Date().toISOString(),
    docs: docs.sort((a, b) => a.file.localeCompare(b.file)),
    subdirs: subdirs.sort(),
  };
  const outPath = path.join(outDir, "index.json");
  await fsp.writeFile(outPath, JSON.stringify(idx, null, 2) + "\n", "utf8");
  console.log(`• wrote ${path.relative(process.cwd(), outPath)}`);
  return idx;
}

async function main() {
  // Sanity
  try {
    await fsp.access(ROOT, fs.constants.R_OK);
  } catch {
    console.error(`✖ Root not found: ${ROOT}`);
    process.exit(1);
  }

  console.log(`Building doc indices under: ${path.relative(process.cwd(), ROOT)}`);
  await buildIndexForDir(ROOT, ROOT);
  console.log("✓ Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
