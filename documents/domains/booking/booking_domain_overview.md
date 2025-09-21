---
title: Booking Domain (Overview)
owner: @conorhovis1
domain: booking
status: stable
updated: 2025-09-19
---

# Booking Domain Overview

The **Booking Domain** enables customers to discover availability, select a slot, and confirm a service appointment. It is one of the highest-value flows in the platform, directly connected to services, packages, and portfolio case studies.

---

## Goals

- Provide a **frictionless scheduling experience** across web and mobile.
- Ensure **data accuracy** (no double bookings, real-time availability).
- Support **multi-step flows**: browse → select → confirm → follow-up.
- Enable **cross-domain integration**:
  - Show relevant **packages** during booking.
  - Showcase **portfolio work** to reinforce trust.
  - Trigger **services domain data** for context.

---

## Core User Flows

1. **Availability → Slot → Confirm**
   - User selects service type or package.
   - System surfaces real-time availability (via provider APIs).
   - User chooses a slot and confirms booking.

2. **Confirmation & Follow-Up**
   - User receives confirmation screen + email/SMS.
   - System syncs with provider calendar and internal DB.

3. **Reschedule & Cancel**
   - User accesses booking management via link.
   - Flow ensures updated availability and notifications.

---

## Data Dependencies

- **Providers / External APIs**
  - Real-time availability from Google/Outlook/other connected calendars.
  - Payment gateways if required (optional integration).

- **Internal Sources**
  - `src/data/services-pages/**` (services taxonomy for booking context).
  - `src/data/packages/**` (package selection and upsell).
  - Portfolio snippets (optional, for credibility).

- **Cross-Domain Contracts**
  - `booking-lib/` provides reusable data loaders and validators.
  - Must align with `services` canonical slugs and taxonomy.

---

## UI Surfaces

- **Main Booking Entry Point**  
  Route: `/booking` (domain landing page).

- **Confirmation Page**  
  Route: `/booking/confirm`.

- **Success Page**  
  Route: `/booking/success`.

- **Widgets & Components**
  - Availability selector
  - Date/time picker
  - Confirmation summary
  - Reschedule/cancel widget

---

## Related Documents

- [Booking Domain Plan](2025-09-15_booking_domain_plan.md) – milestones, risks, and acceptance criteria.
- [Booking Supplemental Guidance](2025-09-15_booking_domain_supplemental-guidance.md) – cross-functional playbook for devs, writers, and stakeholders.
- [Booking CTA Policy](booking_cta_policy.md) – CTA placement and copy rules.
- [Booking Lib Authoring Guide](booking-lib_authoring-guide.md) – standards for developing in `src/booking/lib`.

---

## Owners

- **Domain Owner:** @conorhovis1
- **Engineering Lead:** TBD
- **Content/UX Lead:** TBD
- **QA Lead:** TBD

---

# Complete Booking Domain Implementation Plan

## Executive Summary

This plan transforms your current basic booking setup into a production-ready domain following the established portfolio architecture patterns. It implements a hybrid modal/page strategy with full accessibility, SEO optimization, and canonical service integration.

## 1. Architecture Overview

### Current State Analysis
- **Existing**: Basic `/app/book/page.tsx`, simple modal component, minimal config
- **Gap**: No templates/sections structure, no data facade, limited modal strategy, no canonical service integration
- **Target**: Full domain architecture matching portfolio patterns with hybrid UX strategy

### Target Architecture
```
Booking Domain = App Router + Source Module + Data Layer + Scripts
│
├── App Router (/app/book, /(modals)/book)
├── Source Module (/src/booking) - templates/sections/components/lib
├── Data Layer (/src/data/booking) - facade + canonical service data  
└── Scripts (/scripts/booking) - validation/health/maintenance
```

## 2. Complete Directory Structure

### 2.1 App Router Structure
```
/app
├── book/
│   └── page.tsx                    # Full booking page (SER + SEO)
├── (modals)/
│   └── book/
│       └── page.tsx               # Modal overlay route
└── @modal/                        # Parallel route slot (optional)
    └── book/
        └── page.tsx
```

### 2.2 Source Module Structure (/src/booking)
```
/src/booking/
├── templates/
│   ├── BookingHubTemplate/
│   │   ├── index.ts
│   │   ├── BookingHubTemplate.tsx
│   │   ├── BookingHubTemplate.types.ts
│   │   └── BookingHubTemplate.module.css
│   ├── BookingModalTemplate/
│   │   ├── index.ts
│   │   ├── BookingModalTemplate.tsx
│   │   ├── BookingModalTemplate.types.ts
│   │   └── BookingModalTemplate.module.css
│   └── index.ts
├── sections/
│   ├── BookingHeroSection/
│   │   ├── index.ts
│   │   ├── BookingHeroSection.tsx
│   │   ├── BookingHeroSection.types.ts
│   │   ├── BookingHeroSection.module.css
│   │   └── utils/
│   │       └── bookingHeroValidator.ts
│   ├── BookingSection/
│   │   ├── index.ts
│   │   ├── BookingSection.tsx
│   │   ├── BookingSection.types.ts
│   │   ├── BookingSection.module.css
│   │   └── utils/
│   │       └── bookingSectionValidator.ts
│   ├── BookingOptionsSection/
│   │   ├── index.ts
│   │   ├── BookingOptionsSection.tsx
│   │   ├── BookingOptionsSection.types.ts
│   │   ├── BookingOptionsSection.module.css
│   │   └── utils/
│   │       └── bookingOptionsValidator.ts
│   ├── BookingFAQSection/
│   │   ├── index.ts
│   │   ├── BookingFAQSection.tsx
│   │   ├── BookingFAQSection.types.ts
│   │   └── BookingFAQSection.module.css
│   └── index.ts
├── components/
│   ├── SchedulerEmbed/
│   │   ├── index.ts
│   │   ├── SchedulerEmbed.tsx
│   │   ├── SchedulerEmbed.types.ts
│   │   └── SchedulerEmbed.module.css
│   ├── BookingForm/
│   │   ├── index.ts
│   │   ├── BookingForm.tsx
│   │   ├── BookingForm.types.ts
│   │   └── BookingForm.module.css
│   ├── AvailabilityCalendar/
│   │   ├── index.ts
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── AvailabilityCalendar.types.ts
│   │   └── AvailabilityCalendar.module.css
│   ├── TimezonePicker/
│   │   ├── index.ts
│   │   ├── TimezonePicker.tsx
│   │   ├── TimezonePicker.types.ts
│   │   └── TimezonePicker.module.css
│   ├── ConsentPolicies/
│   │   ├── index.ts
│   │   ├── ConsentPolicies.tsx
│   │   ├── ConsentPolicies.types.ts
│   │   └── ConsentPolicies.module.css
│   ├── BookingConfirmation/
│   │   ├── index.ts
│   │   ├── BookingConfirmation.tsx
│   │   ├── BookingConfirmation.types.ts
│   │   └── BookingConfirmation.module.css
│   ├── MeetingTypeSelector/
│   │   ├── index.ts
│   │   ├── MeetingTypeSelector.tsx
│   │   ├── MeetingTypeSelector.types.ts
│   │   └── MeetingTypeSelector.module.css
│   ├── BookingProgress/
│   │   ├── index.ts
│   │   ├── BookingProgress.tsx
│   │   ├── BookingProgress.types.ts
│   │   └── BookingProgress.module.css
│   └── index.ts
├── lib/
│   ├── types.ts                   # Core booking types
│   ├── adapters.ts               # Data transformation adapters
│   ├── validators.ts             # Domain validation schemas
│   ├── registry.ts               # Component/provider registry
│   ├── metrics.ts                # Analytics helpers
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # Domain constants
├── hooks/
│   ├── useBookingFlow.ts
│   ├── useBookingAnalytics.ts
│   ├── useBookingModal.ts
│   └── index.ts
└── index.ts                      # Public API barrel
```

### 2.3 Data Layer Structure (/src/data/booking)
```
/src/data/booking/
├── index.ts                      # Facade API
├── _types/
│   └── index.ts                  # Raw data types
├── _utils/
│   ├── normalization.ts          # Data normalization
│   ├── search.ts                 # Search utilities
│   └── validation.ts             # Data validation
├── _validators/
│   ├── schema.ts                 # Zod schemas
│   └── booking.validate.ts       # Validation functions
├── calendars/                    # Calendar configs per service
│   ├── web-development-services.ts
│   ├── video-production-services.ts
│   ├── seo-services.ts
│   ├── marketing-services.ts
│   ├── lead-generation-services.ts
│   ├── content-production-services.ts
│   └── index.ts
├── intake/                       # Intake forms per service
│   ├── web-development-services.ts
│   ├── video-production-services.ts
│   ├── seo-services.ts
│   ├── marketing-services.ts
│   ├── lead-generation-services.ts
│   ├── content-production-services.ts
│   └── index.ts
├── providers/                    # External provider configs
│   ├── cal-com.ts
│   ├── calendly.ts
│   ├── acuity.ts
│   └── index.ts
├── policies/
│   ├── gdpr.md
│   ├── cancellation.md
│   ├── privacy.md
│   └── terms.md
├── configs/
│   ├── booking-hub.ts            # Hub page configuration
│   ├── modal-defaults.ts         # Modal defaults
│   └── analytics.ts              # Analytics configuration
└── README.md
```

### 2.4 Scripts Structure (/scripts/booking)
```
/scripts/booking/
├── validate-booking.ts           # Schema & consistency validation
├── check-booking-health.ts       # Health monitoring (providers, data integrity)
├── booking-stats.ts              # Statistics and metrics
├── fix-booking-data.ts           # Auto-fixer for common issues
├── migrate-booking.ts            # Data migration utilities
├── test-providers.ts             # Provider connectivity tests
└── README.md
```

## 3. Implementation Strategy

### 3.1 Phase 1: Foundation (Week 1)
**Objective**: Establish core architecture and data structures

**Tasks**:
1. **Create source module structure**
   - Set up `/src/booking` with proper directory structure
   - Implement core types and validators in `lib/`
   - Create basic adapters for data transformation

2. **Establish data layer**
   - Create `/src/data/booking` facade
   - Implement canonical service data structure
   - Set up provider configurations

3. **Build core templates**
   - `BookingHubTemplate` for full page experience
   - `BookingModalTemplate` for overlay experience
   - Ensure both follow established design patterns

### 3.2 Phase 2: Components & Sections (Week 2)
**Objective**: Build reusable UI components and orchestrator sections

**Tasks**:
1. **Core booking components**
   - `SchedulerEmbed` with provider abstraction
   - `BookingForm` with validation
   - `MeetingTypeSelector` with service-specific options

2. **Orchestrator sections**
   - `BookingSection` with variant switching
   - `BookingHeroSection` with contextual messaging
   - `BookingOptionsSection` with service-specific configurations

3. **Enhanced UX components**
   - `AvailabilityCalendar` for inline scheduling
   - `TimezonePicker` with smart defaults
   - `BookingProgress` for multi-step flows

### 3.3 Phase 3: Modal Strategy & Routing (Week 3)
**Objective**: Implement hybrid modal/page strategy with proper routing

**Tasks**:
1. **App Router enhancement**
   - Implement `/(modals)/book/page.tsx`
   - Set up intercepted routes for seamless UX
   - Ensure proper back/forward navigation

2. **Modal strategy implementation**
   - Enhance existing `BookingModal` component
   - Implement decision logic from `bookingPolicy.ts`
   - Add analytics tracking for modal interactions

3. **CTA integration**
   - Update service page CTAs to use modal strategy
   - Implement context passing for service-specific booking
   - Add fallback mechanisms for modal failures

### 3.4 Phase 4: Advanced Features & Polish (Week 4)
**Objective**: Add advanced features, accessibility, and production readiness

**Tasks**:
1. **Advanced booking features**
   - Multi-step booking flows
   - Service-specific intake forms
   - Automated follow-up sequences

2. **Accessibility & Performance**
   - Focus management in modals
   - Screen reader compatibility
   - Performance optimization with lazy loading

3. **Analytics & Monitoring**
   - Comprehensive event tracking
   - Conversion funnel analysis
   - Error monitoring and fallbacks

## 4. Key Components Specification

### 4.1 BookingHubTemplate
```typescript
interface BookingHubTemplateProps {
  meta: {
    title: string;
    subtitle?: string;
    description?: string;
  };
  hero: BookingHeroSectionProps;
  options: BookingOptionsSectionProps;
  faq?: BookingFAQSectionProps;
  analytics: AnalyticsContext;
  features: {
    showHero: boolean;
    showOptions: boolean;
    showFAQ: boolean;
  };
}
```

### 4.2 BookingModalTemplate
```typescript
interface BookingModalTemplateProps {
  booking: BookingSectionProps;
  context: BookingContext;
  analytics: AnalyticsContext;
  onClose: () => void;
  onSuccess?: (data: BookingResult) => void;
}
```

### 4.3 BookingSection (Orchestrator)
```typescript
interface BookingSectionProps {
  variant: BookingVariant;
  service?: CanonicalService;
  meetingTypes?: MeetingType[];
  calendar?: CalendarConfig;
  intake?: IntakeFormSpec;
  prefill?: BookingPrefill;
  onSuccess?: (result: BookingResult) => void;
  onError?: (error: BookingError) => void;
}

type BookingVariant = "embed" | "form" | "calendar" | "hybrid";
```

## 5. Data Contracts & Types

### 5.1 Core Types
```typescript
// Core booking types
export interface BookingIntent {
  service: CanonicalService;
  meetingType: string;
  duration: number;
  timezone: string;
  preferredTimes?: TimeSlot[];
}

export interface MeetingType {
  id: string;
  label: string;
  description?: string;
  duration: number;
  price?: number;
  provider: BookingProvider;
  providerConfig: ProviderConfig;
}

export interface CalendarConfig {
  provider: BookingProvider;
  embedUrl: string;
  apiKey?: string;
  eventTypeId?: string;
  customization?: ProviderCustomization;
}

export interface IntakeFormSpec {
  fields: IntakeField[];
  required: string[];
  validation: ValidationRules;
}

export type BookingProvider = "cal-com" | "calendly" | "acuity" | "custom";
export type CanonicalService = "web-development-services" | "video-production-services" | "seo-services" | "marketing-services" | "lead-generation-services" | "content-production-services";
```

### 5.2 Data Facade API
```typescript
// /src/data/booking/index.ts
export interface BookingFacade {
  getBookingHub(): Promise<BookingHubData>;
  getServiceBookingData(service: CanonicalService): Promise<ServiceBookingData>;
  getMeetingTypes(service?: CanonicalService): Promise<MeetingType[]>;
  getIntakeForm(service: CanonicalService): Promise<IntakeFormSpec>;
  getCalendarConfig(service: CanonicalService): Promise<CalendarConfig>;
  searchAvailability(params: AvailabilitySearchParams): Promise<TimeSlot[]>;
}
```

## 6. Modal Strategy Implementation

### 6.1 Decision Logic Enhancement
```typescript
// Enhanced from existing bookingPolicy.ts
export function chooseBookingMode(opts: BookingModeOptions): {
  mode: BookingMode;
  reason: string;
  fallbackUrl: string;
  analytics: Record<string, any>;
} {
  const { mode, reason, analytics } = chooseBookingModeWithContext(opts, context);
  
  return {
    mode,
    reason,
    fallbackUrl: buildFallbackUrl(opts),
    analytics
  };
}

export function buildFallbackUrl(opts: BookingModeOptions): string {
  const params = new URLSearchParams();
  if (opts.service) params.set('service', opts.service);
  if (opts.context) params.set('context', opts.context);
  if (opts.source) params.set('source', opts.source);
  
  return `/book?${params.toString()}`;
}
```

### 6.2 CTA Integration Pattern
```typescript
// Enhanced CTA component
export function BookingCTA({ context }: { context: BookingContext }) {
  const { mode, fallbackUrl } = useBookingMode(context);
  
  const handleBookingClick = useCallback((e: React.MouseEvent) => {
    if (mode === "modal") {
      e.preventDefault();
      openBookingModal({
        service: context.service,
        source: context.source,
        prefill: context.prefill
      });
    }
    // Otherwise allow natural navigation to fallbackUrl
  }, [mode, context]);
  
  return (
    <Link href={fallbackUrl} onClick={handleBookingClick}>
      Book a Consultation
    </Link>
  );
}
```

## 7. Scripts & Maintenance

### 7.1 Validation Scripts
```bash
# Booking domain validation
npm run validate:booking                 # Full validation
npm run validate:booking:providers       # Test provider connectivity
npm run validate:booking:data           # Data integrity checks

# Health monitoring
npm run health:booking                  # Overall health check
npm run health:booking:providers        # Provider status
npm run health:booking:forms           # Form validation

# Statistics
npm run stats:booking                   # Usage statistics
npm run stats:booking:conversion        # Conversion metrics
npm run stats:booking:providers         # Provider performance
```

### 7.2 Development Workflow
```bash
# Development commands
npm run booking:dev                     # Development mode with hot reload
npm run booking:test                    # Run booking domain tests
npm run booking:lint                    # Lint booking domain code

# Maintenance commands  
npm run booking:fix                     # Auto-fix common issues
npm run booking:migrate                 # Run data migrations
npm run booking:cleanup                 # Clean up old data
```

## 8. SEO & Accessibility Requirements

### 8.1 SEO Implementation
- **Full page** (`/book`): Complete metadata, JSON-LD schema, canonical URLs
- **Modal route**: Minimal/inherited metadata, focuses on functionality
- **Service-specific booking**: Dynamic metadata based on service context
- **Structured data**: Implement `Service`, `Offer`, and `LocalBusiness` schemas

### 8.2 Accessibility Features
- **Focus management**: Proper focus trapping in modals
- **Screen reader support**: Comprehensive ARIA labels and descriptions  
- **Keyboard navigation**: Full keyboard accessibility
- **Reduced motion**: Respect `prefers-reduced-motion` settings
- **High contrast**: Support for high contrast mode
- **Mobile optimization**: Touch-friendly interfaces with proper tap targets

## 9. Analytics & Performance

### 9.1 Analytics Events
```typescript
// Core booking events
export const BookingEvents = {
  BOOKING_VIEW: 'booking_view',
  BOOKING_START: 'booking_start',
  BOOKING_STEP: 'booking_step',
  BOOKING_SUCCESS: 'booking_success',
  BOOKING_ABANDON: 'booking_abandon',
  MODAL_OPEN: 'booking_modal_open',
  MODAL_CLOSE: 'booking_modal_close',
  PROVIDER_ERROR: 'booking_provider_error'
} as const;
```

### 9.2 Performance Optimizations
- **Lazy loading**: Modal components loaded on demand
- **Code splitting**: Provider-specific code split by service
- **Preloading**: Critical booking data preloaded on service pages
- **Caching**: Aggressive caching of calendar availability
- **Error boundaries**: Graceful fallbacks for provider failures

## 10. Quality Assurance Checklist

### 10.1 Functional Requirements
- [ ] Full booking page renders with all meeting types
- [ ] Modal overlay works from all service pages
- [ ] Back/forward navigation maintains state
- [ ] Provider embeds load and function correctly
- [ ] Form validation works across all scenarios
- [ ] Success/error states display appropriately
- [ ] Mobile responsive design functions properly

### 10.2 Technical Requirements  
- [ ] TypeScript strict mode compliance
- [ ] All components have proper prop types
- [ ] Error boundaries catch and handle failures
- [ ] Analytics events fire correctly
- [ ] SEO metadata complete and accurate
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Performance budgets met (LCP < 2.5s, FID < 100ms)

### 10.3 Business Requirements
- [ ] All canonical services supported
- [ ] Service-specific intake forms functional
- [ ] Provider configurations tested
- [ ] Conversion funnel tracking implemented
- [ ] Error monitoring and alerting configured
- [ ] A/B testing capability implemented

## 11. Success Metrics

### 11.1 User Experience Metrics
- **Conversion Rate**: Booking completion rate > 15%
- **Time to Book**: Average booking completion < 3 minutes
- **Modal Engagement**: Modal usage > 60% on service pages
- **Error Rate**: Provider/form errors < 2%

### 11.2 Technical Metrics
- **Page Load Speed**: LCP < 2.5 seconds
- **Accessibility Score**: Lighthouse A11y > 95
- **SEO Score**: Lighthouse SEO > 95
- **Bundle Size**: Booking domain < 100kb gzipped

### 11.3 Business Metrics
- **Lead Quality**: Booking leads conversion > 25%
- **Service Distribution**: Even distribution across all services
- **Channel Attribution**: Clear source tracking
- **Revenue Impact**: Measurable increase in qualified leads

## 12. Migration Path

### 12.1 Current State Migration
1. **Preserve existing functionality**: Ensure current `/book` page continues working
2. **Gradual enhancement**: Implement new architecture alongside existing
3. **Feature flags**: Control rollout of new modal functionality
4. **Data migration**: Migrate existing booking configurations
5. **Analytics continuity**: Maintain existing tracking during transition

### 12.2 Rollout Strategy
1. **Internal testing** (Week 1): Team testing of core functionality
2. **Beta testing** (Week 2): Limited external user testing
3. **Staged rollout** (Week 3): Gradual rollout to increasing traffic
4. **Full deployment** (Week 4): Complete rollout with monitoring

## Conclusion

This comprehensive plan transforms your basic booking functionality into a production-ready domain that matches your established architecture patterns. The hybrid modal/page strategy provides optimal user experience while maintaining SEO benefits and accessibility standards.

The implementation follows the proven portfolio domain architecture, ensuring consistency and maintainability across your codebase. With proper monitoring, analytics, and gradual rollout, this booking system will significantly improve user conversion while providing a scalable foundation for future enhancements.

---

Based on the project documentation and your current booking implementation, I'll provide a comprehensive plan for building a complete, production-ready Booking domain that follows the established architecture patterns and meets all requirements.I've created a comprehensive implementation plan that transforms your current basic booking setup into a production-ready domain following your established architecture patterns. Here are the key highlights:

## **Current State Analysis**
Your existing setup has the basic pieces but lacks the full domain architecture:
- ✅ Basic `/app/book/page.tsx` and modal component  
- ❌ No templates/sections structure
- ❌ No data facade with canonical service integration
- ❌ Limited modal strategy implementation
- ❌ No validation/health scripts

## **Key Architecture Decisions**

1. **Hybrid Modal/Page Strategy**: Following your CTA policy document exactly - modals for engaged users on desktop, full pages for mobile/accessibility/SEO

2. **Portfolio Architecture Alignment**: Using the same templates→sections→components→lib structure that you've perfected

3. **Canonical Service Integration**: Full compliance with your `*-services` naming standards across all booking data

## **What Gets Built**

### **Core Infrastructure** 
- **2 App Router pages**: Full `/book` page + `/(modals)/book` overlay
- **2 Templates**: `BookingHubTemplate` + `BookingModalTemplate` 
- **4 Key Sections**: Hero, Booking, Options, FAQ
- **8 Components**: Scheduler embeds, forms, calendar, timezone picker, etc.

### **Data Layer**
- **Facade API** with 6 canonical service configurations
- **Provider abstraction** (Cal.com, Calendly, Acuity)
- **Service-specific** intake forms and calendar configs
- **Validation & health scripts** for data integrity

### **Advanced Features**
- **Smart modal decisions** using your existing `bookingPolicy.ts`
- **Analytics integration** with conversion funnel tracking  
- **Accessibility compliance** (focus traps, screen readers, keyboard nav)
- **Performance optimization** (lazy loading, code splitting, caching)

## **Implementation Timeline**
- **Week 1**: Foundation (core architecture, data structures)
- **Week 2**: Components & sections (UI building blocks) 
- **Week 3**: Modal strategy & routing (hybrid UX implementation)
- **Week 4**: Advanced features & polish (analytics, a11y, performance)

## **Quality Assurance**
The plan includes comprehensive checklists for functional, technical, and business requirements, plus success metrics to ensure the booking system drives real conversion improvements.

This approach gives you a booking domain that's not just functional, but truly production-ready with monitoring, health checks, and scalability built in from day one. Would you like me to dive deeper into any specific aspect of the implementation, such as the data layer structure or the modal strategy details?