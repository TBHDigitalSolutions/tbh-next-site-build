-----

**Official Title:** Internal Pricing Documentation Guide
**Domain:** documentation
**File Name:** internal-pricing-docs_Guide_2025-09-30.md
**Main Part:** internal-pricing-docs
**Qualifier:** Guide
**Date:** 2025-09-30

**Spotlight Comments:**

  - Defines standards for internal service package documentation
  - Includes templates for developer and human-readable formats
  - Ensures consistent quoting and sales across all service packages

**Summary:**
This document is the **single source of truth** for creating and managing internal service package documentation. It outlines the three essential versions of each document—template, populated template, and human-readable format—to ensure a consistent, scalable, and effective sales process.

## See also

  - [LLM Answer SEO Services Package - Populated Template](https://www.google.com/search?q=./seo-llm-answers_Internal_2025-09-30.md)
  - [External-Facing Package Documentation Guide](https://www.google.com/search?q=./external-facing-docs_Guide_2025-09-30.md)

-----

## **Internal Pricing Documentation Guide**

This document outlines the three essential versions of your service package pricing and explains their distinct purposes. Every service package must have all three versions to ensure a consistent, scalable, and effective sales process.

---

### **1. The Overview**

The **InternalPricingDAW (Data/Analytics Workbench) Template** is a specialized tool for managing your service pricing and sales strategy. It standardizes how your team quotes and sells, providing a clear, structured framework for each service tier. The template captures essential internal details, including upsell triggers and pricing notes, ensuring your sales process is consistent, scalable, and focused on moving clients toward higher-value packages.

---

### **2. The Template (For Developers)**

This is the master **JSON template**. It's the blueprint for your documentation system and is intended for developers and automated tools. The document uses `{{ double brackets }}` as placeholders for dynamic data. It should **never be manually edited**.

**Why it's needed:** This standardized JSON format provides a clean data structure that enables your systems—like CRMs or pricing engines—to automatically generate documents. This ensures data integrity and consistency while making your process scalable.

### **InternalPricingDAW (Data/Analytics Workbench) Template**

**ID:** `{{ service }}-{{ slug }}`
**Service:** `{{ service }}`
**Category:** {{ Category }}
**Tags:** {{ Tags }}

---

### **Pricing & Tiers**

[
  { "name": "{{ Tier Name }}",
    "best_for": "{{ brief description of target client }}",
    "problem_solved": "{{ client's problem in their own words }}",
    "includes": [
      "{{ bulleted deliverable #1 }}",
      "{{ bulleted deliverable #2 }}",
      "{{ bulleted deliverable #3 }}"
    ],
    "price": { {{ oneTime ? `"oneTime": ${oneTime}, ` : "" }}{{ monthly ? `"monthly": ${monthly}, ` : "" }}"currency": "{{ currency_code }}" }
  },
  { "name": "{{ Tier Name }}",
    "best_for": "{{ brief description of target client }}",
    "problem_solved": "{{ client's problem in their own words }}",
    "includes": [
      "{{ bulleted deliverable #1 }}",
      "{{ bulleted deliverable #2 }}"
    ],
    "price": { {{ oneTime ? `"oneTime": ${oneTime}, ` : "" }}{{ monthly ? `"monthly": ${monthly}, ` : "" }}"currency": "{{ currency_code }}" }
  },
  { "name": "{{ Tier Name }}",
    "best_for": "{{ brief description of target client }}",
    "problem_solved": "{{ client's problem in their own words }}",
    "includes": [
      "{{ bulleted deliverable #1 }}",
      "{{ bulleted deliverable #2 }}"
    ],
    "price": { {{ oneTime ? `"oneTime": ${oneTime}, ` : "" }}{{ monthly ? `"monthly": ${monthly}, ` : "" }}"currency": "{{ currency_code }}" }
  }
]

---

### **Sales & Quoting Notes**

* **Upsell Triggers:**
  * **Pro:** {{ simple rule for when to upgrade to Pro tier }}
  * **Enterprise:** {{ simple rule for when to upgrade to Enterprise tier }}
* **Pricing Notes:**
  * **Discounts:** Sales ≤10%; 10–20% Manager; >20% Director approval.
* **Effective Date:** {{ YYYY-MM-DD }}
* **Review Date:** {{ YYYY-MM-DD }}

---

### **3. The Populated Template (Developer Reference)**

This is a **fully populated JSON example** of a single service package. It provides developers with a concrete reference to validate that the data is correctly structured and ready for implementation. You can think of it as a test case that ensures your data aligns with system requirements.

**Why it's needed:** This document ensures a flawless handoff from the sales team to the engineering team. It provides a real-world example so developers can confirm the data is ready to be parsed and used for automated document generation.

### **InternalPricingDAW (Data/Analytics Workbench) Template**

**ID:** `seo-llm-answers`
**Service:** `seo`
**Category:** `LLM SEO`
**Tags:** `AI`, `LLM`, `featured-snippets`, `conversational-search`

---

### **Pricing & Tiers**

[
  { "name": "Starter: Foundational AI Optimization",
    "best_for": "Businesses targeting AI-powered featured snippets.",
    "problem_solved": "We want to appear in AI search results but don't know where to start.",
    "includes": [
      "LLM response optimization for core web pages.",
      "Snippet and passage markup recommendations.",
      "Conversational query map for a core set of topics.",
      "Monthly AI-answer placement report."
    ],
    "price": { "monthly": 2500, "currency": "USD" }
  },
  { "name": "Professional: Advanced AI Positioning",
    "best_for": "Companies optimizing for multiple AI platforms.",
    "problem_solved": "We need to capture top-tier AI placements across all major platforms.",
    "includes": [
      "Multi-platform optimization for platforms like ChatGPT, Bard, etc.",
      "Authority signals and citation optimization.",
      "Expanded conversational intent mapping for broader topic coverage.",
      "Content component library for creating AI-ready chunks.",
      "Bi-weekly reporting and prioritization updates."
    ],
    "price": { "monthly": 4500, "currency": "USD" }
  },
  { "name": "Enterprise: Full-Scale LLM Strategy",
    "best_for": "Organizations with complex, comprehensive AI search needs.",
    "problem_solved": "We need a complete AI search strategy to gain a competitive advantage.",
    "includes": [
      "Custom LLM optimization strategy tailored to your brand's unique goals.",
      "Advanced answer engineering and testing.",
      "Multi-language optimization for global markets.",
      "Competitive AI-answer gap analysis.",
      "Internal enablement playbooks and governance documentation.",
      "Weekly working sessions with a dedicated strategist."
    ],
    "price": { "monthly": 8500, "currency": "USD" }
  }
]

---

### **Sales & Quoting Notes**

* **Upsell Triggers:**
  * **Pro:** Client has >10 target intents/month or requires optimization for >2 AI platforms.
  * **Enterprise:** Project requires multi-language optimization, governance deliverables, or weekly strategist time.
* **Pricing Notes:**
  * **Discounts:** Sales ≤10%; 10–20% Manager; >20% Director approval.
* **Effective Date:** 2025-01-01
* **Review Date:** 2025-06-01

---

### **4. The Markdown Template (For Content Writers)**

This is the human-readable Markdown template designed for non-technical teams like sales and marketing. It's a fill-in-the-blanks format that uses `{{ double brackets }}` for placeholders. Teams can easily copy and fill in this template for a new service package without needing to understand the underlying JSON structure.

**Why it's needed:** This template provides a straightforward, editable format for non-technical staff to quickly generate clear, professional pricing documents. It ensures consistency and ease of use in daily communication.

-----

### **Markdown Template for Internal Pricing**

This is the fill-in-the-blanks template for creating a human-readable internal pricing document. You'll copy this format for every new package and fill in the details.

```markdown
### 🔒 INTERNAL PRICING — {{ Service Name }}

**Category:** {{ Category }}
**Tags:** {{ tag1 }}, {{ tag2 }}, {{ tag3 }}

#### **{{ Tier 1 Name }}**

**Best for:** {{ brief description of target client }}
**Problem Solved:** "{{ client's problem in their own words }}"

**Includes:**
* {{ bulleted deliverable #1 }}
* {{ bulleted deliverable #2 }}
* {{ bulleted deliverable #3 }}

**Price:** {{ Price }}

#### **{{ Tier 2 Name }}**

**Best for:** {{ brief description of target client }}
**Problem Solved:** "{{ client's problem in their own words }}"

**Includes:**
* {{ bulleted deliverable #1 }}
* {{ bulleted deliverable #2 }}
* {{ bulleted deliverable #3 }}

**Price:** {{ Price }}

#### **{{ Tier 3 Name }}**

**Best for:** {{ brief description of target client }}
**Problem Solved:** "{{ client's own problem in their own words }}"

**Includes:**
* {{ bulleted deliverable #1 }}
* {{ bulleted deliverable #2 }}
* {{ bulleted deliverable #3 }}

**Price:** {{ Price }}

**Quoting Notes (internal):**
* **Upsell to Pro if:** {{ simple rule for when to upgrade to Pro tier }}
* **Upsell to Enterprise if:** {{ simple rule for when to upgrade to Enterprise tier }}
* **Discounts:** Sales ≤10%; 10–20% Manager; >20% Director approval.
* **Effective:** YYYY-MM-DD
* **Review by:** YYYY-MM-DD
```

-----

### **5. The Populated Markdown (For All Team Members)**

This is the **final, completed document** that your team will use and reference on a day-to-day basis. It’s designed for easy reading and editing by anyone.

**Why it's needed:** This document is the single source of truth for your sales and marketing teams. Its clear and editable format makes it the primary tool for internal communication and can be easily adapted for client-facing materials.

---

### 🔒 INTERNAL PRICING — LLM Answer SEO Services

**Category:** LLM SEO
**Tags:** AI, LLM, Featured Snippets, Conversational Search

#### **Starter: Foundational AI Optimization**

**Best for:** Businesses targeting AI-powered featured snippets.
**Problem Solved:** **"We want to appear in AI search results but don't know where to start."**

**Includes:**
* LLM response optimization for core web pages.
* Snippet and passage markup recommendations.
* Conversational query map for a core set of topics.
* Monthly AI-answer placement report.
* **Price:** `{ monthly: 2500 }`

#### **Professional: Advanced AI Positioning**

**Best for:** Companies optimizing for multiple AI platforms.
**Problem Solved:** **"We need to capture top-tier AI placements across all major platforms."**

**Includes:**
* **Multi-platform optimization** for platforms like ChatGPT, Bard, and other leading LLMs.
* Authority signals and citation optimization.
* Expanded conversational intent mapping for broader topic coverage.
* A content component library for creating AI-ready content chunks.
* Bi-weekly reporting and prioritization updates.
* **Price:** `{ monthly: 4500 }`

#### **Enterprise: Full-Scale LLM Strategy**

**Best for:** Organizations with complex, comprehensive AI search needs.
**Problem Solved:** **"We need a complete AI search strategy to gain a competitive advantage."**

**Includes:**
* **Custom LLM optimization strategy** tailored to your brand's unique goals.
* Advanced answer engineering and testing.
* Multi-language optimization for global markets.
* Competitive AI-answer gap analysis.
* Internal enablement playbooks and governance documentation.
* Weekly working sessions with a dedicated strategist.
* **Price:** `{ monthly: 8500 }`

**Quoting Notes (internal):**
* **Upsell to Pro if:** The client has more than 10 target intents per month or requires optimization for more than two AI platforms.
* **Upsell to Enterprise if:** The project requires multi-language optimization, governance deliverables, or weekly strategist time.
* **Discounts:** Sales ≤10%; 10–20% Manager; >20% Director approval.
* **Effective:** 2025-01-01
* **Review by:** 2025-06-01

---