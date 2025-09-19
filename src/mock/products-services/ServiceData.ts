import { Service } from "@/types/Service"; // ✅ Import Corrected Type

// 📌 Export Services Data
export const services: Service[] = [
    {
        id: "saas",
        title: "Automate & Optimize with",
        titleCategory: "SaaS Solutions",
        category: "saas",
        description:
            "Leverage AI-driven tools for CRM, automation, social media scheduling, and referral networks.",
        features: [
            "CRM – Lead management, automation, follow-ups",
            "Social Media Scheduler – AI-powered post planning",
            "Cloud Storage – Secure, scalable collaboration",
            "Electronic Referral Network – Streamline referrals",
        ],
        video: "/videos/Website-Videos/website-marketing-crm-1-1.mp4",
        image: "/images/services/placeholder-800x800.jpeg",
        cta: {
            text: "Shop Services",
            link: "/shop/saas", 
        },
    },
    {
        id: "web-dev",
        title: "Scalable, Performance-Driven",
        titleCategory: "Web Development & E-Commerce",
        category: "web-dev",
        description:
            "Custom-built websites, optimized for SEO, conversions, and seamless e-commerce experiences.",
        features: [
            "Custom Websites – Optimized for speed & SEO",
            "E-Commerce Stores – Secure & seamless checkout",
            "Content Hubs & Blogs – Drive organic traffic",
        ],
        video: "/videos/Website-Videos/website-websites-1-1.mp4",
        image: "/images/services/placeholder-800x800.jpeg",
        cta: {
            text: "Shop Services",
            link: "/shop/web-dev",
        },
    },
    {
        id: "marketing",
        title: "Reach Your Target Audience",
        titleCategory: "Marketing Services",
        category: "marketing",
        description:
            "End-to-end marketing services including PPC, SEO, traditional ads, and analytics.",
        features: [
            "Google Ads, Facebook & Instagram Ads, LinkedIn Ads",
            "Traditional Marketing – Brochures, flyers, print media",
            "Advanced Pixel & Tracking Integrations",
        ],
        video: "/videos/Website-Videos/website-marketing-crm-1-1.mp4",
        image: "/images/services/placeholder-800x800.jpeg",
        cta: {
            text: "Shop Services",
            link: "/shop/marketing",
        },
    },
    {
        id: "content",
        title: "Engaging Visual & Video",
        titleCategory: "Content Creation",
        category: "content",
        description:
            "Expert content creation from social media graphics to high-quality video production.",
        features: [
            "Social Media Packages – Posts, captions, engagement",
            "Graphic Design – Custom images, infographics",
            "Video Production – Motion graphics & live shoots",
        ],
        video: "/videos/Website-Videos/website-video-and-content-1-1.mp4",
        image: "/images/services/placeholder-800x800.jpeg",
        cta: {
            text: "Shop Services",
            link: "/shop/content",
        },
    },
    {
        id: "branding",
        title: "Establish a Strong",
        titleCategory: "Brand Identity",
        category: "branding",
        description:
            "We help you create a strong, memorable brand with professional design services.",
        features: [
            "Custom Logo Design",
            "Branding Guidelines & Kits",
            "Consistent Online Presence Setup",
        ],
        video: "/videos/Website-Videos/website-websites-1-1.mp4",
        image: "/images/services/placeholder-800x800.jpeg",
        cta: {
            text: "Shop Services",
            link: "/shop/branding",
        },
    },
    {
        id: "social-media",
        title: "Enhance Your Online Presence",
        titleCategory: "Social Media Management",
        category: "social-media",
        description:
            "Drive engagement, build your audience, and stay ahead of trends with our expert social media management services.",
        features: [
            "Content Strategy & Scheduling",
            "Engagement & Community Management",
            "Paid Social Advertising & Analytics",
            "Platform-Specific Content Creation",
        ],
        video: "/videos/Website-Videos/website-video-and-content-1-1.mp4",
        image: "/images/services/placeholder-800x800.jpeg",
        cta: {
            text: "Shop Services",
            link: "/shop/social-media",
        },
    },
];
