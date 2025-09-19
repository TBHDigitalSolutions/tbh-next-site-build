// src/data/taxonomy/servicesTree.ts
import type {
  AnyServiceNode,
  HubNode,
  ServiceNode,
  SubServiceNode,
} from "@/types/servicesTaxonomy.types";

/**
 * Services Tree (Production)
 * ------------------------------------------------------------------
 * - Virtual root "hub" node at /services with L1 hubs as children.
 * - L2 nodes are "service" (leaf or mini-hub); may contain L3 subservices.
 * - No subservice uses the reserved slug "packages".
 * - Each node has a minimal hero to satisfy template requirements.
 *
 * Canonical L1 hub slugs (must match middleware + KnownServiceSlug):
 *  - web-development
 *  - video-production
 *  - seo-services
 *  - marketing
 *  - lead-generation
 *  - content-production
 */

const rootId = "services-root";

/* Helpers ------------------------------------------------------------------ */

function hubNode(id: string, slug: string, title: string): HubNode {
  return {
    id,
    kind: "hub",
    slug,
    path: `/services/${slug}`,
    title,
    hero: { content: { title, subtitle: undefined } },
    children: [],
  };
}

function serviceNode(
  id: string,
  parentId: string,
  hubSlug: string,
  slug: string,
  title: string
): ServiceNode {
  return {
    id,
    kind: "service",
    parentId,
    slug,
    path: `/services/${hubSlug}/${slug}`,
    title,
    hero: { content: { title, subtitle: undefined } },
    children: [],
  };
}

function subServiceNode(
  id: string,
  parentId: string,
  hubSlug: string,
  serviceSlug: string,
  slug: string,
  title: string
): SubServiceNode {
  return {
    id,
    kind: "subservice",
    parentId,
    slug,
    path: `/services/${hubSlug}/${serviceSlug}/${slug}`,
    title,
    hero: { content: { title, subtitle: undefined } },
  };
}

/* Root (virtual) ----------------------------------------------------------- */

const servicesHub: HubNode = {
  id: rootId,
  kind: "hub",
  slug: "services",
  path: "/services",
  title: "Services",
  hero: { content: { title: "Services", subtitle: "Explore our capabilities" } },
  children: [],
};

/* ============================================================================
 * L1 HUB: Web Development  (/services/web-development)
 * ============================================================================
 */
const webDev = hubNode("hub_web_development", "web-development", "Web Development");

// L2 under Web Dev
const webDev_applications = serviceNode(
  "svc_webdev_applications",
  webDev.id,
  webDev.slug,
  "applications",
  "Applications"
);
webDev_applications.children = [
  subServiceNode(
    "sub_webdev_applications_api",
    webDev_applications.id,
    webDev.slug,
    webDev_applications.slug,
    "api",
    "APIs & GraphQL"
  ),
  subServiceNode(
    "sub_webdev_applications_auth",
    webDev_applications.id,
    webDev.slug,
    webDev_applications.slug,
    "auth",
    "Auth & Identity"
  ),
  subServiceNode(
    "sub_webdev_applications_dashboards",
    webDev_applications.id,
    webDev.slug,
    webDev_applications.slug,
    "dashboards",
    "Dashboards"
  ),
  subServiceNode(
    "sub_webdev_applications_data_model",
    webDev_applications.id,
    webDev.slug,
    webDev_applications.slug,
    "data-model",
    "Data Model & Storage"
  ),
  subServiceNode(
    "sub_webdev_applications_observability",
    webDev_applications.id,
    webDev.slug,
    webDev_applications.slug,
    "observability",
    "Observability"
  ),
  subServiceNode(
    "sub_webdev_applications_testing",
    webDev_applications.id,
    webDev.slug,
    webDev_applications.slug,
    "testing",
    "Testing"
  ),
];

const webDev_ecommerce = serviceNode(
  "svc_webdev_ecommerce",
  webDev.id,
  webDev.slug,
  "ecommerce",
  "E-commerce"
);
webDev_ecommerce.children = [
  subServiceNode(
    "sub_webdev_ecommerce_analytics",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "analytics",
    "Analytics & Tagging"
  ),
  subServiceNode(
    "sub_webdev_ecommerce_catalog",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "catalog",
    "Catalog & PDPs"
  ),
  subServiceNode(
    "sub_webdev_ecommerce_checkout",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "checkout",
    "Checkout & Payments"
  ),
  subServiceNode(
    "sub_webdev_ecommerce_integrations",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "integrations",
    "Apps & Integrations"
  ),
  subServiceNode(
    "sub_webdev_ecommerce_performance",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "performance",
    "Performance"
  ),
  subServiceNode(
    "sub_webdev_ecommerce_storefront",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "storefront",
    "Storefront"
  ),
  subServiceNode(
    "sub_webdev_ecommerce_subscriptions",
    webDev_ecommerce.id,
    webDev.slug,
    webDev_ecommerce.slug,
    "subscriptions",
    "Subscriptions"
  ),
];

const webDev_website = serviceNode(
  "svc_webdev_website",
  webDev.id,
  webDev.slug,
  "website",
  "Website"
);
webDev_website.children = [
  subServiceNode(
    "sub_webdev_website_accessibility",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "accessibility",
    "Accessibility"
  ),
  subServiceNode(
    "sub_webdev_website_analytics",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "analytics",
    "Analytics"
  ),
  subServiceNode(
    "sub_webdev_website_cms",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "cms",
    "CMS"
  ),
  subServiceNode(
    "sub_webdev_website_design_system",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "design-system",
    "Design System"
  ),
  subServiceNode(
    "sub_webdev_website_devops",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "devops",
    "DevOps"
  ),
  subServiceNode(
    "sub_webdev_website_forms",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "forms",
    "Forms"
  ),
  subServiceNode(
    "sub_webdev_website_i18n",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "i18n",
    "Internationalization"
  ),
  subServiceNode(
    "sub_webdev_website_media_delivery",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "media-delivery",
    "Media Delivery"
  ),
  subServiceNode(
    "sub_webdev_website_migrations",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "migrations",
    "Migrations"
  ),
  subServiceNode(
    "sub_webdev_website_performance",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "performance",
    "Performance"
  ),
  subServiceNode(
    "sub_webdev_website_rendering",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "rendering",
    "Rendering (SSR/SSG/ISR)"
  ),
  subServiceNode(
    "sub_webdev_website_security",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "security",
    "Security"
  ),
  subServiceNode(
    "sub_webdev_website_seo_impl",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "seo-implementation",
    "SEO Implementation"
  ),
  subServiceNode(
    "sub_webdev_website_sre",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "sre",
    "SRE"
  ),
  subServiceNode(
    "sub_webdev_website_templates",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "templates",
    "Templates"
  ),
  subServiceNode(
    "sub_webdev_website_testing",
    webDev_website.id,
    webDev.slug,
    webDev_website.slug,
    "testing",
    "Testing"
  ),
];

webDev.children = [webDev_applications, webDev_ecommerce, webDev_website];

/* ============================================================================
 * L1 HUB: Video Production  (/services/video-production)
 * ============================================================================
 */
const video = hubNode("hub_video_production", "video-production", "Video Production");

// L2 under Video Production
const video_pre = serviceNode(
  "svc_video_pre_production",
  video.id,
  video.slug,
  "pre-production",
  "Pre-production"
);
video_pre.children = [
  subServiceNode(
    "sub_video_pre_concept",
    video_pre.id,
    video.slug,
    video_pre.slug,
    "concept-development",
    "Concept Development"
  ),
  subServiceNode(
    "sub_video_pre_scripting",
    video_pre.id,
    video.slug,
    video_pre.slug,
    "scripting-storyboarding",
    "Scripting & Storyboarding"
  ),
  subServiceNode(
    "sub_video_pre_locations",
    video_pre.id,
    video.slug,
    video_pre.slug,
    "location-scouting-permits",
    "Location Scouting & Permits"
  ),
  subServiceNode(
    "sub_video_pre_talent",
    video_pre.id,
    video.slug,
    video_pre.slug,
    "talent-casting-crew",
    "Talent, Casting & Crew"
  ),
  subServiceNode(
    "sub_video_pre_schedule",
    video_pre.id,
    video.slug,
    video_pre.slug,
    "production-scheduling",
    "Production Scheduling"
  ),
];

const video_prod = serviceNode(
  "svc_video_production",
  video.id,
  video.slug,
  "production",
  "Production"
);
video_prod.children = [
  subServiceNode(
    "sub_video_prod_corporate",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "corporate-videos",
    "Corporate Videos"
  ),
  subServiceNode(
    "sub_video_prod_brandfilms",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "brand-films",
    "Brand Films"
  ),
  subServiceNode(
    "sub_video_prod_testimonials",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "testimonials-interviews",
    "Testimonials & Interviews"
  ),
  subServiceNode(
    "sub_video_prod_event",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "event-coverage-live",
    "Event Coverage & Live"
  ),
  subServiceNode(
    "sub_video_prod_explainers",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "explainers",
    "Explainers"
  ),
  subServiceNode(
    "sub_video_prod_launches",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "product-launches",
    "Product Launches"
  ),
  subServiceNode(
    "sub_video_prod_training",
    video_prod.id,
    video.slug,
    video_prod.slug,
    "training-videos",
    "Training Videos"
  ),
];

const video_post = serviceNode(
  "svc_video_post_production",
  video.id,
  video.slug,
  "post-production",
  "Post-production"
);
video_post.children = [
  subServiceNode(
    "sub_video_post_edit",
    video_post.id,
    video.slug,
    video_post.slug,
    "editing-narrative",
    "Editing & Narrative"
  ),
  subServiceNode(
    "sub_video_post_color",
    video_post.id,
    video.slug,
    video_post.slug,
    "color-grading-audio",
    "Color Grading & Audio"
  ),
  subServiceNode(
    "sub_video_post_motion",
    video_post.id,
    video.slug,
    video_post.slug,
    "motion-graphics-animation",
    "Motion Graphics & Animation"
  ),
  subServiceNode(
    "sub_video_post_versioning",
    video_post.id,
    video.slug,
    video_post.slug,
    "versioning-delivery",
    "Versioning & Delivery"
  ),
];

const video_dist = serviceNode(
  "svc_video_distribution",
  video.id,
  video.slug,
  "distribution",
  "Distribution"
);
video_dist.children = [
  subServiceNode(
    "sub_video_dist_social_content",
    video_dist.id,
    video.slug,
    video_dist.slug,
    "social-media-content",
    "Social Media Content"
  ),
  subServiceNode(
    "sub_video_dist_adkits",
    video_dist.id,
    video.slug,
    video_dist.slug,
    "ad-kits",
    "Ad Kits"
  ),
  subServiceNode(
    "sub_video_dist_ctv",
    video_dist.id,
    video.slug,
    video_dist.slug,
    "ctv-youtube",
    "CTV & YouTube"
  ),
  subServiceNode(
    "sub_video_dist_multi_opt",
    video_dist.id,
    video.slug,
    video_dist.slug,
    "multi-platform-optimization",
    "Multi-platform Optimization"
  ),
  subServiceNode(
    "sub_video_dist_analytics",
    video_dist.id,
    video.slug,
    video_dist.slug,
    "analytics-performance",
    "Analytics & Performance"
  ),
];

const video_premium = serviceNode(
  "svc_video_premium_packages",
  video.id,
  video.slug,
  "premium-packages",
  "Premium Packages"
);
video_premium.children = [
  subServiceNode(
    "sub_video_premium_social_pack",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "social-content-pack",
    "Social Content Pack"
  ),
  subServiceNode(
    "sub_video_premium_ads",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "video-ads-package",
    "Video Ads Package"
  ),
  subServiceNode(
    "sub_video_premium_ecom",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "ecommerce-product-kit",
    "E-commerce Product Kit"
  ),
  subServiceNode(
    "sub_video_premium_event",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "event-content-package",
    "Event Content Package"
  ),
  subServiceNode(
    "sub_video_premium_thoughtlead",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "thought-leadership-series",
    "Thought Leadership Series"
  ),
  subServiceNode(
    "sub_video_premium_training",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "training-onboarding-pack",
    "Training & Onboarding Pack"
  ),
  subServiceNode(
    "sub_video_premium_distribution_analytics",
    video_premium.id,
    video.slug,
    video_premium.slug,
    "distribution-analytics",
    "Distribution & Analytics"
  ),
];

video.children = [video_pre, video_prod, video_post, video_dist, video_premium];

/* ============================================================================
 * L1 HUB: SEO Services  (/services/seo-services)
 * ============================================================================
 */
const seo = hubNode("hub_seo_services", "seo-services", "SEO Services");

// L2: AI SEO
const seo_aiseo = serviceNode("svc_seo_ai", seo.id, seo.slug, "ai-seo", "AI SEO");
seo_aiseo.children = [
  subServiceNode(
    "sub_seo_ai_search_opt",
    seo_aiseo.id,
    seo.slug,
    seo_aiseo.slug,
    "ai-search-optimization",
    "AI Search Optimization"
  ),
  subServiceNode(
    "sub_seo_llm_answers",
    seo_aiseo.id,
    seo.slug,
    seo_aiseo.slug,
    "llm-answer-seo",
    "LLM Answer SEO"
  ),
  subServiceNode(
    "sub_seo_visibility_eng",
    seo_aiseo.id,
    seo.slug,
    seo_aiseo.slug,
    "visibility-engineering",
    "Visibility Engineering"
  ),
];

// L2: Marketing SEO
const seo_marketing = serviceNode(
  "svc_seo_marketing",
  seo.id,
  seo.slug,
  "marketing",
  "Marketing SEO"
);
seo_marketing.children = [
  subServiceNode(
    "sub_seo_mkt_community",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "community-seo",
    "Community SEO"
  ),
  subServiceNode(
    "sub_seo_mkt_content_hubs",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "content-hubs",
    "Content Hubs"
  ),
  subServiceNode(
    "sub_seo_mkt_content_syndication",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "content-syndication",
    "Content Syndication"
  ),
  subServiceNode(
    "sub_seo_mkt_digital_pr",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "digital-pr",
    "Digital PR"
  ),
  subServiceNode(
    "sub_seo_mkt_ecom",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "ecommerce-seo",
    "E-commerce SEO"
  ),
  subServiceNode(
    "sub_seo_mkt_keyword",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "keyword-strategy",
    "Keyword Strategy"
  ),
  subServiceNode(
    "sub_seo_mkt_local",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "local-seo",
    "Local SEO"
  ),
  subServiceNode(
    "sub_seo_mkt_marketplace",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "marketplace-seo",
    "Marketplace SEO"
  ),
  subServiceNode(
    "sub_seo_mkt_onpage",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "on-page",
    "On-page Optimization"
  ),
  subServiceNode(
    "sub_seo_mkt_video",
    seo_marketing.id,
    seo.slug,
    seo_marketing.slug,
    "video-seo",
    "Video SEO"
  ),
];

// L2: Technical SEO
const seo_technical = serviceNode(
  "svc_seo_technical",
  seo.id,
  seo.slug,
  "technical",
  "Technical SEO"
);
seo_technical.children = [
  subServiceNode(
    "sub_seo_tech_cwv",
    seo_technical.id,
    seo.slug,
    seo_technical.slug,
    "core-web-vitals",
    "Core Web Vitals"
  ),
  subServiceNode(
    "sub_seo_tech_indexation",
    seo_technical.id,
    seo.slug,
    seo_technical.slug,
    "indexation-routing",
    "Indexation & Routing"
  ),
  subServiceNode(
    "sub_seo_tech_international",
    seo_technical.id,
    seo.slug,
    seo_technical.slug,
    "international-seo",
    "International SEO"
  ),
  subServiceNode(
    "sub_seo_tech_migration",
    seo_technical.id,
    seo.slug,
    seo_technical.slug,
    "migration-seo",
    "Migration SEO"
  ),
  subServiceNode(
    "sub_seo_tech_schema",
    seo_technical.id,
    seo.slug,
    seo_technical.slug,
    "schema",
    "Schema & Entities"
  ),
  subServiceNode(
    "sub_seo_tech_audit",
    seo_technical.id,
    seo.slug,
    seo_technical.slug,
    "technical-audit",
    "Technical Audit"
  ),
];

seo.children = [seo_aiseo, seo_marketing, seo_technical];

/* ============================================================================
 * L1 HUB: Marketing  (/services/marketing)
 * ============================================================================
 */
const marketing = hubNode("hub_marketing", "marketing", "Marketing");

// Flat L2 services (no L3 here)
const mk_digital_ads = serviceNode(
  "svc_mkt_digital_advertising",
  marketing.id,
  marketing.slug,
  "digital-advertising",
  "Digital Advertising"
);
const mk_content_creative = serviceNode(
  "svc_mkt_content_creative",
  marketing.id,
  marketing.slug,
  "content-creative",
  "Content & Creative"
);
const mk_mkt_tech = serviceNode(
  "svc_mkt_martech_automation",
  marketing.id,
  marketing.slug,
  "martech-automation",
  "MarTech & Automation"
);
const mk_analytics = serviceNode(
  "svc_mkt_analytics_optimization",
  marketing.id,
  marketing.slug,
  "analytics-optimization",
  "Analytics & Optimization"
);
const mk_pr = serviceNode(
  "svc_mkt_pr_comms",
  marketing.id,
  marketing.slug,
  "pr-communications",
  "PR & Communications"
);
const mk_strategy = serviceNode(
  "svc_mkt_strategy_consulting",
  marketing.id,
  marketing.slug,
  "strategy-consulting",
  "Strategy Consulting"
);

marketing.children = [
  mk_digital_ads,
  mk_content_creative,
  mk_mkt_tech,
  mk_analytics,
  mk_pr,
  mk_strategy,
];

/* ============================================================================
 * L1 HUB: Lead Generation  (/services/lead-generation)
 * ============================================================================
 */
const leadgen = hubNode("hub_lead_generation", "lead-generation", "Lead Generation");

// L2 + L3
const lg_strategy = serviceNode(
  "svc_lg_strategy_planning",
  leadgen.id,
  leadgen.slug,
  "strategy-planning",
  "Strategy & Planning"
);
lg_strategy.children = [
  subServiceNode(
    "sub_lg_strategy_channel",
    lg_strategy.id,
    leadgen.slug,
    lg_strategy.slug,
    "channel-planning",
    "Channel Planning"
  ),
  subServiceNode(
    "sub_lg_strategy_offer",
    lg_strategy.id,
    leadgen.slug,
    lg_strategy.slug,
    "offer-strategy",
    "Offer Strategy"
  ),
];

const lg_conversion = serviceNode(
  "svc_lg_conversion_optimization",
  leadgen.id,
  leadgen.slug,
  "conversion-optimization",
  "Conversion Optimization"
);
lg_conversion.children = [
  subServiceNode(
    "sub_lg_conversion_landing",
    lg_conversion.id,
    leadgen.slug,
    lg_conversion.slug,
    "landing-pages",
    "Landing Pages"
  ),
  subServiceNode(
    "sub_lg_conversion_optimization",
    lg_conversion.id,
    leadgen.slug,
    lg_conversion.slug,
    "optimization",
    "Optimization"
  ),
  subServiceNode(
    "sub_lg_conversion_ab",
    lg_conversion.id,
    leadgen.slug,
    lg_conversion.slug,
    "ab-testing",
    "A/B Testing"
  ),
];

const lg_mgmt = serviceNode(
  "svc_lg_lead_mgmt_qualification",
  leadgen.id,
  leadgen.slug,
  "lead-management-qualification",
  "Lead Management & Qualification"
);
lg_mgmt.children = [
  subServiceNode(
    "sub_lg_mgmt_scoring",
    lg_mgmt.id,
    leadgen.slug,
    lg_mgmt.slug,
    "lead-scoring",
    "Lead Scoring"
  ),
  subServiceNode(
    "sub_lg_mgmt_routing",
    lg_mgmt.id,
    leadgen.slug,
    lg_mgmt.slug,
    "routing",
    "Routing"
  ),
  subServiceNode(
    "sub_lg_mgmt_nurturing",
    lg_mgmt.id,
    leadgen.slug,
    lg_mgmt.slug,
    "lead-nurturing",
    "Lead Nurturing"
  ),
];

const lg_remarketing = serviceNode(
  "svc_lg_remarketing_retention",
  leadgen.id,
  leadgen.slug,
  "remarketing-retention",
  "Remarketing & Retention"
);
lg_remarketing.children = [
  subServiceNode(
    "sub_lg_remarketing_entry",
    lg_remarketing.id,
    leadgen.slug,
    lg_remarketing.slug,
    "remarketing-entry",
    "Remarketing Entry"
  ),
  subServiceNode(
    "sub_lg_remarketing_retargeting",
    lg_remarketing.id,
    leadgen.slug,
    lg_remarketing.slug,
    "retargeting-campaigns",
    "Retargeting Campaigns"
  ),
];

const lg_events = serviceNode(
  "svc_lg_event_experience",
  leadgen.id,
  leadgen.slug,
  "event-experience-marketing",
  "Event & Experience Marketing"
);
lg_events.children = [
  subServiceNode(
    "sub_lg_events_webinars",
    lg_events.id,
    leadgen.slug,
    lg_events.slug,
    "webinars-events",
    "Webinars & Events"
  ),
  subServiceNode(
    "sub_lg_events_virtual",
    lg_events.id,
    leadgen.slug,
    lg_events.slug,
    "virtual-events",
    "Virtual Events"
  ),
  subServiceNode(
    "sub_lg_events_tradeshows",
    lg_events.id,
    leadgen.slug,
    lg_events.slug,
    "trade-shows",
    "Trade Shows"
  ),
];

leadgen.children = [lg_strategy, lg_conversion, lg_mgmt, lg_remarketing, lg_events];

/* ============================================================================
 * L1 HUB: Content Production  (/services/content-production)
 * ============================================================================
 */
const content = hubNode("hub_content_production", "content-production", "Content Production");

const content_creative = serviceNode(
  "svc_content_creative_services",
  content.id,
  content.slug,
  "creative-services",
  "Creative Services"
);
content_creative.children = [
  subServiceNode(
    "sub_content_creative_design",
    content_creative.id,
    content.slug,
    content_creative.slug,
    "design",
    "Design"
  ),
  subServiceNode(
    "sub_content_creative_photography",
    content_creative.id,
    content.slug,
    content_creative.slug,
    "photography",
    "Photography"
  ),
  subServiceNode(
    "sub_content_creative_video",
    content_creative.id,
    content.slug,
    content_creative.slug,
    "video-production",
    "Video Production"
  ),
];

const content_editorial = serviceNode(
  "svc_content_writing_editorial",
  content.id,
  content.slug,
  "writing-editorial",
  "Writing & Editorial"
);
content_editorial.children = [
  subServiceNode(
    "sub_content_editorial_copywriting",
    content_editorial.id,
    content.slug,
    content_editorial.slug,
    "copywriting",
    "Copywriting"
  ),
  subServiceNode(
    "sub_content_editorial_strategy",
    content_editorial.id,
    content.slug,
    content_editorial.slug,
    "editorial-strategy",
    "Editorial Strategy"
  ),
];

const content_production = serviceNode(
  "svc_content_production_publishing",
  content.id,
  content.slug,
  "production-publishing",
  "Production & Publishing"
);
content_production.children = [
  subServiceNode(
    "sub_content_production_cms",
    content_production.id,
    content.slug,
    content_production.slug,
    "cms-publishing",
    "CMS & Publishing"
  ),
  subServiceNode(
    "sub_content_production_packaging",
    content_production.id,
    content.slug,
    content_production.slug,
    "packaging",
    "Packaging"
  ),
];

const content_sales = serviceNode(
  "svc_content_sales_marketing",
  content.id,
  content.slug,
  "sales-marketing-materials",
  "Sales & Marketing Materials"
);
content_sales.children = [
  subServiceNode(
    "sub_content_sales_materials",
    content_sales.id,
    content.slug,
    content_sales.slug,
    "sales-materials",
    "Sales Materials"
  ),
  subServiceNode(
    "sub_content_brand_collateral",
    content_sales.id,
    content.slug,
    content_sales.slug,
    "brand-collateral",
    "Brand Collateral"
  ),
  subServiceNode(
    "sub_content_presentation_design",
    content_sales.id,
    content.slug,
    content_sales.slug,
    "presentation-design",
    "Presentation Design"
  ),
];

content.children = [content_creative, content_editorial, content_production, content_sales];

/* ============================================================================
 * Assemble & export tree
 * ============================================================================
 */
export const servicesTree: AnyServiceNode = {
  ...servicesHub,
  children: [webDev, video, seo, marketing, leadgen, content],
};
