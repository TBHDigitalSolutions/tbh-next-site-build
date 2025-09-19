"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FaStar } from "react-icons/fa";
import clsx from "clsx";
import "./GenericCard.css";

// ✅ Define Generic Card Props
interface GenericCardProps {
    id?: string;
    image?: string;
    nameTeam?: string; // ✅ Team member name
    nameReview?: string; // ✅ Testimonial name
    position?: string;
    company?: string;
    service?: string;
    description?: string;
    bio?: string;
    quote?: string; 
    rating?: number;
    date?: string;
    buttonText?: string;
    buttonLink?: string;
    variant?: "team" | "testimonial" | "corevalue" | "default";
}
 
const GenericCard: React.FC<GenericCardProps> = ({
    id,
    image = "/images/default-avatar.jpg",
    nameTeam,
    nameReview,
    position,
    company,
    service,
    description,
    bio,
    quote,
    rating,
    date,
    buttonText,
    buttonLink,
    variant = "default",
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            className={clsx("generic-card", variant)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            key={id}
        >
            {/* ✅ Testimonial Card Layout */}
            {variant === "testimonial" ? (
                <>
                    {/* ✅ Profile Image */}
                    <div className="testimonialcard-image-wrapper">
                        <Image
                            src={image}
                            alt={nameReview}
                            width={128} 
                            height={128}
                            className="testimonialcard-image"
                        />
                    </div>

                    {/* ✅ Testimonial Quote */}
                    {quote && <p className="testimonialcard-text">"{quote}"</p>}

                    {/* ✅ Rating */}
                    {rating && (
                        <div className="testimonialcard-rating">
                            {[...Array(rating)].map((_, i) => (
                                <FaStar key={i} className="testimonialcard-star" />
                            ))}
                        </div>
                    )}

                    {/* ✅ Name, Company, Service */}
                    {nameReview && <h4 className="testimonialcard-name">- {nameReview}</h4>}
                    {company && service && (
                        <p className="testimonialcard-details">{company} • {service}</p>
                    )}
                    {date && <p className="testimonialcard-date">{new Date(date).toLocaleDateString()}</p>}
                </>
            ) : (
                <>
                    {/* ✅ Profile Image for Team & Default Variants */}
                    {variant !== "corevalue" && (
                        <div className="generic-card-image">
                            <Image
                                src={image}
                                alt={nameTeam}
                                width={128}
                                height={128}
                                className="object-cover rounded-full"
                            />
                        </div>
                    )}

                    {/* ✅ Name for Team Members */}
                    {nameTeam && <h3 className="generic-card-title">{nameTeam}</h3>}

                    {/* ✅ Display Position for Team Members */}
                    {variant === "team" && position && (
                        <p className="generic-card-position">{position}</p>
                    )}

                    {/* ✅ Main Description (For Team and Core Value Cards) */}
                    {description && <p className="generic-card-description">{description}</p>}

                    {/* ✅ Expand Button (For Team Bios) */}
                    {variant === "team" && bio && (
                        <button
                            className="generic-card-btn"
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-expanded={isExpanded}
                        >
                            {isExpanded ? "Read Less" : buttonText || "Read More"}
                        </button>
                    )}

                    {/* ✅ Expanded Content (Bio for Team Cards) */}
                    <AnimatePresence>
                        {isExpanded && bio && (
                            <motion.div
                                className="generic-card-details"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <p>{bio}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ✅ Button for External Link (For Team, Testimonials, or Core Values) */}
                    {buttonLink && (
                        <a href={buttonLink} className="generic-card-link">
                            {buttonText || "Learn More"}
                        </a>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default GenericCard;
