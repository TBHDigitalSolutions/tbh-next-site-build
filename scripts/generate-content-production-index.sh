#!/usr/bin/env bash
# scripts/generate-content-production-index.sh
# Scans src/data/packages/content-production/** for leaf package folders
# (identified by presence of bundle.ts) and writes index.ts that imports all.

set -euo pipefail

ROOT="src/data/packages/content-production"
OUT="$ROOT/index.ts"
TYPE_IMPORT='import type { ServicePackage } from "../_types/packages.types";'

# 1) find all package dirs (have bundle.ts), sort for stable output
mapfile -t PKG_DIRS < <(find "$ROOT" -type f -name 'bundle.ts' -print0 | xargs -0 -n1 dirname | sort)

IMPORTS=""
ARRAY_ITEMS=""

for dir in "${PKG_DIRS[@]}"; do
  # Make path relative to ROOT (e.g., "visual-design-packages/content-design-essential")
  rel="${dir#"$ROOT/"}"
  # Create a variable name from path (replace non-alnum with _)
  var="$(echo "$rel" | sed 's/[^A-Za-z0-9]/_/g')"
  IMPORTS+="import ${var} from \"./${rel}\";\n"
  ARRAY_ITEMS+="  ${var},\n"
done

cat > "$OUT" <<EOF
${TYPE_IMPORT}
${IMPORTS}
export const CONTENT_PACKAGES: ServicePackage[] = [
${ARRAY_ITEMS}];

export const CONTENT_BY_ID = new Map(CONTENT_PACKAGES.map(p => [p.id, p]));
export const getContentPackage = (id: string) => CONTENT_BY_ID.get(id);
EOF

echo "✅ Wrote $OUT with ${#PKG_DIRS[@]} packages."
