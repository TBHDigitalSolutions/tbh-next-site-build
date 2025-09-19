"use client";

import React from "react";
// ✅ Pull in the shared‑ui ContactForm
import ContactForm from "@/components/ui/organisms/ContactForm/ContactForm";
import "./ContactHero.css";

// ✅ Define Props Interface
interface ContactHeroProps {
  title: string;
  description: string;
  backgroundImage: string;
  theme: string;
} 

const ContactHero: React.FC<ContactHeroProps> = ({
  title,
  description,
  backgroundImage,
  theme,
}) => {
  return (
    <>
      {/* Hero Section */}
      <section
        className={`contact-hero ${theme}`}
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="contact-hero-container">
          {/* Left: Title & Description */}
          <div className="contact-hero-left">
            <h1 className="contact-hero-title">{title}</h1>
            <p className="contact-hero-description">{description}</p>
          </div>

          {/* Right: Contact Form */}
          <div className="contact-hero-right">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Divider Outside of Section */}
      <div className="contact-hero-divider" />
    </>
  );
};

export default ContactHero;
