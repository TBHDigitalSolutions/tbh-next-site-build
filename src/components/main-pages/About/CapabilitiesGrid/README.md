### `src/components/main-pages/About/CapabilitiesGrid/index.ts`

```ts
export { default } from "./CapabilitiesGrid";
export type {
  CapabilitiesGridProps,
  Capability,
  CapabilitySkill,
} from "./CapabilitiesGrid";
```

**Usage example (page level):**

```tsx
import CapabilitiesGrid from "@/components/main-pages/About/CapabilitiesGrid";
import type { Capability } from "@/components/main-pages/About/CapabilitiesGrid";

const items: Capability[] = [
  { id: "webdev", title: "Web Development", icon: "💻", description: "Modern full-stack apps." },
  { id: "seo", title: "SEO", icon: "🔍", description: "Compounding organic growth." },
  // …etc
];

<CapabilitiesGrid
  title="Our Capabilities"
  subtitle="Where we’re strongest."
  items={items}
  columns={3}
/>;
```