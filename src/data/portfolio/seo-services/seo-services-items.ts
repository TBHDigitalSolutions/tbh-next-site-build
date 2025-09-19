import type { Project } from "@/data/portfolio";

/**
 * SEO Services → canonical item list
 * Target: 6+ items (3 featured). Use unique, stable IDs.
 * Thumbnails are required for grid displays.
 */
export const seoServicesItems: Project[] = [
  {
    id: "greenleaf-topical-map",
    title: "GreenLeaf Topical Map + Programmatic SEO",
    description:
      "Semantic topical map, programmatic page generation, and internal linking graph. Tech SEO + schema + log-file analysis.",
    category: "seo-services",
    client: "GreenLeaf Supply",
    featured: true,
    priority: 1,
    tags: ["topical-authority", "programmatic-seo", "schema", "internal-links"],
    media: {
      type: "image",
      src: "/portfolio/seo/greenleaf-topical-graph.jpg",
      thumbnail: "/portfolio/seo/greenleaf-topical-graph-thumb.jpg",
      alt: "GreenLeaf topical map and internal link graph"
    },
    href: "/case-studies/greenleaf-topical-map",
    metrics: [
      { label: "Top-3 Keywords", value: "+412" },
      { label: "Organic Sessions (90d)", value: "+138%" },
      { label: "Avg. Position", value: "↑ 7.4" }
    ]
  },

  {
    id: "metrohealth-technical-seo",
    title: "MetroHealth Technical SEO Overhaul",
    description:
      "Core Web Vitals remediation, crawl budget optimization, duplicate content control, and XML sitemap refactor.",
    category: "seo-services",
    client: "MetroHealth",
    featured: true,
    priority: 2,
    tags: ["technical-seo", "core-web-vitals", "crawl-budget", "sitemaps"],
    media: {
      type: "pdf",
      src: "/portfolio/seo/metrohealth-tech-audit.pdf",
      thumbnail: "/portfolio/seo/metrohealth-tech-audit-thumb.jpg",
      alt: "MetroHealth technical SEO audit PDF"
    },
    href: "/case-studies/metrohealth-technical-seo",
    metrics: [
      { label: "Index Coverage Errors", value: "-92%" },
      { label: "LCP", value: "1.9s" },
      { label: "CWV Passing URLs", value: "96%" }
    ]
  },

  {
    id: "ridgeoutdoors-local-seo",
    title: "RidgeOutdoors Local SEO Expansion",
    description:
      "GBP optimization, location pages at scale, NAP cleanup, and review velocity system with UTM tracking.",
    category: "seo-services",
    client: "RidgeOutdoors",
    featured: true,
    priority: 3,
    tags: ["local-seo", "gbp", "citations", "reviews"],
    media: {
      type: "image",
      src: "/portfolio/seo/ridgeoutdoors-gbp.jpg",
      thumbnail: "/portfolio/seo/ridgeoutdoors-gbp-thumb.jpg",
      alt: "RidgeOutdoors Google Business Profile performance"
    },
    href: "/case-studies/ridgeoutdoors-local-seo",
    metrics: [
      { label: "Calls from GBP", value: "+71%" },
      { label: "Directions Requests", value: "+54%" },
      { label: "Local Pack Impressions", value: "+133%" }
    ]
  },

  {
    id: "finstack-edtech-content-hub",
    title: "FinStack Content Hub & E-E-A-T Foundation",
    description:
      "Expert-led content hub with author entities, reviewer schema, citations, and media-rich guides aligned to search intent.",
    category: "seo-services",
    client: "FinStack",
    tags: ["eeat", "content-hub", "entities", "search-intent"],
    media: {
      type: "image",
      src: "/portfolio/seo/finstack-content-hub.jpg",
      thumbnail: "/portfolio/seo/finstack-content-hub-thumb.jpg",
      alt: "FinStack E-E-A-T content hub layout"
    },
    href: "/case-studies/finstack-eeat-hub",
    metrics: [
      { label: "Info→MOFU Clicks", value: "+62%" },
      { label: "Helpful Content Risk", value: "Low" }
    ],
    priority: 6
  },

  {
    id: "shopora-marketplace-seo",
    title: "Shopora Marketplace SEO (Faceted + PDP)",
    description:
      "Faceted navigation handling, canonical/robots rules, PDP enrichment (spec tables, FAQs, review schema).",
    category: "seo-services",
    client: "Shopora",
    tags: ["ecommerce-seo", "faceted-navigation", "canonical", "schema-faq"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/shopora-pdp-seo",
      thumbnail: "/portfolio/seo/shopora-pdp-thumb.jpg",
      title: "Shopora PDP SEO Demo"
    },
    href: "/case-studies/shopora-marketplace-seo",
    metrics: [
      { label: "Non-Brand Clicks", value: "+91%" },
      { label: "CTR on PDPs", value: "+24%" }
    ],
    priority: 7
  },

  {
    id: "voyagr-international-seo",
    title: "Voyagr International SEO",
    description:
      "Hreflang architecture, geo-targeting, language fallbacks, and CDN-level rules for global crawling.",
    category: "seo-services",
    client: "Voyagr",
    tags: ["international-seo", "hreflang", "geo-targeting", "cdn-rules"],
    media: {
      type: "video",
      src: "/media/seo/voyagr-intl-overview.mp4",
      poster: "/portfolio/seo/voyagr-intl-poster.jpg",
      thumbnail: "/portfolio/seo/voyagr-intl-thumb.jpg",
      alt: "Voyagr international SEO architecture overview"
    },
    href: "/case-studies/voyagr-international-seo",
    metrics: [
      { label: "Cross-locale Cannibalization", value: "-85%" },
      { label: "Intl. Impressions", value: "+144%" }
    ],
    priority: 8
  }
];
