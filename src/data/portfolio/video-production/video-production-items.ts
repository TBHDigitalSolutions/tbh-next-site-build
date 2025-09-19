import type { Project } from "@/data/portfolio";

/**
 * Video Production → canonical item list
 * Target: 6+ items (3 featured). Use unique, stable IDs.
 * Thumbnails are required for grid displays.
 */
export const videoProductionItems: Project[] = [
  {
    id: "acme-brand-film-2025",
    title: "ACME Brand Film (2025)",
    description:
      "High-impact brand film for national launch. Hybrid studio + location shoot, cine lighting, 5.1 mix, broadcast deliverables.",
    category: "video-production",
    client: "ACME",
    featured: true,
    priority: 1,
    tags: ["brand-film", "cinema", "broadcast", "5.1"],
    media: {
      type: "video",
      src: "/media/video/acme-brand-film-2025.mp4",
      poster: "/portfolio/video/acme-brand-film-2025-poster.jpg",
      thumbnail: "/portfolio/video/acme-brand-film-2025-thumb.jpg",
      alt: "ACME Brand Film hero frame"
    },
    href: "/case-studies/acme-brand-film-2025",
    metrics: [
      { label: "Completion Rate", value: "72%" },
      { label: "TV Reach (2w)", value: "4.3M" },
      { label: "Brand Recall Lift", value: "+18%" }
    ]
  },

  {
    id: "morrow-fitness-series",
    title: "Morrow Fitness Member Story Series",
    description:
      "Docu-style member stories shot over two days. Fast turn social cutdowns and vertical masters for paid + organic.",
    category: "video-production",
    client: "Morrow Fitness",
    featured: true,
    priority: 2,
    tags: ["docu", "vertical", "social", "cutdowns"],
    media: {
      type: "video",
      src: "/media/video/morrow-fitness-stories.mp4",
      poster: "/portfolio/video/morrow-fitness-stories-poster.jpg",
      thumbnail: "/portfolio/video/morrow-fitness-stories-thumb.jpg",
      alt: "Morrow Fitness member interview frame"
    },
    href: "/case-studies/morrow-fitness-member-series",
    metrics: [
      { label: "CPV (Paid)", value: "$0.02" },
      { label: "Avg Watch Time", value: "38s" },
      { label: "Sign-ups (30d)", value: "+419" }
    ]
  },

  {
    id: "citybrew-ugc-ads",
    title: "CityBrew UGC Ads Sprint",
    description:
      "Creator-led product tasters with voiceover templates and motion supers. Weekly test matrix across hooks × offers.",
    category: "video-production",
    client: "CityBrew",
    featured: true,
    priority: 3,
    tags: ["ugc", "paid-social", "motion-graphics", "testing"],
    media: {
      type: "video",
      src: "/media/video/citybrew-ugc-reel.mp4",
      poster: "/portfolio/video/citybrew-ugc-reel-poster.jpg",
      thumbnail: "/portfolio/video/citybrew-ugc-reel-thumb.jpg",
      alt: "CityBrew UGC montage"
    },
    href: "/case-studies/citybrew-ugc-ads",
    metrics: [
      { label: "CPA", value: "-34%" },
      { label: "Thumb-stop Rate", value: "+61%" },
      { label: "ROAS", value: "3.2x" }
    ]
  },

  {
    id: "riverview-real-estate-walkthroughs",
    title: "Riverview Real Estate Walkthroughs",
    description:
      "Stabilized interior walkthroughs, HDR exteriors, aerials, and MLS-ready exports. Broker bumper + music licensing.",
    category: "video-production",
    client: "Riverview Realty",
    tags: ["real-estate", "aerial", "hdr", "mls"],
    media: {
      type: "video",
      src: "/media/video/riverview-walkthrough.mp4",
      poster: "/portfolio/video/riverview-walkthrough-poster.jpg",
      thumbnail: "/portfolio/video/riverview-walkthrough-thumb.jpg",
      alt: "Riverview property exterior frame"
    },
    href: "/case-studies/riverview-walkthroughs",
    metrics: [
      { label: "Days on Market", value: "-23%" },
      { label: "Showing Requests", value: "+46%" }
    ],
    priority: 6
  },

  {
    id: "novatech-product-demo",
    title: "NovaTech Product Demo (SaaS)",
    description:
      "On-screen capture + macro lens hardware overlays. Two-track master: full demo and 60-sec elevator edit.",
    category: "video-production",
    client: "NovaTech",
    tags: ["product-demo", "screen-capture", "saas", "overlay"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/novatech-demo-embed",
      thumbnail: "/portfolio/video/novatech-demo-thumb.jpg",
      title: "NovaTech Interactive Demo"
    },
    href: "/case-studies/novatech-product-demo",
    metrics: [
      { label: "Trial Starts (30d)", value: "+28%" },
      { label: "Sales Velocity", value: "+14%" }
    ],
    priority: 7
  },

  {
    id: "harborbank-explainer-animation",
    title: "HarborBank Explainer Animation",
    description:
      "2D vector explainer with custom icon set, VO, and SFX. Delivered in 16:9, 1:1, and 9:16 variants with captions.",
    category: "video-production",
    client: "HarborBank",
    tags: ["explainer", "animation", "captions", "localization"],
    media: {
      type: "pdf",
      src: "/portfolio/video/harborbank-styleboards.pdf",
      thumbnail: "/portfolio/video/harborbank-styleboards-thumb.jpg",
      alt: "HarborBank animation styleboards PDF"
    },
    href: "/case-studies/harborbank-explainer-animation",
    metrics: [
      { label: "Landing Page CVR", value: "+22%" },
      { label: "Bounce Rate", value: "-17%" }
    ],
    priority: 8
  }
];
