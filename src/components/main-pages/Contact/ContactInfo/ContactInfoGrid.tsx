"use client";

import React from "react";
import ContactInfoCard from "@/components/ui/molecules/Card/ContactInfoCard";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaShoppingCart } from "react-icons/fa";
import "./ContactInfoGrid.css"; 

// ✅ Icon Mapping
const iconMap: Record<string, React.ReactNode> = {
  FaMapMarkerAlt: <FaMapMarkerAlt />,
  FaPhoneAlt: <FaPhoneAlt />,
  FaEnvelope: <FaEnvelope />,
  FaShoppingCart: <FaShoppingCart />, 
};

// ✅ Props Interface
interface ContactInfoGridProps {
  contactInfo: {
    title: string;
    description: string;
    details: string;
    link: string;
    icon: string;
  }[];
  sectionTitle: string;
}

const ContactInfoGrid: React.FC<ContactInfoGridProps> = ({ contactInfo, sectionTitle }) => {
  return (
    <section className="contact-info-grid">
      {/* Header */}
      <div className="contact-info-header">
        <h2 className="contact-section-title" id="contact-info-title">
          {sectionTitle}
        </h2>
        <div className="contact-info-divider-under-title" aria-hidden="true" />
      </div>

      {/* Grid */}
      <div className="contact-info-container" role="list" aria-labelledby="contact-info-title">
        {contactInfo.map((info, index) => (
          <div className="contact-info-item" role="listitem" key={index}>
            <ContactInfoCard
              title={info.title}
              description={info.description}
              details={info.details}
              link={info.link}
              icon={iconMap[info.icon] || <FaMapMarkerAlt />} // Default icon
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContactInfoGrid;
