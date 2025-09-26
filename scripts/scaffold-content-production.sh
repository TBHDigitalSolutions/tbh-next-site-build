#!/usr/bin/env bash
# scripts/scaffold-content-production.sh
# Scaffolds Content Production package folders and minimal TS files.
# Usage:
#   bash scripts/scaffold-content-production.sh
#   bash scripts/scaffold-content-production.sh --force   # overwrite existing files
#   bash scripts/scaffold-content-production.sh --service-key content-production
#
set -euo pipefail

# ---- Config ----
ROOT="src/data/packages/content-production"
SERVICE_KEY="content"    # logical service key stored on each package object
FORCE="false"

# Parse flags
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE="true"; shift ;;
    --service-key) SERVICE_KEY="${2:-content}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Package IDs (slugs). Edit to match your catalog.
IDS=(
  "content-design-essential"
  "content-design-professional"
  "content-design-enterprise"
  "content-photo-product-starter"
  "content-photo-corporate"
  "content-photo-event"
  "content-video-social-pack"
  "content-video-promotional"
  "content-video-training-system"
  "content-copy-essential"
  "content-copy-professional"
  "content-copy-enterprise"
  "content-editorial-starter"
  "content-editorial-advanced"
  "content-editorial-enterprise"
  "content-publish-basic-cms"
  "content-publish-professional"
  "content-publish-enterprise"
  "content-packaging-starter"
  "content-packaging-complete"
  "content-packaging-digital"
  "content-sales-essential"
  "content-sales-professional"
  "content-sales-enterprise"
  "content-brand-essentials"
  "content-brand-complete-system"
  "content-presentation-starter"
  "content-presentation-sales-system"
  "content-presentation-executive"
)

# Utility: safe write (skip unless --force)
write_file () {
  local path="$1"
  local content="$2"
  if [[ -f "$path" && "$FORCE" != "true" ]]; then
    echo "⚠️  Exists, skipping: $path"
    return 0
  fi
  mkdir -p "$(dirname "$path")"
  printf "%s" "$content" > "$path"
  echo "✅ Wrote: $path"
}

# Utility: derive a readable name from an id (best-effort title case)
# e.g., content-copy-professional -> "Content Copy Professional"
title_from_id () {
  local id="$1"
  local s="${id#content-}"     # strip leading "content-"
  s="${s//-/ }"                # hyphens -> spaces
  # Capitalize words:
  IFS=' ' read -r -a parts <<< "$s"
  local out=""
  for w in "${parts[@]}"; do
    out+=" ${w^}"
  done
  echo "${out# }"
}

# Template generators ----------------------------------------------------------

tpl_bundle_ts () {
  local id="$1"
  local name
  name="$(title_from_id "$id")"
  cat <<EOF
import type { ServicePackage } from "../_types/packages.types";

export const bundle: ServicePackage = {
  id: "${id}",
  service: "${SERVICE_KEY}",
  name: "${name}",
  summary: "",
  // e.g. tier: "Essential" | "Professional" | "Enterprise",
  price: { currency: "USD" },
};
EOF
}

tpl_includes_ts () {
  cat <<'EOF'
export const includes = [
  // "Item A",
  // "Item B",
];
EOF
}

tpl_outcomes_ts () {
  cat <<'EOF'
export const outcomes = [
  // "Outcome A",
  // "Outcome B",
];
EOF
}

tpl_faqs_ts () {
  cat <<'EOF'
export const faqs = [
  // { q: "Question?", a: "Answer." },
];
EOF
}

tpl_narrative_ts () {
  cat <<'EOF'
export const narrative = `
  <h2></h2>
  <p></p>
`;
EOF
}

tpl_index_ts () {
  cat <<'EOF'
import { bundle } from "./bundle";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import { faqs } from "./faqs";
import { narrative } from "./narrative";

export default { ...bundle, includes, outcomes, faqs, narrative };
EOF
}

# Generate per-package folders/files ------------------------------------------
echo "Scaffolding packages under: $ROOT"
for id in "${IDS[@]}"; do
  dir="$ROOT/$id"
  mkdir -p "$dir"

  write_file "$dir/bundle.ts"    "$(tpl_bundle_ts "$id")"
  write_file "$dir/includes.ts"  "$(tpl_includes_ts)"
  write_file "$dir/outcomes.ts"  "$(tpl_outcomes_ts)"
  write_file "$dir/faqs.ts"      "$(tpl_faqs_ts)"
  write_file "$dir/narrative.ts" "$(tpl_narrative_ts)"
  write_file "$dir/index.ts"     "$(tpl_index_ts)"
done

# Service-level aggregator: content-production/index.ts ------------------------
# Variable-safe names by replacing "-" with "_"
IMPORTS=""
ARRAY_ITEMS=""
for id in "${IDS[@]}"; do
  var="${id//-/_}"
  IMPORTS+="import ${var} from \"./${id}\";\n"
  ARRAY_ITEMS+="  ${var},\n"
done

AGG_TS="import type { ServicePackage } from \"../_types/packages.types\";\n${IMPORTS}\nexport const CONTENT_PACKAGES: ServicePackage[] = [\n${ARRAY_ITEMS}];\n\nexport const CONTENT_BY_ID = new Map(CONTENT_PACKAGES.map(p => [p.id, p]));\nexport const getContentPackage = (id: string) => CONTENT_BY_ID.get(id);\n"

write_file "$ROOT/index.ts" "$AGG_TS"

echo "Done."
