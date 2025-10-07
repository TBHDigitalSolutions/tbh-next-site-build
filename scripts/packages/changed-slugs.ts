// scripts/packages/changed-slugs.ts
/**
 * Print slugs that changed vs. main, to speed partial builds.
 * Usage: node/tsx scripts/packages/changed-slugs.ts | xargs -I{} npm run data:build -- --slug {}
 */
import { execSync } from "node:child_process";

function main() {
  const diff = execSync("git diff --name-only origin/main...HEAD", { stdio: ["ignore","pipe","ignore"] }).toString();
  const lines = diff.split("\n").filter(Boolean);
  const slugs = new Set<string>();
  for (const l of lines) {
    const m = l.match(/content\/packages\/catalog\/([^/]+)\/([^/]+)\/public\.mdx$/);
    if (m) slugs.add(m[2]);
  }
  process.stdout.write(Array.from(slugs).join("\n"));
}
main();
