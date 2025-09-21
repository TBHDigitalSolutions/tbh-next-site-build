#!/usr/bin/env bash
# Refactor /documents to the ideal layout with consistent naming.
# Usage:
#   DRY_RUN=1 bash scripts/refactor-docs.sh   # show what would happen
#   bash scripts/refactor-docs.sh             # perform changes (uses git mv if repo)

set -euo pipefail

ROOT="${ROOT:-$(pwd)}"
DOCS="$ROOT/documents"
TARGET="$ROOT/documents" # in-place reorganize

# helper: mv with mkdir -p and optional git
move() {
  src="$1"; dst="$2"
  [[ -e "$src" ]] || { echo "skip (missing): $src"; return; }
  mkdir -p "$(dirname "$dst")"
  if [[ "${DRY_RUN:-}" == "1" ]]; then
    echo "would move: $src -> $dst"
  else
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
      git mv -f "$src" "$dst" 2>/dev/null || { mv -f "$src" "$dst"; git add "$dst"; }
    else
      mv -f "$src" "$dst"
    fi
  fi
}

# helper: write stub file if missing
ensure_file() {
  path="$1"; content="$2"
  if [[ "${DRY_RUN:-}" == "1" ]]; then
    echo "would ensure: $path"
    return
  fi
  mkdir -p "$(dirname "$path")"
  if [[ ! -f "$path" ]]; then
    printf "%s\n" "$content" > "$path"
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git add "$path"; fi
  fi
}

# 0) Create top-level buckets & READMEs
ensure_file "$TARGET/README.md" "# Documents\n\nSee architecture/, project/, domains/, content/, taxonomy/, authoring/, meta/."
for dir in architecture project domains content taxonomy authoring meta; do
  mkdir -p "$TARGET/$dir"
  ensure_file "$TARGET/$dir/README.md" "# ${dir^}\n"
done

# 1) Architecture moves
move "$DOCS/app/app-router-official-guide.md" \
     "$TARGET/architecture/app-router_official-guide.md"
move "$DOCS/copy-rules/development-guides/frontend-architecture/project-architecture_system-overview_2025-09-13.md" \
     "$TARGET/architecture/system-overview_overview.md"
move "$DOCS/copy-rules/development-guides/frontend-architecture/project-architecture_service-data-patterns_2025-09-13.md" \
     "$TARGET/architecture/service-data-patterns_overview.md"
move "$DOCS/copy-rules/development-guides/frontend-architecture/project-architecture_terminology-guide_2025-09-13.md" \
     "$TARGET/architecture/terminology_guide.md"
move "$DOCS/src/src-tree-audit_improvement-plan_2025-09-12.md" \
     "$TARGET/architecture/src-tree-audit_improvement-plan.md"

# 2) Project & policies
move "$DOCS/project-overview_guide_2025-09-13.md" \
     "$TARGET/project/project-overview_guide.md"
move "$DOCS/project-enhancements/project-enhancements_roadmap_2025-09-13.md" \
     "$TARGET/project/enhancements_roadmap.md"
move "$DOCS/canonical_services_global_rules.md" \
     "$TARGET/project/policies/canonical-services_global-rules_policy.md"

# 3) Domains: booking
move "$DOCS/booking/booking_domain_complete_plan.md" \
     "$TARGET/domains/booking/booking_domain_overview.md"
move "$DOCS/booking/booking-cta-policy_InternalGuide_2025-09-11.md" \
     "$TARGET/domains/booking/booking_cta_policy.md"
move "$DOCS/booking/booking-domain-project-plan_Plan_2025-09-15.md" \
     "$TARGET/domains/booking/2025-09-15_booking_domain_plan.md"
move "$DOCS/booking/booking-domain-supplemental-guidance_Guidance_2025-09-15.md" \
     "$TARGET/domains/booking/2025-09-15_booking_domain_supplemental-guidance.md"
move "$DOCS/booking/Booking-Lib—Authoring Guide-src-booking-lib.md" \
     "$TARGET/domains/booking/booking-lib_authoring-guide.md"
move "$DOCS/booking/services-booking-portfolio_StrategyPlan_09-05-2025.md" \
     "$TARGET/domains/booking/2025-09-05_services-booking-portfolio_strategy-plan.md"

# 4) Domains: portfolio
move "$DOCS/portfolio/portfolio_domain_standards.md" \
     "$TARGET/domains/portfolio/portfolio_production-standards_standard.md"
move "$DOCS/portfolio/portfolio-app-router-integration_Guide_2025-09-14.md" \
     "$TARGET/domains/portfolio/2025-09-14_portfolio_app-router_integration_guide.md"
move "$DOCS/portfolio/portfolio-app-router-refactor_Plan_2025-09-14.md" \
     "$TARGET/domains/portfolio/2025-09-14_portfolio_app-router_refactor_plan.md"
move "$DOCS/portfolio/portfolio-template-parity_ParityReview_2025-09-14.md" \
     "$TARGET/domains/portfolio/2025-09-14_portfolio_template-parity_review.md"
move "$DOCS/portfolio/portfolio-production-standards_PortfolioProductionStandardsGuide_2025-09-14.md" \
     "$TARGET/domains/portfolio/portfolio_production-standards_standard.md"
move "$DOCS/portfolio/PORTFOLIO BUILD GUIDE — UPDATED (PLAIN TEXT) VERSION 3.md" \
     "$TARGET/domains/portfolio/portfolio_domain_overview.md"
move "$DOCS/portfolio/Current assesment and to do review and plans/portfolio_project_assessment.md" \
     "$TARGET/domains/portfolio/current-assessment_todo.md"

# 5) Domains: packages
for f in \
"3-Card Package Display for Website.md:3-card-package-display_guide.md" \
"Additional Package & Add-On Opportunities.md:additional-addons_opportunities_overview.md" \
"Complete Service Packages & Add-Ons.md:complete-service-packages_overview.md" \
"comprehensive_packages_doc.md:comprehensive-packages_overview.md" \
"Content Production Packages.md:content-production_packages.md" \
"Marketing Services Packages.md:marketing-services_packages.md" \
"SEO Services Packages.md:seo-services_packages.md" \
"Web Development Packages.md:web-development_packages.md" \
"Global Packages Hub_overview.md:global-packages_hub_overview.md"; do
  src="${f%%:*}"; dst="${f##*:}"
  move "$DOCS/packages/$src" "$TARGET/domains/packages/$dst"
done
for g in content_production_packages.md lead_generation_packages.md marketing_services_packages.md seo_services_packages.md video_production_packages.md web_development_packages.md; do
  move "$DOCS/packages/core-services-packages/$g" "$TARGET/domains/packages/$g"
done
for k in 5-complete-packages_IntegratedGrowthPackages.md client-facing-sales-sheet_IntegratedGrowthPackages.md; do
  move "$DOCS/packages/integrated-growth-packages_MultiServiceBundles/$k" \
       "$TARGET/domains/packages/$k"
done

# 6) Domains: services (shared + per-practice)
move "$DOCS/services/services-information-architecture.md" \
     "$TARGET/domains/services/information-architecture_overview.md"
move "$DOCS/services/services-data-passing-official-plan.md" \
     "$TARGET/domains/services/data-passing_plan.md"
move "$DOCS/services/service-page-template-layout_integration-guide_2025-09-12.md" \
     "$TARGET/domains/services/page-template-layout_integration-guide.md"
move "$DOCS/services/Service-Specific-Tools/service-specific tools.md" \
     "$TARGET/domains/services/tools/service-specific-tools_overview.md"
move "$DOCS/services/marketing-services/marketing-services-data-integration_qa-guide_2025-09-12.md" \
     "$TARGET/domains/services/marketing/data-integration_qa-guide.md"
move "$DOCS/services/marketing-services/marketing-services-qa_guide_2025-09-12.md" \
     "$TARGET/domains/services/marketing/qa_guide.md"

# 7) Domains: search
move "$DOCS/search/implementing search-09062025.md" \
     "$TARGET/domains/search/search_implementing_guide.md"
move "$DOCS/search/search-module-comple-domain-example-09062025.md" \
     "$TARGET/domains/search/search_complete-domain_example.md"
move "$DOCS/search/search-starter-bundle-09062025.md" \
     "$TARGET/domains/search/search_starter-bundle.md"

# 8) Domains: landing-pages & company
move "$DOCS/landing-pages/landing-pages-playbook-overview.md" \
     "$TARGET/domains/landing-pages/playbook_overview.md"
# company-information (rename, consolidate)
if [[ -d "$DOCS/company-information" ]]; then
  mkdir -p "$TARGET/domains/company"
  # move any files in "pricing and packages" into single md
  if compgen -G "$DOCS/company-information/pricing and packages/*" > /dev/null; then
    ensure_file "$TARGET/domains/company/pricing-and-packages.md" "# Pricing & Packages\n"
    # optional: append filenames as bullets
    for x in "$DOCS/company-information/pricing and packages/"*; do
      [[ -e "$x" ]] || continue
      base="$(basename "$x")"
      echo "- Migrated: $base" >> "$TARGET/domains/company/pricing-and-packages.md"
    done
  else
    ensure_file "$TARGET/domains/company/pricing-and-packages.md" "# Pricing & Packages\n"
  fi
fi

# 9) Content (data/docs)
move "$DOCS/data/data-domain-offical-guide.md" \
     "$TARGET/content/data_official-guide.md"

declare -A PRACTICES=(
  ["content-production-services"]="content-production"
  ["lead-generation-services"]="lead-generation"
  ["marketing-services"]="marketing"
  ["seo-services"]="seo"
  ["video-production-services"]="video-production"
  ["web-development-services"]="web-development"
)
for srcdir in "${!PRACTICES[@]}"; do
  dst="${PRACTICES[$srcdir]}"
  move "$DOCS/data/services-pages/$srcdir/${dst//-/_}_directory_tree.txt" \
       "$TARGET/content/services-pages/$dst/directory-tree.txt" || true
  # handle marketing file with (1) in name
  if [[ -f "$DOCS/data/services-pages/$srcdir/${dst//-/_}_structure.md" ]]; then
    move "$DOCS/data/services-pages/$srcdir/${dst//-/_}_structure.md" \
         "$TARGET/content/services-pages/$dst/structure_overview.md"
  elif [[ -f "$DOCS/data/services-pages/$srcdir/${dst//-/_}_services_structure (1).md" ]]; then
    move "$DOCS/data/services-pages/$srcdir/${dst//-/_}_services_structure (1).md" \
         "$TARGET/content/services-pages/$dst/structure_overview.md"
  else
    # generic match
    for cand in "$DOCS/data/services-pages/$srcdir/"*structure*.md; do
      [[ -e "$cand" ]] || continue
      move "$cand" "$TARGET/content/services-pages/$dst/structure_overview.md"
      break
    done
  fi
done
move "$DOCS/data/services-pages/services_index.md" \
     "$TARGET/content/services-pages/services_index.md"

# 10) Taxonomy
for f in canonical-hub-slugs_enforcement-guide_2025-09-12.md \
         services-taxonomy-middleware_manual_2025-09-12.md \
         services-taxonomy-simplification_Plan_2025-09-12.md; do
  move "$DOCS/taxonomy/$f" "$TARGET/taxonomy/${f//_2025-09-12/}"
done

# 11) Authoring: templates & copy frameworks
move "$DOCS/Domain Implementation Template.md" \
     "$TARGET/authoring/templates/domain-implementation_template.md"
move "$DOCS/generic_domain_structure_authoring_guide_reusable_template.md" \
     "$TARGET/authoring/templates/generic-domain-structure_authoring-template.md"
move "$DOCS/copy-rules/service-content_two-lens-framework_guide_2025-09-13.md" \
     "$TARGET/authoring/copy/service-content_two-lens-framework_guide.md"
move "$DOCS/copy-rules/service-template_four-area-framework_guide_2025-09-13.md" \
     "$TARGET/authoring/copy/service-template_four-area-framework_guide.md"
move "$DOCS/copy-rules/service-template_four-area-skeleton_worksheet_2025-09-13.md" \
     "$TARGET/authoring/copy/service-template_four-area-skeleton_worksheet.md"
move "$DOCS/copy-rules/random-knowledge/marketing-seo-vs-web-development-seo_comparison-guide_2025-09-13.md" \
     "$TARGET/authoring/knowledge/marketing-seo-vs-web-dev-seo_comparison.md"
move "$DOCS/copy-rules/random-knowledge/service-taxonomy_leaf-children-structure_guide_2025-09-13.md" \
     "$TARGET/authoring/knowledge/service-taxonomy_leaf-children-structure_guide.md"

# 12) Fill required READMEs
ensure_file "$TARGET/domains/booking/README.md" "# Booking (Domain)\n"
ensure_file "$TARGET/domains/portfolio/README.md" "# Portfolio (Domain)\n"
ensure_file "$TARGET/domains/packages/README.md" "# Packages (Domain)\n"
ensure_file "$TARGET/domains/services/README.md" "# Services (Domain)\n"
ensure_file "$TARGET/domains/search/README.md" "# Search (Domain)\n"
ensure_file "$TARGET/domains/landing-pages/README.md" "# Landing Pages (Domain)\n"
ensure_file "$TARGET/domains/company/README.md" "# Company (Domain)\n"
ensure_file "$TARGET/content/README.md" "# Content\n"
ensure_file "$TARGET/taxonomy/README.md" "# Taxonomy\n"
ensure_file "$TARGET/authoring/README.md" "# Authoring\n"
ensure_file "$TARGET/project/README.md" "# Project\n"
ensure_file "$TARGET/architecture/README.md" "# Architecture\n"
ensure_file "$TARGET/meta/docs-contributing_guide.md" "# Docs Contributing Guide\n"
ensure_file "$TARGET/meta/linting-rules_for-docs.md" "# Docs Linting Rules\n"
ensure_file "$TARGET/meta/docs-roadmap.md" "# Docs Roadmap\n"

echo "Done. Review git changes and commit."
