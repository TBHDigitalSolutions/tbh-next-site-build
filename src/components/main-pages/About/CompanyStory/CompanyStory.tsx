"use client";

import React from "react";
import { motion } from "framer-motion";
import companyStoryData from "@/data/companystory.json";
import "./CompanyStory.css"; // ✅ Import component-specific styles

// ✅ Define TypeScript type for JSON data
interface CompanyStoryData {
    title: string;
    description: string;
    highlight: string;
    cta: {
        text: string;
        link: string; 
    };
    video: {
        src: string;
        fallbackImage: string;
    };
}

const storyData: CompanyStoryData = companyStoryData as CompanyStoryData;

const CompanyStory: React.FC = () => {
    return (
        <motion.section
            className="companystory-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
        >
            {/* 🌟 Left Container - Video Section */}
            <motion.div className="companystory-left" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                <video className="companystory-video" controls poster={storyData.video.fallbackImage}>
                    <source src={storyData.video.src} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </motion.div>

            {/* 📌 Right Container - Content */}
            <motion.div className="companystory-right" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                <h2 className="companystory-heading">{storyData.title}</h2>
                <div className="companystory-divider"></div>
                <p className="companystory-description">
                    {storyData.description} <span className="companystory-highlight">{storyData.highlight}</span>
                </p>
                <a href={storyData.cta.link} className="companystory-btn">
                    {storyData.cta.text} →
                </a>
            </motion.div>
        </motion.section>
    );
};

export default CompanyStory;
