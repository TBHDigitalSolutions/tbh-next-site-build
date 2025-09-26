import type { AddOn } from "../../_types/packages.types";

const addon: AddOn = {
  id: "leadgen-international",
  name: "International Lead Generation",
  price: { oneTime: 5500, monthly: 2500, currency: "USD" },
  priceNote: "+$2,500/month per additional market",
  bullets: [
    "Market research and entry strategy",
    "Localized campaign development",
    "Regional compliance (e.g., GDPR)",
    "Multi-language lead nurturing",
  ],
};

export default addon;
