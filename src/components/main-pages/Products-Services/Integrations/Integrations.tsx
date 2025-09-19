"use client";

import React from "react";
import { integrations, marketingCTA } from "@/mock/products-services/IntegrationData";
import { FaCheckCircle } from "react-icons/fa";

// ✅ Fixed CSS import path to match current directory structure
import "./Integrations.css";

const Integrations: React.FC = () => {
    if (!integrations || !marketingCTA) return null; // ✅ Safety check

    return (
        <section className="integrations-section">
            <div className="integrations-container">
                {/* ✅ Section Heading */}
                <h2 className="integrations-title">Seamless Marketing & Ad Platform Integrations</h2>
                <p className="integrations-description">
                    Connect your campaigns with the best-in-class advertising and analytics platforms.
                </p>

                {/* ✅ Integrations Grid */}
                <div className="integrations-grid">
                    {integrations.map((integration) => (
                        <div key={integration.id} className="integration-card">
                            {/* ✅ Integration Logo */}
                            <img
                                src={integration.logo}
                                alt={integration.name}
                                className="integration-logo"
                                loading="lazy"
                            />

                            {/* ✅ Integration Title */}
                            <h3 className="integration-name">{integration.name}</h3>

                            {/* ✅ Integration Description */}
                            <p className="integration-description-text">{integration.description}</p>

                            {/* ✅ Learn More Button */}
                            <a
                                href={integration.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="integration-link"
                            >
                                Learn More →
                            </a>
                        </div>
                    ))}
                </div>

                {/* ✅ CTA Button (Fixed JSX Structure) */}
                {marketingCTA.ctaButton?.text && marketingCTA.ctaButton?.link && (
                    <div className="integration-cta">
                        <a href={marketingCTA.ctaButton.link} className="integration-cta-button">
                            {marketingCTA.ctaButton.text}
                        </a>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Integrations;