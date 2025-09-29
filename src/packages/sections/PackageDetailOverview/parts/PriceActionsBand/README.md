---

## Notes & usage

* **Detail pages**: Swap your existing `<PriceTeaser/>` + `<CTARow/>` stack with:

```tsx
<PriceActionsBand
  variant={price?.monthly && price?.oneTime ? "detail-hybrid" : "detail-oneTime"}
  price={price}
  tagline={tagline /* optional */}
  baseNote={price?.monthly && price?.oneTime ? "proposal" : "final"}
  finePrint={micro /* e.g., "3-month minimum • + ad spend" */}
  ctaPrimary={{ label: "Request proposal", href: "/contact" }}
  ctaSecondary={{ label: "Book a call", href: "/book" }}
  showDivider
  align="center"
/>
```

* **Cards**: You can keep your current compact pipeline for now; `card-hybrid` / `card-oneTime` variants here are **API-ready** if you want to render the same band on cards later.

* **No breaking data**: It takes the same `price` object you already pass around.

* **Tokens only**: All colors/type/shape route through your CSS variables.
