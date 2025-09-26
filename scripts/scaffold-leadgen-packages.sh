#!/usr/bin/env bash
# scripts/scaffold-leadgen-packages.sh
# Create src/data/packages/lead-generation/* category dirs and per-package module folders.
# Each package folder gets: bundle.ts, includes.ts, outcomes.ts, faqs.ts, narrative.ts, index.ts
# Usage:
#   bash scripts/scaffold-leadgen-packages.sh
#   bash scripts/scaffold-leadgen-packages.sh --force

set -euo pipefail

FORCE="false"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE="true"; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

ROOT="src/data/packages/lead-generation"
TYPE_IMPORT='../../../_types/packages.types' # relative to each package file

mkdir -p "$ROOT"

write_file () {
  local path="$1"
  local content="$2"
  if [[ -f "$path" && "$FORCE" != "true" && -s "$path" ]]; then
    echo "⚠️  Exists (non-empty), skipping: $path"
    return 0
  fi
  mkdir -p "$(dirname "$path")"
  printf "%s" "$content" > "$path"
  echo "✅ Wrote: $path"
}

make_pkg () {
  local category_dir="$1"  # e.g. channel-planning-packages
  local slug="$2"          # e.g. leadgen-channel-essential
  local title="$3"         # display name
  local price_json="$4"    # e.g. '"monthly": 3500' or '"oneTime": 4500, "monthly": 500'
  local summary="${5:-}"

  local dir="$ROOT/$category_dir/$slug"
  mkdir -p "$dir"

  # Escape any embedded double quotes in summary for TS string safety
  local summary_escaped="${summary//\"/\\\"}"

  # bundle.ts (expand variables directly; no sed)
  write_file "$dir/bundle.ts" "$(cat <<TS
import type { ServicePackage } from "$TYPE_IMPORT";

const bundle: ServicePackage = {
  id: "$slug",
  service: "leadgen",
  name: "$title",
  summary: "$summary_escaped",
  price: { $price_json, currency: "USD" },
  badges: [],
  tags: [],
  // Optional card highlights
  highlights: [],
  // Optional matrix (add later if needed)
  // pricingMatrix: undefined,
};

export default bundle;
TS
)"

  # includes.ts
  write_file "$dir/includes.ts" "$(cat <<'TS'
export const includes = [
  {
    title: "Core deliverables",
    items: [
      // { label: "", note: "" },
    ],
  },
] as const;
TS
)"

  # outcomes.ts
  write_file "$dir/outcomes.ts" "$(cat <<'TS'
export const outcomes = {
  title: "Expected outcomes",
  items: [
    // { label: "Lead volume uplift", value: "TBD" },
  ],
} as const;
TS
)"

  # faqs.ts
  write_file "$dir/faqs.ts" "$(cat <<'TS'
const faqs = [
  {
    id: "scope",
    question: "What’s included in this package?",
    answer: "See the Includes section; larger initiatives can be scoped as add-ons.",
  },
  {
    id: "term",
    question: "Is there a minimum commitment?",
    answer: "Month-to-month unless otherwise stated; 30-day cancellation notice.",
  },
] as const;

export default faqs;
TS
)"

  # narrative.ts
  write_file "$dir/narrative.ts" "$(cat <<'TS'
const narrativeHtml = `
  <section>
    <h2>How this package drives qualified leads</h2>
    <p>
      This plan sets up the right foundations and iterates using measurable
      conversion signals so you capture more qualified demand over time.
    </p>
  </section>
`;
export default narrativeHtml;
TS
)"

  # index.ts
  write_file "$dir/index.ts" "$(cat <<'TS'
import bundle from "./bundle";
import { includes } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

export default { ...bundle, includes, outcomes, faq: { title: "FAQs", faqs }, content: { html: narrativeHtml } };
TS
)"
}

# ---------------------------
# Category → Packages (use single-quoted elements)
# Format: slug|Title|price-json
# ---------------------------

# Strategy & Planning → Channel Planning
CATEGORY="channel-planning-packages"
ARR=(
  'leadgen-channel-essential|Essential Channel Strategy|"monthly": 3500'
  'leadgen-channel-professional|Professional Channel Management|"monthly": 6500'
  'leadgen-channel-enterprise|Enterprise Channel Optimization|"monthly": 12500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Strategy → Offer Strategy
CATEGORY="offer-strategy-packages"
ARR=(
  'leadgen-offer-starter|Lead Magnet Starter Kit|"oneTime": 4500'
  'leadgen-offer-professional|Professional Offer System|"oneTime": 8500, "monthly": 1500'
  'leadgen-offer-enterprise|Enterprise Offer Management|"oneTime": 15000, "monthly": 3500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Conversion → Landing Pages
CATEGORY="conversion-landing-packages"
ARR=(
  'leadgen-landing-essentials|Landing Page Essentials|"oneTime": 3500, "monthly": 500'
  'leadgen-landing-professional|Professional Landing Page System|"oneTime": 6500, "monthly": 2500'
  'leadgen-landing-enterprise|Enterprise Conversion Platform|"oneTime": 15000, "monthly": 5500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Conversion → A/B Testing
CATEGORY="ab-testing-packages"
ARR=(
  'leadgen-testing-starter|Conversion Testing Starter|"monthly": 2500'
  'leadgen-testing-advanced|Advanced Testing Program|"monthly": 4500'
  'leadgen-testing-enterprise|Enterprise Testing Platform|"monthly": 8500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Lead Management → Scoring
CATEGORY="lead-scoring-packages"
ARR=(
  'leadgen-scoring-basic|Basic Lead Scoring Setup|"oneTime": 3500, "monthly": 1500'
  'leadgen-scoring-professional|Professional Scoring System|"oneTime": 6500, "monthly": 2500'
  'leadgen-scoring-enterprise|Enterprise Scoring Platform|"oneTime": 12500, "monthly": 4500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Lead Management → Routing
CATEGORY="lead-routing-packages"
ARR=(
  'leadgen-routing-essential|Essential Routing System|"oneTime": 2500, "monthly": 1000'
  'leadgen-routing-professional|Professional Distribution Platform|"oneTime": 4500, "monthly": 2000'
  'leadgen-routing-enterprise|Enterprise Routing Intelligence|"oneTime": 8500, "monthly": 3500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Lead Management → Nurturing
CATEGORY="lead-nurturing-packages"
ARR=(
  'leadgen-nurture-essential|Essential Nurturing Package|"oneTime": 3500, "monthly": 1500'
  'leadgen-nurture-professional|Professional Nurturing System|"oneTime": 6500, "monthly": 3500'
  'leadgen-nurture-enterprise|Enterprise Nurturing Platform|"oneTime": 12500, "monthly": 5500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Remarketing → Setup
CATEGORY="remarketing-setup-packages"
ARR=(
  'leadgen-remarketing-starter|Remarketing Starter Kit|"oneTime": 2500, "monthly": 1500'
  'leadgen-remarketing-professional|Professional Remarketing System|"oneTime": 4500, "monthly": 3500'
  'leadgen-remarketing-enterprise|Enterprise Remarketing Platform|"oneTime": 8500, "monthly": 5500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Remarketing → Retargeting Campaigns
CATEGORY="retargeting-campaign-packages"
ARR=(
  'leadgen-retargeting-display|Display Retargeting Package|"monthly": 2500'
  'leadgen-retargeting-social|Social Retargeting System|"monthly": 3500'
  'leadgen-retargeting-search|Search Retargeting Platform|"monthly": 2500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Event & Experience → Webinar & Event
CATEGORY="webinar-event-packages"
ARR=(
  'leadgen-webinar-starter|Webinar Starter Package|"oneTime": 3500'
  'leadgen-event-professional|Professional Event System|"monthly": 6500'
  'leadgen-event-enterprise|Enterprise Event Platform|"monthly": 12500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

# Event & Experience → Trade Show & Exhibition
CATEGORY="tradeshow-exhibition-packages"
ARR=(
  'leadgen-tradeshow-starter|Trade Show Starter Package|"oneTime": 5500'
  'leadgen-exhibition-professional|Professional Exhibition System|"oneTime": 8500, "monthly": 2500'
  'leadgen-exhibition-enterprise|Enterprise Exhibition Platform|"oneTime": 15000, "monthly": 5500'
)
for row in "${ARR[@]}"; do IFS="|" read -r slug title price <<< "$row"; make_pkg "$CATEGORY" "$slug" "$title" "$price"; done

echo "📁 Lead Generation packages scaffolded at: $ROOT"
