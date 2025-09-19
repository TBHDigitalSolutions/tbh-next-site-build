# Portfolio Module

## What goes here
- components/: UI building blocks (galleries, modals, viewers)
- sections/: Page sections (PortfolioSection orchestrator + overview/stats/text)
- templates/: Page-level scaffolds for Hub and Category
- lib/: adapters, validators, metrics helpers, registry, shared types
- index.ts: public API for everything Portfolio

## How to use
- In Service pages: import { toPortfolioSectionProps, PortfolioSection } from "@/portfolio"
- In Portfolio hub page: import { PortfolioHubTemplate } from "@/portfolio"
- In Portfolio category page: import { PortfolioCategoryTemplate } from "@/portfolio"

## Data shape
- `portfolio` block may be:
  - `{ variant?: "web"|"video"|"demo", title?, subtitle?, items: Project[] }`
  - Or simply `Project[]` (tolerant). `toPortfolioSectionProps()` normalizes this.

## Metrics safety
- Use `normalizeMetrics`/`sanitizeVideoItems` from `lib/metrics` for any video items.
