// scripts/packages/check-featured-refs.ts
import { validateFeaturedRefs } from "@/data/packages/_validators/packages.validate";

// Content Production
import contentPkgs from "@/data/packages/content-production/content-production-packages";
import contentFeat from "@/data/packages/content-production/content-production-featured";

// Lead Gen
import leadPkgs from "@/data/packages/lead-generation/lead-generation-packages";
import leadFeat from "@/data/packages/lead-generation/lead-generation-featured";

// Marketing
import marketingPkgs from "@/data/packages/marketing-services/marketing-packages";
import marketingFeat from "@/data/packages/marketing-services/marketing-featured";

// SEO
import seoPkgs from "@/data/packages/seo-services/seo-services-packages";
import seoFeat from "@/data/packages/seo-services/seo-services-featured";

// Video
import videoPkgs from "@/data/packages/video-production/video-production-packages";
import videoFeat from "@/data/packages/video-production/video-production-featured";

// Web Dev
import webPkgs from "@/data/packages/web-development/web-development-packages";
import webFeat from "@/data/packages/web-development/web-development-featured";

function check(label: string, pkgs: any[], feat: any[]) {
  const { errors } = validateFeaturedRefs(pkgs, feat);
  if (errors.length) {
    console.error(`✖ ${label}: featured → packageId mismatches`);
    errors.forEach((e) => console.error("  -", e));
  } else {
    console.log(`✓ ${label}: OK`);
  }
}

check("content", contentPkgs, contentFeat);
check("leadgen", leadPkgs, leadFeat);
check("marketing", marketingPkgs, marketingFeat);
check("seo", seoPkgs, seoFeat);
check("video", videoPkgs, videoFeat);
check("webdev", webPkgs, webFeat);
