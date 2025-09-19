# ProcessTimeline Component

A specialized timeline component for displaying service delivery phases and workflows across service pages, with built-in validation, interactive features, and service-specific configurations.

## Overview

The ProcessTimeline is an organism-level component that provides a consistent interface for displaying process workflows across all TBH Digital Solutions service pages. It features collapsible phases, duration tracking, client input requirements, deliverables, and comprehensive data validation.

## File Structure

```
src/components/ui/organisms/ProcessTimeline/
├── ProcessTimeline.tsx              # Main component implementation
├── ProcessTimeline.types.ts         # TypeScript contracts & service types
├── ProcessTimeline.module.css       # Component-scoped styles
├── adapters.ts                      # Data transformation utilities
├── utils/                           # Validation and helper utilities
│   └── ProcessTimelineValidator.ts  # Zod validation & normalization
├── README.md                        # This documentation
└── index.ts                         # Barrel exports
```

## Installation & Usage

### Basic Import

```tsx
import ProcessTimeline from "@/components/ui/organisms/ProcessTimeline";
import type { ProcessPhase, ProcessTimelineProps } from "@/components/ui/organisms/ProcessTimeline";
```

### Service Page Integration

```tsx
// In your service page component
import { webDevProcessTimelineSection } from "@/data/page/services-pages/web-development";

function WebDevPage() {
  return (
    <div>
      {/* Other sections */}
      <ProcessTimeline {...webDevProcessTimelineSection} />
    </div>
  );
}
```

## Type Definitions

### ProcessPhase

```typescript
interface ProcessPhase {
  id: string;                        // Unique identifier
  stepNumber?: number;               // Step number (auto-generated if omitted)
  title: string;                     // Phase title
  description: string;               // Phase description
  icon?: string;                     // Phase icon identifier
  
  // Flexible duration handling
  duration?: string | DurationObject; // "1-2 weeks" or structured object
  durationLabel?: string;            // Explicit display label
  durationData?: DurationObject;     // Structured duration data
  
  // Phase details
  activities?: string[];             // Key phase activities
  clientInputs?: string[];           // Required client inputs
  deliverables?: string[];           // Phase deliverables
  approval?: string;                 // Approval requirements
  owner?: "client" | "studio" | "shared";
  status?: "upcoming" | "active" | "complete" | "in-progress";
  
  // Additional metadata
  dependencies?: string[];           // Phase dependencies
  complexity?: "low" | "medium" | "high";
  teamMembers?: string[];           // Team involvement
  resources?: Array<{               // External resources
    title: string;
    url: string;
    type?: "document" | "tool" | "reference";
  }>;
}
```

### ProcessTimelineProps

```typescript
interface ProcessTimelineProps {
  title?: string;                    // Section title
  subtitle?: string;                 // Section description
  phases?: ProcessPhase[];           // Timeline phases
  
  // Visual configuration
  variant?: "vertical" | "horizontal" | "detailed" | "compact" | "cards";
  interactive?: boolean;             // Enable interactive features
  showProgress?: boolean;            // Show progress indicator
  
  // Content visibility
  showActivities?: boolean;          // Show phase activities
  showClientInputs?: boolean;        // Show client requirements
  showDeliverables?: boolean;        // Show deliverables
  showApproval?: boolean;            // Show approval steps
  showDuration?: boolean;            // Show duration info
  showStatus?: boolean;              // Show phase status
  
  // Behavior
  collapsible?: boolean;             // Enable collapsible phases
  defaultOpen?: number | "all" | "none"; // Default expanded state
  showSummary?: boolean;             // Show timeline summary
  
  // Callbacks
  ctaRenderer?: (phase: ProcessPhase) => React.ReactNode;
  onPhaseClick?: (phase: ProcessPhase, index: number) => void;
}
```

## Data File Structure

Follow the established service page patterns:

```
src/data/page/services-pages/{service}/process-timeline/{service}_process-timeline.ts
```

### Example Data File

```typescript
// web-dev_process-timeline.ts
import type { ProcessPhase } from "@/components/ui/organisms/ProcessTimeline";

const webDevProcessPhases: ProcessPhase[] = [
  {
    id: "discovery",
    title: "Discovery & Requirements",
    description: "Align on goals, audiences, success metrics, and technical constraints to set the right foundation.",
    icon: "search",
    duration: "3-5 days",
    activities: [
      "Stakeholder interviews",
      "Content & brand audit",
      "Analytics & SEO baseline review"
    ],
    clientInputs: [
      "Brand assets & guidelines",
      "Key pages & features list",
      "Primary goals & KPIs"
    ],
    deliverables: [
      "Requirements brief",
      "Initial site map",
      "Success metrics checklist"
    ],
    approval: "Sign off on requirements brief & KPIs",
    owner: "shared",
    status: "complete",
    complexity: "medium"
  },
  {
    id: "planning",
    title: "Architecture & Planning",
    description: "Translate requirements into a pragmatic plan and site information architecture.",
    icon: "grid",
    duration: "1-2 weeks",
    activities: [
      "Technical architecture design",
      "Content strategy & sitemap",
      "Wireframes & user flows"
    ],
    clientInputs: [
      "Content inventory",
      "Technical preferences",
      "Hosting requirements"
    ],
    deliverables: [
      "Technical specification",
      "Site architecture document",
      "Project timeline"
    ],
    approval: "Architecture and timeline approval",
    owner: "studio",
    status: "upcoming",
    complexity: "high"
  }
  // ... more phases
] satisfies ProcessPhase[];

export const webDevProcessTimelineSection = createWebDevProcessTimeline(webDevProcessPhases, {
  title: "Our Web Development Process",
  subtitle: "A transparent, collaborative timeline from discovery to launch.",
  variant: "detailed",
  showSummary: true,
  collapsible: true
}) satisfies WebDevProcessTimeline;
```

### Barrel Export

```typescript
// src/data/page/services-pages/web-development/process-timeline/index.ts
export { webDevProcessTimelineSection } from "./web-dev_process-timeline";
```

## Service-Specific Configurations

### Web Development

```typescript
const webDevTimeline = createWebDevProcessTimeline(phases, {
  variant: "detailed",           // Show full phase details
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  collapsible: true,
  defaultOpen: "all"
});
```

### Video Production

```typescript
const videoTimeline = createVideoProductionProcessTimeline(phases, {
  variant: "detailed",           // Emphasize creative phases
  showProgress: true,
  showApproval: true,            // Important for creative approval
  interactive: true
});
```

### Lead Generation

```typescript
const leadGenTimeline = createLeadGenProcessTimeline(phases, {
  variant: "compact",            // Results-focused display
  showSummary: true,             // Emphasize timeline efficiency
  showStatus: true,
  defaultOpen: "none"            // Collapsed by default
});
```

### SEO Services

```typescript
const seoTimeline = createSEOServicesProcessTimeline(phases, {
  variant: "detailed",           // Show detailed optimization steps
  showProgress: true,            // Track SEO progress
  showActivities: true,
  interactive: true
});
```

## Component Variants

### Vertical (Default)
```typescript
variant: "vertical"
// Traditional timeline with phases stacked vertically
```

### Horizontal
```typescript
variant: "horizontal"
// Horizontal timeline layout for wide screens
```

### Detailed
```typescript
variant: "detailed"
// Full information display with all phase details
```

### Compact
```typescript
variant: "compact"
// Condensed view showing essential information only
```

### Cards
```typescript
variant: "cards"
// Card-based layout with each phase as a distinct card
```

## Advanced Features

### Custom Phase Rendering

```typescript
<ProcessTimeline
  phases={phases}
  ctaRenderer={(phase) => (
    <div className="custom-cta">
      <button onClick={() => scheduleCall(phase.id)}>
        Schedule {phase.title} Call
      </button>
    </div>
  )}
/>
```

### Phase Status Tracking

```typescript
<ProcessTimeline
  phases={phases}
  showStatus={true}
  onPhaseClick={(phase, index) => {
    updatePhaseStatus(phase.id, 'active');
    trackEvent('phase_clicked', { phaseId: phase.id });
  }}
/>
```

### Duration Handling

The component supports flexible duration input:

```typescript
// String format (parsed automatically)
{ duration: "1-2 weeks" }
{ duration: "5 days" }

// Structured format
{ 
  durationData: { min: 1, max: 2, unit: "weeks" },
  durationLabel: "1-2 weeks" 
}

// Mixed approach
{
  duration: "2-3 weeks",
  durationData: { min: 2, max: 3, unit: "weeks" }
}
```

## Data Validation

### Using Validators

```typescript
import { validateProcessPhase, webDevProcessTimelineValidator } from "./utils/ProcessTimelineValidator";

// Validate individual phase
const validation = validateProcessPhase(rawPhaseData);
if (validation.isValid) {
  const phase = validation.phase;
}

// Validate complete timeline
const timelineValidation = webDevProcessTimelineValidator.validate(rawData);
if (timelineValidation.isValid) {
  const timeline = webDevProcessTimelineValidator.createSection(timelineValidation.phases);
}
```

### Quality Assessment

```typescript
import { assessProcessTimelineQuality } from "./utils/ProcessTimelineValidator";

const quality = assessProcessTimelineQuality(phases);
console.log(`Quality score: ${quality.score}/100`);

if (quality.recommendations.length > 0) {
  console.log("Recommendations:", quality.recommendations);
}
```

## External Data Integration

### Strapi CMS

```typescript
import { adaptStrapiProcessTimeline } from "./adapters";

const strapiResponse = await fetch('/api/process-timeline');
const strapiData = await strapiResponse.json();
const phases = adaptStrapiProcessTimeline(strapiData.data);
```

### Contentful

```typescript
import { adaptContentfulProcessTimeline } from "./adapters";

const contentfulEntries = await client.getEntries({ content_type: 'processPhase' });
const phases = adaptContentfulProcessTimeline(contentfulEntries.items);
```

### Project Management Tools

```typescript
import { adaptAsanaProject, adaptLinearProject } from "./adapters";

// Asana integration
const asanaProject = await asanaClient.projects.findById(projectId);
const phases = adaptAsanaProject(asanaProject);

// Linear integration
const linearProject = await linearClient.project(projectId);
const phases = adaptLinearProject(linearProject);
```

## Accessibility

- **Keyboard Navigation**: Full keyboard support for phase navigation
- **Screen Readers**: Proper ARIA labels and phase announcements
- **Focus Management**: Clear focus indicators and logical tab order
- **Reduced Motion**: Respects user's motion preferences
- **Color Contrast**: WCAG 2.1 AA compliant status indicators

## Performance Considerations

### Phase Optimization
- Lazy rendering for large timelines (20+ phases)
- Virtualization for extremely long processes
- Memoized phase calculations
- Debounced interactions

### Data Processing
- Efficient duration parsing with caching
- Optimized dependency resolution
- Incremental phase updates

### Best Practices

```typescript
// Limit phases for optimal UX
const optimizedPhases = limitProcessPhases(allPhases, 8, true);

// Use structured duration data when possible
const phaseWithStructuredDuration = {
  ...phase,
  durationData: { min: 2, max: 3, unit: "weeks" },
  durationLabel: "2-3 weeks"
};

// Implement progressive disclosure
<ProcessTimeline
  phases={phases}
  collapsible={true}
  defaultOpen="none"     // Start collapsed
  showSummary={true}     // Show overview first
/>
```

## Styling

The component uses CSS Modules with scoped styles:

```css
/* ProcessTimeline.module.css */
.timeline {
  --timeline-connector-color: var(--border-primary);
  --timeline-phase-spacing: var(--spacing-lg);
  --timeline-border-radius: var(--radius-lg);
}

.phase {
  background: var(--gradient-card);
  border: var(--card-border);
  border-radius: var(--timeline-border-radius);
}
```

### Dark Theme Support

```css
[data-theme="dark"] .timeline {
  --timeline-connector-color: var(--border-primary-dark);
  --phase-bg: var(--bg-elevated);
}
```

## Testing

### Unit Tests

```typescript
// Test phase validation
test('validates process phase correctly', () => {
  const result = validateProcessPhase(mockPhase);
  expect(result.isValid).toBe(true);
});

// Test duration parsing
test('parses duration strings correctly', () => {
  const duration = parseDurationString("1-2 weeks");
  expect(duration).toEqual({ min: 1, max: 2, unit: "weeks" });
});
```

### Integration Tests

```typescript
// Test timeline rendering
test('renders all phases correctly', () => {
  render(<ProcessTimeline phases={mockPhases} />);
  
  mockPhases.forEach(phase => {
    expect(screen.getByText(phase.title)).toBeInTheDocument();
  });
});

// Test interactive features
test('toggles phase expansion on click', () => {
  render(<ProcessTimeline phases={mockPhases} collapsible={true} />);
  
  const phaseHeader = screen.getByText(mockPhases[0].title);
  fireEvent.click(phaseHeader);
  
  expect(screen.getByText('Activities')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Duration Parsing Errors**: Ensure duration strings follow supported formats
2. **Phase Validation Failures**: Check required fields (id, title, description)
3. **Performance Issues**: Limit phases and use progressive disclosure
4. **Styling Conflicts**: Verify CSS Module imports and scoped styles

### Debug Tools

```typescript
// Debug timeline validation
import { debugProcessTimelineValidation } from "./utils/ProcessTimelineValidator";
debugProcessTimelineValidation(timelineData, "Web Development");

// Create mock data for testing
import { createMockProcessPhases } from "./utils/ProcessTimelineValidator";
const mockPhases = createMockProcessPhases(5, "Web Development");
```

## Migration Guide

### From Legacy Timeline Components

```typescript
// Old: Basic step objects
interface OldStep {
  name: string;           // → title
  time: string;           // → duration
  tasks: string[];        // → activities
  outputs: string[];      // → deliverables
}

// New: Use adapters for migration
const newPhases = oldSteps.map(normalizeProcessPhase);
```

### From Static Process Lists

```typescript
// Old: Static list
<ProcessList steps={steps} />

// New: Interactive timeline
<ProcessTimeline 
  phases={steps}
  interactive={true}
  collapsible={true}
  variant="detailed"
/>
```

## Related Components

- **CaseStudyCarousel**: Project results and case studies
- **Testimonials**: Client testimonials and reviews
- **ServicesAndCapabilities**: Service offerings overview
- **FAQAccordion**: Process-related frequently asked questions

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `phases` | `ProcessPhase[]` | Required | Array of timeline phases |
| `title` | `string` | `undefined` | Section title |
| `subtitle` | `string` | `undefined` | Section description |
| `variant` | `TimelineVariant` | `"vertical"` | Visual variant |
| `interactive` | `boolean` | `true` | Enable interactions |
| `collapsible` | `boolean` | `true` | Enable phase collapse |
| `showSummary` | `boolean` | `true` | Show timeline summary |
| `showActivities` | `boolean` | `true` | Show phase activities |
| `showClientInputs` | `boolean` | `true` | Show client requirements |
| `showDeliverables` | `boolean` | `true` | Show deliverables |
| `defaultOpen` | `number \| "all" \| "none"` | `"all"` | Default expanded state |
| `onPhaseClick` | `Function` | `undefined` | Phase click handler |
| `ctaRenderer` | `Function` | `undefined` | Custom CTA renderer |

### Methods (via ref)

```typescript
const timelineRef = useRef<ProcessTimelineRef>(null);

// Navigation methods
timelineRef.current?.goToPhase(2);
timelineRef.current?.nextPhase();
timelineRef.current?.prevPhase();

// State management
timelineRef.current?.updatePhaseStatus('discovery', 'complete');
timelineRef.current?.getCompletionPercentage();
timelineRef.current?.reset();
```

---

The ProcessTimeline component provides a comprehensive solution for displaying service delivery processes while maintaining consistency, accessibility, and performance across all service pages.

---

