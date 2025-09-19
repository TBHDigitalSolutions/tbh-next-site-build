import type { ModuleItem } from "../types";

export const videoProductionModules: ModuleItem[] = [
  {
    type: "tool",
    title: "Video Strategy Planner",
    description: "Plan your video content strategy with our interactive planning toolkit.",
    href: "/tools/video-planner",
    image: "/modules/video-planner.jpg",
    tags: ["video-production-services", "pre-production"],
    featured: true,
    hubSpecific: true
  },
  {
    type: "calculator",
    title: "Video ROI Calculator",
    description: "Calculate the potential return on investment for your video marketing campaigns.",
    href: "/tools/video-roi",
    image: "/modules/video-roi.jpg",
    tags: ["video-production-services", "distribution"],
    hubSpecific: true
  },
  {
    type: "case-study",
    title: "Viral Brand Film Case Study",
    description: "Behind the scenes of a brand film that generated 2.4M views and 18% brand lift.",
    href: "/case-studies/viral-brand-film",
    image: "/modules/brand-film-case.jpg",
    tags: ["video-production-services", "production", "brand-films"],
    featured: true
  },
  {
    type: "checklist",
    title: "Pre-Production Checklist",
    description: "Complete 32-point checklist to ensure smooth video production workflows.",
    href: "/resources/pre-production-checklist",
    image: "/modules/preproduction-checklist.jpg",
    tags: ["video-production-services", "pre-production"],
    hubSpecific: true
  },
  {
    type: "tool",
    title: "Video Format Optimizer",
    description: "Optimize your videos for different platforms with our format recommendation tool.",
    href: "/tools/format-optimizer",
    image: "/modules/format-optimizer.jpg",
    tags: ["video-production-services", "post-production", "distribution"],
    hubSpecific: true
  },
  {
    type: "resource",
    title: "Video Analytics Guide",
    description: "Master video performance metrics across YouTube, LinkedIn, and social platforms.",
    href: "/resources/video-analytics",
    image: "/modules/video-analytics.jpg",
    tags: ["video-production-services", "distribution", "analytics-performance"],
    hubSpecific: true
  },
  {
    type: "case-study",
    title: "Corporate Training Series",
    description: "How we produced a 12-part training series that improved employee engagement by 67%.",
    href: "/case-studies/corporate-training",
    image: "/modules/training-case.jpg",
    tags: ["video-production-services", "production", "training-videos"],
    featured: true
  }
];