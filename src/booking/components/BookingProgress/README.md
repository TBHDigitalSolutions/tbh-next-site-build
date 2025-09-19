# BookingProgress Component

A comprehensive progress tracking component for multi-step booking flows, featuring multiple display variants, step navigation, accessibility support, and analytics integration.

## Features

- **Multiple Display Variants**: Horizontal, vertical, compact, detailed, and circular progress views
- **Flexible Step Management**: Support for required, optional, and conditional steps
- **Interactive Navigation**: Click-to-navigate with validation and permission checks
- **Progress Persistence**: Auto-save progress state with browser storage
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Analytics Ready**: Built-in tracking for user interactions and flow completion
- **Responsive Design**: Mobile-optimized with compact modes
- **Customizable Animations**: Multiple transition effects for step changes
- **Error Handling**: Graceful error states with recovery options

## Installation & Setup

### 1. File Structure
```
src/booking/components/BookingProgress/
├── BookingProgress.tsx
├── BookingProgress.types.ts
├── BookingProgress.module.css
└── index.ts
```

### 2. Dependencies
The component requires these utilities from your booking lib:
- `trackBookingProgressEvent()` - Analytics tracking
- `getFlowConfiguration()` - Pre-built flow configurations
- Progress utility functions (see utils section)

### 3. CSS Variables
Ensure your CSS includes these custom properties:
```css
:root {
  /* Background colors */
  --bg-surface: #ffffff;
  --bg-elevated: #f8f9fa;
  --bg-secondary: #f1f5f9;
  
  /* Text colors */
  --text-primary: #121417;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-danger: #dc2626;
  
  /* Border colors */
  --border-subtle: #e5e5e5;
  --border-strong: #d1d5db;
  
  /* Accent colors */
  --accent-primary: #0ea5e9;
  --accent-secondary: #0284c7;
  --accent-contrast: #ffffff;
  
  /* Success colors */
  --success-primary: #10b981;
  --success-contrast: #ffffff;
  
  /* Warning colors */
  --warning-primary: #f59e0b;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 28px;
  
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --radius-full: 999px;
  
  /* Font sizes */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-smooth: 300ms ease;
  
  /* Shadows */
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* Fonts */
  --font-body: system-ui, sans-serif;
  --font-heading: inherit;
}
```

## Usage

### Basic Usage
```tsx
import { BookingProgress } from '@/booking/components/BookingProgress';

function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      id: 'service-selection',
      label: 'Select Service',
      description: 'Choose the service you need',
      status: 'completed',
      optional: false,
      clickable: true,
      estimatedTime: 60,
    },
    {
      id: 'time-selection',
      label: 'Choose Time',
      description: 'Pick your preferred time slot',
      status: 'current',
      optional: false,
      clickable: true,
      estimatedTime: 90,
    },
    {
      id: 'contact-info',
      label: 'Contact Details',
      description: 'Provide your contact information',
      status: 'pending',
      optional: false,
      clickable: true,
      estimatedTime: 120,
    },
    {
      id: 'confirmation',
      label: 'Confirmation',
      description: 'Review and confirm your booking',
      status: 'pending',
      optional: false,
      clickable: false,
      estimatedTime: 30,
    },
  ];

  return (
    <BookingProgress
      flowType="simple"
      steps={steps}
      currentStep={currentStep}
      variant="horizontal"
      showPercentage={true}
      showEstimatedTime={true}
      onStepClick={(stepIndex) => setCurrentStep(stepIndex)}
    />
  );
}
```

### Advanced Usage with Navigation
```tsx
import { BookingProgress } from '@/booking/components/BookingProgress';
import { getFlowConfiguration } from '@/booking/lib/utils';

function AdvancedBookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState(() => {
    const config = getFlowConfiguration('detailed', 'web-development-services');
    return config.steps.map((step, index) => ({
      ...step,
      status: index === 0 ? 'current' : 'pending',
    }));
  });

  const handleStepNavigation = (fromStep: number, toStep: number) => {
    // Custom navigation logic
    if (toStep > fromStep) {
      // Check if intermediate steps are completed
      for (let i = fromStep; i < toStep; i++) {
        if (!steps[i].optional && steps[i].status !== 'completed') {
          return false; // Prevent navigation
        }
      }
    }
    return true; // Allow navigation
  };

  const handleStepClick = (stepIndex: number, step: any) => {
    setCurrentStep(stepIndex);
    // Update step statuses
    setSteps(prev => prev.map((s, i) => ({
      ...s,
      status: i === stepIndex ? 'current' : 
              i < stepIndex ? 'completed' : 'pending'
    })));
  };

  return (
    <BookingProgress
      flowType="detailed"
      steps={steps}
      currentStep={currentStep}
      variant="detailed"
      position="top"
      showStepNumbers={true}
      showDescriptions={true}
      showEstimatedTime={true}
      showPercentage={true}
      enableNavigation={true}
      allowSkipping={true}
      animation="fade"
      service="web-development-services"
      provider="cal"
      onStepClick={handleStepClick}
      onNavigate={handleStepNavigation}
      onTrack={(event, properties) => {
        console.log('Progress Event:', event, properties);
      }}
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `flowType` | `BookingFlowType` | Type of booking flow |
| `steps` | `ProgressStep[]` | Array of progress steps |
| `currentStep` | `number` | Current step index |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"horizontal" \| "vertical" \| "compact" \| "detailed" \| "circular"` | `"horizontal"` | Display variant |
| `position` | `"top" \| "bottom" \| "left" \| "right" \| "floating"` | `"top"` | Position on screen |
| `showStepNumbers` | `boolean` | `true` | Show step numbers |
| `showDescriptions` | `boolean` | `true` | Show step descriptions |
| `showEstimatedTime` | `boolean` | `false` | Show estimated time per step |
| `showPercentage` | `boolean` | `true` | Show completion percentage |
| `enableNavigation` | `boolean` | `false` | Enable step navigation |
| `allowSkipping` | `boolean` | `false` | Allow skipping optional steps |
| `animation` | `"slide" \| "fade" \| "scale" \| "bounce" \| "none"` | `"fade"` | Animation type |
| `showTimeRemaining` | `boolean` | `false` | Show time remaining |
| `compactMobile` | `boolean` | `true` | Use compact mode on mobile |
| `loading` | `boolean` | `false` | Loading state |
| `disabled` | `boolean` | `false` | Disabled state |

### Callback Props

| Prop | Type | Description |
|------|------|-------------|
| `onStepClick` | `(stepIndex: number, step: ProgressStep) => void` | Called when step is clicked |
| `onNavigate` | `(fromStep: number, toStep: number) => boolean` | Navigation permission check |
| `onTrack` | `(event: string, properties: object) => void` | Analytics tracking callback |

## Step Configuration

### ProgressStep Structure
```typescript
interface ProgressStep {
  id: string;                    // Unique step identifier
  label: string;                 // Display label
  description?: string;          // Step description
  status: StepStatus;           // Current status
  optional?: boolean;           // Whether step is optional
  icon?: string | React.ComponentType; // Custom icon
  estimatedTime?: number;       // Time in seconds
  errorMessage?: string;        // Error message if status is error
  clickable?: boolean;          // Whether step can be clicked
  className?: string;           // Custom CSS class
}
```

### Step Statuses
- `pending` - Step not yet started
- `current` - Currently active step
- `completed` - Step completed successfully
- `error` - Step has an error
- `skipped` - Step was skipped (optional only)

## Flow Types

### Simple Flow
Basic 4-step flow: Service Selection → Time Selection → Contact Info → Confirmation

### Detailed Flow
Extended 6-step flow: Service Selection → Requirements → Time Selection → Contact Info → Payment → Confirmation

### Consultation Flow
Consultation-specific: Service Selection → Questionnaire → Schedule Meeting → Contact Details → Confirmation

### Quote Flow
Quote request: Service Selection → Project Details → Contact Info → Quote Generation

### Custom Flow
Fully customizable flow with your own step definitions

## Display Variants

### Horizontal (Default)
Steps displayed in a horizontal line with connecting progress bar.

### Vertical
Steps stacked vertically, ideal for sidebar placement.

### Compact
Minimal display showing only step indicators, perfect for limited space.

### Detailed
Full display with descriptions, time estimates, and additional metadata.

### Circular
Circular progress indicator with percentage completion.

## Advanced Features

### Step Navigation
```typescript
const handleNavigation = (fromStep: number, toStep: number) => {
  // Custom validation logic
  if (toStep > fromStep) {
    // Forward navigation - check prerequisites
    return validateForwardNavigation(fromStep, toStep);
  } else {
    // Backward navigation - usually allowed
    return true;
  }
};

<BookingProgress
  enableNavigation={true}
  onNavigate={handleNavigation}
  // ... other props
/>
```

### Optional Step Skipping
```typescript
<BookingProgress
  allowSkipping={true}
  steps={steps.map(step => ({
    ...step,
    optional: step.id === 'payment' // Payment step is optional
  }))}
  // ... other props
/>
```

### Custom Step Icons
```typescript
const CustomIcon = () => <span>🎯</span>;

const stepsWithIcons = steps.map(step => ({
  ...step,
  icon: step.id === 'service-selection' ? CustomIcon : step.icon
}));
```

### Progress Persistence
```typescript
import { 
  saveProgressToStorage, 
  loadProgressFromStorage 
} from '@/booking/lib/utils';

// Save progress automatically
useEffect(() => {
  saveProgressToStorage(flowType, steps, currentStep, startTime);
}, [flowType, steps, currentStep, startTime]);

// Load saved progress on mount
useEffect(() => {
  const savedProgress = loadProgressFromStorage();
  if (savedProgress) {
    setSteps(savedProgress.steps);
    setCurrentStep(savedProgress.currentStep);
  }
}, []);
```

## Accessibility

### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper ARIA roles and attributes
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Descriptive labels and live announcements
- **Color Contrast**: 4.5:1 minimum contrast ratio
- **Focus Management**: Visible focus indicators
- **Progress Announcements**: Step changes announced to assistive technology

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Tab` | Navigate between clickable steps |
| `Enter/Space` | Activate focused step |
| `Arrow Keys` | Navigate between steps (when enabled) |
| `Home/End` | Jump to first/last step |

## Analytics

### Tracked Events
- `step_enter` - User enters a step
- `step_exit` - User exits a step
- `step_complete` - Step marked as completed
- `step_error` - Error occurs in step
- `step_skip` - Optional step skipped
- `navigation_attempt` - User attempts navigation
- `flow_start` - Flow begins
- `flow_complete` - Flow completed
- `flow_abandon` - User abandons flow

### Analytics Integration
```typescript
<BookingProgress
  onTrack={(event, properties) => {
    // Google Analytics
    gtag('event', event, properties);
    
    // Custom analytics
    analytics.track(event, properties);
  }}
  // ... other props
/>
```

## Performance

### Optimization Features
- **Efficient Rendering**: Minimal re-renders with React optimization
- **Lazy Animations**: Animations only when visible
- **Memory Management**: Automatic cleanup of event listeners
- **Bundle Size**: Optimized CSS and JS

### Performance Targets
- **Initial Render**: < 200ms
- **Step Transition**: < 100ms
- **Animation Duration**: 150-300ms
- **Bundle Size**: < 25KB gzipped

## Customization

### Theming
Use CSS custom properties to customize appearance:
```css
.booking-progress {
  --accent-primary: #your-brand-color;
  --success-primary: #your-success-color;
  --border-radius: 8px;
}
```

### Custom Step Renderer
```typescript
const customStepRenderer = (step, index, isActive) => (
  <div className="custom-step">
    <div className="step-icon">{index + 1}</div>
    <div className="step-content">
      <h3>{step.label}</h3>
      {isActive && <div className="current-indicator">Current</div>}
    </div>
  </div>
);

<BookingProgress
  customStepRenderer={customStepRenderer}
  // ... other props
/>
```

## Error Handling

### Common Issues

**Step Navigation Blocked**
- Check step validation logic
- Verify required steps are completed
- Ensure step is marked as clickable

**Progress Not Updating**
- Verify step status updates
- Check currentStep prop synchronization
- Ensure proper state management

**Accessibility Issues**
- Test with screen readers
- Verify keyboard navigation
- Check ARIA attribute presence

### Debug Mode
Enable detailed logging:
```typescript
<BookingProgress
  onTrack={(event, properties) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Progress Debug:', event, properties);
    }
  }}
  // ... other props
/>
```

## Testing

### Running Tests
```bash
# Run validation tests
npm run test:progress

# Run accessibility tests
npm run test:a11y:progress

# Run performance tests
npm run test:perf:progress
```

### Test Coverage
- **Unit Tests**: Step logic and flow validation
- **Integration Tests**: Navigation and state management
- **Accessibility Tests**: WCAG compliance verification
- **Performance Tests**: Render times and animations
- **E2E Tests**: Complete user workflows

## Deployment Checklist

### Pre-deployment
- [ ] All validation tests passing
- [ ] Accessibility audit complete
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] Analytics integration tested
- [ ] Performance benchmarks met
- [ ] Error handling validated

### Production Setup
- [ ] Analytics tracking configured
- [ ] Error monitoring enabled
- [ ] Performance monitoring active
- [ ] Progress persistence configured
- [ ] Accessibility compliance verified

### Post-deployment
- [ ] Monitor step completion rates
- [ ] Track navigation patterns
- [ ] Validate analytics data
- [ ] Monitor performance metrics
- [ ] Test user workflows end-to-end

## Troubleshooting

### Progress Not Advancing
1. Check step status updates
2. Verify currentStep prop changes
3. Ensure proper validation logic
4. Check console for errors

### Navigation Issues
1. Verify step clickable property
2. Check navigation permission logic
3. Test with different flow types
4. Validate step prerequisites

### Accessibility Problems
1. Run automated accessibility scanner
2. Test with screen reader
3. Verify keyboard navigation
4. Check ARIA attribute presence

## Maintenance

### Regular Tasks
- Update flow configurations for new services
- Review step completion analytics
- Monitor accessibility compliance
- Update performance benchmarks
- Test with new browser versions

### Updates and Versioning
When updating the component:
1. Run full test suite
2. Update flow configurations
3. Test with existing implementations
4. Verify backwards compatibility
5. Update documentation

## Support

For issues and questions:
1. Check component documentation
2. Review flow configuration
3. Test with minimal setup
4. Check browser console for errors
5. Contact development team

---

**Version**: 1.0.0
**Last Updated**: 2025-09-15
**Compatibility**: React 19+, Next.js 15+