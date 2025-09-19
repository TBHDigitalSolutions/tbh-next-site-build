# TBH Platform — Website Workspace Documentation

This document details the **website/**  workspace of the TBH Platform monorepo, providing a clear directory breakdown, asset organization, configuration files, and coding conventions to help onboard new developers or AI assistants.

---

## 1. Workspace Overview

* **Root:**  `website/`
* **Framework:**  Next.js (App Router)
* **Styling:**  Tailwind CSS + PostCSS + global CSS modules
* **Shared Integration:**  Inherits webpack aliases & components from `shared-ui/`
* **Entry Commands:**

  * `npm run dev` → starts Next.js dev server
  * `npm run build` → builds for production
  * `npm run start` → starts production server
  * `npm run lint` / `npm run format`

---

## 2. Public Assets (`website/public/`)

```text
public/
├─ favicon.ico
├─ robots.txt            # SEO crawl directives
├─ sitemap.xml           # Static sitemap
├─ fonts/                # Custom webfonts
├─ images/               # Static images referenced by components
│  ├─ icons/             # SVGs and PNG icons
│  ├─ integrations/      # Logos of integration partners
│  ├─ logos/             # TBH logos (primary, dark, wordmark)
│  ├─ services/          # Service-specific imagery
│  ├─ team/              # Team headshots
│  ├─ testimonials/      # Testimonial photos
│  ├─ hero-temp-bg.jpg   # Temp backgrounds
│  └─ ...                # other marketing assets
├─ favicon_io/           # Favicon source images & manifest
├─ klaro/                # GDPR consent configs (Klaro)
├─ videos/               # Marketing videos under `Website-Videos/`
└─ site.webmanifest      # PWA metadata
```

**Usage:**  reference via `<Image src="/images/..." />` or `<video src="/videos/..." />`.

---

## 3. Build Artifacts & Helpers

*  **`.next/`** : Next.js build output (ignore in VCS)
* **`node_modules/`** : Local dependencies
* **`fix-imports.sh`**: Shell script to normalize or convert import paths (run when syncing shared-ui changes)

---

## 4. Configuration Files

```text
website/
├─ next.config.js       # Next.js custom config + shared-ui webpack merge
├─ postcss.config.js    # PostCSS + Tailwind integration
├─ tailwind.config.ts   # Tailwind theme, purge paths, plugins
├─ tsconfig.json        # Extends tsconfig.base.json, local paths
├─ package.json         # Workspace scripts & dependencies
└─ next-env.d.ts        # Next.js type augmentation
```

* **Aliasing**: Uses `configureWebpack` from `shared-ui/config/webpack.js` to inherit:

  * `@components` → `shared-ui/components`
  * `@hooks` → `shared-ui/hooks`
  * `@styles` → `shared-ui/styles`
  * etc.

---

## 5. Source Code Structure (`website/src/`)

```text
src/
├─ app/                 # Next.js App Router routes & layouts
│  ├─ layout.tsx        # Root layout: theme provider, nav/footer
│  ├─ page.tsx          # Home page
│  ├─ about/page.tsx
│  ├─ contact/page.tsx
│  ├─ products-services/page.tsx
│  ├─ support/
│  │  ├─ faq/page.tsx
│  │  └─ help-center/page.tsx
│  ├─ privacy-policy/page.tsx
│  ├─ terms-conditions/page.tsx
│  ├─ terms-services/page.tsx
│  ├─ utility/
│  │  ├─ error404/page.tsx
│  │  └─ sitemap/page.tsx
│  └─ test/page.tsx     # Sandbox/test route

├─ components/          # Website-specific React components
│  ├─ feature-modules/  # Section-level modules mapping to mock data
│  │  ├─ about/         # About page modules (CompanyStory)
│  │  ├─ home/          # Home page modules (Hero, Industries, Portfolio, Services)
│  │  ├─ contact/       # Contact page modules (Modal, TrustSignals)
│  │  └─ products-services/ # Products & Services modules
│  ├─ ui/               # Lower-level UI primitives (Buttons, Cards, CTAs)
│  ├─ test/             # Ad-hoc test components
│  ├─ Contact.tsx/
│  └─ DynamicServiceSection.tsx  # Generic dynamic two-column section

├─ contexts/            # React Context providers (e.g., ThemeContext)
│  └─ ...

├─ hooks/               # Website-specific hooks
│  └─ useDeviceType.ts

├─ providers/           # Global providers (e.g., AnalyticsProvider)
│  └─ ...

├─ mock/                # Local mock JSON/TS data for pages
│  ├─ aboutPage.ts
│  ├─ contactPage.ts
│  ├─ productsServicesPage.ts
│  ├─ industriesData.ts
│  └─ ...

├─ styles/              # Global CSS modules and overrides
│  ├─ about.css
│  ├─ contact.css
│  ├─ layout.css
│  ├─ products-services.css
│  └─ ...

├─ types/               # TypeScript declarations
│  ├─ react-slick.d.ts
│  └─ Service.ts

└─ utils/               # Utility functions (API wrappers, helpers)
   ├─ api.ts            # Axios or fetch wrappers
   ├─ constants.ts      # App-wide constants
   ├─ helpers.ts        # misc formatters & adapters
   └─ animations.ts     # Framer Motion variants
```

---

## 6. Import & Usage Patterns

### 6.1 Shared-UI Imports

Use webpack aliases to import shared components:

```tsx
import Section from '@components/common/Section';
import { Button } from '@components/ui/Button';
import { useDebounce } from '@hooks/useDebounce';
import '@styles/globals.css';
```

### 6.2 Local Imports

Relative to `src/`:

```tsx
import Hero from '@/components/feature-modules/home/Hero';
import ContactModal from '@/components/feature-modules/contact/ContactModal';
import { contactPageData } from '@/mock/contactPage';
import useDeviceType from '@/hooks/useDeviceType';
```

> **Note:**  `@/` maps to `website/src/` via `tsconfig.json` paths.

---

## 7. Feature Module Guidelines

* **Purpose:**  Encapsulate a full page section (e.g., Hero, Portfolio, ContactOptions).
* **Structure:**  Each lives under `components/feature-modules/<page>/` with paired `.tsx` + `.css` files.
* **Props/Data:**  Consume data from `mock/` or CMS via props.
* **Styling:**  Use CSS Modules scoped by filename; minimal Tailwind usage—prefer global design tokens in shared-ui.

---

## 8. Running & Maintenance

1. **Install dependencies**: `npm install` from `/tbh-platform`
2. **Start dev server**: `npm --workspace website run dev`
3. **Lint &amp; format**: `npm --workspace website run lint` / `npm run format`
4. **Sync imports**: Run `./fix-imports.sh` after pulling or renaming shared-ui paths
5. **Build**: `npm run build` and inspect `.next/` output

---

## 9. Routing Logic

The website leverages Next.js App Router for file‑system based routing. Each `src/app` folder and file maps directly to URL paths:

* **Global Layout**:

  * `src/app/layout.tsx` defines wrappers (e.g., `<ThemeProvider>`, `<Navigation>`, `<Footer>`).
* **Pages**:

  * `/` → `src/app/page.tsx`
  * `/about` → `src/app/about/page.tsx`
  * `/contact` → `src/app/contact/page.tsx`
  * `/products-services` → `src/app/products-services/page.tsx`
  * `/privacy-policy` → `src/app/privacy-policy/page.tsx`
  * `/terms-conditions` → `src/app/terms-conditions/page.tsx`
  * `/terms-services` → `src/app/terms-services/page.tsx`
  * `/test` → `src/app/test/page.tsx`
* **Support Section**:

  * `/support/faq` → `src/app/support/faq/page.tsx`
  * `/support/help-center` → `src/app/support/help-center/page.tsx`
* **Utility Routes**:

  * **Custom 404**:

    * `not-found.tsx` under any segment folder triggers a 404 fallback.
    * `src/app/utility/error404/page.tsx` is referenced via custom `<NotFound>` logic.
  * **Sitemap**:

    * `/utility/sitemap` → `src/app/utility/sitemap/page.tsx` outputs XML.
* **404 Handling**:

  * Next.js automatically handles missing routes; use `not-found.tsx` to customize per-directory.
* **Policies &amp; Legal**:

  * `/privacy-policy`, `/terms-conditions`, `/terms-services` map to their respective page files.
* **Dynamic Routes**:

  * For future segments (e.g., blogs or product slugs), create `[slug]/page.tsx` under the segment folder:

    ```text
    src/app/<segment>/[slug]/page.tsx → /<segment>/<slug>
    ```

**Key Points:**

* Filenames `page.tsx` define a route; `layout.tsx` applies to that segment and all nested pages.
* Folder nesting yields URL nesting.
* Use `loading.tsx`, `error.tsx`, and `not-found.tsx` in any segment folder for granular data/state handling.

*End of Website Workspace Documentation*