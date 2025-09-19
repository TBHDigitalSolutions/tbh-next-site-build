# ServicesAndCapabilitiesExpandable

A single, composable section that merges **Services & Capabilities** with **Expandable Bullets** to keep L3/L4 detail inline on the L2 page (no deep routes). It renders:

- **Pillars Grid** — deliverables as cards (reuses your `PillarCard`)
- **Inline Bullets** — quick links (non-expandable)
- **Expandable Bullets** — accessible accordion rows with short summary + details + optional CTA

## Why

- **SEO:** Keep substantive content on the L2 URL (no thin L3/L4 pages).
- **Scanability:** Users skim pillars/links and expand details only when needed.
- **Maintainability:** One module to own variations (with adapters for legacy data).

---

## Props

From `types.ts`:

```ts
type ExpandableItem = {
  id: string;
  title: string;
  summary?: string;
  details?: string | string[];
  cta?: { label: string; href: string };
  tag?: string;
};

type Pillar = {
  id: string;
  title: string;
  description?: string;
  deliverables?: string[];
  icon?: string | React.ReactNode;
};

type InlineBullet = { label: string; href?: string };

export type ServicesAndCapabilitiesExpandableProps = {
  title?: string;
  intro?: string;
  pillars?: Pillar[];
  bullets?: InlineBullet[];
  expandable?: ExpandableItem[];
  defaultOpen?: number;       // open first N accordions on mount
  analyticsId?: string;       // optional namespace for analytics
  className?: string;
};
---
Notes

Tests assume Jest + @testing-library/react + @testing-library/jest-dom.
Add to devDependencies if not present:

npm i -D jest @testing-library/react @testing-library/jest-dom @types/jest


If your project uses Next.js next/link, either stub it globally or keep the light DS Link stub I included in the spec.

The PillarCard is mocked to avoid importing styles; replace with your real component if you prefer full integration tests.