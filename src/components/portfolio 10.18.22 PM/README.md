Got it ✅
Here’s the **production-ready `README.md`** for your **`/src/components/portfolio`** module. It covers the entire directory, explains roles of each sub-folder, how data flows, how adapters and validators are used, and usage examples.

---

# Portfolio Module

The `portfolio` module implements a complete, type-safe system for displaying, searching, and interacting with portfolio projects across hubs, categories, and individual items.

It is built around **composition**:

* **Data layer** (`/src/data/portfolio`) defines canonical project data.
* **Adapters** map raw data into component props.
* **Validators** enforce correctness.
* **Components** render consistent UI (hub, categories, galleries, modals, etc.).

---

## 📂 Directory Structure

```
/src/components/portfolio
├── adapters.ts                     # Shared portfolio adapters
├── index.ts                        # Barrel exports for all portfolio components
├── mediaViewers/                   # Media-specific renderers (image, video, pdf, interactive)
├── ModalShell/                     # Generic accessible modal shell
├── PortfolioHubClient.tsx          # Hub client (global search + category highlights)
├── PortfolioHubClient.types.ts     # Typed props for hub client
├── PortfolioModal/                 # Single-project modal with metrics & media
├── PortfolioOverviewSection/       # Section-level overview component
├── PortfolioOverviewText/          # Overview text-only component
├── PortfolioStatsSection/          # Stats/metrics display section
├── StandardPortfolioGallery/       # Grid-based gallery view
├── types.ts                        # Shared types & config re-exports
└── UniversalPortfolioModal/        # Flexible modal that supports any media type
```

---

## 🔑 Core Concepts

### **Types & Contracts**

* `types.ts` re-exports canonical types from `/data/portfolio` and adds UI-specific types (`GalleryProps`, `ModalState`, etc.).
* Type guards (`isValidProject`, `isMediaType`, …) are provided for runtime safety.

### **Adapters**

* Each sub-module has an `adapters.ts`.
* Purpose: map **data layer shape → component props shape**.
  Example: converting `Project[]` into `{ items, variant }` for `StandardPortfolioGallery`.

### **Validators**

* Lightweight Zod (or TS runtime) schemas live in each module’s `utils/`.
* Prevent runtime errors by validating union types (`media.type`) and coercing metrics to strings.

### **MediaViewers**

* Dedicated viewers for each media type:

  * `ImageViewer`
  * `VideoViewer`
  * `PDFViewer`
  * `InteractiveViewer`
* Centralized in `registry.ts` with a `getMediaViewer()` helper.

### **ModalShell**

* Accessible, reusable modal container.
* Provides focus trap, keyboard navigation, and scroll-lock.
* Used by both `PortfolioModal` and `UniversalPortfolioModal`.

---

## 🧩 Components

### 1. **PortfolioHubClient**

* Entry point for `/portfolio` page.
* Orchestrates:

  * **Global search** (search across all projects).
  * **Category highlights** (featured projects per category).
  * Opens `PortfolioModal` for project details.

```tsx
<PortfolioHubClient
  allItems={allProjects}
  categoryHighlights={categoryHighlights}
/>
```

---

### 2. **PortfolioModal**

* Displays a single project with:

  * Media (via appropriate MediaViewer)
  * Metrics
  * Tags
  * Navigation (prev/next)
* Uses `portfolioModalValidator.ts` to guard props.

---

### 3. **UniversalPortfolioModal**

* More flexible modal than `PortfolioModal`.
* Can accept **any project shape**, not just canonical `Project`.
* Adapter + validator ensure consistency.

---

### 4. **StandardPortfolioGallery**

* Grid display of projects.
* Supports optional filters/search.
* Each item opens a modal when clicked.

---

### 5. **PortfolioOverviewSection / PortfolioOverviewText**

* Overview sections for service pages.
* Text + optional stats.
* Use **adapters** to stay aligned with data contracts.

---

### 6. **PortfolioStatsSection**

* Displays KPIs, stats, or achievement highlights.
* Accepts a list of stats objects from data layer.

---

### 7. **ModalShell**

* Generic wrapper for all modals.
* Handles:

  * Focus management
  * Escape key to close
  * Backdrop click behavior

---

## 📦 Data Handling

1. **Define projects in `/src/data/portfolio`**

   ```ts
   export const webDevProjects: Project[] = [
     {
       id: "alpha",
       title: "Alpha SaaS Platform",
       description: "Real-time collaboration React app",
       category: "web-development",
       client: "Alpha Inc.",
       media: {
         type: "interactive",
         src: "https://alpha-demo.example.com",
         thumbnail: "/portfolio/web-dev/alpha-thumb.jpg",
         title: "Alpha SaaS Platform Demo"
       },
       metrics: [
         { label: "Performance Score", value: "98/100" }
       ],
       tags: ["react", "saas", "real-time"]
     }
   ]
   ```

2. **Pass data via adapters**

   ```ts
   import { mapProjectsToGalleryProps } from "@/components/portfolio/StandardPortfolioGallery/adapters";

   const galleryProps = mapProjectsToGalleryProps(webDevProjects);
   <StandardPortfolioGallery {...galleryProps} />
   ```

3. **Open in modal**

   * `PortfolioModal` for strict canonical projects.
   * `UniversalPortfolioModal` for looser/varied data.

---

## ⚡ Usage Examples

### Render a hub page

```tsx
import { PortfolioHubClient } from "@/components/portfolio";

<PortfolioHubClient
  allItems={allProjects}
  categoryHighlights={[
    { category: webDevCategory, highlights: webDevProjects.slice(0, 3) },
    { category: seoCategory, highlights: seoProjects.slice(0, 3) }
  ]}
/>
```

### Show a single gallery

```tsx
import { StandardPortfolioGallery } from "@/components/portfolio";

<StandardPortfolioGallery items={seoProjects} variant="gallery" />
```

### Open project in Universal Modal

```tsx
<UniversalPortfolioModal
  isOpen={true}
  project={seoProjects[0]}
  onClose={() => setOpen(false)}
/>
```

---

## ✅ Best Practices

* **Always go through adapters** → never feed raw data directly.
* **Use validators** when consuming mixed/remote data.
* **Prefer `UniversalPortfolioModal`** if you anticipate custom or irregular project data.
* **Keep `PortfolioHubClient` thin** → logic should live in data/adapters.

---

Would you like me to also **add inline usage docs** (short `README.md`) **inside each sub-folder** (`PortfolioModal/`, `UniversalPortfolioModal/`, etc.) so contributors don’t have to jump back to this root README?
