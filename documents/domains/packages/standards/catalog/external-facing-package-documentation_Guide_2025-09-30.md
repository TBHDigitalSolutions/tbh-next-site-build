---

title: "External-Facing Package Documentation Guide"
domain: "docs"
file: "external-facing-package-documentation_Guide_2025-09-30.md"
main: "external-facing-package-documentation"
qualifier: "Guide"
date: "2025-09-30"
status: "Draft"
owners: ["@owner_name"]
tags: ["documentation", "packages", "templates"]
links:
  related:
    - "./documents-indexing-linking_Standard_YYYY-MM-DD.md"
    - "./documents-directory_RefactorPlan_YYYY-MM-DD.md"

---

External-Facing Package Documentation Guide

## **External-Facing Package Documentation Guide**

This document outlines the three essential versions of your external-facing service package content. Every package must have all three versions to ensure a consistent, scalable, and effective public presence across your website and sales materials.

---

### **1. The Overview**

The **SmartDAW Package Template** is a specialized tool for managing your public-facing service descriptions. It standardizes your content, ensuring a clear and consistent message for potential clients. The template captures critical details, from SEO tags to a compelling value proposition, ensuring your public-facing materials are consistent, on-brand, and optimized for conversion.

---

## **2. The Template**

This is the master **JSON template**. It's the blueprint for your documentation system, intended for developers and automated tools. The document uses `{{ double brackets }}` as placeholders for dynamic data and should **never be manually edited**.

The JSON structure is the machine-readable version of your public-facing content. It captures every field in a logical, hierarchical format that a system can easily parse and use to generate web pages, sales collateral, or other documents.

**Note on `is_public`:** The `internal_tiers` object includes an `is_public` flag for each tier. This boolean flag is a control for your content management system. A value of `true` tells your system that the tier should be rendered on a public-facing website, while `false` keeps the tier for internal reference only. This allows you to manage all tier data in one place while controlling public visibility.

**Why it's needed:** This standardized JSON format provides a clean data structure that enables your systems—like CRMs or pricing engines—to automatically generate documents. This ensures **data integrity** and **consistency** across all public-facing platforms while making your process scalable.

---

### **SmartDAW Package Template**

SmartDAW (Data/Analytics Workbench) Readme Template, structured to mirror the logical flow of a web page or sales sheet.

```json
{
  "meta": {
    "id": "{{ service }}-{{ slug }}",
    "slug": "{{ slug }}",
    "service": "{{ service }}",
    "category": "{{ Category }}",
    "tier": "{{ e.g., Essential | Premium | — }}",
    "badges": "{{ e.g., Popular | New | — }}",
    "tags": [
      "{{ tag1 }}",
      "{{ tag2 }}",
      "{{ tag3 }}"
    ]
  },
  "hero": {
    "seo": {
      "title": "{{ SEO title }}",
      "description": "{{ SEO description }}"
    },
    "summary": "{{ 1–2 sentence value proposition (concise). }}",
    "description": "{{ 1–3 short paragraphs elaborating benefits and context. }}",
    "image": {
      "src": "/images/packages/{{ slug }}-card.png",
      "alt": "{{ Package Name }} — preview"
    },
    "ctas": {
      "details": "/packages/{{ slug }}",
      "book_a_call": "/book",
      "request_proposal": "/contact"
    }
  },
  "why_you_need_this": {
    "pain_points": [
      "{{ pain point #1 }}",
      "{{ pain point #2 }}",
      "{{ pain point #3 }}"
    ],
    "purpose": "{{ what good looks like, business outcome }}",
    "icp": "{{ audience fit }}",
    "outcomes": [
      "{{ outcome #1 }}",
      "{{ outcome #2 }}",
      "{{ outcome #3 }}",
      "{{ outcome #4 }}"
    ]
  },
  "what_you_get": {
    "highlights": [
      "{{ feature #1 }}",
      "{{ feature #2 }}",
      "{{ feature #3 }}",
      "{{ feature #4 }}",
      "{{ feature #5 }}"
    ],
    "includes": [
      {
        "group_name": "{{ Group A }}",
        "bullets": [
          "{{ bullet A1 }}",
          "{{ bullet A2 }}",
          "{{ bullet A3 }}"
        ]
      },
      {
        "group_name": "{{ Group B }}",
        "bullets": [
          "{{ bullet B1 }}",
          "{{ bullet B2 }}"
        ]
      }
    ],
    "deliverables": [
      "{{ deliverable #1 }}",
      "{{ deliverable #2 }}",
      "{{ deliverable #3 }}"
    ]
  },
  "details_and_trust": {
    "pricing": {
      "oneTime": "{{ oneTime }}",
      "monthly": "{{ monthly }}",
      "currency": "USD"
    },
    "price_band": {
      "tagline": "{{ short marketing line }}",
      "base_note": "{{ 'proposal' | 'final' }}",
      "fine_print": "{{ e.g., '3-month minimum • + ad spend' }}"
    },
    "timeline": {
      "setup": "{{ x–y }} business days",
      "launch": "{{ e.g., 'First 30-day cadence live after X' }}",
      "ongoing": "{{ cadence }}"
    },
    "requirements": [
      "{{ access/integrations needed, e.g., CRM admin, DNS, GA4, etc. }}"
    ],
    "caveats": [
      "{{ guardrail #1 }}",
      "{{ guardrail #2 }}"
    ]
  },
  "next_step": {
    "faqs": [
      {
        "q": "{{ question 1 }}",
        "a": "{{ concise answer }}"
      },
      {
        "q": "{{ question 2 }}",
        "a": "{{ concise answer }}"
      }
    ],
    "cross_sell": {
      "related": [
        "{{ related-slug-1 }}",
        "{{ related-slug-2 }}"
      ],
      "add_ons": [
        "{{ add-on-slug-1 }}",
        "{{ add-on-slug-2 }}"
      ]
    },
    "notes": "{{ short ethics / limits / timeline note }}"
  },
  "internal_tiers": [
    {
      "name": "{{ Tier Name }}",
      "best_for": "{{ brief description of target client }}",
      "problem_solved": "{{ client's problem in their own words }}",
      "includes": [
        "{{ bulleted deliverable #1 }}",
        "{{ bulleted deliverable #2 }}",
        "{{ bulleted deliverable #3 }}"
      ],
      "price": {
        "oneTime": "{{ oneTime }}",
        "monthly": "{{ monthly }}",
        "currency": "USD"
      },
      "is_public": true
    },
    {
      "name": "{{ Tier Name }}",
      "best_for": "{{ brief description of target client }}",
      "problem_solved": "{{ client's problem in their own words }}",
      "includes": [
        "{{ bulleted deliverable #1 }}",
        "{{ bulleted deliverable #2 }}"
      ],
      "price": {
        "oneTime": "{{ oneTime }}",
        "monthly": "{{ monthly }}",
        "currency": "USD"
      },
      "is_public": false
    }
  ]
}
```

---

### **3. The Populated Template (Developer Use Only)**

This version contains all the specific data for a single package. It is a concrete example of a filled-out JSON template that developers can use to validate the data structure and ensure information is ready for implementation. This file is **not for human review or manual editing**.

**Why it's needed:** This populated template provides a concrete example for developers, ensuring a flawless handover of information from the content team to the engineering team. It serves as a test case to confirm that your data is correctly aligned with system requirements.

### **SmartDAW Package Template**

{
  "meta": {
    "id": "seo-llm-answers",
    "slug": "llm-answer-seo",
    "service": "seo",
    "category": "LLM SEO",
    "tier": "Essential",
    "badges": "Popular",
    "tags": [
      "llm",
      "ai-search",
      "featured-snippets"
    ]
  },
  "hero": {
    "seo": {
      "title": "Dominate AI Search & Featured Snippets | [Your Company]",
      "description": "Capture the top-ranking answers on Google and leading AI platforms. Our LLM SEO service optimizes your content for conversational search to boost visibility."
    },
    "summary": "We optimize your content to rank as the top answer on AI platforms and Google's featured snippets.",
    "description": "Capture the top-ranking answer for your most valuable questions. We optimize your content for conversational search and featured snippets to dominate AI-powered search results and attract high-intent traffic.",
    "image": {
      "src": "/images/packages/llm-answer-seo-card.png",
      "alt": "LLM Answer SEO — featured snippet optimization preview"
    },
    "ctas": {
      "details": "/packages/llm-answer-seo",
      "book_a_call": "/book",
      "request_proposal": "/contact"
    }
  },
  "why_you_need_this": {
    "pain_points": [
      "Your competitors are appearing in featured snippets and AI-generated answers.",
      "You're not capturing traffic from conversational or voice search queries.",
      "Your content isn't structured for AI and you're falling behind in the new search landscape."
    ],
    "purpose": "Our service is designed to make your content the authoritative source for AI-powered search, leading to higher visibility, qualified traffic, and a powerful competitive advantage in the modern search ecosystem.",
    "icp": "This is for businesses that want to dominate emerging search platforms and be the trusted source for their most valuable questions.",
    "outcomes": [
      "Increased Visibility: Achieve higher placement in AI-driven answers and featured snippets.",
      "Qualified Traffic: Attract high-intent users with relevant, conversational queries.",
      "Content Authority: Position your brand as a trusted authority on key topics."
    ]
  },
  "what_you_get": {
    "highlights": [
      "Dominate AI-powered search results",
      "Boost visibility for conversational queries",
      "Gain authority with answer ranking analysis",
      "Get a clear content roadmap for AI readiness"
    ],
    "includes": [
      {
        "group_name": "Core Optimization",
        "bullets": [
          "LLM response optimization and on-page content formatting."
        ]
      },
      {
        "group_name": "Targeting",
        "bullets": [
          "Targeted strategy for featured snippets and specific answer passages."
        ]
      },
      {
        "group_name": "Research",
        "bullets": [
          "Conversational intent mapping to align content with user questions."
        ]
      },
      {
        "group_name": "Reporting",
        "bullets": [
          "Monthly performance and opportunity reports."
        ]
      }
    ],
    "deliverables": [
      "Monthly AI-answer placement report",
      "Conversational query map",
      "On-page guidance for AI-ready formatting"
    ]
  },
  "details_and_trust": {
    "pricing": {
      "oneTime": null,
      "monthly": 2500,
      "currency": "USD"
    },
    "price_band": {
      "tagline": "The essential package for a strong AI-first presence.",
      "base_note": "proposal",
      "fine_print": null
    },
    "timeline": {
      "setup": "5–10 business days",
      "launch": null,
      "ongoing": "Monthly reporting and optimization cadence."
    },
    "requirements": [
      "Access to Google Search Console",
      "Access to Google Analytics (GA4)",
      "CMS access for on-page updates"
    ],
    "caveats": [
      "Tactics are continuously updated to stay compliant with the latest AI search platform guidelines.",
      "Platform algorithms evolve quickly; results may vary."
    ]
  },
  "next_step": {
    "faqs": [
      {
        "q": "How quickly will I see results?",
        "a": "While results can vary, clients typically see initial placement improvements within the first 60–90 days as search engines re-index your optimized content."
      },
      {
        "q": "Is this different from traditional SEO?",
        "a": "Yes, it’s a specialized form of on-page SEO focused on the specific signals AI models and snippet algorithms use, working alongside your traditional SEO efforts."
      }
    ],
    "cross_sell": {
      "related": [
        "content-strategy-services",
        "technical-seo-audit"
      ],
      "add_ons": [
        "advanced-keyword-research",
        "competitor-ai-gap-analysis"
      ]
    },
    "notes": null
  },
  "internal_tiers": [
    {
      "name": "Starter: Foundational AI Optimization",
      "price": {
        "oneTime": null,
        "monthly": 2500,
        "currency": "USD"
      }
    },
    {
      "name": "Professional: Advanced AI Positioning",
      "price": {
        "oneTime": null,
        "monthly": 4500,
        "currency": "USD"
      }
    },
    {
      "name": "Enterprise: Full-Scale LLM Strategy",
      "price": {
        "oneTime": null,
        "monthly": 8500,
        "currency": "USD"
      }
    }
  ]
}

---

### **Markdown Template Format for External Packages**

---

### **4. The Markdown Template (For Content Writers)**

This is the **fill-in-the-blanks**, human-readable template for creating external package content. It's designed for your sales and marketing teams to quickly author new service package copy without needing to understand the underlying technical structure.

**Why it's needed:** This template is the starting point for all new public-facing content. It ensures that content creators follow a consistent structure, which makes it easy for developers to convert the final copy into the machine-readable JSON format, maintaining data integrity.

```markdown
## 🟢 {{ Package Name }} - Marketing Template

**ID:** `{{ service }}-{{ slug }}`
**Slug:** `{{ slug }}`
**Service:** `{{ service }}` **Category:** {{ Category }}
**Tier (optional):** {{ e.g., Essential | Premium | — }}
**Badges (optional):** {{ e.g., Popular | New | — }}
**Tags:** {{ tag1 }}, {{ tag2 }}{{ tag3 ? `, ${tag3}` : "" }}

---

### Phase 1: The Hero Section (Top of the Page)

**SEO:**
* **title:** {{ SEO title }}
* **description:** {{ SEO description }}

**Summary (short; used on card + detail headline):**
{{ 1–2 sentence value proposition (concise). }}

**Description (longer; used on detail body/hero):**
{{ 1–3 short paragraphs elaborating benefits and context. }}

**Image (optional):**
* **src:** `/images/packages/{{ slug }}-card.png`
* **alt:** `{{ Package Name }} — preview`

**CTAs (links only; labels standardized):**
* **Details:** `/packages/{{ slug }}`
* **Book a call:** `/book`
* **Request proposal (detail page):** `/contact`

---

### Phase 2: The "Why You Need This" Section

**Pain Points (optional):**
* {{ pain point #1 }}
* {{ pain point #2 }}
* {{ pain point #3 }}

**Purpose (success in one paragraph):**
{{ what good looks like, business outcome }}

**ICP (Who it's for, one sentence):**
{{ audience fit }}

**Outcomes (KPIs you can expect):**
* {{ outcome #1 }}
* {{ outcome #2 }}
* {{ outcome #3 }}
* {{ outcome #4 }}

---

### Phase 3: The "What You Get" Section

**Highlights / Features (top 5 appear on card):**
* {{ feature #1 }}
* {{ feature #2 }}
* {{ feature #3 }}
* {{ feature #4 }}
* {{ feature #5 }}

**What’s Included (grouped bullets for the includes table):**
* **{{ Group A }}:** {{ bullet A1 }}, {{ bullet A2 }}{{ bullet A3 ? `, ${bullet A3}` : "" }}
* **{{ Group B }}:** {{ bullet B1 }}, {{ bullet B2 }}
* **{{ Group C }} (optional):** {{ bullet C1 }}, {{ bullet C2 }}
* **{{ Group D }} (optional):** {{ bullet D1 }}, {{ bullet D2 }}

**Deliverables (optional):**
* {{ deliverable #1 }}
* {{ deliverable #2 }}
* {{ deliverable #3 }}

---

### Phase 4: The "Details & Trust" Section

**Pricing (canonical JSON):**
{ {{ oneTime ? `"oneTime": ${oneTime}, ` : "" }}{{ monthly ? `"monthly": ${monthly}, ` : "" }}"currency": "USD" }

**Price Band (optional):**
* **Tagline (detail only):** {{ short marketing line }}
* **Base note:** {{ "proposal" | "final" }}
* **Fine print (detail only):** {{ e.g., "3-month minimum • + ad spend" }}

> Authoring notes:
> - Tagline does **not** auto-pull from Summary. If omitted, the detail band shows **no** tagline.
> - If **Base note** is omitted, the UI defaults to **"proposal"** (monthly/hybrid) and **"final"** (one-time-only).

**Timeline / Turnaround (optional):**
* Setup: **{{ x–y }} business days**
* Launch: {{ e.g., “First 30-day cadence live after X” }}
* Ongoing: {{ cadence }}

**Requirements (optional):**
* {{ access/integrations needed, e.g., CRM admin, DNS, GA4, etc. }}

**Caveats / Limits & Ethics (optional):**
* {{ guardrail #1 }}
* {{ guardrail #2 }}

---

### Phase 5: The "Next Step" Section

**FAQs (optional):**
* **Q:** {{ question 1 }}
  **A:** {{ concise answer }}
* **Q:** {{ question 2 }}
  **A:** {{ concise answer }}

**Cross-sell (optional):**
* **Related:** {{ related-slug-1 }}, {{ related-slug-2 }}
* **Add-ons:** {{ add-on-slug-1 }}, {{ add-on-slug-2 }}

**Notes (optional; small print under includes table):**
{{ short ethics / limits / timeline note }}

---

### Internal Tiers (optional; not rendered publicly)

[
  { "name": "Starter", "price": { {{ oneTime ? `"oneTime": ${oneTime}, ` : "" }}{{ monthly ? `"monthly": ${monthly}, ` : "" }}"currency": "USD" } },
  { "name": "Professional", "price": { "oneTime": {{ pOneTime ?? 0 }}, "monthly": {{ pMonthly ?? 0 }}, "currency": "USD" } },
  { "name": "Enterprise", "price": { "oneTime": {{ eOneTime ?? 0 }}, "monthly": {{ eMonthly ?? 0 }}, "currency": "USD" } }
]
```

---

### **5. The Populated Markdown (For All Team Members)**

This is the final, human-readable document that is **generated from the master JSON file**. It's designed to be used by your sales team, marketing specialists, and anyone else who needs to quickly reference the definitive, public-facing package details.

**Why it's needed:** This document serves as the **single source of truth** for all public-facing content, providing a trusted reference for internal communication and team collaboration. It is the final, approved output of the documentation process, ensuring that the content being shared is always consistent.

```markdown
## 🟢 LLM Answer SEO Services (PUBLIC PACKAGE)

**ID:** `seo-llm-answers`
**Slug:** `llm-answer-seo`
**Service:** `seo`
**Category:** LLM SEO
**Tier (optional):** Essential
**Badges (optional):** Popular
**Tags:** `llm`, `ai-search`, `featured-snippets`

---

### Phase 1: The Hero Section

**SEO:**
* **title:** Dominate AI Search & Featured Snippets | [Your Company]
* **description:** Capture the top-ranking answers on Google and leading AI platforms. Our LLM SEO service optimizes your content for conversational search to boost visibility.

**Summary (short; used on card + detail headline):**
We optimize your content to rank as the top answer on AI platforms and Google's featured snippets.

**Description (longer; used on detail body/hero):**
Capture the top-ranking answer for your most valuable questions. We optimize your content for conversational search and featured snippets to dominate AI-powered search results and attract high-intent traffic.

**Image (optional):**
* **src:** `/images/packages/llm-answer-seo-card.png`
* **alt:** `LLM Answer SEO — featured snippet optimization preview`

**CTAs (links only; labels standardized):**
* **Details:** `/packages/llm-answer-seo`
* **Book a call:** `/book`
* **Request proposal (detail page):** `/contact`

---

### Phase 2: The "Why You Need This" Section

**Pain Points (optional):**
* Your competitors are appearing in featured snippets and AI-generated answers.
* You're not capturing traffic from conversational or voice search queries.
* Your content isn't structured for AI and you're falling behind in the new search landscape.

**Purpose (success in one paragraph):**
Our service is designed to make your content the authoritative source for AI-powered search, leading to higher visibility, qualified traffic, and a powerful competitive advantage in the modern search ecosystem.

**ICP (Who it's for, one sentence):**
This is for businesses that want to dominate emerging search platforms and be the trusted source for their most valuable questions.

**Outcomes (KPIs you can expect):**
* **Increased Visibility:** Achieve higher placement in AI-driven answers and featured snippets.
* **Qualified Traffic:** Attract high-intent users with relevant, conversational queries.
* **Content Authority:** Position your brand as a trusted authority on key topics.

---

### Phase 3: The "What You Get" Section

**Highlights / Features (top 5 appear on card):**
* Dominate AI-powered search results
* Boost visibility for conversational queries
* Gain authority with answer ranking analysis
* Get a clear content roadmap for AI readiness

**What’s Included (grouped bullets for the includes table):**
* **Core Optimization:** LLM response optimization and on-page content formatting.
* **Targeting:** Targeted strategy for featured snippets and specific answer passages.
* **Research:** Conversational intent mapping to align content with user questions.
* **Reporting:** Monthly performance and opportunity reports.

**Deliverables (optional):**
* Monthly AI-answer placement report
* Conversational query map
* On-page guidance for AI-ready formatting

---

### Phase 4: The "Details & Trust" Section

**Pricing (canonical JSON):**
{ "monthly": 2500, "currency": "USD" }

**Price Band (optional):**
* **Tagline (detail only):** The essential package for a strong AI-first presence.
* **Base note:** `proposal`
* **Fine print (detail only):**

**Timeline / Turnaround (optional):**
* **Setup:** 5–10 business days
* **Ongoing:** Monthly reporting and optimization cadence.

**Requirements (optional):**
* Access to Google Search Console
* Access to Google Analytics (GA4)
* CMS access for on-page updates

**Caveats / Limits & Ethics (optional):**
* Tactics are continuously updated to stay compliant with the latest AI search platform guidelines.
* Platform algorithms evolve quickly; results may vary.

---

### Phase 5: The "Next Step" Section

**FAQs (optional):**
* **Q:** How quickly will I see results?
  **A:** While results can vary, clients typically see initial placement improvements within the first 60–90 days as search engines re-index your optimized content.
* **Q:** Is this different from traditional SEO?
  **A:** Yes, it’s a specialized form of on-page SEO focused on the specific signals AI models and snippet algorithms use, working alongside your traditional SEO efforts.

**Cross-sell (optional):**
* **Related:** `content-strategy-services`, `technical-seo-audit`
* **Add-ons:** `advanced-keyword-research`, `competitor-ai-gap-analysis`

---

### Internal Tiers (optional; not rendered publicly)

* **Starter: Foundational AI Optimization**
  * **Best for:** Businesses targeting AI-powered featured snippets.
  * **Problem Solved:** "We want to appear in AI search results but don't know where to start."
  * **Price:** `{ "monthly": 2500, "currency": "USD" }`

* **Professional: Advanced AI Positioning**
  * **Best for:** Companies optimizing for multiple AI platforms.
  * **Problem Solved:** "We need to capture top-tier AI placements across all major platforms."
  * **Price:** `{ "monthly": 4500, "currency": "USD" }`

* **Enterprise: Full-Scale LLM Strategy**
  * **Best for:** Organizations with complex, comprehensive AI search needs.
  * **Problem Solved:** "We need a complete AI search strategy to gain a competitive advantage."
  * **Price:** `{ "monthly": 8500, "currency": "USD" }`

**Quoting Notes (internal):**
* **Upsell to Pro if:** The client has more than 10 target intents per month or requires optimization for more than two AI platforms.
* **Upsell to Enterprise if:** The project requires multi-language optimization, governance deliverables, or weekly strategist time.
* **Discounts:** Sales ≤10%; 10–20% Manager; >20% Director approval.
* **Effective:** 2025-01-01
* **Review by:** 2025-06-01

```