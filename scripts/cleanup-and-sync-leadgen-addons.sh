#!/usr/bin/env bash
# scripts/cleanup-and-sync-leadgen-addons.sh
# - Remove mis-filed "bundle" add-ons
# - Ensure canonical LeadGen add-ons exist
# - Rebuild index.ts
# Usage:
#   bash scripts/cleanup-and-sync-leadgen-addons.sh
#   bash scripts/cleanup-and-sync-leadgen-addons.sh --force
#   bash scripts/cleanup-and-sync-leadgen-addons.sh --types "../../_types/packages.types"

set -euo pipefail

FORCE="false"
TYPE_IMPORT='../../_types/packages.types'  # path from add-ons/lead-generation/*.ts

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE="true"; shift ;;
    --types) TYPE_IMPORT="${2:-../../_types/packages.types}"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

ROOT="src/data/packages/add-ons/lead-generation"
mkdir -p "$ROOT"

# 0) Fix accidental nested folder (if it exists)
if [[ -d "$ROOT/lead-generation" ]]; then
  echo "🧹 Found nested $ROOT/lead-generation — flattening..."
  shopt -s nullglob
  for f in "$ROOT/lead-generation"/*.ts; do
    mv -f "$f" "$ROOT/"
  done
  rmdir "$ROOT/lead-generation" || true
  shopt -u nullglob
fi

# Helper to (re)write a file unless it exists and is non-empty (unless --force)
write_file () {
  local path="$1"
  if [[ -f "$path" && -s "$path" && "$FORCE" != "true" ]]; then
    echo "⚠️  Exists (non-empty), skipping: $path"
    return 0
  fi
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  echo "✅ Wrote: $path"
}

# 1) Delete the four bundle-like files that do not belong in add-ons
BAD_FILES=(
  "leadgen-pack-b2b-saas.ts"
  "leadgen-pack-financial.ts"
  "leadgen-pack-healthcare.ts"
  "leadgen-pack-real-estate.ts"
)
for bf in "${BAD_FILES[@]}"; do
  if [[ -f "$ROOT/$bf" ]]; then
    rm -f "$ROOT/$bf"
    echo "🗑️  Deleted: $ROOT/$bf"
  fi
done

# 2) Ensure required add-ons exist (create if missing)
# IDs and filenames:
# - leadgen-lead-magnet.ts
# - leadgen-webinar-success.ts
# - leadgen-audit-optimization.ts
# - leadgen-advanced-attribution.ts
# - leadgen-abm.ts
# - leadgen-international.ts

# Lead Magnet
write_file "$ROOT/leadgen-lead-magnet.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

const addon: AddOn = {
  id: "leadgen-lead-magnet",
  name: "Lead Magnet Creation Package",
  price: { oneTime: 3500, currency: "USD" },
  bullets: [
    "3 high-converting lead magnets",
    "Landing page design and setup",
    "Email sequence automation (5–7 emails/magnet)",
    "Performance tracking setup",
  ],
  badges: ["Popular"],
};

export default addon;
EOF

# Webinar Success
write_file "$ROOT/leadgen-webinar-success.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

const addon: AddOn = {
  id: "leadgen-webinar-success",
  name: "Webinar Success Package",
  price: { oneTime: 5500, currency: "USD" },
  bullets: [
    "Complete webinar planning and setup",
    "Promotional campaign design",
    "Registration and follow-up automation",
    "Post-event content creation and replay optimization",
  ],
};

export default addon;
EOF

# Sales Funnel Optimization Audit
write_file "$ROOT/leadgen-audit-optimization.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

const addon: AddOn = {
  id: "leadgen-audit-optimization",
  name: "Sales Funnel Optimization Audit",
  price: { oneTime: 2500, currency: "USD" },
  bullets: [
    "Complete funnel analysis (end-to-end)",
    "CRO recommendations with prioritization",
    "A/B testing plan development",
    "Implementation roadmap with timelines",
  ],
};

export default addon;
EOF

# Advanced Attribution Modeling
write_file "$ROOT/leadgen-advanced-attribution.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

const addon: AddOn = {
  id: "leadgen-advanced-attribution",
  name: "Advanced Attribution Modeling",
  price: { oneTime: 6500, monthly: 2500, currency: "USD" },
  bullets: [
    "Multi-touch attribution setup",
    "Advanced analytics & custom dashboards",
    "Cross-channel lead tracking",
    "Executive reporting",
  ],
};

export default addon;
EOF

# ABM
write_file "$ROOT/leadgen-abm.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

const addon: AddOn = {
  id: "leadgen-abm",
  name: "Account-Based Marketing (ABM)",
  price: { monthly: 8500, currency: "USD" },
  bullets: [
    "Target account identification & research",
    "Personalized campaign development",
    "Multi-channel ABM execution",
    "Account-level tracking & attribution",
  ],
  badges: ["Popular"],
};

export default addon;
EOF

# International Lead Generation
write_file "$ROOT/leadgen-international.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

const addon: AddOn = {
  id: "leadgen-international",
  name: "International Lead Generation",
  price: { oneTime: 5500, monthly: 2500, currency: "USD" },
  priceNote: "+\$2,500/month per additional market",
  bullets: [
    "Market research and entry strategy",
    "Localized campaign development",
    "Regional compliance (e.g., GDPR)",
    "Multi-language lead nurturing",
  ],
};

export default addon;
EOF

# 3) Rebuild index.ts (includes the six canonical add-ons)
#     If leadgen-accelerator-rapid-launch.ts exists, include it as well.
HAS_RAPID=""
if [[ -f "$ROOT/leadgen-accelerator-rapid-launch.ts" ]]; then
  HAS_RAPID="yes"
fi

write_file "$ROOT/index.ts" <<EOF
import type { AddOn } from "${TYPE_IMPORT}";

import leadgenLeadMagnet from "./leadgen-lead-magnet";
import leadgenWebinarSuccess from "./leadgen-webinar-success";
import leadgenAuditOptimization from "./leadgen-audit-optimization";
import leadgenAdvancedAttribution from "./leadgen-advanced-attribution";
import leadgenABM from "./leadgen-abm";
import leadgenInternational from "./leadgen-international";
${HAS_RAPID:+import leadgenRapidLaunch from "./leadgen-accelerator-rapid-launch";}

export const LEADGEN_ADDONS_LIST: AddOn[] = [
  leadgenLeadMagnet,
  leadgenWebinarSuccess,
  leadgenAuditOptimization,
  leadgenAdvancedAttribution,
  leadgenABM,
  leadgenInternational,
  ${HAS_RAPID:+leadgenRapidLaunch,}
];

export const LEADGEN_ADDONS: Record<string, AddOn> = Object.fromEntries(
  LEADGEN_ADDONS_LIST.map(a => [a.id, a])
);

export default LEADGEN_ADDONS;

export type { AddOn } from "${TYPE_IMPORT}";
EOF

echo "✅ LeadGen add-ons cleaned and synced at: $ROOT"
