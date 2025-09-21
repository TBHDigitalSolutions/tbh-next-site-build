// src/data/page/main-pages/contact/location.ts
// Location metadata – supports map embed via URL or lat/lng + API key

import type { LocationData } from "@/data/page/main-pages/contact/types";

const lat = 38.627;
const lng = -90.1994;
const googleMapsApiKey = "APIKEY"; // ← replace with env-backed value if you wire this into runtime

// Convenience: prebuild a static Maps Embed URL (can be used by an <iframe>)
const mapEmbedUrl = `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(
  googleMapsApiKey
)}&center=${lat},${lng}&zoom=11&maptype=roadmap`;

export const locationData = {
  name: "Primary Office",
  addressLines: ["St. Louis, MO"],
  lat,
  lng,
  mapEmbedUrl,
  hours: [
    { label: "Mon–Fri", value: "9:00am – 5:00pm CT" },
    { label: "Sat–Sun", value: "Closed" },
  ],
} satisfies LocationData;

export default locationData;
