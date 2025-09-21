Short answer: your intent is strong, but it won’t be “clear” to future devs until you (1) **name it**, (2) **document it at 3 levels**, and (3) **enforce it in code**. Below is a plug-and-play package: folder map, docs you should add, and tiny bits of config to make the structure self-evident and hard to drift from.

---

# 1) Name the idea

Call it **Domain-Mirrored Architecture (DMA)**: three top-level roots (app, src, public) mirror the same business domains:

* **Domains**: `booking/`, `portfolio/`, `packages/`, `pages/` (split into `main/`, `services/`, `legal/`), `search/`, etc.
* **Components**: `src/components/*` provides shared UI to those domains.
* **Public** mirrors static derivatives of domain assets.

---

# 2) Make it visible: folder map (authoritative)

Add this to `docs/DOMAINS.md` and the root `README.md`.

```text
.
├─ app/                                  # Next.js routes (App Router)
│  ├─ (main)/                            # “Main pages” route group
│  │  └─ page.tsx
│  ├─ services/
│  │  ├─ [hub]/                          # services pages (by hub)
│  │  │  └─ [service]/[sub]/page.tsx
│  ├─ legal/
│  │  ├─ privacy/page.tsx
│  │  └─ terms/page.tsx
│  ├─ portfolio/                         # domain routes (optional surface)
│  ├─ booking/                           # domain routes (optional surface)
│  └─ api/...
├─ public/
│  ├─ booking/      # public assets derived from src/booking
│  ├─ portfolio/
│  ├─ packages/
│  └─ og/           # generated OpenGraph images per domain/page
├─ src/
│  ├─ booking/      # domain logic: data loaders, domain services, adapters
│  ├─ portfolio/
│  ├─ packages/
│  ├─ pages/        # content & builders used by app/ (main/services/legal)
│  │  ├─ main/
│  │  ├─ services/
│  │  └─ legal/
│  ├─ search/
│  ├─ components/   # shared UI (server-first; leaf client components only)
│  ├─ lib/          # cross-domain utilities (fetchers, env, logger)
│  ├─ data/         # content/taxonomy/config (typed & validated)
│  └─ types/        # canonical types per domain
└─ scripts/
   ├─ mirror-public.ts  # mirrors src/* → public/*
   ├─ validate-structure.ts
   └─ ...
```

> Rule of thumb: **`app/` = routing & composition only**; **`src/<domain>/` = business logic**; **`public/<domain>/` = assets generated or curated for that domain**.

---

# 3) Explain the contract (docs you should add)

Create a small docs suite:

### `docs/ARCHITECTURE.md` (high level)

* **What is DMA** and why mirroring helps (discoverability, least surprise).
* **Roots and responsibilities** table:

| Root               | Purpose                                        | Can import from                                                  |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------------------- |
| `app/`             | Routes/Layouts, minimal glue                   | `src/pages/*`, `src/<domain>/*`, `src/components/*`, `src/lib/*` |
| `src/<domain>/`    | Domain logic, content builders, loaders        | `src/lib/*`, `src/types/*` (no cross-domain imports)             |
| `src/pages/*`      | Page builders for `app/` (main/services/legal) | Domain + components                                              |
| `public/<domain>/` | Generated or static assets                     | (no imports; output only)                                        |

### `docs/DOMAINS.md` (per-domain mini-specs)

For each domain (`booking`, `portfolio`, `packages`, `search`, …) list:

* **Scope**: what “high-functioning” means here (e.g., booking = slots, availability, confirmation UX).
* **Surface**: routes under `app/…` and which **page builders** in `src/pages/…` feed them.
* **Inputs/Outputs**: data sources (files, CMS), generated artifacts in `public/…`.
* **Ownership**: CODEOWNERS group.

> Provide a **template** (include it at the top of the doc):

```md
## <Domain Name> Domain
**Purpose:** …
**Routes:** `/booking`, `/booking/confirm`, …
**Core modules:** `src/booking/*`
**Page builders:** `src/pages/main/home.tsx`, `src/pages/services/...`
**Public outputs:** `public/booking/*`
**Contracts:** types in `src/types/booking.ts`
**Owners:** @team-website
```

### `docs/ROUTING.md` (how pages are composed)

* Mapping of `app/` routes → `src/pages/*` builders → domain data loaders.
* Explain route groups (`(main)`), `generateMetadata`, and canonical redirects.

### `docs/CONTENT.md` (content & mirroring)

* Where content/taxonomy live (`src/data/*`).
* How `scripts/mirror-public.ts` mirrors assets to `public/…`.
* Naming rules, slug rules, and a quick **“add a new service page”** walkthrough.

### `docs/CONTRIBUTING.md`

* How to add a new domain or page.
* “Do/Don’t” for imports (see enforcement below).
* Local dev commands.

---

# 4) Put it in code: light enforcement so it can’t drift

### a) Path aliases (clarify intent)

In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["app/*"],
      "@/*": ["src/*"],
      "@domain/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@public/*": ["public/*"]
    }
  }
}
```

### b) Import boundaries (ESLint)

Prevent cross-domain spaghetti; allow domains to use `lib` and `components`, but not each other.

`.eslintrc.cjs`:

```js
module.exports = {
  // …
  rules: {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          // Disallow importing directly across domains:
          { "group": ["@/booking/*"], "message": "Only booking domain may import booking modules." },
          { "group": ["@/portfolio/*"], "message": "Only portfolio domain may import portfolio modules." },
          { "group": ["@/packages/*"], "message": "Only packages domain may import packages modules." }
        ],
        "paths": []
      }
    ]
  },
  overrides: [
    {
      files: ["src/booking/**"],
      rules: { "no-restricted-imports": ["error", { patterns: ["@/portfolio/*", "@/packages/*"] }] }
    },
    {
      files: ["src/portfolio/**"],
      rules: { "no-restricted-imports": ["error", { patterns: ["@/booking/*", "@/packages/*"] }] }
    },
    {
      files: ["src/packages/**"],
      rules: { "no-restricted-imports": ["error", { patterns: ["@/booking/*", "@/portfolio/*"] }] }
    }
  ]
};
```

(Adjust as needed; keep `src/lib/*`, `src/components/*`, and `src/pages/*` open to all.)

### c) Scripted mirror (public sync)

Document and keep a single source of truth for mirroring. Example command in `package.json`:

```json
{
  "scripts": {
    "mirror:public": "tsx scripts/mirror-public.ts",
    "validate:structure": "tsx scripts/validate-structure.ts"
  }
}
```

* `mirror-public.ts` copies whitelisted directories from `src/<domain>/assets` to `public/<domain>/…` (and can prune).
* `validate-structure.ts` checks that each domain has `README.md`, `types.ts`, and optional `assets/` folder; fails CI if missing.

### d) CODEOWNERS (ownership ≙ clarity)

`CODEOWNERS`:

```
/src/booking/*      @team-website
/app/booking/*      @team-website
/public/booking/*   @team-website

/src/portfolio/*    @team-brand
/app/portfolio/*    @team-brand
/public/portfolio/* @team-brand
```

---

# 5) Quick “how to make it obvious” checklist

* [ ] Root `README.md` has a **“Domain-Mirrored Architecture”** section with the folder map.
* [ ] `docs/ARCHITECTURE.md`, `docs/DOMAINS.md`, `docs/ROUTING.md`, `docs/CONTENT.md`, `docs/CONTRIBUTING.md` exist and are linked from README.
* [ ] Each domain folder (`src/booking`, `src/portfolio`, …) has its own **`README.md`** using the template above.
* [ ] Import boundaries lint rules are enabled and tested.
* [ ] The **mirror script** exists and runs in CI (`npm run mirror:public && git diff --quiet` to ensure no drift).
* [ ] `app/` files stay thin: they call builders from `src/pages/*` and domain loaders from `src/<domain>/*`.

---

# 6) Copy-paste doc templates

### `src/booking/README.md`

```md
# Booking Domain

**Purpose:** Manage discovery, availability, scheduling, and confirmation flows.

**Routes:** `/booking`, `/booking/confirm`, `/booking/success`

**Page builders (src/pages):**
- `src/pages/main/bookingHome.tsx` → `app/booking/page.tsx`
- `src/pages/main/bookingConfirm.tsx` → `app/booking/confirm/page.tsx`

**Domain modules:**
- `src/booking/services/*` (availability, slots)
- `src/booking/adapters/*` (API/CMS)
- `src/booking/ui/*` (booking-specific components)

**Public outputs:** `public/booking/*` (icons, images, OG)

**Contracts:** `src/types/booking.ts`

**Owners:** @team-website
```

### `docs/ROUTING.md` (snippet)

```md
## Pages composition

- `app/(main)/page.tsx` → `src/pages/main/home.tsx`
- `app/services/[hub]/[service]/[sub]/page.tsx` → `src/pages/services/buildServicePage.tsx` + `src/data/services-pages/**`
- `app/legal/privacy/page.tsx` → `src/pages/legal/privacy.tsx`

All pages are **server components by default**; client-only widgets live in leaf components inside `src/components/**`.
```

---

## Bottom line

Your model is good. To make it **obvious**: document it (short, specific docs), **show** it (folder map & per-domain READMEs), and **enforce** it (path aliases, lint boundaries, mirror script, CODEOWNERS). If you want, I can generate the `docs/*` files and a minimal `validate-structure.ts` in a PR so the repo literally teaches this structure to every contributor.
