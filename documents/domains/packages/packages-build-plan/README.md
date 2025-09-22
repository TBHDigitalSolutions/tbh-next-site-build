Here’s a **production-ready official documentation draft** you can drop into your repo (e.g., under `documents/domains/packages/Packages-Domain_Source-MD-Review-SSOT-Mapping_2025-09-21.md` or create a dedicated `README.md`). It clearly explains the purpose and responsibilities of your **data directory TS files**, **content directory MDX files**, and **documents directory reference markdowns**.

---

# 📑 Official Documentation — Packages Data, Content, and Documents Directories

This documentation defines the roles and responsibilities of the different package file types across the **`data`**, **`content`**, and **`documents`** directories in the TBH Next Site Build.

---

## 1. `/src/data/packages`

The `data` directory provides the **source of truth for structured data**. All TypeScript (`.ts`) and JSON files here are used by the application runtime.

### ✅ When to Use

Use these files when you need:

* **Structured package data** (pricing, IDs, features, etc.)
* **Application logic and validation**
* **Consistent typing across services**

### 📂 What They Contain

* **Core Package Files** (`*-packages.ts`):
  Define the main packages for each service (e.g., content-production, marketing, SEO). Contain structured objects with IDs, names, pricing, deliverables.

* **Add-On Files** (`*-addons.ts`):
  Contain optional upsell modules associated with a service.

* **Featured Files** (`*-featured.ts`):
  Curated or highlighted packages for specific marketing/promotional use cases.

* **Bundles** (`bundles/*.ts`):
  Integrated cross-service solutions (e.g., e-commerce accelerator).

* **JSON Index Files** (`packages.json`, `bundles.json`, `featured.json`):
  Aggregate data for search, navigation, and runtime consumption.

* **Validators & Types** (`_types/`, `_validators/`):
  Enforce schemas, types, and validation rules for package objects.

* **Utils** (`_utils/`):
  Helper functions for IDs, slugs, and mapping logic.

### 🛠️ Responsibility

The **data layer** is responsible for:

* Ensuring packages are valid and consistent.
* Providing data for search, filtering, pricing, and UI rendering.
* Defining the “single source of truth” for what packages exist.

---

## 2. `/src/content/packages`

The `content` directory provides **narrative descriptions and marketing copy** for the packages. Files here are written in **Markdown/MDX** and are **content-facing** rather than **data-facing**.

### ✅ When to Use

Use these files when you need:

* **Client-facing package descriptions** (web pages, marketing collateral).
* **Detailed explanations of packages** with prose, headings, and lists.
* **Human-readable documentation** to explain the packages.

### 📂 What They Contain

* **Service-Specific MDX Files** (`services/*/*.mdx`):

  * `*-packages.mdx`: Overview of core packages.
  * `*-addons.mdx`: Descriptions of optional add-ons.
  * `*-featured.mdx`: Highlighted promotional or featured packages.

* **Bundles MDX Files** (`bundles/*.mdx`):
  Explain integrated multi-service bundles for business problems.

* **Overviews** (`overviews/*.mdx`):
  Higher-level documents like Integrated Growth Packages.

### 🛠️ Responsibility

The **content layer** is responsible for:

* Communicating packages in a **marketing-friendly, client-facing way**.
* Providing **copywriting, storytelling, and presentation**.
* Serving as the **frontend content source** for rendering package pages.

⚠️ **Note:** These files do not control business logic or data validation. They are for **display only**.

---

## 3. `/documents/domains/packages`

The `documents` directory is for **internal reference documentation**. These files are **not consumed by the app runtime** and exist purely for **documentation, planning, and reference**.

### ✅ When to Use

Use these when you need:

* **Authoritative internal documentation** about packages.
* **Pricing rules, copywriting, and service details** to reference when updating data or content files.
* **Implementation guides and planning specs**.

### 📂 What They Contain

* **Build Plans** (`packages-build-plan/`):
  Technical documents covering routing, layouts, authoring, and rules for building packages.

* **Core Service Package Documentation** (`packages-data-and-content/core-services-packages/*`):
  Each service (content-production, SEO, video-production, etc.) has:

  * `*-packages.md` → Core package breakdowns.
  * `*-add-ons.md` → Optional add-on descriptions.
  * `*-featured-packages.md` → Featured offerings.
  * `*-bundles.md` → Multi-package bundles.

* **Cross-Service Packages** (`cross-service/`):
  Bundles and add-ons that span multiple services.

### 🛠️ Responsibility

The **documents layer** is responsible for:

* Providing the **official internal copy** of package details, pricing, and descriptions.
* Acting as a **reference SSOT (single source of truth)** for creating/updating `data` and `content` files.
* Ensuring alignment between marketing copy and structured data.

⚠️ **Note:** These files are **not used directly in the app**. They are for **internal documentation only**.

---

## 4. 🔄 How They Work Together

1. **Documents → Data**
   Internal markdown defines the *official copy & pricing*. This is the reference when writing or updating `.ts` files in `/src/data/packages`.

2. **Data → Content**
   TypeScript files define the structured data. MDX files provide human-friendly descriptions of that same data for frontend display.

3. **Content → Client**
   MDX files render into client-facing package pages, ensuring consistency with the data layer.

---

## ✅ Summary of Responsibilities

| Layer         | Format          | Purpose                                     | Consumed By                 | Example Files                                                               |
| ------------- | --------------- | ------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| **Data**      | `.ts` / `.json` | Structured data, validation, runtime logic  | Application runtime         | `seo-services-packages.ts`, `bundles.json`                                  |
| **Content**   | `.mdx`          | Client-facing copy, marketing presentation  | Frontend rendering          | `seo-services-packages.mdx`, `event-launch-domination.mdx`                  |
| **Documents** | `.md`           | Internal reference, official copy & pricing | Humans only (docs/planning) | `seo-services-packages.md`, `packages-app-pages-layouts_Plan_2025-09-21.md` |

---

👉 Would you like me to also **generate a starter `README.md`** in `src/data/packages` and `src/content/packages` that summarizes this same guidance for devs working directly in those folders? That way they always know which files to edit vs. reference.
