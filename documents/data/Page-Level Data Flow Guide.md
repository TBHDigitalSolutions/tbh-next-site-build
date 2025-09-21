# Page-Level Data Flow Guide

**Goal:** keep all data loading/selection/transformation at the **page level** (or route handler/loader), and pass the resulting data **down as props**. Components below the page level must be **pure UI** (no data imports, no fetching).

This document is the single source of truth for how data flows through your Next.js app.

---

## Why this rule?

* **Predictability:** every page declares exactly which data it needs.
* **Reusability:** components stay portable and testable because they render only from props.
* **Performance:** fewer surprise client bundles and double-fetches; server components/pages own the data boundary.
* **Design hygiene:** clearer separation of concerns (data orchestration vs. presentation).

---

## Component roles

Use these categories to decide where data work happens:

1. **Pages / Route segments** (`app/**/page.tsx`, `layout.tsx`)

   * ✅ Fetch/read data (files, APIs, CMS).
   * ✅ Transform/map to view models.
   * ✅ Compose UI by **passing props** to children.
   * ❌ Don’t render heavy logic inline—factor into helpers.

2. **Section layouts / Feature components** (`src/components/sections/**`, `src/components/main-pages/**`)

   * ✅ Receive all data via props (typed).
   * ✅ Contain layout and interactions only.
   * ❌ No imports from `@/data/**`.
   * ❌ No network requests.

3. **UI primitives (atoms/molecules/organisms)** (`src/components/ui/**`)

   * ✅ Pure, stateless; render from props.
   * ✅ May accept callbacks for events/analytics provided by the page.
   * ❌ No data fetching or `@/data/**` imports.

---

## Page-level pipeline (recommended)

1. **Read**: import JSON/TS data modules or perform server-side fetches in the page.
2. **Validate**: run light runtime guards (optionally zod in server boundary).
3. **Transform**: adapt to the exact props the components expect (view models).
4. **Render**: pass props down; no component reaches into data modules directly.

```tsx
// app/(main)/about/page.tsx
import aboutPageData from "@/data/page/main-pages/about";
import { CompanyStory, CoreValues, TeamGrid, JoinUsCTA } from "@/components/main-pages/About";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import TestimonialSlider from "@/components/ui/organisms/Testimonials/TestimonialSlider";

export default function AboutPage() {
  const {
    hero,
    companyStory,
    coreValues,
    teamSection,
    teamMembers,
    testimonialsSection,
    testimonials,
    joinUsCTA,
  } = aboutPageData;

  return (
    <>
      {/* Hero comes from a route-based selector or explicit <AboutHero data={hero} /> */}
      <CompanyStory data={companyStory} />
      <CoreValues title="Our Core Values" values={coreValues} />
      <TeamGrid section={teamSection} members={teamMembers} />
      <FullWidthSection title={testimonialsSection.title} description={testimonialsSection.description} align="center">
        <TestimonialSlider data={testimonials} />
      </FullWidthSection>
      <FullWidthSection>
        <JoinUsCTA data={joinUsCTA} />
      </FullWidthSection>
    </>
  );
}
```

---

## Anti-pattern (don’t do this)

```tsx
// ❌ Inside a component file
import aboutPageData from "@/data/page/main-pages/about"; // <-- Not allowed here

export default function CompanyStory() {
  const { companyStory } = aboutPageData; // <-- Component fetching data itself
  // ...
}
```

Components should **not** import `@/data/**`. They must receive `props`:

```tsx
// ✅ Correct
export default function CompanyStory({ data }: { data: CompanyStory }) {
  // render from props only
}
```

---

## Props & types

* Define shared types near your data modules (e.g., `src/data/page/main-pages/about/types.ts`).
* Components import **types only** from the shared types module; they don’t import **data**.

```ts
// src/data/page/main-pages/about/types.ts (excerpt)
export type CompanyStory = {
  heading: string;
  subheading?: string;
  video: { src: string; fallbackImage?: string; autoplay?: boolean; loop?: boolean; muted?: boolean; controls?: boolean; };
  body: Array<{ type: "paragraph"; content: string } | { type: "list"; items: string[] }>;
  highlights?: string[];
};
```

```tsx
// src/components/main-pages/About/CompanyStory/CompanyStory.tsx
import type { CompanyStory as CompanyStoryType } from "@/data/page/main-pages/about/types";

export default function CompanyStory({ data }: { data: CompanyStoryType }) {
  // ...
}
```

---

## Directory conventions

```
src/data/page/main-pages/about/
├─ aboutPage.ts           // page-level cohesive data barrel (default export)
├─ hero.ts
├─ company-story.ts
├─ core-values.ts
├─ team.ts
├─ testimonials.ts
├─ join-us-cta.ts
└─ types.ts               // shared, importable types only
```

```
src/components/main-pages/About/
├─ AboutHero/
├─ CompanyStory/
├─ CoreValues/
├─ TeamGrid/
└─ JoinUsCTA/
```

* **Data barrel** (`aboutPage.ts`) exports a **single object** the page can destructure.
* Feature components live in `src/components/main-pages/About/**` and accept **only props**.

---

## Adapters & view models (optional but recommended)

When a component needs a very specific shape, create a small **adapter** at the page level (or a pure utility in `src/lib/adapters.ts`) to map raw data → props. This keeps components dumb and reusable.

```ts
// src/lib/adapters.ts
import type { CompanyStory } from "@/data/page/main-pages/about/types";

export function toCompanyStoryVM(data: CompanyStory) {
  return {
    heading: data.heading,
    subheading: data.subheading,
    paragraphs: data.body.filter(b => b.type === "paragraph"),
    bullets: data.body.find(b => b.type === "list")?.items ?? [],
  };
}
```

```tsx
// app/(main)/about/page.tsx
import { toCompanyStoryVM } from "@/src/lib/adapters";

const vm = toCompanyStoryVM(companyStory);
<CompanyStory data={companyStory} /* or pass vm to a more specific component */ />;
```

---

## Handling state & events

* UI state (open/close, active tab) stays inside the component or is hoisted to the page if shared.
* Analytics or routing events are passed **down as callbacks** from the page:

```tsx
<CoreValues
  title="Our Core Values"
  values={coreValues}
  onValueClick={(value) => {
    window.gtag?.("event", "core_value_click", { value: value.id });
  }}
/>
```

> Components should not reach for global analytics directly unless it’s a low-level UI concern (e.g., button fires a generic `onClick` the page can handle).

---

## Server vs. client components

* Prefer pages as **server components** to load data efficiently.
* Mark interactive feature components with `"use client";` as needed; still **receive data via props** only.
* Avoid fetching in client components.

---

## Testing

* Components are easy to test with plain props (no fixtures imports needed).
* Snapshot and visual tests become stable because inputs are explicit.

```tsx
import { render } from "@testing-library/react";
import CompanyStory from "./CompanyStory";

test("renders CompanyStory", () => {
  render(<CompanyStory data={{ heading: "Our Story", video: { src: "/v.mp4" }, body: [], highlights: [] }} />);
});
```

---

## Enforcement (ESLint)

Add guardrails so components cannot import from `@/data/**`:

```jsonc
// .eslintrc.json (excerpt)
{
  "overrides": [
    {
      "files": ["src/components/**/*.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": ["@/data/*"]
          }
        ]
      }
    }
  ]
}
```

Optionally allow pages to import data:

```jsonc
{
  "overrides": [
    {
      "files": ["app/**/page.tsx", "app/**/layout.tsx"],
      "rules": {
        "no-restricted-imports": "off"
      }
    }
  ]
}
```

---

## Quick checklist (copy/paste)

* [ ] Page imports **all** data from `@/data/**` barrels or performs server fetches.
* [ ] Page transforms/validates data (optional adapters).
* [ ] Page passes **props only** to children.
* [ ] No component below page imports from `@/data/**`.
* [ ] No network requests in section/feature/UI components.
* [ ] Types live in `src/data/**/types.ts` and are safe to import anywhere.
* [ ] ESLint rule `no-restricted-imports` blocks `@/data/**` in `src/components/**`.

---

## Example: About page wiring (final)

```tsx
import aboutPageData from "@/data/page/main-pages/about";
import { AboutHero, CompanyStory, CoreValues, TeamGrid, JoinUsCTA } from "@/components/main-pages/About";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import TestimonialSlider from "@/components/ui/organisms/Testimonials/TestimonialSlider";

export default function AboutPage() {
  const { hero, companyStory, coreValues, teamSection, teamMembers, testimonialsSection, testimonials, joinUsCTA } =
    aboutPageData;

  return (
    <>
      {hero && <AboutHero data={hero} />}
      <CompanyStory data={companyStory} />
      <CoreValues title="Our Core Values" values={coreValues} />
      <TeamGrid section={teamSection} members={teamMembers} />
      <FullWidthSection title={testimonialsSection.title} description={testimonialsSection.description} align="center">
        <TestimonialSlider data={testimonials} />
      </FullWidthSection>
      <FullWidthSection>
        <JoinUsCTA data={joinUsCTA} />
      </FullWidthSection>
    </>
  );
}
```

---

**TL;DR**
**Pages own data.** Everything else renders from props. No component below page should import from `@/data/**` or fetch on its own. Keep types shared, keep components pure, and the app will stay predictable and easy to evolve.
