// documents/domains/packages/scripts/check-docs.ts
// Node 20+, ESM. Run with: npx tsx documents/domains/packages/scripts/check-docs.ts
import fsp from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "documents/domains/packages");

const ALLOWED_QUALIFIERS = new Set([
  "Plan",
  "Playbook",
  "Checklist",
  "Standard",
  "Spec",
  "Guide",
  "Readme",     // allow "Readme" for README.md mapping
  "README"      // tolerate uppercase in headers
]);

const REQUIRED_KEYS = [
  "Official Title",
  "Domain",
  "File Name",
  "Main Part",
  "Qualifier",
  "Date",
] as const;

type Problem = { file: string; kind: "error" | "warn"; message: string };

function isMarkdown(file: string) {
  return file.toLowerCase().endsWith(".md");
}

function parseHeader(md: string) {
  const grab = (label: string) => {
    const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`);
    return md.match(re)?.[1]?.trim();
  };
  const exists = (label: string) => new RegExp(`\\*\\*${label}:\\*\\*`).test(md);
  return {
    officialTitle: grab("Official Title"),
    domain: grab("Domain"),
    fileNameDecl: grab("File Name"),
    mainPart: grab("Main Part"),
    qualifier: grab("Qualifier"),
    date: grab("Date"),
    hasSpotlight: exists("Spotlight Comments"),
    hasSummary: exists("Summary"),
  };
}

function checkNamePattern(file: string, qualifier?: string, date?: string): boolean {
  if (file === "README.md") return true;
  // pattern: <kebab-main>_<Qualifier>_<YYYY-MM-DD|Evergreen>.md
  const m = file.match(/^(.+)_([A-Za-z]+)_(\d{4}-\d{2}-\d{2}|Evergreen)\.md$/);
  if (!m) return false;
  if (!qualifier || !date) return true;
  const [, , q, d] = m;
  return q === qualifier || q.toLowerCase() === qualifier.toLowerCase()
    ? d === date
    : true; // if header qualifier differs in case, don’t hard-fail here (we check qualifier separately)
}

async function walk(dir: string, acc: string[] = []) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === "_generated") continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) await walk(abs, acc);
    else if (e.isFile() && isMarkdown(e.name)) acc.push(abs);
  }
  return acc;
}

async function main() {
  const problems: Problem[] = [];
  const files = await walk(ROOT, []);

  for (const abs of files) {
    const rel = path.relative(ROOT, abs);
    const text = await fsp.readFile(abs, "utf8");
    const header = parseHeader(text);

    // 1) Required keys present
    for (const key of REQUIRED_KEYS) {
      const present = new RegExp(`\\*\\*${key}:\\*\\*`).test(text);
      if (!present) problems.push({ file: rel, kind: "error", message: `Missing header field: "${key}"` });
    }

    // Skip further checks for README.md header mismatches (we still want headers if present)
    const fileName = path.basename(abs);

    // 2) Domain is 'packages'
    if (header.domain && header.domain.toLowerCase() !== "packages") {
      problems.push({ file: rel, kind: "error", message: `Domain must be "packages" (got "${header.domain}")` });
    }

    // 3) File Name header matches actual
    if (header.fileNameDecl && header.fileNameDecl !== fileName) {
      problems.push({ file: rel, kind: "error", message: `Header "File Name" (${header.fileNameDecl}) does not match actual (${fileName})` });
    }

    // 4) Qualifier allowed
    if (header.qualifier && !ALLOWED_QUALIFIERS.has(header.qualifier)) {
      problems.push({ file: rel, kind: "error", message: `Qualifier "${header.qualifier}" not allowed` });
    }

    // 5) Name pattern
    if (!checkNamePattern(fileName, header.qualifier, header.date)) {
      problems.push({
        file: rel,
        kind: "error",
        message: `File name should match "<kebab>_<Qualifier>_<YYYY-MM-DD|Evergreen>.md" (got "${fileName}")`,
      });
    }

    // 6) Spotlight & Summary soft checks
    if (!header.hasSpotlight) {
      problems.push({ file: rel, kind: "warn", message: `Missing "Spotlight Comments" section` });
    }
    if (!header.hasSummary) {
      problems.push({ file: rel, kind: "warn", message: `Missing "Summary" section` });
    }
  }

  // Report
  const errs = problems.filter((p) => p.kind === "error");
  const warns = problems.filter((p) => p.kind === "warn");

  if (errs.length) {
    console.error("✖ Doc check failed with errors:\n");
    for (const p of errs) console.error(`  - [ERROR] ${p.file}: ${p.message}`);
  }
  if (warns.length) {
    console.warn("\n⚠ Warnings:\n");
    for (const p of warns) console.warn(`  - [WARN]  ${p.file}: ${p.message}`);
  }

  if (errs.length) process.exit(1);
  console.log("\n✓ Docs check passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
