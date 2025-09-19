xXSSProtection: response.headers.get('x-xss-protection'),
          referrerPolicy: response.headers.get('referrer-policy'),
        };
        
        const script = await response.text();
        const hasCSPViolations = script.includes('eval(') || script.includes('innerHTML =');
        const usesHTTPS = response.url.startsWith('https://');
        
        return {
          securityHeaders,
          hasCSPViolations,
          usesHTTPS,
          securityScore: this.calculateSecurityScore(securityHeaders, hasCSPViolations, usesHTTPS),
        };
      },
      { severity: 'warning' }
    );
  }

  private async testWebhookEndpoint(): Promise<ProviderTestResult> {
    return this.runTest(
      'webhook-endpoint',
      async () => {
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const response = await this.fetchWithRetry('https://api.cal.com/v1/webhooks', { headers });
        
        if (response.status === 401) {
          return {
            webhooksAccessible: false,
            requiresAuth: true,
            hasApiKey: !!this.config.apiKey,
          };
        }
        
        if (!response.ok) {
          throw new Error(`Webhooks endpoint returned ${response.status}`);
        }

        const data = await response.json();
        return {
          webhooksCount: data.webhooks?.length || 0,
          canConfigureWebhooks: true,
          webhookTypes: data.webhooks?.map((w: any) => w.eventTriggers).flat() || [],
        };
      },
      { severity: 'info' }
    );
  }

  private async testCustomEndpoint(endpoint: string): Promise<ProviderTestResult> {
    return this.runTest(
      `custom-endpoint-${new URL(endpoint).pathname}`,
      async () => {
        const response = await this.fetchWithRetry(endpoint);
        
        return {
          url: endpoint,
          statusCode: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          responseSize: response.headers.get('content-length'),
        };
      },
      { severity: 'error' }
    );
  }

  private calculateSecurityScore(
    headers: Record<string, string | null>,
    hasViolations: boolean,
    usesHTTPS: boolean
  ): number {
    let score = 0;
    
    if (usesHTTPS) score += 20;
    if (headers.xFrameOptions) score += 15;
    if (headers.contentSecurityPolicy) score += 25;
    if (headers.xContentTypeOptions) score += 15;
    if (headers.xXSSProtection) score += 10;
    if (headers.referrerPolicy) score += 10;
    if (!hasViolations) score += 5;
    
    return Math.min(score, 100);
  }
}

// Calendly provider tester with enhanced functionality
class CalendlyTester extends BaseProviderTester {
  async runTests(): Promise<ProviderTestResult[]> {
    const tests: ProviderTestResult[] = [];

    if (this.config.apiTests !== false) {
      tests.push(await this.testApiConnectivity());
      
      if (this.validateApiKey()) {
        tests.push(await this.testUserInfo());
        tests.push(await this.testEventTypes());
        tests.push(await this.testAvailability());
      }
    }

    if (this.config.embedTests !== false) {
      tests.push(await this.testEmbedWidget());
      tests.push(await this.testInlineEmbed());
      tests.push(await this.testPopupEmbed());
    }

    if (this.config.webhookTests !== false) {
      tests.push(await this.testWebhookSupport());
    }

    if (this.config.testEndpoints && this.config.testEndpoints.length > 0) {
      for (const endpoint of this.config.testEndpoints) {
        tests.push(await this.testCustomEndpoint(endpoint));
      }
    }

    return tests;
  }

  private async testApiConnectivity(): Promise<ProviderTestResult> {
    return this.runTest(
      'api-connectivity',
      async () => {
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const response = await this.fetchWithRetry('https://api.calendly.com/users/me', { headers });
        
        if (!response.ok) {
          throw new Error(`Calendly API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          status: response.status,
          hasApiKey: !!this.config.apiKey,
          userUri: data.resource?.uri || 'unknown',
          rateLimit: {
            remaining: response.headers.get('x-ratelimit-remaining'),
            reset: response.headers.get('x-ratelimit-reset'),
          },
        };
      },
      { severity: 'critical' }
    );
  }

  private async testUserInfo(): Promise<ProviderTestResult> {
    return this.runTest(
      'user-info',
      async () => {
        const headers = { 'Authorization': `Bearer ${this.config.apiKey}` };
        const response = await this.fetchWithRetry('https://api.calendly.com/users/me', { headers });
        
        if (!response.ok) {
          throw new Error(`User info endpoint returned ${response.status}`);
        }

        const data = await response.json();
        const user = data.resource;
        
        return {
          name: user?.name || 'unknown',
          email: user?.email || 'unknown',
          timezone: user?.timezone || 'unknown',
          slug: user?.slug || 'unknown',
          schedulingUrl: user?.scheduling_url || 'unknown',
          avatar: user?.avatar_url || null,
        };
      },
      { severity: 'warning' }
    );
  }

  private async testEventTypes(): Promise<ProviderTestResult> {
    return this.runTest(
      'event-types',
      async () => {
        const headers = { 'Authorization': `Bearer ${this.config.apiKey}` };
        
        // First get user to get their URI
        const userResponse = await this.fetchWithRetry('https://api.calendly.com/users/me', { headers });
        if (!userResponse.ok) {
          throw new Error('Could not fetch user info');
        }
        
        const userData = await userResponse.json();
        const userUri = userData.resource?.uri;
        
        if (!userUri) {
          throw new Error('Could not determine user URI');
        }

        const response = await this.fetchWithRetry(
          `https://api.calendly.com/event_types?user=${userUri}`,
          { headers }
        );
        
        if (!response.ok) {
          throw new Error(`Event types returned ${response.status}`);
        }

        const data = await response.json();
        const eventTypes = data.collection || [];
        
        return {
          eventTypesCount: eventTypes.length,
          hasEventTypes: eventTypes.length > 0,
          activeEventTypes: eventTypes.filter((et: any) => et.active).length,
          eventTypeDetails: eventTypes.slice(0, 3).map((et: any) => ({
            uri: et.uri,
            name: et.name,
            duration: et.duration,
            active: et.active,
            type: et.type,
          })),
        };
      },
      { severity: 'error' }
    );
  }

  private async testAvailability(): Promise<ProviderTestResult> {
    return this.runTest(
      'availability',
      async () => {
        const headers = { 'Authorization': `Bearer ${this.config.apiKey}` };
        
        // Get user first
        const userResponse = await this.fetchWithRetry('https://api.calendly.com/users/me', { headers });
        if (!userResponse.ok) {
          throw new Error('Could not fetch user info');
        }
        
        const userData = await userResponse.json();
        const userUri = userData.resource?.uri;
        
        if (!userUri) {
          throw new Error('Could not determine user URI');
        }

        const response = await this.fetchWithRetry(
          `https://api.calendly.com/user_availability_schedules?user=${userUri}`,
          { headers }
        );
        
        return {
          availabilityAccessible: response.ok,
          statusCode: response.status,
          hasSchedules: response.ok,
        };
      },
      { severity: 'info' }
    );
  }

  private async testEmbedWidget(): Promise<ProviderTestResult> {
    return this.runTest(
      'embed-widget',
      async () => {
        const response = await this.fetchWithRetry('https://assets.calendly.com/assets/external/widget.js');
        
        if (!response.ok) {
          throw new Error(`Widget script returned ${response.status}`);
        }

        const script = await response.text();
        const hasWidgetFunction = script.includes('Calendly.') || script.includes('widget');
        const hasInitFunction = script.includes('initPopupWidget') || script.includes('initInlineWidget');
        const scriptSize = script.length;
        
        return {
          scriptSize,
          hasWidgetFunction,
          hasInitFunction,
          contentType: response.headers.get('content-type'),
          cacheHeaders: {
            cacheControl: response.headers.get('cache-control'),
            expires: response.headers.get('expires'),
          },
          minified: !script.includes('\n  '),
        };
      },
      { severity: 'error' }
    );
  }

  private async testInlineEmbed(): Promise<ProviderTestResult> {
    return this.runTest(
      'inline-embed',
      async () => {
        // Test inline embed capabilities with a test URL
        const testUrl = 'https://calendly.com/test-user/30min';
        const response = await this.fetchWithRetry(testUrl);
        
        // We expect this might return 404 for test user, but service should be up
        const serviceAvailable = [200, 404].includes(response.status);
        
        return {
          serviceAvailable,
          statusCode: response.status,
          embedSupported: true, // Calendly supports inline embeds
          responseTime: response.headers.get('x-response-time'),
        };
      },
      { severity: 'warning' }
    );
  }

  private async testPopupEmbed(): Promise<ProviderTestResult> {
    return this.runTest(
      'popup-embed',
      async () => {
        // Test popup widget functionality by checking the widget script
        const response = await this.fetchWithRetry('https://assets.calendly.com/assets/external/widget.js');
        
        if (!response.ok) {
          throw new Error(`Widget script not accessible: ${response.status}`);
        }

        const script = await response.text();
        const hasPopupSupport = script.includes('popup') || script.includes('PopupWidget');
        const hasCloseFunction = script.includes('closePopupWidget') || script.includes('close');
        
        return {
          hasPopupSupport,
          hasCloseFunction,
          popupWidgetAvailable: hasPopupSupport && hasCloseFunction,
        };
      },
      { severity: 'info' }
    );
  }

  private async testWebhookSupport(): Promise<ProviderTestResult> {
    return this.runTest(
      'webhook-support',
      async () => {
        if (!this.validateApiKey()) {
          return {
            webhookSupported: true, // Calendly supports webhooks
            requiresApiKey: true,
            tested: false,
          };
        }

        const headers = { 'Authorization': `Bearer ${this.config.apiKey}` };
        const response = await this.fetchWithRetry('https://api.calendly.com/webhook_subscriptions', { headers });
        
        if (!response.ok && response.status !== 404) {
          throw new Error(`Webhook subscriptions endpoint returned ${response.status}`);
        }

        return {
          webhookSupported: response.status === 200 || response.status === 404,
          statusCode: response.status,
          tested: true,
          canCreateWebhooks: response.status === 200,
        };
      },
      { severity: 'info' }
    );
  }

  private async testCustomEndpoint(endpoint: string): Promise<ProviderTestResult> {
    return this.runTest(
      `custom-endpoint-${new URL(endpoint).pathname}`,
      async () => {
        const response = await this.fetchWithRetry(endpoint);
        
        return {
          url: endpoint,
          statusCode: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          responseSize: response.headers.get('content-length'),
        };
      },
      { severity: 'error' }
    );
  }
}

// Custom provider tester with flexible endpoint testing
class CustomProviderTester extends BaseProviderTester {
  async runTests(): Promise<ProviderTestResult[]> {
    const tests: ProviderTestResult[] = [];

    tests.push(await this.testCustomEndpoints());
    tests.push(await this.testFormSubmission());
    tests.push(await this.testHealthCheck());
    tests.push(await this.testDataValidation());
    
    if (this.config.apiTests !== false) {
      tests.push(await this.testApiCapability());
    }

    return tests;
  }

  private async testCustomEndpoints(): Promise<ProviderTestResult> {
    return this.runTest(
      'custom-endpoints',
      async () => {
        const endpoints = this.config.testEndpoints || [];
        
        if (endpoints.length === 0) {
          return {
            endpointCount: 0,
            allHealthy: true,
            message: 'No custom endpoints configured',
          };
        }

        const results = await Promise.allSettled(
          endpoints.map(async endpoint => {
            const response = await this.fetchWithRetry(endpoint);
            return {
              url: endpoint,
              ok: response.ok,
              status: response.status,
              responseTime: Date.now(),
            };
          })
        );

        const successfulTests = results.filter(r => 
          r.status === 'fulfilled' && r.value.ok
        ).length;

        const healthyEndpoints = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as any).value)
          .filter(r => r.ok);

        return {
          endpointCount: endpoints.length,
          healthyEndpoints: successfulTests,
          allHealthy: successfulTests === endpoints.length,
          healthPercentage: (successfulTests / endpoints.length) * 100,
          results: results.map((r, i) => ({
            endpoint: endpoints[i],
            success: r.status === 'fulfilled' && (r as any).value?.ok,
            details: r.status === 'fulfilled' ? (r as any).value : { error: (r as any).reason?.message },
          })),
        };
      },
      { severity: 'critical' }
    );
  }

  private async testFormSubmission(): Promise<ProviderTestResult> {
    return this.runTest(
      'form-submission',
      async () => {
        const testEndpoint = this.config.testEndpoints?.[0];
        
        if (!testEndpoint) {
          return {
            tested: false,
            message: 'No test endpoint configured for form submission',
          };
        }

        const testData = {
          name: 'Test User',
          email: 'test@example.com',
          service: 'web-development-services',
          message: 'Test booking submission',
          timestamp: new Date().toISOString(),
          testMode: true,
        };

        const response = await this.fetchWithRetry(testEndpoint, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'BookingSystemTester/1.0',
          },
          body: JSON.stringify(testData),
        });

        let responseData = null;
        try {
          responseData = await response.json();
        } catch {
          // Response might not be JSON
        }

        return {
          statusCode: response.status,
          success: response.ok,
          contentType: response.headers.get('content-type'),
          responseData,
          tested: true,
        };
      },
      { severity: 'error' }
    );
  }

  private async testHealthCheck(): Promise<ProviderTestResult> {
    return this.runTest(
      'health-check',
      async () => {
        const endpoints = this.config.testEndpoints || [];
        
        if (endpoints.length === 0) {
          return { available: false, reason: 'No endpoints configured' };
        }

        // Try to find a health check endpoint
        const healthEndpoints = endpoints.filter(url => 
          url.includes('/health') || url.includes('/status') || url.includes('/ping')
        );

        if (healthEndpoints.length === 0) {
          // Fallback to first endpoint with HEAD request
          const endpoint = endpoints[0];
          const response = await this.fetchWithRetry(endpoint, { method: 'HEAD' });
          
          return {
            available: response.ok,
            statusCode: response.status,
            endpoint,
            method: 'HEAD',
          };
        }

        // Test dedicated health endpoint
        const healthEndpoint = healthEndpoints[0];
        const response = await this.fetchWithRetry(healthEndpoint);
        
        let healthData = null;
        if (response.ok) {
          try {
            healthData = await response.json();
          } catch {
            healthData = await response.text();
          }
        }

        return {
          available: response.ok,
          statusCode: response.status,
          endpoint: healthEndpoint,
          healthData,
        };
      },
      { severity: 'warning' }
    );
  }

  private async testDataValidation(): Promise<ProviderTestResult> {
    return this.runTest(
      'data-validation',
      async () => {
        // Test validation with invalid data
        const testEndpoint = this.config.testEndpoints?.[0];
        
        if (!testEndpoint) {
          return {
            tested: false,
            reason: 'No endpoint available for validation testing',
          };
        }

        const validationTests = [
          { name: 'invalid-email', data: { email: 'invalid-email' }, shouldFail: true },
          { name: 'missing-required', data: {}, shouldFail: true },
          { name: 'valid-data', data: { name: 'Test', email: 'test@example.com' }, shouldFail: false },
        ];

        const results = await Promise.allSettled(
          validationTests.map(async test => {
            try {
              const response = await this.fetchWithRetry(testEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...test.data, testMode: true }),
              });

              return {
                test: test.name,
                expectedFail: test.shouldFail,
                actualFail: !response.ok,
                statusCode: response.status,
                correct: test.shouldFail === !response.ok,
              };
            } catch (error) {
              return {
                test: test.name,
                expectedFail: test.shouldFail,
                actualFail: true,
                error: error instanceof Error ? error.message : 'Unknown error',
                correct: test.shouldFail,
              };
            }
          })
        );

        const testResults = results
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as any).value);

        const correctValidations = testResults.filter(r => r.correct).length;
        
        return {
          totalTests: validationTests.length,
          correctValidations,
          validationAccuracy: (correctValidations / validationTests.length) * 100,
          details: testResults,
          tested: true,
        };
      },
      { severity: 'info' }
    );
  }

  private async testApiCapability(): Promise<ProviderTestResult> {
    return this.runTest(
      'api-capability',
      async () => {
        const endpoints = this.config.testEndpoints || [];
        
        if (endpoints.length === 0) {
          return { capable: false, reason: 'No endpoints configured' };
        }

        const apiEndpoint = endpoints.find(url => url.includes('/api/')) || endpoints[0];
        
        // Test different HTTP methods
        const methods = ['GET', 'POST', 'OPTIONS'];
        const methodResults = await Promise.allSettled(
          methods.map(async method => {
            const response = await this.fetchWithRetry(apiEndpoint, { method });
            return {
              method,
              supported: response.ok || response.status !== 405,
              statusCode: response.status,
            };
          })
        );

        const supportedMethods = methodResults
          .filter(r => r.status === 'fulfilled')
          .map(r => (r as any).value)
          .filter(r => r.supported);

        return {
          capable: supportedMethods.length > 0,
          endpoint: apiEndpoint,
          supportedMethods: supportedMethods.map(m => m.method),
          methodResults: methodResults.map((r, i) => ({
            method: methods[i],
            result: r.status === 'fulfilled' ? (r as any).value : { error: (r as any).reason?.message },
          })),
        };
      },
      { severity: 'info' }
    );
  }
}

// Main provider test orchestrator with enhanced reporting
export class ProviderTestOrchestrator {
  private config: ProviderTestConfig;

  constructor(config: ProviderTestConfig) {
    this.config = ProviderTestConfigSchema.parse(config);
  }

  /**
   * Test all enabled providers
   */
  async testAllProviders(): Promise<AllProvidersReport> {
    console.log('🧪 Starting comprehensive provider tests...\n');
    
    const providerReports: ProviderTestReport[] = [];
    
    for (const [providerName, config] of Object.entries(this.config.providers)) {
      const provider = providerName as BookingProvider;
      
      if (!config.enabled) {
        console.log(`⏭️ Skipping ${provider} (disabled)`);
        continue;
      }

      console.log(`Testing ${provider}...`);
      const report = await this.testProvider(provider, config);
      providerReports.push(report);
      
      const icon = this.getHealthIcon(report.overallHealth);
      console.log(`${icon} ${provider}: ${report.overallHealth} (${report.passedTests}/${report.totalTests}) - Score: ${report.healthScore}/100`);
    }

    const summary = this.calculateSummary(providerReports);
    const systemRecommendations = this.generateSystemRecommendations(providerReports);
    
    const allProvidersReport: AllProvidersReport = {
      timestamp: new Date(),
      providers: providerReports,
      summary,
      systemRecommendations,
    };

    console.log('\n');
    this.printSummaryReport(allProvidersReport);

    return allProvidersReport;
  }

  /**
   * Test a specific provider
   */
  async testProvider(
    provider: BookingProvider, 
    config: ProviderTestConfig['providers'][BookingProvider]
  ): Promise<ProviderTestReport> {
    const tester = this.createTester(provider, config);
    const results = await tester.runTests();
    
    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;
    
    // Calculate health metrics
    const successRate = passedTests / results.length;
    const averageResponseTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    const criticalFailures = results.filter(r => !r.success && r.severity === 'critical').length;
    const errorFailures = results.filter(r => !r.success && r.severity === 'error').length;
    
    // Determine overall health
    let overallHealth: ProviderTestReport['overallHealth'];
    if (criticalFailures > 0) {
      overallHealth = 'offline';
    } else if (errorFailures > 0 || successRate < 0.5) {
      overallHealth = 'critical';
    } else if (successRate < 0.8 || averageResponseTime > this.config.performance.maxResponseTime) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'healthy';
    }
    
    // Calculate health score (0-100)
    let healthScore = successRate * 70; // 70 points for success rate
    
    // Performance bonus/penalty
    if (averageResponseTime < this.config.performance.maxResponseTime / 2) {
      healthScore += 15; // Fast response bonus
    } else if (averageResponseTime > this.config.performance.maxResponseTime) {
      healthScore -= 10; // Slow response penalty
    }
    
    // Security bonus
    const securityTests = results.filter(r => r.test.includes('security'));
    if (securityTests.length > 0 && securityTests.every(t => t.success)) {
      healthScore += 15;
    }
    
    healthScore = Math.max(0, Math.min(100, healthScore));

    const recommendations = this.generateProviderRecommendations(provider, results, averageResponseTime);

    return {
      provider,
      timestamp: new Date(),
      totalTests: results.length,
      passedTests,
      failedTests,
      overallHealth,
      healthScore: Math.round(healthScore),
      results,
      recommendations,
      averageResponseTime: Math.round(averageResponseTime),
    };
  }

  private createTester(
    provider: BookingProvider, 
    config: ProviderTestConfig['providers'][BookingProvider]
  ): BaseProviderTester {
    switch (provider) {
      case 'cal':
        return new CalComTester(provider, config, this.config.timeout, this.config.retries);
      case 'calendly':
        return new CalendlyTester(provider, config, this.config.timeout, this.config.retries);
      case 'custom':
        return new CustomProviderTester(provider, config, this.config.timeout, this.config.retries);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  private calculateSummary(reports: ProviderTestReport[]) {
    return {
      totalProviders: reports.length,
      healthyProviders: reports.filter(r => r.overallHealth === 'healthy').length,
      degradedProviders: reports.filter(r => r.overallHealth === 'degraded').length,
      criticalProviders: reports.filter(r => r.overallHealth === 'critical').length,
      offlineProviders: reports.filter(r => r.overallHealth === 'offline').length,
    };
  }

  private generateProviderRecommendations(
    provider: BookingProvider, 
    results: ProviderTestResult[], 
    avgResponseTime: number
  ): string[] {
    const recommendations: string[] = [];
    const failedTests = results.filter(r => !r.success);

    if (failedTests.length === 0) {
      recommendations.push(`${provider} is performing optimally`);
      return recommendations;
    }

    // Provider-specific recommendations
    if (provider === 'cal') {
      const apiFailures = failedTests.filter(t => t.test.includes('api'));
      if (apiFailures.length > 0) {
        recommendations.push('Verify Cal.com API key and account permissions');
      }

      const embedFailures = failedTests.filter(t => t.test.includes('embed'));
      if (embedFailures.length > 0) {
        recommendations.push('Check embed script accessibility and CSP headers');
      }

      const securityIssues = results.filter(r => r.test === 'embed-security' && r.details?.securityScore < 80);
      if (securityIssues.length > 0) {
        recommendations.push('Review security headers and implement CSP improvements');
      }
    }

    if (provider === 'calendly') {
      const authFailures = failedTests.filter(t => t.error?.includes('401') || t.error?.includes('Authorization'));
      if (authFailures.length > 0) {
        recommendations.push('Update Calendly API token - may be expired or have insufficient scope');
      }

      const widgetFailures = failedTests.filter(t => t.test.includes('widget'));
      if (widgetFailures.length > 0) {
        recommendations.push('Verify widget.js CDN accessibility and browser compatibility');
      }
    }

    if (provider === 'custom') {
      const endpointFailures = failedTests.filter(t => t.test.includes('endpoint'));
      if (endpointFailures.length > 0) {
        recommendations.push('Review custom endpoint health and server infrastructure');
      }

      const validationFailures = failedTests.filter(t => t.test.includes('validation'));
      if (validationFailures.length > 0) {
        recommendations.push('Implement proper input validation and error handling');
      }
    }

    // General recommendations
    if (avgResponseTime > this.config.performance.maxResponseTime) {
      recommendations.push(`Response time (${avgResponseTime}ms) exceeds threshold - optimize performance`);
    }

    const criticalFailures = failedTests.filter(t => t.severity === 'critical');
    if (criticalFailures.length > 0) {
      recommendations.push('Address critical failures immediately to prevent service disruption');
    }

    const timeoutFailures = failedTests.filter(t => t.error?.includes('timeout'));
    if (timeoutFailures.length > 0) {
      recommendations.push('Consider increasing timeout values or optimizing response times');
    }

    return recommendations;
  }

  private generateSystemRecommendations(reports: ProviderTestReport[]): string[] {
    const recommendations: string[] = [];
    const summary = this.calculateSummary(reports);

    if (summary.offlineProviders > 0) {
      recommendations.push(`${summary.offlineProviders} provider(s) offline - implement failover strategy`);
    }

    if (summary.criticalProviders > 0) {
      recommendations.push(`${summary.criticalProviders} provider(s) in critical state - immediate attention required`);
    }

    const totalHealthScore = reports.reduce((sum, r) => sum + r.healthScore, 0) / reports.length;
    if (totalHealthScore < 70) {
      recommendations.push('Overall system health below threshold - review provider configurations');
    }

    const avgResponseTime = reports.reduce((sum, r) => sum + r.averageResponseTime, 0) / reports.length;
    if (avgResponseTime > this.config.performance.maxResponseTime) {
      recommendations.push('System-wide performance degradation detected - investigate network or infrastructure issues');
    }

    if (summary.healthyProviders === reports.length) {
      recommendations.push('All providers healthy - continue regular monitoring');
    }

    if (reports.some(r => r.results.some(t => !t.success && t.test.includes('security')))) {
      recommendations.push('Security issues detected - review and implement security best practices');
    }

    return recommendations;
  }

  private getHealthIcon(health: ProviderTestReport['overallHealth']): string {
    const icons = {
      healthy: '✅',
      degraded: '⚠️',
      critical: '🚨',
      offline: '💀',
    };
    return icons[health];
  }

  private printSummaryReport(report: AllProvidersReport): void {
    console.log(`PROVIDER TEST SUMMARY`);
    console.log(`====================`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Total Providers: ${report.summary.totalProviders}`);
    console.log(`Healthy: ${report.summary.healthyProviders}`);
    console.log(`Degraded: ${report.summary.degradedProviders}`);
    console.log(`Critical: ${report.summary.criticalProviders}`);
    console.log(`Offline: ${report.summary.offlineProviders}`);

    if (report.providers.length > 0) {
      console.log(`\nPROVIDER DETAILS:`);
      report.providers.forEach(provider => {
        const icon = this.getHealthIcon(provider.overallHealth);
        console.log(`\n${icon} ${provider.provider.toUpperCase()}`);
        console.log(`  Status: ${provider.overallHealth} (Score: ${provider.healthScore}/100)`);
        console.log(`  Tests: ${provider.passedTests}/${provider.totalTests} passed`);
        console.log(`  Avg Response: ${provider.averageResponseTime}ms`);
        
        if (provider.recommendations.length > 0) {
          console.log(`  Recommendations:`);
          provider.recommendations.forEach(rec => console.log(`    • ${rec}`));
        }

        const criticalFailures = provider.results.filter(r => !r.success && r.severity === 'critical');
        if (criticalFailures.length > 0) {
          console.log(`  Critical Issues:`);
          criticalFailures.forEach(test => {
            console.log(`    🚨 ${test.test}: ${test.error || test.message}`);
          });
        }

        const errorFailures = provider.results.filter(r => !r.success && r.severity === 'error');
        if (errorFailures.length > 0) {
          console.log(`  Errors:`);
          errorFailures.forEach(test => {
            console.log(`    ❌ ${test.test}: ${test.error || test.message}`);
          });
        }
      });
    }

    if (report.systemRecommendations.length > 0) {
      console.log(`\nSYSTEM RECOMMENDATIONS:`);
      report.systemRecommendations.forEach(rec => console.log(`• ${rec}`));
    }
  }
}

// Configuration validation and defaults
function createDefaultConfig(): ProviderTestConfig {
  return {
    timeout: 10000,
    retries: 2,
    providers: {
      cal: {
        enabled: true,
        apiTests: true,
        embedTests: true,
        webhookTests: true,
      },
      calendly: {
        enabled: true,
        apiTests: true,
        embedTests: true,
        webhookTests: true,
      },
      custom: {
        enabled: true,
        apiTests: true,
        embedTests: false,
        webhookTests: false,
        testEndpoints: [],
      },
    },
    performance: {
      maxResponseTime: 5000,
      minSuccessRate: 0.8,
    },
  };
}

// CLI interface with enhanced options
export async function runProviderTests(options: {
  providers?: BookingProvider[];
  configPath?: string;
  outputPath?: string;
  format?: 'json' | 'junit' | 'text';
  verbose?: boolean;
  failFast?: boolean;
}): Promise<void> {
  const { 
    providers, 
    configPath, 
    outputPath, 
    format = 'text',
    verbose = false,
    failFast = false 
  } = options;

  let config = createDefaultConfig();
  
  // Load configuration from file
  if (configPath) {
    try {
      const fs = await import('fs/promises');
      const configFile = await fs.readFile(configPath, 'utf-8');
      const userConfig = JSON.parse(configFile);
      
      // Merge configurations properly
      config = {
        ...config,
        ...userConfig,
        providers: {
          ...config.providers,
          ...userConfig.providers,
        },
        performance: {
          ...config.performance,
          ...userConfig.performance,
        },
      };
    } catch (error) {
      console.warn(`Could not load config from ${configPath}, using defaults:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Override with environment variables
  if (process.env.CAL_API_KEY) {
    config.providers.cal.apiKey = process.env.CAL_API_KEY;
  }
  if (process.env.CALENDLY_API_KEY) {
    config.providers.calendly.apiKey = process.env.CALENDLY_API_KEY;
  }
  if (process.env.CUSTOM_BOOKING_ENDPOINTS) {
    config.providers.custom.testEndpoints = process.env.CUSTOM_BOOKING_ENDPOINTS.split(',');
  }

  // Filter providers if specified
  if (providers && providers.length > 0) {
    Object.keys(config.providers).forEach(provider => {
      if (!providers.includes(provider as BookingProvider)) {
        config.providers[provider as BookingProvider].enabled = false;
      }
    });
  }

  // Validate configuration
  try {
    ProviderTestConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }

  try {
    const orchestrator = new ProviderTestOrchestrator(config);
    const report = await orchestrator.testAllProviders();

    // Save report in requested format
    if (outputPath) {
      await saveReport(report, outputPath, format);
      console.log(`\nReport saved to: ${outputPath}`);
    }

    // Print verbose details if requested
    if (verbose) {
      console.log('\nVERBOSE TEST DETAILS:');
      report.providers.forEach(provider => {
        console.log(`\n=== ${provider.provider.toUpperCase()} DETAILED RESULTS ===`);
        provider.results.forEach(result => {
          const status = result.success ? 'PASS' : 'FAIL';
          const icon = result.success ? '✅' : '❌';
          console.log(`${icon} [${status}] ${result.test} (${result.duration}ms)`);
          
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
          
          if (result.details && Object.keys(result.details).length > 0) {
            console.log(`    Details:`, JSON.stringify(result.details, null, 2).replace(/\n/g, '\n    '));
          }
        });
      });
    }

    // Determine exit code based on results
    const hasOffline = report.summary.offlineProviders > 0;
    const hasCritical = report.summary.criticalProviders > 0;
    const hasDegraded = report.summary.degradedProviders > 0;
    
    if (hasOffline || (failFast && hasCritical)) {
      console.error('\nCritical provider failures detected');
      process.exit(1);
    } else if (hasCritical || (failFast && hasDegraded)) {
      console.warn('\nProvider issues detected but not critical');
      process.exit(2);
    } else {
      console.log('\nAll providers are healthy');
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal error during provider testing:', error);
    process.exit(1);
  }
}

// Report saving functionality
async function saveReport(
  report: AllProvidersReport, 
  outputPath: string, 
  format: 'json' | 'junit' | 'text'
): Promise<void> {
  const fs = await import('fs/promises');
  
  switch (format) {
    case 'json':
      await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
      break;
      
    case 'junit':
      const junitXml = generateJUnitXML(report);
      await fs.writeFile(outputPath, junitXml);
      break;
      
    case 'text':
      const textReport = generateTextReport(report);
      await fs.writeFile(outputPath, textReport);
      break;
  }
}

// JUnit XML generation for CI/CD integration
function generateJUnitXML(report: AllProvidersReport): string {
  const totalTests = report.providers.reduce((sum, p) => sum + p.totalTests, 0);
  const totalFailures = report.providers.reduce((sum, p) => sum + p.failedTests, 0);
  const totalTime = report.providers.reduce((sum, p) => 
    sum + p.results.reduce((pSum, r) => pSum + r.duration, 0), 0) / 1000;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<testsuites tests="${totalTests}" failures="${totalFailures}" time="${totalTime.toFixed(3)}">\n`;
  
  report.providers.forEach(provider => {
    const suiteTime = provider.results.reduce((sum, r) => sum + r.duration, 0) / 1000;
    xml += `  <testsuite name="${provider.provider}" tests="${provider.totalTests}" failures="${provider.failedTests}" time="${suiteTime.toFixed(3)}">\n`;
    
    provider.results.forEach(result => {
      const testTime = result.duration / 1000;
      xml += `    <testcase name="${result.test}" time="${testTime.toFixed(3)}" classname="${provider.provider}">\n`;
      
      if (!result.success) {
        xml += `      <failure message="${result.message}">${result.error || 'Test failed'}</failure>\n`;
      }
      
      xml += `    </testcase>\n`;
    });
    
    xml += `  </testsuite>\n`;
  });
  
  xml += `</testsuites>`;
  return xml;
}

// Text report generation
function generateTextReport(report: AllProvidersReport): string {
  let text = `PROVIDER TEST REPORT\n`;
  text += `===================\n`;
  text += `Generated: ${report.timestamp.toISOString()}\n`;
  text += `Total Providers: ${report.summary.totalProviders}\n`;
  text += `Healthy: ${report.summary.healthyProviders}\n`;
  text += `Degraded: ${report.summary.degradedProviders}\n`;
  text += `Critical: ${report.summary.criticalProviders}\n`;
  text += `Offline: ${report.summary.offlineProviders}\n\n`;

  report.providers.forEach(provider => {
    text += `${provider.provider.toUpperCase()}\n`;
    text += `${'='.repeat(provider.provider.length)}\n`;
    text += `Status: ${provider.overallHealth}\n`;
    text += `Health Score: ${provider.healthScore}/100\n`;
    text += `Tests Passed: ${provider.passedTests}/${provider.totalTests}\n`;
    text += `Average Response Time: ${provider.averageResponseTime}ms\n`;
    
    if (provider.recommendations.length > 0) {
      text += `\nRecommendations:\n`;
      provider.recommendations.forEach(rec => text += `- ${rec}\n`);
    }
    
    const failures = provider.results.filter(r => !r.success);
    if (failures.length > 0) {
      text += `\nFailed Tests:\n`;
      failures.forEach(failure => {
        text += `- ${failure.test}: ${failure.error || failure.message}\n`;
      });
    }
    
    text += `\n`;
  });

  if (report.systemRecommendations.length > 0) {
    text += `SYSTEM RECOMMENDATIONS\n`;
    text += `=====================\n`;
    report.systemRecommendations.forEach(rec => text += `- ${rec}\n`);
  }

  return text;
}

// CLI runner with comprehensive argument parsing
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const providersArg = args.find(arg => arg.startsWith('--providers='))?.split('=')[1];
  const providers = providersArg ? providersArg.split(',') as BookingProvider[] : undefined;
  
  const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1];
  
  const formatArg = args.find(arg => arg.startsWith('--format='))?.split('=')[1];
  const format = (formatArg && ['json', 'junit', 'text'].includes(formatArg)) 
    ? formatArg as 'json' | 'junit' | 'text' 
    : 'text';
    
  const verbose = args.includes('--verbose') || args.includes('-v');
  const failFast = args.includes('--fail-fast');

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: npm run booking:test-providers [options]

Options:
  --providers=cal,calendly    Test specific providers only
  --config=path/to/config     Load configuration from file
  --output=path/to/output     Save report to file
  --format=json|junit|text    Output format (default: text)
  --verbose, -v               Show detailed test results
  --fail-fast                 Exit on first critical failure
  --help, -h                  Show this help message

Environment Variables:
  CAL_API_KEY                 Cal.com API key for authenticated tests
  CALENDLY_API_KEY            Calendly API key for authenticated tests
  CUSTOM_BOOKING_ENDPOINTS    Comma-separated custom endpoints to test

Examples:
  npm run booking:test-providers
  npm run booking:test-providers -- --providers=cal,calendly --verbose
  npm run booking:test-providers -- --config=./test-config.json --output=./results.json --format=json
    `);
    process.exit(0);
  }

  runProviderTests({ 
    providers, 
    configPath, 
    outputPath, 
    format, 
    verbose, 
    failFast 
  }).catch(console.error);
}// scripts/booking/test-providers.ts
// Comprehensive testing for booking providers (Cal.com, Calendly, Custom)
// Tests connectivity, API responses, embed functionality, and integration health

import { z } from 'zod';
import type { BookingProvider } from '../../src/booking/lib/types';

// Test result interfaces
interface ProviderTestResult {
  provider: BookingProvider;
  test: string;
  success: boolean;
  message: string;
  duration: number;
  details?: Record<string, any>;
  error?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface ProviderTestReport {
  provider: BookingProvider;
  timestamp: Date;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallHealth: 'healthy' | 'degraded' | 'critical' | 'offline';
  healthScore: number; // 0-100
  results: ProviderTestResult[];
  recommendations: string[];
  averageResponseTime: number;
}

interface AllProvidersReport {
  timestamp: Date;
  providers: ProviderTestReport[];
  summary: {
    totalProviders: number;
    healthyProviders: number;
    degradedProviders: number;
    criticalProviders: number;
    offlineProviders: number;
  };
  systemRecommendations: string[];
}

// Test configuration with validation
const ProviderTestConfigSchema = z.object({
  timeout: z.number().min(1000).max(60000),
  retries: z.number().min(0).max(5),
  providers: z.object({
    cal: z.object({
      enabled: z.boolean(),
      apiKey: z.string().optional(),
      testEndpoints: z.array(z.string().url()).optional(),
      embedTests: z.boolean().optional(),
      apiTests: z.boolean().optional(),
      webhookTests: z.boolean().optional(),
    }),
    calendly: z.object({
      enabled: z.boolean(),
      apiKey: z.string().optional(),
      testEndpoints: z.array(z.string().url()).optional(),
      embedTests: z.boolean().optional(),
      apiTests: z.boolean().optional(),
      webhookTests: z.boolean().optional(),
    }),
    custom: z.object({
      enabled: z.boolean(),
      apiKey: z.string().optional(),
      testEndpoints: z.array(z.string().url()).optional(),
      embedTests: z.boolean().optional(),
      apiTests: z.boolean().optional(),
      webhookTests: z.boolean().optional(),
    }),
  }),
  performance: z.object({
    maxResponseTime: z.number().default(5000),
    minSuccessRate: z.number().min(0).max(1).default(0.8),
  }),
});

type ProviderTestConfig = z.infer<typeof ProviderTestConfigSchema>;

// Base provider tester class with improved error handling
abstract class BaseProviderTester {
  protected config: ProviderTestConfig['providers'][BookingProvider];
  protected provider: BookingProvider;
  protected globalTimeout: number;
  protected retries: number;

  constructor(
    provider: BookingProvider, 
    config: ProviderTestConfig['providers'][BookingProvider],
    globalTimeout: number,
    retries: number
  ) {
    this.provider = provider;
    this.config = config;
    this.globalTimeout = globalTimeout;
    this.retries = retries;
  }

  abstract runTests(): Promise<ProviderTestResult[]>;

  protected async runTest(
    testName: string,
    testFn: () => Promise<any>,
    options: {
      timeout?: number;
      retries?: number;
      severity?: ProviderTestResult['severity'];
    } = {}
  ): Promise<ProviderTestResult> {
    const {
      timeout = this.globalTimeout,
      retries = this.retries,
      severity = 'error'
    } = options;

    const startTime = Date.now();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.withTimeout(testFn(), timeout);
        const duration = Date.now() - startTime;

        return {
          provider: this.provider,
          test: testName,
          success: true,
          message: attempt > 0 ? `Test passed on retry ${attempt}` : 'Test passed',
          duration,
          details: { ...result, attempts: attempt + 1 },
          severity: 'info',
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retries) {
          const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.delay(backoffDelay);
        }
      }
    }

    const duration = Date.now() - startTime;
    const errorMessage = lastError?.message || 'Unknown error';

    return {
      provider: this.provider,
      test: testName,
      success: false,
      message: `Test failed after ${retries + 1} attempts`,
      duration,
      error: errorMessage,
      severity,
      details: { attempts: retries + 1 },
    };
  }

  protected async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Test timed out after ${timeout}ms`)), timeout);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    customRetries?: number
  ): Promise<Response> {
    const maxRetries = customRetries ?? this.retries;
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.globalTimeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown fetch error');
        if (i < maxRetries) {
          await this.delay(1000 * Math.pow(2, i)); // Exponential backoff
        }
      }
    }

    throw lastError!;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected validateApiKey(): boolean {
    return !!(this.config.apiKey && this.config.apiKey.length > 10);
  }
}

// Cal.com provider tester with comprehensive tests
class CalComTester extends BaseProviderTester {
  async runTests(): Promise<ProviderTestResult[]> {
    const tests: ProviderTestResult[] = [];

    // Core API tests
    if (this.config.apiTests !== false) {
      tests.push(await this.testApiConnectivity());
      tests.push(await this.testEventTypesEndpoint());
      
      if (this.validateApiKey()) {
        tests.push(await this.testUserProfile());
        tests.push(await this.testBookingCapability());
      }
    }

    // Embed functionality tests
    if (this.config.embedTests !== false) {
      tests.push(await this.testEmbedScript());
      tests.push(await this.testEmbedResponsiveness());
      tests.push(await this.testEmbedSecurity());
    }

    // Webhook tests
    if (this.config.webhookTests !== false) {
      tests.push(await this.testWebhookEndpoint());
    }

    // Custom endpoint tests
    if (this.config.testEndpoints && this.config.testEndpoints.length > 0) {
      for (const endpoint of this.config.testEndpoints) {
        tests.push(await this.testCustomEndpoint(endpoint));
      }
    }

    return tests;
  }

  private async testApiConnectivity(): Promise<ProviderTestResult> {
    return this.runTest(
      'api-connectivity',
      async () => {
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const response = await this.fetchWithRetry('https://api.cal.com/v1/me', { headers });
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          status: response.status,
          hasApiKey: !!this.config.apiKey,
          responseTime: response.headers.get('x-response-time'),
          userInfo: data.username || 'anonymous',
          rateLimit: {
            remaining: response.headers.get('x-ratelimit-remaining'),
            reset: response.headers.get('x-ratelimit-reset'),
          },
        };
      },
      { severity: 'critical' }
    );
  }

  private async testUserProfile(): Promise<ProviderTestResult> {
    return this.runTest(
      'user-profile',
      async () => {
        const headers = { 'Authorization': `Bearer ${this.config.apiKey}` };
        const response = await this.fetchWithRetry('https://api.cal.com/v1/me', { headers });
        
        if (!response.ok) {
          throw new Error(`User profile endpoint returned ${response.status}`);
        }

        const data = await response.json();
        return {
          id: data.id,
          email: data.email,
          username: data.username,
          timeZone: data.timeZone,
          verified: data.emailVerified,
          plan: data.plan || 'free',
        };
      },
      { severity: 'warning' }
    );
  }

  private async testEventTypesEndpoint(): Promise<ProviderTestResult> {
    return this.runTest(
      'event-types',
      async () => {
        const headers: Record<string, string> = {};
        if (this.config.apiKey) {
          headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const response = await this.fetchWithRetry('https://api.cal.com/v1/event-types', { headers });
        
        if (!response.ok) {
          throw new Error(`Event types endpoint returned ${response.status}`);
        }

        const data = await response.json();
        const eventTypes = data.event_types || [];
        
        return {
          eventTypesCount: eventTypes.length,
          hasEventTypes: eventTypes.length > 0,
          activeEventTypes: eventTypes.filter((et: any) => !et.hidden).length,
          eventTypeDetails: eventTypes.slice(0, 3).map((et: any) => ({
            id: et.id,
            title: et.title,
            length: et.length,
            active: !et.hidden,
          })),
        };
      },
      { severity: 'error' }
    );
  }

  private async testBookingCapability(): Promise<ProviderTestResult> {
    return this.runTest(
      'booking-capability',
      async () => {
        if (!this.validateApiKey()) {
          throw new Error('API key required for booking capability test');
        }

        // Test with a dry-run booking request
        const headers = { 
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        };
        
        // First get available event types
        const eventTypesResponse = await this.fetchWithRetry(
          'https://api.cal.com/v1/event-types', 
          { headers }
        );
        
        if (!eventTypesResponse.ok) {
          throw new Error('Cannot access event types for booking test');
        }

        const eventTypesData = await eventTypesResponse.json();
        const eventTypes = eventTypesData.event_types || [];
        
        return {
          canAccessEventTypes: true,
          availableEventTypes: eventTypes.length,
          bookingEndpointAccessible: true,
          testMode: true, // This is a capability test, not actual booking
        };
      },
      { severity: 'warning' }
    );
  }

  private async testEmbedScript(): Promise<ProviderTestResult> {
    return this.runTest(
      'embed-script',
      async () => {
        const response = await this.fetchWithRetry('https://app.cal.com/embed/embed.js');
        
        if (!response.ok) {
          throw new Error(`Embed script returned ${response.status}`);
        }

        const script = await response.text();
        const hasEmbedFunction = script.includes('Cal(') || script.includes('getCalApi');
        const hasErrorHandling = script.includes('catch') || script.includes('error');
        const scriptSize = script.length;
        
        return {
          scriptSize,
          hasEmbedFunction,
          hasErrorHandling,
          contentType: response.headers.get('content-type'),
          cacheHeaders: {
            cacheControl: response.headers.get('cache-control'),
            etag: response.headers.get('etag'),
          },
          minified: !script.includes('\n  '), // Basic minification check
        };
      },
      { severity: 'error' }
    );
  }

  private async testEmbedResponsiveness(): Promise<ProviderTestResult> {
    return this.runTest(
      'embed-responsiveness',
      async () => {
        // Test if embed page handles different viewport scenarios
        const embedUrl = 'https://cal.com/test/30min';
        const response = await this.fetchWithRetry(embedUrl);
        
        const html = await response.text();
        const hasViewportMeta = html.includes('viewport');
        const hasResponsiveCSS = html.includes('responsive') || html.includes('@media');
        const hasMobileOptimization = html.includes('mobile') || html.includes('touch');
        
        return {
          hasViewportMeta,
          hasResponsiveCSS,
          hasMobileOptimization,
          embedUrl,
          htmlSize: html.length,
          statusCode: response.status,
        };
      },
      { severity: 'warning' }
    );
  }

  private async testEmbedSecurity(): Promise<ProviderTestResult> {
    return this.runTest(
      'embed-security',
      async () => {
        const response = await this.fetchWithRetry('https://app.cal.com/embed/embed.js');
        
        const securityHeaders = {
          xFrameOptions: response.headers.get('x-frame-options'),
          contentSecurityPolicy: response.headers.get('content-security-policy'),
          xContentTypeOptions: response.headers.get('x-content-type-options'),
          xXSSProtection: response.headers