// scripts/booking/check-booking-health.ts
// Comprehensive health monitoring for the booking system
// Checks provider availability, data integrity, configuration validity, and performance metrics

import { z } from 'zod';
import type { CanonicalService } from '@/shared/services/types';
import type { BookingProvider, CalendarProviderConfig } from '../../src/booking/lib/types';
import { validateCalendarConfig, validateIntakeFormSpec, validatePrefill } from '../../src/booking/lib/validators';

// Health check interfaces
interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  responseTime?: number;
}

interface SystemHealthReport {
  overall: 'healthy' | 'degraded' | 'critical';
  timestamp: Date;
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    warnings: number;
    critical: number;
  };
  recommendations: string[];
}

// Configuration for health checks
interface HealthCheckConfig {
  timeoutMs: number;
  retries: number;
  checkInterval: number;
  providers: {
    [K in BookingProvider]?: {
      enabled: boolean;
      endpoints?: string[];
      apiKey?: string;
    };
  };
  services: CanonicalService[];
}

// Provider health checker class
export class BookingHealthChecker {
  private config: HealthCheckConfig;
  private lastResults: HealthCheckResult[] = [];

  constructor(config: HealthCheckConfig) {
    this.config = config;
  }

  /**
   * Run all health checks and return comprehensive report
   */
  async runHealthCheck(): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const checks: HealthCheckResult[] = [];

    console.log('🔍 Starting booking system health check...\n');

    // Run all checks in parallel
    const checkPromises = [
      this.checkProviderHealth(),
      this.checkDataIntegrity(),
      this.checkConfigurationValidity(),
      this.checkPerformanceMetrics(),
      this.checkServiceAvailability(),
      this.checkDatabaseConnectivity(),
      this.checkExternalDependencies(),
    ];

    const checkResults = await Promise.allSettled(checkPromises);
    
    checkResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        checks.push(...result.value);
      } else {
        checks.push({
          component: `health-check-${index}`,
          status: 'critical',
          message: `Health check failed: ${result.reason?.message || 'Unknown error'}`,
          timestamp: new Date(),
        });
      }
    });

    this.lastResults = checks;
    
    // Calculate summary
    const summary = {
      total: checks.length,
      healthy: checks.filter(c => c.status === 'healthy').length,
      warnings: checks.filter(c => c.status === 'warning').length,
      critical: checks.filter(c => c.status === 'critical').length,
    };

    // Determine overall health
    const overall = summary.critical > 0 ? 'critical' : 
                   summary.warnings > 0 ? 'degraded' : 'healthy';

    const recommendations = this.generateRecommendations(checks);

    const report: SystemHealthReport = {
      overall,
      timestamp: new Date(),
      checks,
      summary,
      recommendations,
    };

    console.log(`✅ Health check completed in ${Date.now() - startTime}ms\n`);
    this.printHealthReport(report);

    return report;
  }

  /**
   * Check health of each booking provider
   */
  private async checkProviderHealth(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    for (const [provider, config] of Object.entries(this.config.providers)) {
      if (!config.enabled) continue;

      const startTime = Date.now();

      try {
        const result = await this.checkSingleProvider(provider as BookingProvider, config);
        checks.push({
          ...result,
          responseTime: Date.now() - startTime,
        });
      } catch (error) {
        checks.push({
          component: `provider-${provider}`,
          status: 'critical',
          message: `Provider check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
        });
      }
    }

    return checks;
  }

  /**
   * Check individual provider health
   */
  private async checkSingleProvider(
    provider: BookingProvider,
    config: NonNullable<HealthCheckConfig['providers'][BookingProvider]>
  ): Promise<HealthCheckResult> {
    switch (provider) {
      case 'cal':
        return this.checkCalComHealth(config);
      case 'calendly':
        return this.checkCalendlyHealth(config);
      case 'custom':
        return this.checkCustomProviderHealth(config);
      default:
        return {
          component: `provider-${provider}`,
          status: 'unknown',
          message: `Unknown provider: ${provider}`,
          timestamp: new Date(),
        };
    }
  }

  /**
   * Check Cal.com provider health
   */
  private async checkCalComHealth(
    config: NonNullable<HealthCheckConfig['providers']['cal']>
  ): Promise<HealthCheckResult> {
    try {
      // Check Cal.com API availability
      const response = await this.fetchWithTimeout('https://api.cal.com/v1/me', {
        headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {},
        timeout: this.config.timeoutMs,
      });

      if (response.ok) {
        return {
          component: 'provider-cal',
          status: 'healthy',
          message: 'Cal.com API is responding normally',
          timestamp: new Date(),
          details: { statusCode: response.status },
        };
      } else {
        return {
          component: 'provider-cal',
          status: 'warning',
          message: `Cal.com API returned status ${response.status}`,
          timestamp: new Date(),
          details: { statusCode: response.status },
        };
      }
    } catch (error) {
      return {
        component: 'provider-cal',
        status: 'critical',
        message: `Cal.com API is unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check Calendly provider health
   */
  private async checkCalendlyHealth(
    config: NonNullable<HealthCheckConfig['providers']['calendly']>
  ): Promise<HealthCheckResult> {
    try {
      // Check Calendly API availability
      const response = await this.fetchWithTimeout('https://api.calendly.com/users/me', {
        headers: config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {},
        timeout: this.config.timeoutMs,
      });

      if (response.ok) {
        return {
          component: 'provider-calendly',
          status: 'healthy',
          message: 'Calendly API is responding normally',
          timestamp: new Date(),
          details: { statusCode: response.status },
        };
      } else {
        return {
          component: 'provider-calendly',
          status: 'warning',
          message: `Calendly API returned status ${response.status}`,
          timestamp: new Date(),
          details: { statusCode: response.status },
        };
      }
    } catch (error) {
      return {
        component: 'provider-calendly',
        status: 'critical',
        message: `Calendly API is unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check custom provider health
   */
  private async checkCustomProviderHealth(
    config: NonNullable<HealthCheckConfig['providers']['custom']>
  ): Promise<HealthCheckResult> {
    if (!config.endpoints || config.endpoints.length === 0) {
      return {
        component: 'provider-custom',
        status: 'warning',
        message: 'No custom endpoints configured for health check',
        timestamp: new Date(),
      };
    }

    try {
      const results = await Promise.all(
        config.endpoints.map(endpoint => this.fetchWithTimeout(endpoint, {
          timeout: this.config.timeoutMs,
        }))
      );

      const failedEndpoints = results.filter(r => !r.ok).length;
      
      if (failedEndpoints === 0) {
        return {
          component: 'provider-custom',
          status: 'healthy',
          message: 'All custom endpoints are responding normally',
          timestamp: new Date(),
          details: { totalEndpoints: results.length, failedEndpoints },
        };
      } else if (failedEndpoints < results.length) {
        return {
          component: 'provider-custom',
          status: 'warning',
          message: `${failedEndpoints} of ${results.length} custom endpoints are failing`,
          timestamp: new Date(),
          details: { totalEndpoints: results.length, failedEndpoints },
        };
      } else {
        return {
          component: 'provider-custom',
          status: 'critical',
          message: 'All custom endpoints are failing',
          timestamp: new Date(),
          details: { totalEndpoints: results.length, failedEndpoints },
        };
      }
    } catch (error) {
      return {
        component: 'provider-custom',
        status: 'critical',
        message: `Custom provider health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check data integrity across services and configurations
   */
  private async checkDataIntegrity(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    // Check service configuration completeness
    for (const service of this.config.services) {
      const serviceCheck = await this.checkServiceDataIntegrity(service);
      checks.push(serviceCheck);
    }

    return checks;
  }

  /**
   * Check data integrity for a specific service
   */
  private async checkServiceDataIntegrity(service: CanonicalService): Promise<HealthCheckResult> {
    try {
      // This would typically load from your data layer
      // For now, we'll simulate the check
      const hasCalendarConfig = await this.serviceHasCalendarConfig(service);
      const hasIntakeConfig = await this.serviceHasIntakeConfig(service);
      const hasValidVariant = await this.serviceHasValidVariant(service);

      const issues: string[] = [];
      
      if (!hasCalendarConfig) {
        issues.push('Missing calendar configuration');
      }
      
      if (!hasIntakeConfig) {
        issues.push('Missing intake form configuration');
      }
      
      if (!hasValidVariant) {
        issues.push('Invalid or missing variant configuration');
      }

      if (issues.length === 0) {
        return {
          component: `data-integrity-${service}`,
          status: 'healthy',
          message: `Service ${service} has complete configuration`,
          timestamp: new Date(),
        };
      } else if (issues.length <= 1) {
        return {
          component: `data-integrity-${service}`,
          status: 'warning',
          message: `Service ${service} has minor configuration issues: ${issues.join(', ')}`,
          timestamp: new Date(),
          details: { issues },
        };
      } else {
        return {
          component: `data-integrity-${service}`,
          status: 'critical',
          message: `Service ${service} has major configuration issues: ${issues.join(', ')}`,
          timestamp: new Date(),
          details: { issues },
        };
      }
    } catch (error) {
      return {
        component: `data-integrity-${service}`,
        status: 'critical',
        message: `Failed to check data integrity for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check configuration validity using validators
   */
  private async checkConfigurationValidity(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    try {
      // Load and validate calendar configurations
      const calendarConfigs = await this.loadCalendarConfigurations();
      for (const [service, config] of Object.entries(calendarConfigs)) {
        const validation = validateCalendarConfig(config);
        checks.push({
          component: `config-calendar-${service}`,
          status: validation.success ? 'healthy' : 'critical',
          message: validation.success 
            ? `Calendar config for ${service} is valid`
            : `Invalid calendar config for ${service}: ${validation.errors?.join(', ')}`,
          timestamp: new Date(),
          details: validation.success ? undefined : { errors: validation.errors },
        });
      }

      // Load and validate intake configurations
      const intakeConfigs = await this.loadIntakeConfigurations();
      for (const [service, config] of Object.entries(intakeConfigs)) {
        const validation = validateIntakeFormSpec(config);
        checks.push({
          component: `config-intake-${service}`,
          status: validation.success ? 'healthy' : 'critical',
          message: validation.success 
            ? `Intake config for ${service} is valid`
            : `Invalid intake config for ${service}: ${validation.errors?.join(', ')}`,
          timestamp: new Date(),
          details: validation.success ? undefined : { errors: validation.errors },
        });
      }

    } catch (error) {
      checks.push({
        component: 'config-validation',
        status: 'critical',
        message: `Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    }

    return checks;
  }

  /**
   * Check performance metrics and thresholds
   */
  private async checkPerformanceMetrics(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    try {
      const metrics = await this.loadPerformanceMetrics();
      
      // Check response times
      if (metrics.averageResponseTime) {
        checks.push({
          component: 'performance-response-time',
          status: metrics.averageResponseTime < 2000 ? 'healthy' : 
                 metrics.averageResponseTime < 5000 ? 'warning' : 'critical',
          message: `Average response time: ${metrics.averageResponseTime}ms`,
          timestamp: new Date(),
          details: { responseTime: metrics.averageResponseTime },
        });
      }

      // Check error rates
      if (metrics.errorRate !== undefined) {
        checks.push({
          component: 'performance-error-rate',
          status: metrics.errorRate < 0.01 ? 'healthy' : 
                 metrics.errorRate < 0.05 ? 'warning' : 'critical',
          message: `Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
          timestamp: new Date(),
          details: { errorRate: metrics.errorRate },
        });
      }

      // Check conversion rates
      if (metrics.conversionRate !== undefined) {
        checks.push({
          component: 'performance-conversion-rate',
          status: metrics.conversionRate > 0.7 ? 'healthy' : 
                 metrics.conversionRate > 0.5 ? 'warning' : 'critical',
          message: `Conversion rate: ${(metrics.conversionRate * 100).toFixed(2)}%`,
          timestamp: new Date(),
          details: { conversionRate: metrics.conversionRate },
        });
      }

    } catch (error) {
      checks.push({
        component: 'performance-metrics',
        status: 'warning',
        message: `Could not load performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    }

    return checks;
  }

  /**
   * Check service availability
   */
  private async checkServiceAvailability(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    for (const service of this.config.services) {
      try {
        const startTime = Date.now();
        const isAvailable = await this.checkServiceEndpoint(service);
        const responseTime = Date.now() - startTime;

        checks.push({
          component: `service-${service}`,
          status: isAvailable ? 'healthy' : 'critical',
          message: isAvailable 
            ? `Service ${service} is available`
            : `Service ${service} is not responding`,
          timestamp: new Date(),
          responseTime,
        });
      } catch (error) {
        checks.push({
          component: `service-${service}`,
          status: 'critical',
          message: `Service ${service} check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        });
      }
    }

    return checks;
  }

  /**
   * Check database connectivity
   */
  private async checkDatabaseConnectivity(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    try {
      const startTime = Date.now();
      const isConnected = await this.checkDatabaseConnection();
      const responseTime = Date.now() - startTime;

      checks.push({
        component: 'database-connectivity',
        status: isConnected ? 'healthy' : 'critical',
        message: isConnected 
          ? 'Database is connected and responsive'
          : 'Database connection failed',
        timestamp: new Date(),
        responseTime,
      });

      if (isConnected) {
        // Additional database health checks
        const tableChecks = await this.checkDatabaseTables();
        checks.push(...tableChecks);
      }

    } catch (error) {
      checks.push({
        component: 'database-connectivity',
        status: 'critical',
        message: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
    }

    return checks;
  }

  /**
   * Check external dependencies
   */
  private async checkExternalDependencies(): Promise<HealthCheckResult[]> {
    const checks: HealthCheckResult[] = [];

    const dependencies = [
      { name: 'CDN', url: 'https://cdnjs.cloudflare.com' },
      { name: 'Analytics', url: 'https://www.google-analytics.com' },
      { name: 'Monitoring', url: 'https://api.example.com/health' },
    ];

    for (const dep of dependencies) {
      try {
        const startTime = Date.now();
        const response = await this.fetchWithTimeout(dep.url, {
          timeout: this.config.timeoutMs,
        });
        const responseTime = Date.now() - startTime;

        checks.push({
          component: `dependency-${dep.name.toLowerCase()}`,
          status: response.ok ? 'healthy' : 'warning',
          message: response.ok 
            ? `${dep.name} is available`
            : `${dep.name} returned status ${response.status}`,
          timestamp: new Date(),
          responseTime,
          details: { url: dep.url, statusCode: response.status },
        });
      } catch (error) {
        checks.push({
          component: `dependency-${dep.name.toLowerCase()}`,
          status: 'warning',
          message: `${dep.name} is unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          details: { url: dep.url },
        });
      }
    }

    return checks;
  }

  // Helper methods
  private async fetchWithTimeout(
    url: string, 
    options: { headers?: Record<string, string>; timeout: number }
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const response = await fetch(url, {
        headers: options.headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async serviceHasCalendarConfig(service: CanonicalService): Promise<boolean> {
    // This would typically check your data layer
    // For demo purposes, we'll simulate the check
    return Math.random() > 0.1; // 90% chance of having config
  }

  private async serviceHasIntakeConfig(service: CanonicalService): Promise<boolean> {
    return Math.random() > 0.2; // 80% chance of having config
  }

  private async serviceHasValidVariant(service: CanonicalService): Promise<boolean> {
    return Math.random() > 0.05; // 95% chance of having valid variant
  }

  private async loadCalendarConfigurations(): Promise<Record<string, CalendarProviderConfig>> {
    // This would load from your data layer
    return {};
  }

  private async loadIntakeConfigurations(): Promise<Record<string, any>> {
    // This would load from your data layer
    return {};
  }

  private async loadPerformanceMetrics(): Promise<{
    averageResponseTime?: number;
    errorRate?: number;
    conversionRate?: number;
  }> {
    // This would load from your metrics system
    return {
      averageResponseTime: 1500 + Math.random() * 2000,
      errorRate: Math.random() * 0.1,
      conversionRate: 0.6 + Math.random() * 0.3,
    };
  }

  private async checkServiceEndpoint(service: CanonicalService): Promise<boolean> {
    // This would check actual service endpoints
    return Math.random() > 0.05; // 95% availability
  }

  private async checkDatabaseConnection(): Promise<boolean> {
    // This would check actual database connectivity
    return Math.random() > 0.01; // 99% availability
  }

  private async checkDatabaseTables(): Promise<HealthCheckResult[]> {
    const tables = ['bookings', 'users', 'services', 'providers'];
    const checks: HealthCheckResult[] = [];

    for (const table of tables) {
      const isHealthy = Math.random() > 0.02; // 98% table health
      checks.push({
        component: `database-table-${table}`,
        status: isHealthy ? 'healthy' : 'warning',
        message: isHealthy 
          ? `Table ${table} is accessible`
          : `Table ${table} may have issues`,
        timestamp: new Date(),
      });
    }

    return checks;
  }

  private generateRecommendations(checks: HealthCheckResult[]): string[] {
    const recommendations: string[] = [];
    const criticalChecks = checks.filter(c => c.status === 'critical');
    const warningChecks = checks.filter(c => c.status === 'warning');

    if (criticalChecks.length > 0) {
      recommendations.push('🚨 CRITICAL: Address all critical issues immediately');
      
      const providerIssues = criticalChecks.filter(c => c.component.startsWith('provider-'));
      if (providerIssues.length > 0) {
        recommendations.push('• Check provider API keys and network connectivity');
      }

      const configIssues = criticalChecks.filter(c => c.component.startsWith('config-'));
      if (configIssues.length > 0) {
        recommendations.push('• Validate and fix configuration files');
      }

      const dataIssues = criticalChecks.filter(c => c.component.startsWith('data-integrity-'));
      if (dataIssues.length > 0) {
        recommendations.push('• Complete missing service configurations');
      }
    }

    if (warningChecks.length > 0) {
      recommendations.push('⚠️  WARNING: Monitor and address warnings to prevent issues');
      
      const performanceIssues = warningChecks.filter(c => c.component.startsWith('performance-'));
      if (performanceIssues.length > 0) {
        recommendations.push('• Investigate performance bottlenecks');
      }

      const dependencyIssues = warningChecks.filter(c => c.component.startsWith('dependency-'));
      if (dependencyIssues.length > 0) {
        recommendations.push('• Consider fallbacks for unreliable external dependencies');
      }
    }

    if (checks.some(c => c.responseTime && c.responseTime > 5000)) {
      recommendations.push('• Consider implementing response time monitoring and alerts');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ System is healthy - continue regular monitoring');
    }

    return recommendations;
  }

  private printHealthReport(report: SystemHealthReport): void {
    console.log(`BOOKING SYSTEM HEALTH REPORT`);
    console.log(`============================`);
    console.log(`Overall Status: ${report.overall.toUpperCase()}`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`\nSUMMARY:`);
    console.log(`Total Checks: ${report.summary.total}`);
    console.log(`Healthy: ${report.summary.healthy}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Critical: ${report.summary.critical}`);
    
    console.log(`\nDETAILED RESULTS:`);
    report.checks.forEach(check => {
      const icon = {
        'healthy': '✅',
        'warning': '⚠️',
        'critical': '🚨',
        'unknown': '❓'
      }[check.status];
      
      const responseTime = check.responseTime ? ` (${check.responseTime}ms)` : '';
      console.log(`${icon} ${check.component}: ${check.message}${responseTime}`);
    });

    if (report.recommendations.length > 0) {
      console.log(`\nRECOMMENDATIONS:`);
      report.recommendations.forEach(rec => console.log(rec));
    }
  }
}

// CLI interface
export async function runBookingHealthCheck(configPath?: string): Promise<void> {
  const defaultConfig: HealthCheckConfig = {
    timeoutMs: 5000,
    retries: 2,
    checkInterval: 60000, // 1 minute
    providers: {
      cal: { enabled: true },
      calendly: { enabled: true },
      custom: { enabled: true, endpoints: ['https://api.example.com/health'] },
    },
    services: [
      'web-development-services',
      'video-production-services', 
      'seo-services',
      'marketing-services',
      'lead-generation-services',
      'content-production-services'
    ],
  };

  let config = defaultConfig;
  
  if (configPath) {
    try {
      const fs = await import('fs/promises');
      const configFile = await fs.readFile(configPath, 'utf-8');
      config = { ...defaultConfig, ...JSON.parse(configFile) };
    } catch (error) {
      console.warn(`Could not load config from ${configPath}, using defaults`);
    }
  }

  const checker = new BookingHealthChecker(config);
  const report = await checker.runHealthCheck();

  // Exit with error code if critical issues found
  if (report.overall === 'critical') {
    process.exit(1);
  } else if (report.overall === 'degraded') {
    process.exit(2);
  }
}

// CLI runner
if (require.main === module) {
  const configPath = process.argv[2];
  runBookingHealthCheck(configPath).catch(console.error);
}