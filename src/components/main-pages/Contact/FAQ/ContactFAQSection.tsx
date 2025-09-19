"use client";

import React, { Suspense, lazy } from "react";
import "./ContactFAQSection.css";

const Accordion = lazy(() => import("@/components/ui/molecules/Accordion/Accordion"));

interface ContactFAQSectionProps {
  sectionTitle: string;
  faqData: { question: string; answer: string }[];
}

const ContactFAQSection: React.FC<ContactFAQSectionProps> = ({ sectionTitle, faqData = [] }) => {
  return (
    <>
      <section className="contactfaq" aria-labelledby="faq-title">
        {/* Section Header */}
        <div className="contactfaq-header">
          <h2 id="faq-title" className="contactfaq-title">
            {sectionTitle}
          </h2>
          <div className="contactfaq-divider-under-title" aria-hidden="true" />
        </div>

        {/* FAQ List (or Empty) */}
        <Suspense
          fallback={
            <div className="contactfaq-loading">
              <span className="spinner" aria-hidden="true" />
              <span className="sr-only">Loading FAQs…</span>
            </div>
          }
        >
          {faqData.length > 0 ? (
            <div className="contactfaq-list">
              {faqData.map((faq, idx) => (
                <Accordion
                  key={`faq-${idx}`}
                  question={faq.question}
                  answer={faq.answer}
                  className="contactfaq-item"
                />
              ))}
            </div>
          ) : (
            <div className="contactfaq-empty" role="status" aria-live="polite">
              <span className="empty-icon">？</span>
              <p className="empty-message">No items available</p>
            </div>
          )}
        </Suspense>
      </section>

      {/* Decorative full-bleed divider below the section */}
      <div className="contactfaq-divider-bottom" aria-hidden="true" />
    </>
  );
};

export default ContactFAQSection;
