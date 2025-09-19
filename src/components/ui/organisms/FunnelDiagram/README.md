# FunnelDiagram Component

A powerful and interactive funnel visualization component for showcasing lead generation processes, sales funnels, and conversion flows with animations and detailed metrics.

## Features

- ✅ **Multiple Variants**: Interactive, static, animated, 3D, minimal
- ✅ **Flexible Orientations**: Vertical and horizontal layouts
- ✅ **Rich Interactions**: Click handlers, hover effects, expandable sections
- ✅ **Visual Customization**: Multiple color schemes and arrow styles
- ✅ **Data Visualization**: Conversion rates, volume metrics, and tactical details
- ✅ **Responsive Design**: Mobile-first with adaptive layouts
- ✅ **Accessibility**: WCAG compliant with keyboard navigation
- ✅ **Animation System**: Scroll-triggered and hover animations
- ✅ **Loading States**: Skeleton loading and error handling
- ✅ **TypeScript**: Full type safety and IntelliSense

## Installation

```bash
# The component is part of the TBH Digital Solutions design system
# Located at: src/components/ui/organisms/FunnelDiagram/
```

## Basic Usage

```tsx
import { FunnelDiagram } from "@/components/ui/organisms/FunnelDiagram";

const funnelSteps = [
  {
    stage: "Awareness",
    title: "Reach Your Ideal Prospects",
    description: "Targeted ads reach potential customers...",
    tactics: ["Interest targeting", "Behavioral data"],
    metrics: "Impressions, Reach, CPM, CTR",
    conversionRate: 15,
    volume: 10000
  },
  // ... more steps
];

function MyComponent() {
  return (
    <FunnelDiagram
      steps={funnelSteps}
      variant="interactive"
      showMetrics={true}
      showTactics={true}
      animated={true}
    />
  );
}
```

## Props

### FunnelDiagramProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `FunnelStep[]` | **required** | Array of funnel steps |
| `variant` | `"interactive" \| "static" \| "animated" \| "3d" \| "minimal"` | `"interactive"` | Visual variant |
| `showMetrics` | `boolean` | `true` | Show metrics if provided |
| `showTactics` | `boolean` | `true` | Show tactics if provided |
| `showConversionRates` | `boolean` | `false` | Show conversion rates |
| `showVolume` | `boolean` | `false` | Show volume numbers |
| `interactive` | `boolean` | `true` | Enable click interactions |
| `animated` | `boolean` | `true` | Enable animations |
| `orientation` | `"vertical" \| "horizontal"` | `"vertical"` | Funnel orientation |
| `colorScheme` | `"blue" \| "gradient" \| "rainbow" \| "monochrome" \| "custom"` | `"blue"` | Color scheme |
| `customColors` | `string[]` | `undefined` | Custom colors array |
| `size` | `"small" \| "medium" \| "large"` | `"medium"` | Size of the funnel |
| `showArrows` | `boolean` | `true` | Show arrows between steps |
| `arrowStyle` | `"simple" \| "curved" \| "animated" \| "dotted"` | `"simple"` | Arrow style |
| `highlightOnHover` | `boolean` | `true` | Enable step highlighting |
| `onStepClick` | `(step: FunnelStep, index: number) => void` | `undefined` | Click handler |
| `onStepHover` | `(step: FunnelStep, index: number) => void` | `undefined` | Hover handler |
| `title` | `string` | `undefined` | Funnel title |
| `subtitle` | `string` | `undefined` | Funnel subtitle |
| `expandable` | `boolean` | `false` | Enable step expansion |
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `mobileVariant` | `"stacked" \| "carousel" \| "accordion"` | `"stacked"` | Mobile layout |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string` | `undefined` | Error message |

### FunnelStep

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier |
| `stage` | `string` | **required** - Stage name |
| `title` | `string` | **required** - Main title |
| `description` | `string` | **required** - Detailed description |
| `tactics` | `string[]` | Array of tactics/strategies |
| `metrics` | `string` | Key metrics description |
| `icon` | `string` | Ionicon name |
| `color` | `string` | Custom color |
| `conversionRate` | `number` | Conversion percentage |
| `volume` | `number` | Number of prospects |
| `active` | `boolean` | Currently active/highlighted |
| `href` | `string` | Optional link |

## Variants

### Interactive
Full interactive experience with clickable steps and animations.

```tsx
<FunnelDiagram
  steps={steps}
  variant="interactive"
  showTactics={true}
  expandable={true}
/>
```

### Static
Non-interactive display with all content visible.

```tsx
<FunnelDiagram
  steps={steps}
  variant="static"
  showMetrics={true}
  showConversionRates={true}
/>
```

### Animated
Enhanced animations and transitions.

```tsx
<FunnelDiagram
  steps={steps}
  variant="animated"
  arrowStyle="animated"
  colorScheme="gradient"
/>
```

### 3D
Three-dimensional visual effects.

```tsx
<FunnelDiagram
  steps={steps}
  variant="3d"
  highlightOnHover={true}
  size="large"
/>
```

### Minimal
Clean, simplified display.

```tsx
<FunnelDiagram
  steps={steps}
  variant="minimal"
  showStepNumbers={false}
  showArrows={false}
/>
```

## Color Schemes

### Blue (Default)
Professional blue gradient scheme.

### Gradient
Multi-color gradient progression.

### Rainbow
Vibrant rainbow colors for each step.

### Monochrome
Grayscale with varying intensities.

### Custom
Use your own color array.

```tsx
<FunnelDiagram
  steps={steps}
  colorScheme="custom"
  customColors={["#ff6b6b", "#4ecdc4", "#45b7d1", "#feca57"]}
/>
```

## Orientations

### Vertical (Default)
Steps arranged vertically with funnel shape.

### Horizontal
Steps arranged horizontally (automatically converts to vertical on mobile).

```tsx
<FunnelDiagram
  steps={steps}
  orientation="horizontal"
  responsive={true}
/>
```

## Arrow Styles

- **Simple**: Basic arrow with subtle styling
- **Curved**: Curved connector lines
- **Animated**: Pulsing animation effects
- **Dotted**: Dotted line connectors

## Responsive Behavior

### Desktop
- Full interactive experience
- Horizontal or vertical layouts
- All features enabled

### Tablet
- Adaptive layouts
- Horizontal converts to vertical
- Simplified interactions

### Mobile
- **Stacked**: Vertical single column
- **Carousel**: Horizontal scroll
- **Accordion**: Expandable sections

## Animation Features

### Scroll Animations
Steps animate into view when scrolled into viewport.

### Hover Effects
Interactive hover states with smooth transitions.

### Number Counting
Conversion rates and volumes animate from 0.

### Arrow Animations
Pulsing and flowing arrow effects between steps.

### Step Transitions
Smooth expand/collapse and color transitions.

## Accessibility

### Keyboard Navigation
- Tab navigation through steps
- Enter/Space to activate steps
- Arrow keys for navigation (when enabled)

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Proper heading hierarchy

### Visual Accessibility
- High contrast mode support
- Reduced motion preferences respected
- Focus indicators for keyboard users

### WCAG Compliance
- AA level contrast ratios
- Proper color contrast
- Alternative text for icons

## Usage in Lead Generation Page

```tsx
import { FunnelDiagram } from "@/components/ui/organisms/FunnelDiagram";

// Replace the static funnel rendering with:
<section className="content-width-section" id="funnel">
  <SectionContainer className={styles.funnelSection}>
    <div className="section-header">
      <h2 className="section-title">Our Lead Generation Funnel</h2>
      <p className="section-subtitle">
        A systematic approach that guides prospects from awareness to conversion.
      </p>
    </div>

    <FunnelDiagram
      steps={data.funnelSteps}
      variant="interactive"
      showMetrics={true}
      showTactics={true}
      showConversionRates={true}
      animated={true}
      highlightOnHover={true}
      arrowStyle="animated"
      colorScheme="blue"
      responsive={true}
      mobileVariant="stacked"
    />
  </SectionContainer>
</section>
```

## Advanced Features

### Real-time Data Integration
```tsx
const [funnelData, setFunnelData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchFunnelMetrics().then(data => {
    setFunnelData(data);
    setLoading(false);
  });
}, []);

return (
  <FunnelDiagram
    steps={funnelData}
    loading={loading}
    showConversionRates={true}
    showVolume={true}
  />
);
```

### Analytics Integration
```tsx
const handleStepClick = (step, index) => {
  // Track funnel interactions
  gtag('event', 'funnel_step_click', {
    event_category: 'engagement',
    event_label: step.stage,
    value: index + 1
  });
};

<FunnelDiagram
  steps={steps}
  onStepClick={handleStepClick}
  onStepHover={handleStepHover}
/>
```

### Progressive Enhancement
```tsx
// Start with minimal, enhance based on capabilities
const [enhanced, setEnhanced] = useState(false);

useEffect(() => {
  // Check for animation support, device capabilities
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    setEnhanced(true);
  }
}, []);

<FunnelDiagram
  steps={steps}
  variant={enhanced ? "interactive" : "minimal"}
  animated={enhanced}
/>
```

## Performance Optimization

### Lazy Loading
Component uses Intersection Observer for efficient animations.

### Memory Management
Automatic cleanup of event listeners and observers.

### Bundle Size
- Tree-shakeable exports
- Minimal dependencies
- CSS-in-JS avoided for performance

## Browser Support

- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

### Progressive Enhancement
- Graceful degradation on older browsers
- CSS Grid with flexbox fallbacks
- Modern features with polyfill detection

## Custom Styling

### CSS Custom Properties
```css
:root {
  --funnel-primary: #your-brand-color;
  --funnel-secondary: #your-secondary-color;
  --funnel-transition: all 0.3s ease;
}
```

### Component Styling
```tsx
<FunnelDiagram
  steps={steps}
  className="my-custom-funnel"
  style={{
    maxWidth: '900px',
    margin: '0 auto'
  }}
/>
```

### Step-specific Styling
```tsx
const customSteps = steps.map((step, index) => ({
  ...step,
  className: `custom-step-${index}`,
  color: index === 0 ? '#special-color' : undefined
}));
```

## Testing

### Unit Tests
```bash
npm test FunnelDiagram
```

### Accessibility Tests
```bash
npm run test:a11y
```

### Visual Regression Tests
```bash
npm run test:visual
```

## Migration Guide

### From Static Implementation
```tsx
// Old static implementation
<div className={styles.funnelDiagram}>
  {data.funnelSteps.map((step, index) => (
    <div key={index} className={styles.funnelStep}>
      {/* Static content */}
    </div>
  ))}
</div>

// New FunnelDiagram component
<FunnelDiagram
  steps={data.funnelSteps}
  variant="interactive"
  showMetrics={true}
  showTactics={true}
/>
```

### Configuration Mapping
```tsx
// Map existing data structure
const mappedSteps = data.funnelSteps.map(step => ({
  stage: step.stage,
  title: step.title,
  description: step.description,
  tactics: step.tactics,
  metrics: step.metrics
}));
```

## Common Patterns

### Loading with Error Handling
```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

return (
  <FunnelDiagram
    steps={data || []}
    loading={loading}
    error={error}
    variant="interactive"
  />
);
```

### Responsive Design Pattern
```tsx
const isMobile = useMediaQuery('(max-width: 768px)');

<FunnelDiagram
  steps={steps}
  variant={isMobile ? "minimal" : "interactive"}
  orientation={isMobile ? "vertical" : "horizontal"}
  mobileVariant="accordion"
/>
```

### Analytics Pattern
```tsx
const trackFunnelInteraction = useCallback((step, index, action) => {
  analytics.track('Funnel Interaction', {
    step: step.stage,
    position: index + 1,
    action: action
  });
}, []);

<FunnelDiagram
  steps={steps}
  onStepClick={(step, index) => trackFunnelInteraction(step, index, 'click')}
  onStepHover={(step, index) => trackFunnelInteraction(step, index, 'hover')}
/>
```

## Troubleshooting

### Common Issues

**Animations not working**
- Check `prefers-reduced-motion` setting
- Ensure `animated={true}` prop is set
- Verify CSS custom properties are loaded

**Steps not displaying correctly**
- Validate step data structure
- Check for missing required props
- Ensure proper TypeScript types

**Mobile layout issues**
- Set `responsive={true}`
- Choose appropriate `mobileVariant`
- Test across different screen sizes

### Performance Issues
- Use `React.memo` for static data
- Implement virtualization for large funnels
- Consider lazy loading for off-screen content

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on contributing to this component.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.