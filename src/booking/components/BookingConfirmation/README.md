# BookingConfirmation Component

A comprehensive booking confirmation component for the Booking domain, providing users with detailed confirmation information, calendar integration, and action management capabilities.

## Features

- **Comprehensive Confirmation Display**: Shows all booking details with clear visual hierarchy
- **Calendar Integration**: Add to Google, Outlook, Apple, Yahoo calendars or download ICS
- **Action Management**: Reschedule, cancel, and support contact functionality
- **Share Capabilities**: Share confirmation via link, email, or print
- **Preparation Guidance**: Expandable preparation checklist and instructions
- **Follow-up Information**: Next steps and resource links
- **Responsive Design**: Mobile-first responsive layout
- **Accessibility**: WCAG 2.1 AA compliant
- **Print Support**: Print-optimized layout
- **Analytics Ready**: Built-in tracking for user interactions

## Installation & Setup

### 1. File Structure
```
src/booking/components/BookingConfirmation/
├── BookingConfirmation.tsx
├── BookingConfirmation.types.ts
├── BookingConfirmation.module.css
└── index.ts
```

### 2. Dependencies
The component requires these utilities from your booking lib:
- `formatDisplayDate()` - Format dates for display
- `formatTime()` - Format time strings
- `getUserTimezone()` - Get user's timezone
- `trackBookingConfirmation()` - Analytics tracking

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
  --border-danger: #fca5a5;
  
  /* Accent colors */
  --accent-primary: #0ea5e9;
  --accent-secondary: #0284c7;
  --accent-contrast: #ffffff;
  
  /* Success colors */
  --success-primary: #10b981;
  --success-secondary: #059669;
  --success-contrast: #ffffff;
  
  /* Warning colors */
  --warning-primary: #f59e0b;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 28px;
  --spacing-2xl: 32px;
  
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
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  /* Fonts */
  --font-body: system-ui, sans-serif;
  --font-heading: inherit;
  --font-mono: 'Monaco', 'Menlo', monospace;
}
```

## Usage

### Basic Usage
```tsx
import { BookingConfirmation } from '@/booking/components/BookingConfirmation';

function ConfirmationPage() {
  const booking = {
    id: 'booking_123',
    referenceNumber: 'BK12345678',
    service: 'web-development-services',
    provider: 'cal',
    meetingType: 'Strategy Consultation',
    startTime: '2025-01-15T14:00:00Z',
    endTime: '2025-01-15T14:30:00Z',
    duration: 30,
    timezone: 'America/New_York',
    location: {
      type: 'video',
      details: {
        platform: 'zoom',
        joinUrl: 'https://zoom.us/j/123456789',
        meetingId: '123 456 789'
      }
    },
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
      timezone: 'America/New_York'
    },
    status: 'confirmed',
    createdAt: '2025-01-10T10:00:00Z'
  };

  return (
    <BookingConfirmation
      booking={booking}
      onAction={(action, data) => console.log('Action:', action, data)}
      onTrack={(event, properties) => console.log('Track:', event, properties)}
    />
  );
}
```

### Advanced Usage with All Features
```tsx
import { BookingConfirmation } from '@/booking/components/BookingConfirmation';

function AdvancedConfirmationPage() {
  const booking = {
    // ... booking data
  };

  const actions = {
    rescheduleUrl: '/reschedule/BK12345678',
    cancelUrl: '/cancel/BK12345678',
    contactSupport: () => window.open('/support', '_blank')
  };

  const preparation = {
    checklist: [
      'Review your current website',
      'Gather brand guidelines',
      'Prepare competitor examples'
    ],
    prepTime: 15,
    techRequirements: ['Stable internet', 'Updated browser']
  };

  const followUp = {
    nextSteps: [
      'Proposal delivery within 2 business days',
      'Review period of 1 week',
      'Project kickoff meeting'
    ],
    timeline: 'Project start: 1-2 weeks after approval',
    resources: [
      {
        title: 'Development Process Guide',
        url: '/process-guide',
        description: 'Learn about our methodology'
      }
    ]
  };

  return (
    <BookingConfirmation
      booking={booking}
      actions={actions}
      preparation={preparation}
      followUp={followUp}
      showCalendarIntegration={true}
      showShareOptions={true}
      onAction={handleAction}
      onTrack={handleTracking}
    />
  );
}
```

## Props API

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `booking` | `ConfirmedBooking` | Complete booking information |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `BookingActions` | `undefined` | Available booking actions |
| `preparation` | `PreparationInfo` | `undefined` | Preparation guidance |
| `followUp` | `FollowUpInfo` | `undefined` | Follow-up information |
| `showDetails` | `boolean` | `true` | Show detailed booking info |
| `showPreparation` | `boolean` | `true` | Show preparation section |
| `showFollowUp` | `boolean` | `true` | Show follow-up section |
| `showCalendarIntegration` | `boolean` | `true` | Show calendar options |
| `showShareOptions` | `boolean` | `true` | Show share functionality |
| `successMessage` | `string` | `"Your booking has been confirmed!"` | Custom success message |
| `className` | `string` | `""` | Additional CSS class |
| `printMode` | `boolean` | `false` | Print-optimized layout |
| `actionsLoading` | `boolean` | `false` | Loading state for actions |
| `actionsDisabled` | `boolean` | `false` | Disable all actions |

### Callback Props

| Prop | Type | Description |
|------|------|-------------|
| `onAction` | `(action: string, data?: any) => void` | Called when user takes action |
| `onTrack` | `(event: string, properties: object) => void` | Analytics tracking callback |

## Data Types

### ConfirmedBooking
```typescript
interface ConfirmedBooking {
  id: string;
  referenceNumber: string;
  service: CanonicalService;
  provider: BookingProvider;
  meetingType: string;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  duration: number;  // minutes
  timezone: string;
  location: MeetingLocation;
  customer: CustomerInfo;
  status: BookingStatus;
  createdAt: string;
  pricing?: BookingPricing;
  notes?: string;
}
```

### MeetingLocation
```typescript
interface MeetingLocation {
  type: "video" | "phone" | "in-person" | "hybrid";
  details: VideoMeetingDetails | PhoneMeetingDetails | InPersonMeetingDetails;
  instructions?: string;
  timezone?: string;
}
```

### BookingActions
```typescript
interface BookingActions {
  rescheduleUrl?: string;
  cancelUrl?: string;
  downloadCalendar?: () => void;
  addToCalendar?: {
    google: string;
    outlook: string;
    apple: string;
    yahoo: string;
  };
  shareBooking?: () => void;
  contactSupport?: () => void;
}
```

## Features in Detail

### Calendar Integration
The component provides seamless calendar integration:
- **Google Calendar**: Direct link to add event
- **Outlook**: Microsoft Calendar integration
- **Apple Calendar**: iCal file download
- **Yahoo Calendar**: Yahoo Calendar link
- **ICS Download**: Standard calendar file

### Meeting Location Types

**Video Meetings**
- Platform detection (Zoom, Google Meet, Teams)
- Join URL with one-click access
- Meeting ID and password display
- Dial-in numbers if available

**Phone Meetings**
- Primary phone number
- Conference ID if applicable
- Extension numbers

**In-Person Meetings**
- Full address display
- Building and parking information
- Timezone indication

### Action Management
- **Reschedule**: Direct link to reschedule interface
- **Cancel**: Cancellation workflow link
- **Support**: Contact support functionality
- **Loading States**: Visual feedback during actions

### Share Functionality
- **Copy Link**: Clipboard integration
- **Email**: Native email client
- **Print**: Print-optimized layout
- **Social**: Platform sharing (if supported)

## Accessibility

### WCAG 2.1 AA Compliance
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user preferences

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Tab` | Navigate between interactive elements |
| `Enter/Space` | Activate buttons and links |
| `Escape` | Close expandable sections |

## Customization

### Theming
Use CSS custom properties to customize appearance:
```css
.confirmation {
  --accent-primary: #your-brand-color;
  --success-primary: #your-success-color;
  --font-heading: 'Your Font', sans-serif;
}
```

### Custom Components
Override default components:
```tsx
<BookingConfirmation
  booking={booking}
  loadingComponent={CustomLoader}
  errorComponent={CustomError}
/>
```

### Custom Icons
Replace default icons by modifying the component or using CSS:
```css
.confirmation .iconClass::before {
  content: '🎯'; /* Your custom icon */
}
```

## Performance

### Optimization Features
- **Lazy Loading**: Calendar integration loaded on demand
- **Memoization**: Expensive calculations cached
- **Efficient Rendering**: Minimal re-renders
- **Bundle Splitting**: Separate chunks for calendar providers

### Performance Targets
- **Initial Render**: < 200ms
- **Action Response**: < 100ms
- **Calendar Generation**: < 50ms
- **Bundle Size**: < 30KB gzipped

## Testing

### Running Tests
```bash
# Run validation tests
npm run test:confirmation

# Run accessibility tests
npm run test:a11y:confirmation

# Run visual regression tests
npm run test:visual:confirmation
```

### Test Coverage
- **Unit Tests**: Component logic and utilities
- **Integration Tests**: Calendar and sharing functionality
- **Accessibility Tests**: WCAG compliance verification
- **Visual Tests**: Cross-browser appearance
- **Performance Tests**: Render and interaction times

## Analytics

### Tracked Events
- `booking_confirmation_view`: Initial page view
- `booking_confirmation_action`: User actions (reschedule, cancel)
- `booking_calendar_integration`: Calendar additions
- `booking_confirmation_share`: Share actions
- `booking_confirmation_duration`: Time spent on page

### Custom Tracking
```tsx
<BookingConfirmation
  booking={booking}
  onTrack={(event, properties) => {
    // Send to your analytics service
    analytics.track(event, properties);
  }}
/>
```

## Error Handling

### Common Issues

**Invalid Booking Data**
- Validate booking object structure
- Check required fields presence
- Verify date/time formats

**Calendar Integration Failures**
- Handle URL generation errors
- Provide fallback download options
- Show user-friendly error messages

**Network Issues**
- Implement retry mechanisms
- Cache calendar URLs
- Graceful degradation

### Debug Mode
Enable detailed logging:
```tsx
<BookingConfirmation
  booking={booking}
  onTrack={(event, properties) => {
    console.log('Confirmation Event:', event, properties);
  }}
/>
```

## Provider Integration

### Cal.com Integration
```typescript
const booking = {
  provider: 'cal',
  providerData: {
    cal: {
      bookingUid: 'cal_booking_123',
      eventTypeId: 'event_type_456',
      rescheduleUrl: 'https://cal.com/reschedule/...',
      cancelUrl: 'https://cal.com/cancel/...'
    }
  }
};
```

### Calendly Integration
```typescript
const booking = {
  provider: 'calendly',
  providerData: {
    calendly: {
      eventUuid: 'calendly_event_123',
      rescheduleUrl: 'https://calendly.com/reschedule/...',
      cancelUrl: 'https://calendly.com/cancel/...'
    }
  }
};
```

## Deployment Checklist

### Pre-deployment
- [ ] All validation tests passing
- [ ] Accessibility audit complete
- [ ] Cross-browser testing done
- [ ] Mobile responsiveness verified
- [ ] Print layout tested
- [ ] Analytics integration verified
- [ ] Calendar integrations tested
- [ ] Error handling validated

### Production Setup
- [ ] Environment variables configured
- [ ] Analytics tracking enabled
- [ ] Error monitoring active
- [ ] Performance monitoring set up
- [ ] CDN configured for assets

### Post-deployment
- [ ] Monitor confirmation page metrics
- [ ] Track calendar integration usage
- [ ] Validate analytics data flow
- [ ] Monitor error rates
- [ ] Test user workflows end-to-end

## Troubleshooting

### Calendar Integration Issues
1. Verify URL generation logic
2. Test with different timezones
3. Check date format compliance
4. Validate provider-specific requirements

### Accessibility Issues
1. Run automated accessibility scanner
2. Test with screen readers
3. Verify keyboard navigation
4. Check color contrast ratios

### Performance Issues
1. Profile component rendering
2. Optimize heavy computations
3. Implement lazy loading
4. Monitor bundle size

## Maintenance

### Regular Tasks
- Update calendar provider APIs
- Review analytics data
- Update accessibility standards
- Monitor performance metrics
- Test cross-browser compatibility

### Version Updates
When updating the component:
1. Run full test suite
2. Update documentation
3. Test with real booking data
4. Verify backwards compatibility
5. Update changelog

## Support

For issues and questions:
1. Check component documentation
2. Review validation errors in console
3. Test with mock data
4. Check browser network tab for errors
5. Contact development team with specific error details

---

**Version**: 1.0.0
**Last Updated**: 2025-09-15
**Compatibility**: React 19+, Next.js 15+