#!/usr/bin/env bash
# create-bundle-indexes.sh
# Creates index.ts scaffolds for bundle subfolders (non-destructive by default).
# Usage:
#   ./create-bundle-indexes.sh           # creates missing index.ts files
#   ./create-bundle-indexes.sh --force   # overwrite existing index.ts files

set -euo pipefail

FORCE=0
if [[ "${1:-}" == "--force" || "${1:-}" == "-f" ]]; then
  FORCE=1
fi

ROOT="src/data/packages/bundles"
DIRS=(
  "marketing-bundles"
  "seo-bundles"
  "video-production-bundles"
  "web-development-bundles"
)

make_file () {
  local file="$1"

  # Write a minimal, valid aggregator with typed export.
  # Adjust imports inside each folder later to pull in real bundles.
  cat > "$file" <<'TS'
import type { PackageBundle } from "../../_types/packages.types";

/**
 * Auto-generated aggregator.
 * Import your bundle files in this folder and include them in the array below.
 *
 * Example:
 *   import awareness from "./brand-awareness";
 *   const BUNDLES: PackageBundle[] = [awareness];
 */
const BUNDLES: PackageBundle[] = [
  // add your bundles here
];

export default BUNDLES;
TS
}

for d in "${DIRS[@]}"; do
  dirpath="${ROOT}/${d}"
  filepath="${dirpath}/index.ts"

  mkdir -p "$dirpath"

  if [[ -f "$filepath" && $FORCE -eq 0 ]]; then
    echo "⚠️  $filepath exists — skipped (use --force to overwrite)"
    continue
  fi

  make_file "$filepath"
  echo "✅ wrote $filepath"
done
