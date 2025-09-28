import React from "react";
import FAQAccordion from "@/components/ui/organisms/FAQAccordion/FAQAccordion";
import styles from "./FAQSection.module.css";

export type Faq = {
  id?: string;
  question?: string;
  answer?: string | React.ReactNode;
  category?: string | null;
  tags?: string[];
};
 
export type FAQSectionProps = {
  /** Anchor id for deep-linking (renders a permalink icon/link). */
  id?: string;
  /** Section heading text (H2). */
  title?: string;
  /** Optional short description under the heading. */
  description?: React.ReactNode;

  /** FAQs to render (preferred prop). */
  faqs?: Faq[];

  /** Pass-throughs to FAQAccordion */
  variant?: "default" | "minimal" | "bordered" | "cards";
  allowMultiple?: boolean;
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  searchPlaceholder?: string;

  /** Extra className for outer <section>. */
  className?: string;
};

export default function FAQSection({
  id,
  title = "Frequently Asked Questions",
  description,
  faqs,
  variant = "default",
  allowMultiple = false,
  enableSearch = true,
  enableCategoryFilter = false,
  searchPlaceholder = "Search FAQs…",
  className,
}: FAQSectionProps) {
  const headingId = id ? `${id}__heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={[styles.section, className].filter(Boolean).join(" ")}
    >
      {(title || description) && (
        <header className={styles.header}>
          <h2 className={styles.title} id={headingId}>
            {title}
            {id && (
              <a
                className={styles.anchor}
                href={`#${id}`}
                aria-label="Permalink to this FAQ section"
              >
                #
              </a>
            )}
          </h2>
          {description ? <p className={styles.desc}>{description}</p> : null}
        </header>
      )}

      <FAQAccordion
        faqs={faqs}
        title={undefined}              // keep heading responsibility here
        variant={variant}
        allowMultiple={allowMultiple}
        enableSearch={enableSearch}
        enableCategoryFilter={enableCategoryFilter}
        searchPlaceholder={searchPlaceholder}
      />
    </section>
  );
}
