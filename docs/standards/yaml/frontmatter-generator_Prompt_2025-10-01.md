title: "Prompt Template for Frontmatter Generation"
domain: "documentation"
file: "frontmatter-generator_Prompt_2025-10-01.md"
main: "frontmatter-generator"
qualifier: "Prompt"
date: "2025-10-01"
time: 12:58pm
status: "Approved"
owners: ["@AI_Assistant"]
tags: ["prompting","metadata","yaml","standards"]
spotlight:
  - "Canonical rules for structure, naming, headers, and cross-linking"
  - "Basis for docs validation and generated indexes"
  - "Pairs with the Indexing & Linking Standard"
summary: "This handbook defines our documentation operating model: folder roles, filename conventions, required headers, linking rules, lifecycle and status. It is the **single source of truth** for authors and reviewers."
links:
  related:
    - "./documents-indexing-linking_Standard_2025-09-21.md"
    - "./documents-directory_RefactorPlan_2025-09-21.md"
---

**Your Task:**
Review the **Source Document** provided below and generate a complete **YAML frontmatter header** for it.

**Rules for Generation:**

1.  The output **must** be formatted as a YAML block.
2.  Follow the key structure and nesting from the **YAML EXAMPLE** provided.
3.  Extract the content for the keys (e.g., `title`, `summary`, `links`) from the **Source Document's content**, using the **EXAMPLE FORMAT** as a guide for what kind of information to look for.
4.  If the Source Document does not contain all the metadata (e.g., `status`, `owners`, `tags`), use reasonable inferences or placeholder data (e.g., `status: "Draft"`, `owners: ["@yourname"]`, `tags: []`).

-----

**YAML EXAMPLE FORMAT (Source Metadata):**

**Official Title:** Project Documents Handbook
**Domain:** project
**File Name:** project-documents\_Handbook\_2025-09-21.md
**Main Part:** project-documents
**Qualifier:** Handbook
**Date:** 2025-09-21
**Time:** 12:02

**Spotlight Comments:**

  - Canonical rules for structure, naming, headers, and cross-linking
  - Basis for docs validation and generated indexes
  - Pairs with the Indexing & Linking Standard

**Summary:**
This handbook defines our documentation operating model: folder roles, filename conventions, required headers, linking rules, lifecycle and status. It is the **single source of truth** for authors and reviewers.

## See also

  - \[Indexing & Linking Standard\](./documents-indexing-linking\_Standard\_2025-09-21.md)
  - \[Refactor Plan & Ideal Structure\](./documents-directory\_RefactorPlan\_2025-09-21.md)

-----

**YAML EXAMPLE (Target Output Structure):**

```yaml
title: "Project Documents Handbook"
domain: "project"
file: "project-documents_Handbook_2025-09-21.md"
main: "project-documents"
qualifier: "Handbook"
date: "2025-09-21"
time: 12:02pm
status: "Approved"
owners: ["@conor"]
tags: ["docs","standards","indexing"]
spotlight:
  - "Canonical rules for structure, naming, headers, and cross-linking"
  - "Basis for docs validation and generated indexes"
  - "Pairs with the Indexing & Linking Standard"
summary: "This handbook defines our documentation operating model: folder roles, filename conventions, required headers, linking rules, lifecycle and status. It is the **single source of truth** for authors and reviewers."
links:
  related:
    - "./documents-indexing-linking_Standard_2025-09-21.md"
    - "./documents-directory_RefactorPlan_2025-09-21.md"
```

-----

**Source Document to Assess and Create Frontmatter Header For:**

-----

## **(PASTE YOUR DOCUMENT CONTENT HERE)**

