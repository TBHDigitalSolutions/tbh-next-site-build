Official Title: Service Taxonomy Leaf vs Children Page Structure Guide
Domain: Web Development, Project Architecture
File Name: service-taxonomy_leaf-children-structure_guide_2025-09-13.md
Main Part: service-taxonomy
Qualifier: LeafChildrenStructureGuide
Date: 2025-09-13
Spotlight Comments:
- Explains the difference between "leaf" pages (endpoints) and pages with "children" (branches)
- Clarifies when to use HubTemplate vs ServiceTemplate based on page hierarchy
- Discusses optional SubHubTemplate and SubServiceTemplate for design variations

Summary: The Service Taxonomy Leaf vs Children Page Structure Guide clarifies the hierarchical structure of TBH Digital Solutions' service pages using tree terminology. It explains when pages are "leaves" (endpoints with no children) versus "branches" (hubs with sub-pages), defines appropriate template usage (HubTemplate for branches, ServiceTemplate for leaves), and discusses optional sub-templates for design variations, helping developers understand the site's information architecture and choose the correct templates for implementation.

---

Got it 👍 let’s slow this down and explain step-by-step, no jargon.

---

## 🌱 What’s a “leaf”?

Think of your services like a **tree**:

* A **hub** is like a **branch**.
  Example: `marketing`
  (It can have smaller branches or leaves hanging from it.)

* A **leaf** is the **end of the branch**.
  Example: `seo-services/technical-audit`
  (There’s nothing underneath it—it’s the final page a user can visit.)

* A page that has **children** means it has **branches hanging below it**.
  Example: `marketing/automation` has children like `platform-setup` or `lead-scoring`.

So:

* **HubTemplate** = used when the page **has children** (like a branch that still splits).
* **ServiceTemplate** = used when the page is a **leaf** (nothing underneath it).

---

## 🛠️ Optional templates (where it got confusing)

You currently have:

* `HubTemplate` (for branches with children).
* `ServiceTemplate` (for leaves).
* `SubHubTemplate` (like a second version of HubTemplate).
* `SubServiceTemplate` (like a second version of ServiceTemplate).

But here’s the truth:
👉 You don’t **need** SubHubTemplate or SubServiceTemplate unless you want those pages to **look different** from normal hubs or normal services.

That’s what I meant by “opinionated layout constraints.”

---

## ❓ Why would you keep them?

* If you want **all hubs** (top-level and sub-hubs) to look the same → you can just use `HubTemplate` everywhere.
* If you want **all services** (normal services and sub-services) to look the same → you can just use `ServiceTemplate` everywhere.

BUT…

* If you want **sub-services** to have a slightly different layout (say: smaller hero, tighter design, “how-to” style), then you’d keep `SubServiceTemplate`.
* If you want **sub-hubs** to emphasize different info (say: more intro text or a different card style), then you’d keep `SubHubTemplate`.

---

## ✅ Simplified takeaway

* **HubTemplate** → any page with children.
* **ServiceTemplate** → any page with no children (a leaf).
* **SubHubTemplate/SubServiceTemplate** → optional extras, only if you want a different *design* or *layout* for those cases.
* Otherwise, you can delete them and just reuse HubTemplate and ServiceTemplate everywhere.

---

Would it help if I drew a **tiny diagram (tree style)** showing hubs vs leaves and when each template would be used, so it’s super visual?
