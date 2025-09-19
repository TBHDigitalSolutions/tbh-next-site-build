// in /data/page/services-pages/.../index.ts
export type ModuleCardItem = {
  key:
    | "audit" | "icp" | "playbooks" | "editorial" | "portfolio"
    | "workflow" | "techstack" | "pricing" | "comparison" | "stats"
    | "faq" | "testimonials" | "logos";
  title: string;
  description?: string;
  href: string;              // "#section-id" or "/modules/..."
  icon?: string;
  badge?: string;
};

export type ModulesCarouselData = {
  title?: string;
  subtitle?: string;
  items: ModuleCardItem[];
};
