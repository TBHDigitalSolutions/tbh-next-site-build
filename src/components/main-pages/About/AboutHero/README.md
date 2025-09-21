### How to use from the page

```tsx
import AboutHero from "@/components/main-pages/About/AboutHero";
import aboutPageData from "@/data/page/main-pages/about";

export default function AboutPage() {
  const { hero } = aboutPageData; // conforms to HeroData
  return (
    <>
      {/* If you still use HeroSelector, keep it; otherwise render AboutHero directly: */}
      <AboutHero data={hero!} />
      {/* ...rest of page... */}
    </>
  );
}
```