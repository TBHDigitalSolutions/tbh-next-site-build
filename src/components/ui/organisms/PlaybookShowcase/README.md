# PlaybookShowcase Component

A production-ready organism for displaying resource playbooks and guides in service sections.

## Usage

```tsx
import { PlaybookShowcase, createWebDevPlaybookSection } from "@/components/ui/organisms/PlaybookShowcase";

// Direct usage
<PlaybookShowcase
  title="Development Resources"
  subtitle="Technical guides and implementation playbooks"
  playbooks={playbookItems}
  columns={3}
  showFeatured={true}
/>

// With adapter (recommended for service templates)
const playbookProps = createWebDevPlaybookSection(serviceData.resources);
<PlaybookShowcase {...playbookProps} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | "Proven Playbooks" | Section title |
| `subtitle` | `string` | - | Section subtitle |
| `playbooks` | `PlaybookItem[]` | **required** | Array of playbook items |
| `categories` | `string[]` | - | Available categories (derived from playbooks if not provided) |
| `difficulties` | `PlaybookDifficulty[]` | - | Available difficulty levels |
| `columns` | `2 \| 3 \| 4` | `3` | Grid columns |
| `cardVariant` | `"compact" \| "detailed"` | `"detailed"` | Card display style |
| `maxItems` | `number` | - | Maximum items to display |
| `showFeatured` | `boolean` | `true` | Highlight featured playbooks |

## PlaybookItem Interface

```typescript
interface PlaybookItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  tags?: string[];
  steps?: Array<{ id: string; title: string; description?: string }>;
  metrics?: Record<string, string>;
  cover?: string;
  href?: string;
  downloadUrl?: string;
  readTime?: string;
  featured?: boolean;
  fileType?: 'pdf' | 'doc' | 'guide' | 'checklist';
  fileSize?: string;
}
```

## Service-Specific Adapters

The component includes pre-configured adapters for each service type:

- `createWebDevPlaybookSection()` - Development resources
- `createVideoPlaybookSection()` - Production guides  
- `createMarketingPlaybookSection()` - Marketing playbooks
- `createSEOPlaybookSection()` - SEO resources
- `createLeadGenPlaybookSection()` - Lead generation frameworks
- `createContentPlaybookSection()` - Content strategy guides

## Data Flow

```
Service Page Data → Adapter → PlaybookShowcase Props → Component
```

The adapters handle:
- Data normalization from various input formats
- Service-specific defaults (titles, CTAs, limits)
- Validation and error handling
- Type safety

## Features

- **Responsive grid layout** with configurable columns
- **Search functionality** across titles, descriptions, and tags
- **Category filtering** with dynamic pill buttons
- **Difficulty filtering** (Beginner/Intermediate/Advanced)
- **Featured item highlighting** with priority sorting
- **Accessible design** with proper ARIA labels and keyboard navigation
- **Zero state handling** for empty results
- **Loading states** and error boundaries

## Templates Integration

Used in service templates for resource sections:

```tsx
// In ServiceTemplate.tsx
{data.resources && (
  <FullWidthSection>
    <Container>
      <PlaybookShowcase {...createWebDevPlaybookSection(data.resources)} />
    </Container>
  </FullWidthSection>
)}
```

## Styling

Uses unified CSS modules with design tokens:
- Responsive breakpoints
- Dark/light theme support  
- Reduced motion respect
- High contrast mode compatibility
- Print-friendly styles

---

Now let me create the updated index file:Now let me create the utils directory structure and README:## **FINAL PRODUCTION FILES SUMMARY**

Here are all the production-ready files needed to complete the PlaybookShowcase component:

### **Required File Structure:**
```
src/components/ui/organisms/PlaybookShowcase/
├── PlaybookShowcase.tsx ✅ (Updated - fixed component)
├── PlaybookShowcase.types.ts ✅ (Updated - aligned types)
├── PlaybookShowcase.module.css ✅ (Already production-ready)
├── adapters.ts ✅ (Complete production adapters)
├── index.ts ✅ (Complete barrel exports)
├── README.md ✅ (Complete documentation)
└── utils/
    └── playbookShowcaseValidator.ts ✅ (Complete validation)
```

## **Key Changes Made:**

### **1. Fixed Type Consistency**
- Aligned `PlaybookItem` interface with component implementation
- Removed duplicate `Playbook` type from component
- Added proper `PlaybookDifficulty` type export

### **2. Enhanced Component**
- Added proper toolbar structure with search and filters
- Integrated `maxItems` and `showFeatured` props
- Added CTA section support
- Fixed responsive grid classes
- Improved accessibility and loading states

### **3. Production Adapters**
- Comprehensive input normalization handling various formats
- Service-specific adapters with proper defaults and CTAs
- Robust validation with detailed error reporting
- Smart type inference and fallbacks

### **4. Complete Validation System**
- Zod schemas for type safety
- Parse/validate functions with error details
- Utility functions for category/difficulty extraction
- Input cleaning and normalization

### **5. Integration Ready**
- Follows exact same pattern as TechStack/StatsStrip
- Template-ready with service-specific creators
- Proper barrel exports for clean imports
- Comprehensive documentation

## **How to Use in Templates:**

```tsx
// In ServiceTemplate.tsx
import { createWebDevPlaybookSection } from "@/components/ui/organisms/PlaybookShowcase";

// Inside template render
{data.resources && (
  <FullWidthSection>
    <Container>
      <PlaybookShowcase {...createWebDevPlaybookSection(data.resources)} />
    </Container>
  </FullWidthSection>
)}
```

## **Status Update:**

**PlaybookShowcase - COMPLETED** ✅
- `adapters.ts` ✅ (Complete with service-specific creators)
- `PlaybookShowcase.types.ts` ✅ (Aligned and comprehensive)
- `utils/playbookShowcaseValidator.ts` ✅ (Full validation suite)
- **Status:** Fully compliant with production standards

This completes the **Phase 2 critical adapter implementations**. The PlaybookShowcase component now follows the exact same production-ready pattern as the other completed organisms (TechStack, StatsStrip, VideoPortfolioGallery) and is ready for immediate use in service templates.
