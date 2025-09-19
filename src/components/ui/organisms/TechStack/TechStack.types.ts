export type TechCategory = "Frontend" | "Backend" | "Database" | "Cloud" | "DevOps" | "Tools";

export interface Tech {
  id: string;
  name: string;
  logo?: string;          // path to svg/png
  category: TechCategory;
  expertise?: "Expert" | "Advanced" | "Intermediate";
  experience?: string;    // "5+ years"
  projects?: number;      // count
  featured?: boolean;
  link?: string;          // docs or site
}

export interface TechStackShowcaseProps {
  title?: string;
  subtitle?: string;
  technologies: Tech[];
  showCategories?: boolean;
  showExperience?: boolean;
  showProjectCounts?: boolean;
  enableFiltering?: boolean;
  enableSearch?: boolean;
  className?: string;
}
