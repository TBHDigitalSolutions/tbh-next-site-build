// src/components/ui/organisms/FAQAccordion/FAQAccordion.tsx
"use client";

import React from "react";
import Accordion from "@/components/ui/molecules/Accordion/Accordion";
import styles from "./FAQAccordion.module.css";

type Faq = {
  id?: string;
  question?: string;
  answer?: string | React.ReactNode;
  category?: string | null;
  tags?: string[];
};

type Props = {
  /** Primary prop used everywhere now */
  faqs?: Faq[];
  /** Back-compat: older pages used faqData + sectionTitle */
  faqData?: Faq[];
  sectionTitle?: string;

  title?: string;
  variant?: "default" | "minimal" | "bordered" | "cards";
  allowMultiple?: boolean;
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  showMetadata?: boolean; // kept only for API parity
  className?: string;
  searchPlaceholder?: string;
};

const slugify = (str: unknown, fallback = "general") =>
  typeof str === "string" && str.trim()
    ? str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    : fallback;

export default function FAQAccordion({
  faqs,
  faqData,
  sectionTitle,
  title,
  variant = "default",
  allowMultiple = false,
  enableSearch = true,
  enableCategoryFilter = false,
  showMetadata, // eslint quiet: retained for compatibility
  className,
  searchPlaceholder = "Search FAQs…",
}: Props) {
  // Back-compat source of truth
  const list: Faq[] = Array.isArray(faqs) ? faqs : Array.isArray(faqData) ? faqData : [];

  // Build Accordion items safely (prevents .toLowerCase() crashes)
  const items = (list || [])
    .filter(Boolean)
    .map((f, i) => {
      const q = typeof f?.question === "string" && f.question.trim() ? f.question : "Untitled question";
      const id = f?.id ?? `${slugify(q)}-${i}`;
      const cat = typeof f?.category === "string" && f.category.trim() ? f.category : "General";

      const content =
        typeof f?.answer === "string" || f?.answer == null ? (
          <p>{(f?.answer as string) ?? "No answer provided."}</p>
        ) : (
          f.answer
        );

      return {
        id,
        title: q,
        content,
        category: cat,
        tags: Array.isArray(f?.tags) ? f.tags.filter(Boolean) : undefined,
      };
    });

  // Class to annotate Accordion variant for CSS hooks
  const variantClass = variant === "minimal" ? "variant-minimal" : `variant-${variant}`;

  return (
    <section className={[styles.faq, className].filter(Boolean).join(" ")}>
      {(title || sectionTitle) && (
        <header className={styles.faqHeader}>
          <h3 className={styles.faqTitle}>{title ?? sectionTitle}</h3>
        </header>
      )}

      <Accordion
        items={items}
        allowMultiple={allowMultiple}
        variant={variant === "minimal" ? "minimal" : variant}
        enableSearch={enableSearch}
        enableCategoryFilter={enableCategoryFilter}
        searchPlaceholder={searchPlaceholder}
        // IMPORTANT: keep these literal classes so internal elements can be styled via :global under the local root
        className={`faq-accordion ${variantClass}`}
      />
    </section>
  );
}
