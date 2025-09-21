You are a document processing assistant. Your task is to analyze a provided document and generate a structured output based on the following criteria.

For each document, you will provide:

Official Title: The full, formal title of the document.

Domain: The associated business or functional area the document addresses (e.g., services, portfolio, packages, legal pages, components).

File Name: A properly formatted file name using the kebab-main_Pascal-qualifier_YYYY-MM-DD.ext convention.

Main Part: A descriptive, kebab-case identifier of the document's core subject.

Qualifier: A PascalCase term that specifies the version, type, or stage of the document.

Date: The date in YYYY-MM-DD format, reflecting the document's relevance.

Spotlight Comments: A brief, 1-3 line note or a few bullet points providing key context, status, or cross-references.

Summary: A concise 1-2 paragraph summary detailing the document's contents and its intended use.
---
DOCUMENT:
---

Here’s the clean way to separate them:

# Marketing SEO vs. Web-Development SEO

| Dimension    | **Marketing SEO**                                                                                                                                         | **Web-Development SEO**                                                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core goal    | Capture demand with relevance & authority                                                                                                                 | Make the site fast, crawlable, and indexable                                                                                                                                                                   |
| Scope        | Keyword/intent strategy, content, on-page messaging, internal linking, PR/link earning, local/search features                                             | IA & routing, Core Web Vitals, server-rendering/ISR, canonicalization, indexation controls, structured-data implementation, redirects, pagination, image perf, sitemaps/robots                                 |
| Typical work | Keyword universe → topic clusters → briefs; title/meta patterns; headers & copy; link plan; SERP feature targeting (FAQs, How-tos, video); local profiles | Site architecture; Next.js rendering strategy; performance budgets; schema JSON-LD components; canonical/hreflang; XML sitemaps; robots/meta robots; 3xx/4xx hygiene; faceted nav; log-file/crawl budget fixes |
| Deliverables | KW map, content calendar & briefs, on-page recs, internal-link blueprint, PR/link list, local SEO plan                                                    | Technical audit/backlog, IA & routing map, SEO meta/schema components, redirect map, performance fixes, monitoring & alerts                                                                                    |
| Primary KPIs | Non-brand organic sessions, rankings, CTR, qualified leads/conversions, assisted pipeline                                                                 | CWV pass rate (LCP/INP/CLS), index coverage, crawl errors/duplication, page speed, 404/redirect quality, organic CVR lift from speed/UX                                                                        |
| Time horizon | Ongoing editorial/program                                                                                                                                 | Foundational sprints + ongoing hardening                                                                                                                                                                       |

## RACI (who owns what)

* **Keyword & intent research** → **Marketing SEO (R/A)**; Dev (C)
* **Title/meta rules & copy** → Marketing (R), Dev templates (A)
* **Content briefs & publishing** → Marketing (R/A); Dev provides CMS components (C)
* **Internal linking** → Marketing plan (R); Dev builds linkable modules/nav (C)
* **Structured data (schema)** → Marketing chooses types/fields (R); **Dev implements JSON-LD** (A)
* **Core Web Vitals & performance** → **Dev (R/A)**; Marketing (C, sets thresholds)
* **Indexation controls (canonicals, robots, sitemaps, hreflang)** → **Dev (R/A)**; Marketing (C, verifies intent)
* **Migrations/redirect maps** → **Dev (A)** with Marketing providing URL strategy and QA (R/C)
* **Analytics/consent/server-side events** → **Dev (R/A)**; Marketing (C, specifies KPIs)

## Handshake artifacts that keep them in sync

* **SEO Requirements doc per page/template** (fields for title/meta, H1, canonical, schema type/props).
* **Technical SEO backlog** (tickets with acceptance criteria for CWV, routing, canonicals, etc.).
* **Content brief template** (target query set, outline, entities, internal links, schema fields).
* **Release QA checklist** (crawl, indexability, CWV, canonicals, schema validation, 404/301s).

## How to position on your site

* **“SEO Services” page** = **Marketing SEO** offer (strategy, content, on-page, authority, local/video).
* **“Web Development” page** = **Web-Dev SEO** offer (technical SEO, speed, rendering, architecture, schema implementation, tracking).

Short version: **Marketing SEO decides *what* to rank for and *why*; Web-Dev SEO makes sure the site can *be* ranked—fast, clean, and technically correct.** They overlap on on-page details and schema, but ownership is split: **Marketing specifies; Dev implements.**
