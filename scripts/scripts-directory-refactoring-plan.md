
## How to add a new script (step-by-step)

1. **Create file** under the right domain folder, e.g.:

```
/scripts/content/validate-links.ts
```

2. **Use the shared logger & flags**:

```ts
#!/usr/bin/env tsx
import { logger, parseFlags } from "../_shared/logger"; // or your flags helper

async function main() {
  const flags = parseFlags(process.argv.slice(2)); // { verbose, quiet, json, dryRun, ... }
  try {
    // ... do work
    logger.info("OK");      // or logger.debug(...) if flags.verbose
    process.exit(0);
  } catch (err) {
    logger.error(String(err));
    process.exit(2);
  }
}

main().catch((e) => { logger.error(String(e)); process.exit(2); });
```

3. **Import types/schemas** from `src/**` rather than duplicating them:

```ts
import { servicesTree } from "@/data/taxonomy/servicesTree";
import type { ServiceNode } from "@/types/servicesTaxonomy.types";
```

4. **Wire it into `package.json`**:

```json
"validate:links": "tsx scripts/content/validate-links.ts"
```

5. **Optionally add to bundles**:

* **Quick local gate**:

  ```json
  "data:quick-check": "npm run validate:packages && npm run check:packages:featured && npm run validate:portfolio:quick && npm run health:portfolio:ping && npm run validate:taxonomy && npm run validate:services-pages && npm run validate:links"
  ```
* **CI gate**:

  ```json
  "data:ci": "npm run verify:public && npm run validate:packages && npm run check:packages:featured && npm run validate:portfolio:quick && npm run health:portfolio:ping && npm run validate:taxonomy && npm run validate:services-pages && npm run validate:links"
  ```

---

## Updating existing scripts (safely)

* **Add `--json` output** where missing (structured report used by CI or dashboards).
* **Normalize exit codes** (`0/1/2`) across every CLI.
* **Adopt shared helpers** from `_shared/` to remove duplicated logic.
* **Guard fixers/migrations**:

  * Always support `--dry-run`.
  * Print a clear **diff summary** (files added/changed/deleted).
  * Optionally write a `scripts/_backups/<name>-YYYYMMDD-HHmm/` snapshot.

---

## Suggested `package.json` additions (copy/paste)

Add only the ones you want now; the rest can come later.

```json
{
  "scripts": {
    "validate:links": "tsx scripts/content/validate-links.ts",
    "validate:assets": "tsx scripts/assets/validate-usage.ts",
    "taxonomy:export-slugs": "tsx scripts/taxonomy/export-slugs.ts",
    "scaffold:service-page": "tsx scripts/services/scaffold-service-page.ts",
    "portfolio:normalize-media": "tsx scripts/portfolio/normalize-media.ts",

    "data:quick-check": "npm run validate:packages && npm run check:packages:featured && npm run validate:portfolio:quick && npm run health:portfolio:ping && npm run validate:taxonomy && npm run validate:services-pages",
    "data:ci": "npm run verify:public && npm run validate:packages && npm run check:packages:featured && npm run validate:portfolio:quick && npm run health:portfolio:ping && npm run validate:taxonomy && npm run validate:services-pages"
  }
}
```

---

## Final notes

* Keep the **two JS tools** in `/tools` as-is (mirror/check for `/public`). They’re operationally simple and stable.
* All **data validators** and **fixers** live here in `/scripts` as **TypeScript** for type-safety and shared types across the app.
* Prefer **dry-run first**, then commit diff, then run the destructive version. Your future self will thank you.
