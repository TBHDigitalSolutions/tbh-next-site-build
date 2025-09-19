// src/components/ui/molecules/Card/ServiceCard.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCheckCircle } from "react-icons/fa";

// ✅ Pull in the shared‑UI Button
import Button from "@/components/ui/atoms/Button/Button";

// ✅ Import your website’s Service type
import { Service } from "@/types/Service";

// ✅ Use the local CSS file in this folder
import "./ServiceCard.css";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const learnMoreLink = `https://tbhdigitalsolutions.com/products-services/${service.id}`;
  const shopCategoryLink = `https://store.tbhdigitalsolutions.com/products-services/${service.id}`;

  return (
    <div className="service-card">
      {/* Media */}
      <div className="service-card-media">
        {service.video ? (
          <video
            className="service-card-video"
            src={service.video}
            autoPlay
            loop
            muted
          />
        ) : (
          <Image
            src={service.image}
            alt={service.titleCategory}
            width={400}
            height={400}
            className="service-card-image"
            priority
          />
        )}
      </div>

      {/* Content */}
      <div className="service-card-content">
        <h3 className="service-card-title">{service.title}</h3>
        <h4 className="service-card-subtitle">{service.titleCategory}</h4>
        <p className="service-card-description">{service.description}</p>

        {/* Features */}
        <ul className="service-card-features">
          {service.features.map((feature, idx) => (
            <li key={idx} className="service-card-feature">
              <FaCheckCircle className="feature-check-icon" /> {feature}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="service-card-buttons">
          <Link href={learnMoreLink} passHref>
            <Button variant="primary" size="medium">
              Learn More
            </Button>
          </Link>

          {service.cta?.link && (
            <Link href={shopCategoryLink} passHref>
              <Button
                className="shop-all-button"
                variant="secondary"
                size="medium"
              >
                {service.cta.text}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
