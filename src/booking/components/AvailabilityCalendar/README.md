# AvailabilityCalendar Component

A production-ready availability calendar component for the Booking domain, featuring multiple view modes, accessibility support, and provider integration.

## Features

- **Multiple Views**: Month, week, and day views
- **Provider Integration**: Support for Cal.com, Calendly, Acuity, and custom providers
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Selection Modes**: Single, multiple, and range selection
- **Timezone Support**: Automatic timezone detection and conversion
- **Performance Optimized**: Efficient rendering and caching
- **Responsive Design**: Mobile-first responsive layout
- **Analytics Ready**: Built-in tracking for user interactions

## Installation & Setup

### 1. File Structure
```
src/booking/components/AvailabilityCalendar/
├── AvailabilityCalendar.tsx
├── AvailabilityCalendar.types.ts
├── AvailabilityCalendar.module.css
└── index.ts
```

### 2. Dependencies
The component requires these utilities from your booking lib:
- `getUserTimezone()` - Get user's timezone
- `formatDuration()` - Format time duration
- `trackBookingCalendarSelect()` - Analytics tracking

### 3. CSS Variables
Ensure your CSS includes these custom properties:
```css
:root {
  --bg-surface: #ffffff;
  --bg-elevated: #f8f9fa;
  --bg-secondary: #f1f5f9;
  --text-primary: #121417;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-danger: #dc2626;
  --border-subtle: #e5e5e5;
  --border-strong: #d1d5db;
  --accent-primary: #0ea5e9;
  --accent-contrast: #ffffff;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --transition-fast: 150ms ease;
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Usage

### Basic Usage
```tsx
import { AvailabilityCalendar } from '@/booking/components/AvailabilityCalendar';

function BookingPage() {
  const config = {
    service: 'web-development-services',
    provider: 'cal',
    minAdvanceHours: 24,
    maxFutureDays: 90
  };

  const handleSlotSelect = (slots) => {
    console.log('Selected slots:', slots);
  };

  const loadAvailability = async (startDate, endDate) => {
    // Fetch availability data from your API
    const response = await fetch(`/api/availability?start=${startDate}&end=${endDate}&service=${config.service}`);
    return response.json();
  };

  return (
    <AvailabilityCalendar
      config={config}
      onSlotSelect={handleSlotSelect}
      onLoadAvailability={loadAvailability}
    />
  );
}
```

### Advanced Usage
```tsx
import { AvailabilityCalendar } from '@/booking/components/AvailabilityCalendar';

function AdvancedBookingPage() {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [currentView, setCurrentView] = useState('month');

  const config = {
    service: 'web-development-services',
    provider: 'cal',
    minAdvanceHours: 24,
    maxFutureDays: 90,
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    },
    availableDays: [1, 2, 3, 4, 5] // Monday-Friday only
  };

  return (
    <AvailabilityCalendar
      config={config}
      view={currentView}
      selectionMode="multiple"
      selectedSlots={selectedSlots}
      timeFormat="24h"
      showPricing={true}
      disableWeekends={true}
      minSlots={1}
      maxSlots={3}
      onSlotSelect={setSelectedSlots}
      onViewChange={setCurrentView}
      onLoadAvailability={loadAvailability}
      analyticsContext="booking-page"
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `CalendarConfig` | Calendar configuration object |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `view` | `'month' \| 'week' \| 'day'` | `'month'` | Initial view mode |
| `selectionMode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Slot selection behavior |
| `selectedSlots` | `TimeSlot[]` | `[]` | Currently selected time slots |
| `userTimezone` | `string` | Auto-detected | User's timezone for display |
| `timeFormat` | `'12h' \| '24h'` | `'12h'` | Time display format |
| `showTimezone` | `boolean` | `true` | Show timezone information |
| `showPricing` | `boolean` | `false` | Display slot pricing |
| `disablePastDates` | `boolean` | `true` | Disable selection of past dates |
| `disableWeekends` | `boolean` | `false` | Disable weekend dates |
| `disabledDates` | `string[]` | `[]` | Specific dates to disable (YYYY-MM-DD) |
| `minSlots` | `number` | `1` | Minimum slots for selection |
| `maxSlots` | `number` | `1` | Maximum slots for selection |
| `className` | `string` | `''` | Additional CSS class |

### Callback Props

| Prop | Type | Description |
|------|------|-------------|
| `onSlotSelect` | `(slots: TimeSlot[]) => void` | Called when slots are selected |
| `onViewChange` | `(view: CalendarView) => void` | Called when view changes |
| `onDateRangeChange` | `(start: string, end: string) => void` | Called when date range changes |
| `onLoadAvailability` | `(start: string, end: string) => Promise<DayAvailability[]>` | Load availability data |

### Component Override Props

| Prop | Type | Description |
|------|------|-------------|
| `loadingComponent` | `React.ComponentType` | Custom loading component |
| `errorComponent` | `React.ComponentType<{error: string; onRetry: () => void}>` | Custom error component |
| `emptyStateComponent` | `React.ComponentType` | Custom empty state component |

## Types

### CalendarConfig
```typescript
interface CalendarConfig {
  service: CanonicalService;
  provider: BookingProvider;
  meetingType?: string;
  minAdvanceHours?: number;
  maxFutureDays?: number;
  availableDays?: number[]; // 0-6, Sunday = 0
  businessHours?: {
    start: string; // "09:00"
    end: string;   // "17:00"
    timezone: string;
  };
}
```

### TimeSlot
```typescript
interface TimeSlot {
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  duration: number;  // minutes
  available: boolean;
  providerId?: string;
  meetingType?: string;
  timezone: string;
  price?: {
    amount: number;
    currency: string;
  };
}
```

### DayAvailability
```typescript
interface DayAvailability {
  date: string; // YYYY-MM-DD
  hasAvailability: boolean;
  slots: TimeSlot[];
  metadata?: {
    dayOfWeek: number;
    isWeekend: boolean;
    isHoliday: boolean;
    specialNote?: string;
  };
}
```

## Accessibility

The component follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support with arrow keys
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Logical focus order and visible focus indicators
- **Color Contrast**: Meets 4.5:1 minimum contrast ratio
- **Motion**: Respects `prefers-reduced-motion` setting

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Keys` | Navigate between dates/slots |
| `Enter/Space` | Select slot or activate button |
| `Escape` | Close modal or clear selection |
| `Tab` | Navigate between interactive elements |

## Performance

### Optimization Features

- **Virtual Scrolling**: Efficient rendering of large date ranges
- **Caching**: Availability data cached to reduce API calls
- **Lazy Loading**: Time slots loaded on demand
- **Debounced Updates**: Prevents excessive re-renders
- **Bundle Splitting**: Dynamic imports for provider-specific code

### Performance Targets

- **Initial Load**: < 500ms
- **View Transitions**: < 200ms
- **Slot Selection**: < 100ms
- **Bundle Size**: < 50KB gzipped

## Testing

### Running Tests
```bash
# Run validation tests
npm run test:calendar

# Run accessibility tests
npm run test:a11y

# Run performance tests
npm run test:perf
```

### Test Coverage
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: Provider integrations
- **Accessibility Tests**: WCAG compliance
- **Visual Tests**: Cross-browser rendering
- **Performance Tests**: Load times and interactions

## Troubleshooting

### Common Issues

**1. Slots not loading**
- Check `onLoadAvailability` function implementation
- Verify API response format matches `DayAvailability[]`
- Check browser console for network errors

**2. Timezone issues**
- Ensure slot times include timezone information
- Verify `userTimezone` prop is correctly set
- Check that server returns times in consistent timezone

**3. Performance issues**
- Reduce date range being loaded
- Implement proper caching in `onLoadAvailability`
- Consider using `React.memo` for parent components

**4. Accessibility issues**
- Ensure proper contrast ratios in custom CSS
- Test with screen readers
- Verify keyboard navigation works

### Debug Mode
Enable debug logging:
```typescript
// Set environment variable
process.env.CALENDAR_DEBUG = 'true';

// Or pass debug prop
<AvailabilityCalendar {...props} debug={true} />
```

## Provider Integration

### Cal.com Setup
```typescript
const calConfig = {
  service: 'web-development-services',
  provider: 'cal',
  meetingType: 'consultation-30min'
};

// API endpoint should return Cal.com availability format
const loadCalAvailability = async (start, end) => {
  const response = await fetch(`/api/cal/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      start, 
      end, 
      eventTypeId: 'your-event-type-id' 
    })
  });
  return response.json();
};
```

### Calendly Setup
```typescript
const calendlyConfig = {
  service: 'web-development-services',
  provider: 'calendly',
  meetingType: 'consultation'
};

// Use Calendly API v2
const loadCalendlyAvailability = async (start, end) => {
  const response = await fetch(`/api/calendly/availability`, {
    headers: {
      'Authorization': `Bearer ${process.env.CALENDLY_TOKEN}`
    }
  });
  return response.json();
};
```

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Accessibility audit complete
- [ ] Performance benchmarks met
- [ ] Provider integrations tested
- [ ] Analytics tracking verified
- [ ] Error handling tested
- [ ] Cross-browser testing complete

### Production Setup
- [ ] Environment variables configured
- [ ] API endpoints secured
- [ ] Rate limiting implemented
- [ ] Monitoring alerts set up
- [ ] Backup error handling in place
- [ ] CDN configured for assets

### Post-deployment
- [ ] Monitor error rates
- [ ] Track performance metrics
- [ ] Validate analytics data
- [ ] Test user workflows
- [ ] Monitor API response times

## Maintenance

### Regular Tasks
- Update provider API integrations
- Review accessibility compliance
- Monitor performance metrics
- Update timezone data
- Review and update test suites

### Monitoring
- Error rates and types
- API response times
- User interaction patterns
- Performance metrics
- Accessibility violations

## Support

For issues and questions:
1. Check this documentation
2. Review component types and props
3. Run validation tests
4. Check browser console for errors
5. Contact development team

---

**Version**: 1.0.0
**Last Updated**: 2025-09-15
**Compatibility**: React 19+, Next.js 15+