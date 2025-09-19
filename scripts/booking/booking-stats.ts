// scripts/booking/booking-stats.ts
// Comprehensive booking system statistics and metrics
// Tracks success rates, provider performance, user behaviors, and system health

import { z } from 'zod';
import type { CanonicalService } from '@/shared/services/types';
import type { BookingProvider, BookingVariant } from '../../src/booking/lib/types';

// Analytics interfaces
interface BookingMetrics {
  totalBookings: number;
  successfulBookings: number;
  failedBookings: number;
  abandonedBookings: number;
  averageCompletionTime: number;
  conversionRate: number;
}

interface ProviderMetrics {
  provider: BookingProvider;
  totalRequests: number;
  successRate: number;
  averageLoadTime: number;
  errorCount: number;
  lastUptime: Date;
}

interface ServiceMetrics {
  service: CanonicalService;
  bookingCount: number;
  popularVariant: BookingVariant;
  averageDuration: number;
  topConversionSources: Array<{ source: string; count: number }>;
}

interface SystemHealth {
  uptime: number;
  errorRate: number;
  activeProviders: BookingProvider[];
  lastHealthCheck: Date;
  criticalIssues: string[];
}

// Validation schemas
const BookingEventSchema = z.object({
  id: z.string(),
  event: z.enum(['view', 'open_modal', 'submit', 'success', 'error', 'abandon']),
  service: z.string().optional(),
  provider: z.string().optional(),
  variant: z.enum(['embed', 'form', 'calendar']).optional(),
  timestamp: z.date(),
  userId: z.string().optional(),
  sessionId: z.string(),
  metadata: z.record(z.any()).optional(),
});

const PerformanceEventSchema = z.object({
  operation: z.string(),
  duration: z.number(),
  success: z.boolean(),
  timestamp: z.date(),
  provider: z.string().optional(),
  errorCode: z.string().optional(),
});

// Statistics calculator class
export class BookingStatistics {
  private events: z.infer<typeof BookingEventSchema>[] = [];
  private performanceEvents: z.infer<typeof PerformanceEventSchema>[] = [];
  
  constructor(
    private readonly dataSource?: {
      getBookingEvents?: (startDate: Date, endDate: Date) => Promise<any[]>;
      getPerformanceEvents?: (startDate: Date, endDate: Date) => Promise<any[]>;
    }
  ) {}

  /**
   * Load events from data source or accept direct input
   */
  async loadEvents(startDate: Date, endDate: Date): Promise<void> {
    if (this.dataSource?.getBookingEvents) {
      const rawEvents = await this.dataSource.getBookingEvents(startDate, endDate);
      this.events = rawEvents.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    }

    if (this.dataSource?.getPerformanceEvents) {
      const rawPerfEvents = await this.dataSource.getPerformanceEvents(startDate, endDate);
      this.performanceEvents = rawPerfEvents.map(event => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    }
  }

  /**
   * Add events directly for testing or real-time updates
   */
  addEvent(event: Omit<z.infer<typeof BookingEventSchema>, 'timestamp'> & { timestamp?: Date }): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || new Date(),
    });
  }

  addPerformanceEvent(event: Omit<z.infer<typeof PerformanceEventSchema>, 'timestamp'> & { timestamp?: Date }): void {
    this.performanceEvents.push({
      ...event,
      timestamp: event.timestamp || new Date(),
    });
  }

  /**
   * Calculate overall booking metrics
   */
  getBookingMetrics(): BookingMetrics {
    const totalBookings = this.countEvents('submit');
    const successfulBookings = this.countEvents('success');
    const failedBookings = this.countEvents('error');
    const abandonedBookings = this.countEvents('abandon');
    
    // Calculate average completion time for successful bookings
    const completionTimes = this.calculateCompletionTimes();
    const averageCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    const conversionRate = totalBookings > 0 ? (successfulBookings / totalBookings) * 100 : 0;

    return {
      totalBookings,
      successfulBookings,
      failedBookings,
      abandonedBookings,
      averageCompletionTime,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  /**
   * Get provider-specific performance metrics
   */
  getProviderMetrics(): ProviderMetrics[] {
    const providers = this.getUniqueProviders();
    
    return providers.map(provider => {
      const providerEvents = this.performanceEvents.filter(e => e.provider === provider);
      const totalRequests = providerEvents.length;
      const successfulRequests = providerEvents.filter(e => e.success).length;
      const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
      
      const loadTimes = providerEvents
        .filter(e => e.operation === 'provider_load')
        .map(e => e.duration);
      const averageLoadTime = loadTimes.length > 0
        ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
        : 0;

      const errorCount = providerEvents.filter(e => !e.success).length;
      const lastUptime = this.getLastProviderUptime(provider);

      return {
        provider: provider as BookingProvider,
        totalRequests,
        successRate: Math.round(successRate * 100) / 100,
        averageLoadTime: Math.round(averageLoadTime),
        errorCount,
        lastUptime,
      };
    });
  }

  /**
   * Get service-specific booking statistics
   */
  getServiceMetrics(): ServiceMetrics[] {
    const services = this.getUniqueServices();
    
    return services.map(service => {
      const serviceEvents = this.events.filter(e => e.service === service);
      const bookingCount = serviceEvents.filter(e => e.event === 'submit').length;
      
      // Find most popular variant
      const variantCounts = serviceEvents.reduce((acc, event) => {
        if (event.variant) {
          acc[event.variant] = (acc[event.variant] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const popularVariant = Object.entries(variantCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] as BookingVariant || 'embed';

      // Calculate average booking duration
      const durations = this.calculateServiceDurations(service);
      const averageDuration = durations.length > 0
        ? durations.reduce((sum, dur) => sum + dur, 0) / durations.length
        : 0;

      // Get top conversion sources
      const sourceCounts = serviceEvents
        .filter(e => e.metadata?.source)
        .reduce((acc, event) => {
          const source = event.metadata?.source;
          acc[source] = (acc[source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const topConversionSources = Object.entries(sourceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => ({ source, count }));

      return {
        service: service as CanonicalService,
        bookingCount,
        popularVariant,
        averageDuration: Math.round(averageDuration),
        topConversionSources,
      };
    });
  }

  /**
   * Assess overall system health
   */
  getSystemHealth(): SystemHealth {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp >= oneDayAgo);
    const errorEvents = recentEvents.filter(e => e.event === 'error');
    const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

    const activeProviders = this.getActiveProviders();
    const criticalIssues = this.identifyCriticalIssues();

    return {
      uptime: this.calculateUptime(),
      errorRate: Math.round(errorRate * 100) / 100,
      activeProviders,
      lastHealthCheck: now,
      criticalIssues,
    };
  }

  /**
   * Generate comprehensive report
   */
  generateReport(format: 'json' | 'text' = 'json'): string {
    const bookingMetrics = this.getBookingMetrics();
    const providerMetrics = this.getProviderMetrics();
    const serviceMetrics = this.getServiceMetrics();
    const systemHealth = this.getSystemHealth();

    const report = {
      generatedAt: new Date().toISOString(),
      period: {
        start: this.getEarliestEventDate(),
        end: this.getLatestEventDate(),
        totalEvents: this.events.length,
      },
      booking: bookingMetrics,
      providers: providerMetrics,
      services: serviceMetrics,
      system: systemHealth,
    };

    if (format === 'text') {
      return this.formatTextReport(report);
    }

    return JSON.stringify(report, null, 2);
  }

  // Private helper methods
  private countEvents(eventType: string): number {
    return this.events.filter(e => e.event === eventType).length;
  }

  private calculateCompletionTimes(): number[] {
    const sessionTimes = new Map<string, { start?: Date; end?: Date }>();

    // Group events by session
    this.events.forEach(event => {
      const session = sessionTimes.get(event.sessionId) || {};
      
      if (event.event === 'view' || event.event === 'open_modal') {
        session.start = session.start || event.timestamp;
      }
      
      if (event.event === 'success') {
        session.end = event.timestamp;
      }

      sessionTimes.set(event.sessionId, session);
    });

    // Calculate completion times
    return Array.from(sessionTimes.values())
      .filter(session => session.start && session.end)
      .map(session => (session.end!.getTime() - session.start!.getTime()) / 1000);
  }

  private getUniqueProviders(): string[] {
    const providers = new Set<string>();
    this.events.forEach(event => {
      if (event.provider) providers.add(event.provider);
    });
    this.performanceEvents.forEach(event => {
      if (event.provider) providers.add(event.provider);
    });
    return Array.from(providers);
  }

  private getUniqueServices(): string[] {
    return Array.from(new Set(this.events.filter(e => e.service).map(e => e.service!)));
  }

  private getLastProviderUptime(provider: string): Date {
    const providerEvents = this.performanceEvents
      .filter(e => e.provider === provider && e.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return providerEvents[0]?.timestamp || new Date(0);
  }

  private calculateServiceDurations(service: string): number[] {
    const serviceSessions = new Map<string, { start?: Date; end?: Date }>();

    this.events
      .filter(e => e.service === service)
      .forEach(event => {
        const session = serviceSessions.get(event.sessionId) || {};
        
        if (event.event === 'view' || event.event === 'open_modal') {
          session.start = session.start || event.timestamp;
        }
        
        if (event.event === 'success' || event.event === 'abandon') {
          session.end = event.timestamp;
        }

        serviceSessions.set(event.sessionId, session);
      });

    return Array.from(serviceSessions.values())
      .filter(session => session.start && session.end)
      .map(session => (session.end!.getTime() - session.start!.getTime()) / 1000);
  }

  private calculateUptime(): number {
    const totalTime = 24 * 60 * 60; // 24 hours in seconds
    const downtime = this.performanceEvents
      .filter(e => !e.success && e.operation === 'provider_load')
      .length * 30; // Assume 30 seconds downtime per failure
    
    return Math.max(0, ((totalTime - downtime) / totalTime) * 100);
  }

  private getActiveProviders(): BookingProvider[] {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentProviders = this.performanceEvents
      .filter(e => e.timestamp >= oneHourAgo && e.success)
      .map(e => e.provider)
      .filter((provider): provider is BookingProvider => 
        provider !== undefined && ['cal', 'calendly', 'custom'].includes(provider)
      );

    return Array.from(new Set(recentProviders));
  }

  private identifyCriticalIssues(): string[] {
    const issues: string[] = [];
    const metrics = this.getBookingMetrics();

    if (metrics.conversionRate < 50) {
      issues.push(`Low conversion rate: ${metrics.conversionRate}%`);
    }

    if (metrics.averageCompletionTime > 600) { // 10 minutes
      issues.push(`High completion time: ${Math.round(metrics.averageCompletionTime / 60)} minutes`);
    }

    const providerMetrics = this.getProviderMetrics();
    providerMetrics.forEach(provider => {
      if (provider.successRate < 90) {
        issues.push(`Provider ${provider.provider} has low success rate: ${provider.successRate}%`);
      }
      
      if (provider.averageLoadTime > 5000) { // 5 seconds
        issues.push(`Provider ${provider.provider} has slow load time: ${provider.averageLoadTime}ms`);
      }
    });

    return issues;
  }

  private getEarliestEventDate(): string {
    const dates = this.events.map(e => e.timestamp);
    return dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString() : '';
  }

  private getLatestEventDate(): string {
    const dates = this.events.map(e => e.timestamp);
    return dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString() : '';
  }

  private formatTextReport(report: any): string {
    return `
BOOKING SYSTEM STATISTICS REPORT
Generated: ${report.generatedAt}
Period: ${report.period.start} to ${report.period.end}
Total Events: ${report.period.totalEvents}

BOOKING METRICS
===============
Total Bookings: ${report.booking.totalBookings}
Successful: ${report.booking.successfulBookings}
Failed: ${report.booking.failedBookings}
Abandoned: ${report.booking.abandonedBookings}
Conversion Rate: ${report.booking.conversionRate}%
Avg Completion Time: ${Math.round(report.booking.averageCompletionTime / 60)} minutes

PROVIDER PERFORMANCE
===================
${report.providers.map((p: any) => 
  `${p.provider.toUpperCase()}: ${p.successRate}% success, ${p.averageLoadTime}ms avg load`
).join('\n')}

SERVICE METRICS
==============
${report.services.map((s: any) => 
  `${s.service}: ${s.bookingCount} bookings, popular variant: ${s.popularVariant}`
).join('\n')}

SYSTEM HEALTH
============
Uptime: ${report.system.uptime}%
Error Rate: ${report.system.errorRate}%
Active Providers: ${report.system.activeProviders.join(', ')}
Critical Issues: ${report.system.criticalIssues.length}

${report.system.criticalIssues.length > 0 ? 
  'CRITICAL ISSUES:\n' + report.system.criticalIssues.map((issue: string) => `- ${issue}`).join('\n') 
  : ''}
`.trim();
  }
}

// CLI interface
export async function generateBookingStats(options: {
  startDate?: Date;
  endDate?: Date;
  format?: 'json' | 'text';
  output?: string;
}): Promise<void> {
  const { startDate, endDate, format = 'json', output } = options;
  
  const stats = new BookingStatistics();
  
  if (startDate && endDate) {
    await stats.loadEvents(startDate, endDate);
  }
  
  const report = stats.generateReport(format);
  
  if (output) {
    const fs = await import('fs/promises');
    await fs.writeFile(output, report);
    console.log(`Report generated: ${output}`);
  } else {
    console.log(report);
  }
}

// CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  const startDate = args[0] ? new Date(args[0]) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = args[1] ? new Date(args[1]) : new Date();
  const format = (args[2] as 'json' | 'text') || 'text';
  
  generateBookingStats({ startDate, endDate, format }).catch(console.error);
}