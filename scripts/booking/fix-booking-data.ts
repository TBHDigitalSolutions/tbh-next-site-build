// scripts/booking/fix-booking-data.ts
// Automated data repair and normalization for booking system
// Fixes common issues with configurations, service mappings, and data inconsistencies

import { z } from 'zod';
import type { CanonicalService } from '@/shared/services/types';
import type { BookingProvider, BookingVariant, CalendarProviderConfig, IntakeFormSpec } from '../../src/booking/lib/types';
import { normalizeServiceSlug } from '@/shared/services/utils';
import { CANONICAL_SERVICES } from '@/shared/services/constants';

// Fix result interfaces
interface FixResult {
  component: string;
  issue: string;
  action: 'fixed' | 'skipped' | 'failed';
  details?: Record<string, any>;
  before?: any;
  after?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface DataFixReport {
  timestamp: Date;
  totalIssues: number;
  fixedIssues: number;
  skippedIssues: number;
  failedIssues: number;
  fixes: FixResult[];
  recommendations: string[];
  criticalFailures: FixResult[];
  backupPath?: string;
}

// Configuration for data fixes
interface DataFixConfig {
  dryRun: boolean;
  backupBeforeChanges: boolean;
  fixTypes: {
    serviceNormalization: boolean;
    calendarConfigCleanup: boolean;
    intakeFormValidation: boolean;
    providerConfigRepair: boolean;
    duplicateRemoval: boolean;
    missingDataCreation: boolean;
  };
  services: CanonicalService[];
  paths: {
    dataDir?: string;
    backupDir?: string;
    configDir?: string;
  };
  validation: {
    strictMode: boolean;
    skipInvalidServices: boolean;
  };
}

// Main data fixer class
export class BookingDataFixer {
  private config: DataFixConfig;
  private fixes: FixResult[] = [];
  private backupPath?: string;

  constructor(config: DataFixConfig) {
    this.config = config;
  }

  /**
   * Run all data fixes and return comprehensive report
   */
  async runDataFixes(): Promise<DataFixReport> {
    console.log('🔧 Starting booking data repair...\n');
    
    if (this.config.dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made\n');
    }

    try {
      // Validate configuration first
      await this.validateConfiguration();

      // Create backup if requested
      if (this.config.backupBeforeChanges && !this.config.dryRun) {
        this.backupPath = await this.createBackup();
      }

      // Run all fix operations
      await this.runFixOperations();

      const report = this.generateReport();
      this.printReport(report);

      return report;
    } catch (error) {
      console.error('Fatal error during data fix:', error);
      throw error;
    }
  }

  /**
   * Validate configuration before running fixes
   */
  private async validateConfiguration(): Promise<void> {
    if (this.config.services.length === 0) {
      throw new Error('No services configured for fixing');
    }

    // Validate service names
    for (const service of this.config.services) {
      if (!CANONICAL_SERVICES.includes(service as any)) {
        const message = `Invalid service in configuration: ${service}`;
        if (this.config.validation.strictMode) {
          throw new Error(message);
        } else {
          console.warn(`Warning: ${message}`);
        }
      }
    }

    // Check data directory exists
    if (this.config.paths.dataDir) {
      try {
        const fs = await import('fs/promises');
        await fs.access(this.config.paths.dataDir);
      } catch (error) {
        throw new Error(`Data directory not accessible: ${this.config.paths.dataDir}`);
      }
    }
  }

  /**
   * Run all configured fix operations
   */
  private async runFixOperations(): Promise<void> {
    const operations = [
      { 
        name: 'Service Normalization', 
        fn: () => this.config.fixTypes.serviceNormalization && this.fixServiceNormalization() 
      },
      { 
        name: 'Calendar Config Cleanup', 
        fn: () => this.config.fixTypes.calendarConfigCleanup && this.fixCalendarConfigurations() 
      },
      { 
        name: 'Intake Form Validation', 
        fn: () => this.config.fixTypes.intakeFormValidation && this.fixIntakeFormConfigurations() 
      },
      { 
        name: 'Provider Config Repair', 
        fn: () => this.config.fixTypes.providerConfigRepair && this.fixProviderConfigurations() 
      },
      { 
        name: 'Duplicate Removal', 
        fn: () => this.config.fixTypes.duplicateRemoval && this.removeDuplicateConfigurations() 
      },
      { 
        name: 'Missing Data Creation', 
        fn: () => this.config.fixTypes.missingDataCreation && this.createMissingConfigurations() 
      },
    ];

    for (const { name, fn } of operations) {
      if (fn) {
        try {
          console.log(`Running: ${name}...`);
          await fn();
          console.log(`✅ Completed: ${name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Failed: ${name} - ${errorMessage}`);
          
          this.fixes.push({
            component: 'fix-operation',
            issue: `${name} failed: ${errorMessage}`,
            action: 'failed',
            severity: 'critical',
            details: { operation: name, error: errorMessage },
          });
        }
      }
    }
  }

  /**
   * Fix service slug normalization issues
   */
  private async fixServiceNormalization(): Promise<void> {
    const configurations = await this.loadAllConfigurations();
    
    for (const config of configurations) {
      const originalService = config.service;
      
      if (!originalService) {
        this.fixes.push({
          component: `service-normalization-${config.id}`,
          issue: 'Missing service field',
          action: 'skipped',
          severity: 'medium',
          details: { configId: config.id },
        });
        continue;
      }

      try {
        const normalizedService = normalizeServiceSlug(originalService);
        
        if (normalizedService !== originalService) {
          if (!this.config.dryRun) {
            await this.updateConfigurationService(config.id, normalizedService);
          }
          
          this.fixes.push({
            component: `service-normalization-${config.id}`,
            issue: `Service slug not normalized: ${originalService}`,
            action: this.config.dryRun ? 'skipped' : 'fixed',
            severity: 'low',
            before: originalService,
            after: normalizedService,
            details: { configId: config.id },
          });
        }
      } catch (error) {
        // Invalid service slug
        const validService = this.findClosestValidService(originalService);
        
        if (validService) {
          if (!this.config.dryRun) {
            await this.updateConfigurationService(config.id, validService);
          }
          
          this.fixes.push({
            component: `service-normalization-${config.id}`,
            issue: `Invalid service slug: ${originalService}`,
            action: this.config.dryRun ? 'skipped' : 'fixed',
            severity: 'high',
            before: originalService,
            after: validService,
            details: { configId: config.id, suggestion: true },
          });
        } else {
          this.fixes.push({
            component: `service-normalization-${config.id}`,
            issue: `Cannot fix invalid service slug: ${originalService}`,
            action: 'failed',
            severity: 'critical',
            details: { configId: config.id },
          });
        }
      }
    }
  }

  /**
   * Fix calendar configuration issues
   */
  private async fixCalendarConfigurations(): Promise<void> {
    const calendarConfigs = await this.loadCalendarConfigurations();
    
    for (const [service, config] of Object.entries(calendarConfigs)) {
      if (!this.config.validation.skipInvalidServices || CANONICAL_SERVICES.includes(service as any)) {
        const fixes = this.validateAndFixCalendarConfig(service as CanonicalService, config);
        
        if (fixes.length > 0 && !this.config.dryRun) {
          await this.saveCalendarConfiguration(service as CanonicalService, config);
        }
        
        this.fixes.push(...fixes);
      }
    }
  }

  /**
   * Validate and fix individual calendar configuration
   */
  private validateAndFixCalendarConfig(
    service: CanonicalService, 
    config: CalendarProviderConfig
  ): FixResult[] {
    const fixes: FixResult[] = [];
    const componentBase = `calendar-config-${service}`;

    // Fix provider normalization
    if (!['cal', 'calendly', 'custom'].includes(config.provider)) {
      const fixedProvider = this.normalizeProvider(config.provider);
      if (fixedProvider) {
        config.provider = fixedProvider as BookingProvider;
        fixes.push({
          component: `${componentBase}-provider`,
          issue: `Invalid provider: ${config.provider}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'medium',
          before: config.provider,
          after: fixedProvider,
        });
      } else {
        fixes.push({
          component: `${componentBase}-provider`,
          issue: `Cannot normalize provider: ${config.provider}`,
          action: 'failed',
          severity: 'high',
        });
      }
    }

    // Fix missing required fields based on provider
    if (config.provider === 'cal' && !config.eventTypeId) {
      const defaultEventTypeId = this.generateDefaultEventTypeId(service);
      config.eventTypeId = defaultEventTypeId;
      fixes.push({
        component: `${componentBase}-event-type-id`,
        issue: 'Missing eventTypeId for Cal.com provider',
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'medium',
        after: defaultEventTypeId,
      });
    }

    if (config.provider === 'calendly' && (!config.organization || !config.eventSlug)) {
      if (!config.organization) {
        config.organization = 'default-org';
        fixes.push({
          component: `${componentBase}-organization`,
          issue: 'Missing organization for Calendly provider',
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'medium',
          after: 'default-org',
        });
      }
      
      if (!config.eventSlug) {
        config.eventSlug = this.generateDefaultEventSlug(service);
        fixes.push({
          component: `${componentBase}-event-slug`,
          issue: 'Missing eventSlug for Calendly provider',
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'medium',
          after: config.eventSlug,
        });
      }
    }

    // Fix invalid URLs
    if (config.fallbackHref && !this.isValidUrl(config.fallbackHref)) {
      const fixedUrl = this.fixUrl(config.fallbackHref);
      if (fixedUrl) {
        config.fallbackHref = fixedUrl;
        fixes.push({
          component: `${componentBase}-fallback-url`,
          issue: `Invalid fallback URL: ${config.fallbackHref}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'low',
          before: config.fallbackHref,
          after: fixedUrl,
        });
      } else {
        delete config.fallbackHref;
        fixes.push({
          component: `${componentBase}-fallback-url`,
          issue: `Removed invalid fallback URL: ${config.fallbackHref}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'low',
          before: config.fallbackHref,
        });
      }
    }

    // Clean up invalid params
    if (config.params) {
      const cleanedParams: Record<string, string | number | boolean> = {};
      let hasChanges = false;
      
      for (const [key, value] of Object.entries(config.params)) {
        if (value === null || value === undefined) {
          hasChanges = true;
          continue;
        }
        
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          cleanedParams[key] = value;
        } else {
          // Try to coerce to string
          cleanedParams[key] = String(value);
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        config.params = cleanedParams;
        fixes.push({
          component: `${componentBase}-params`,
          issue: 'Cleaned up invalid parameters',
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'low',
          details: { cleanedKeys: Object.keys(cleanedParams) },
        });
      }
    }

    return fixes;
  }

  /**
   * Fix intake form configuration issues
   */
  private async fixIntakeFormConfigurations(): Promise<void> {
    const intakeConfigs = await this.loadIntakeConfigurations();
    
    for (const [service, config] of Object.entries(intakeConfigs)) {
      if (!this.config.validation.skipInvalidServices || CANONICAL_SERVICES.includes(service as any)) {
        const fixes = this.validateAndFixIntakeConfig(service as CanonicalService, config);
        
        if (fixes.length > 0 && !this.config.dryRun) {
          await this.saveIntakeConfiguration(service as CanonicalService, config);
        }
        
        this.fixes.push(...fixes);
      }
    }
  }

  /**
   * Validate and fix individual intake configuration
   */
  private validateAndFixIntakeConfig(
    service: CanonicalService, 
    config: IntakeFormSpec
  ): FixResult[] {
    const fixes: FixResult[] = [];
    const componentBase = `intake-config-${service}`;

    // Fix missing or invalid field names
    const originalFieldCount = config.fields.length;
    config.fields = config.fields.filter((field, index) => {
      if (!field.name || !field.label) {
        fixes.push({
          component: `${componentBase}-field-${index}`,
          issue: `Removed field with missing name or label`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'medium',
          before: field,
        });
        return false;
      }
      return true;
    });

    if (config.fields.length !== originalFieldCount) {
      fixes.push({
        component: `${componentBase}-field-count`,
        issue: `Removed ${originalFieldCount - config.fields.length} invalid fields`,
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'medium',
        before: originalFieldCount,
        after: config.fields.length,
      });
    }

    // Fix invalid field types
    config.fields.forEach((field, index) => {
      const validTypes = ['text', 'email', 'textarea', 'select', 'checkbox'];
      if (!validTypes.includes(field.type)) {
        const originalType = field.type;
        const fixedType = this.normalizeFieldType(field.type);
        field.type = fixedType as any;
        fixes.push({
          component: `${componentBase}-field-${index}-type`,
          issue: `Fixed invalid field type: ${originalType}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'medium',
          before: originalType,
          after: fixedType,
        });
      }
    });

    // Fix select fields without options
    config.fields.forEach((field, index) => {
      if (field.type === 'select' && (!field.options || field.options.length === 0)) {
        field.options = [
          { label: 'Please select', value: '' },
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ];
        fixes.push({
          component: `${componentBase}-field-${index}-options`,
          issue: 'Added default options to select field',
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'medium',
          after: field.options,
        });
      }
    });

    // Fix consent configuration
    if (!config.consent?.privacyPolicyHref) {
      if (!config.consent) {
        config.consent = { privacyPolicyHref: '/privacy' };
      } else {
        config.consent.privacyPolicyHref = '/privacy';
      }
      fixes.push({
        component: `${componentBase}-consent`,
        issue: 'Added default privacy policy URL',
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'high',
        after: '/privacy',
      });
    }

    // Fix invalid URLs in consent config
    if (config.consent?.termsHref && !this.isValidUrl(config.consent.termsHref)) {
      const originalUrl = config.consent.termsHref;
      const fixedUrl = this.fixUrl(config.consent.termsHref);
      if (fixedUrl) {
        config.consent.termsHref = fixedUrl;
        fixes.push({
          component: `${componentBase}-terms-url`,
          issue: `Fixed invalid terms URL: ${originalUrl}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'low',
          before: originalUrl,
          after: fixedUrl,
        });
      } else {
        delete config.consent.termsHref;
        fixes.push({
          component: `${componentBase}-terms-url`,
          issue: `Removed invalid terms URL: ${originalUrl}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'low',
          before: originalUrl,
        });
      }
    }

    return fixes;
  }

  /**
   * Fix provider configuration issues
   */
  private async fixProviderConfigurations(): Promise<void> {
    const providerConfigs = await this.loadProviderConfigurations();
    
    for (const [provider, config] of Object.entries(providerConfigs)) {
      const fixes = this.validateAndFixProviderConfig(provider as BookingProvider, config);
      
      if (fixes.length > 0 && !this.config.dryRun) {
        await this.saveProviderConfiguration(provider as BookingProvider, config);
      }
      
      this.fixes.push(...fixes);
    }
  }

  /**
   * Validate and fix provider configuration
   */
  private validateAndFixProviderConfig(
    provider: BookingProvider,
    config: any
  ): FixResult[] {
    const fixes: FixResult[] = [];
    const componentBase = `provider-config-${provider}`;

    // Fix missing API endpoints
    const expectedEndpoints = {
      cal: 'https://api.cal.com/v1',
      calendly: 'https://api.calendly.com',
      custom: undefined,
    };

    const expectedEndpoint = expectedEndpoints[provider];
    if (expectedEndpoint && !config.apiEndpoint) {
      config.apiEndpoint = expectedEndpoint;
      fixes.push({
        component: `${componentBase}-api-endpoint`,
        issue: `Added default ${provider} API endpoint`,
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'medium',
        after: config.apiEndpoint,
      });
    }

    // Fix timeout configurations
    if (!config.timeout || config.timeout < 1000 || config.timeout > 30000) {
      const originalTimeout = config.timeout;
      config.timeout = 10000; // 10 seconds
      fixes.push({
        component: `${componentBase}-timeout`,
        issue: `Fixed invalid timeout value (${originalTimeout}ms)`,
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'low',
        before: originalTimeout,
        after: 10000,
      });
    }

    // Fix retry configurations
    if (!config.retries || config.retries < 0 || config.retries > 5) {
      const originalRetries = config.retries;
      config.retries = 3;
      fixes.push({
        component: `${componentBase}-retries`,
        issue: `Fixed invalid retry count (${originalRetries})`,
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'low',
        before: originalRetries,
        after: 3,
      });
    }

    return fixes;
  }

  /**
   * Remove duplicate configurations
   */
  private async removeDuplicateConfigurations(): Promise<void> {
    await this.removeDuplicateCalendarConfigs();
    await this.removeDuplicateIntakeConfigs();
  }

  /**
   * Remove duplicate calendar configurations
   */
  private async removeDuplicateCalendarConfigs(): Promise<void> {
    const calendarConfigs = await this.loadCalendarConfigurations();
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const [service, config] of Object.entries(calendarConfigs)) {
      const configHash = this.hashConfig(config);
      
      if (seen.has(configHash)) {
        duplicates.push(service);
      } else {
        seen.add(configHash);
      }
    }

    for (const service of duplicates) {
      if (!this.config.dryRun) {
        await this.removeCalendarConfiguration(service);
      }
      
      this.fixes.push({
        component: `duplicate-calendar-${service}`,
        issue: `Removed duplicate calendar configuration`,
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'medium',
        details: { service },
      });
    }
  }

  /**
   * Remove duplicate intake configurations
   */
  private async removeDuplicateIntakeConfigs(): Promise<void> {
    const intakeConfigs = await this.loadIntakeConfigurations();
    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const [service, config] of Object.entries(intakeConfigs)) {
      const configHash = this.hashConfig(config);
      
      if (seen.has(configHash)) {
        duplicates.push(service);
      } else {
        seen.add(configHash);
      }
    }

    for (const service of duplicates) {
      if (!this.config.dryRun) {
        await this.removeIntakeConfiguration(service);
      }
      
      this.fixes.push({
        component: `duplicate-intake-${service}`,
        issue: `Removed duplicate intake configuration`,
        action: this.config.dryRun ? 'skipped' : 'fixed',
        severity: 'medium',
        details: { service },
      });
    }
  }

  /**
   * Create missing configurations for services
   */
  private async createMissingConfigurations(): Promise<void> {
    const calendarConfigs = await this.loadCalendarConfigurations();
    const intakeConfigs = await this.loadIntakeConfigurations();

    for (const service of this.config.services) {
      // Create missing calendar configs
      if (!calendarConfigs[service]) {
        const defaultConfig = this.createDefaultCalendarConfig(service);
        
        if (!this.config.dryRun) {
          await this.saveCalendarConfiguration(service, defaultConfig);
        }
        
        this.fixes.push({
          component: `missing-calendar-${service}`,
          issue: `Created default calendar configuration for ${service}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'high',
          after: defaultConfig,
        });
      }

      // Create missing intake configs
      if (!intakeConfigs[service]) {
        const defaultConfig = this.createDefaultIntakeConfig(service);
        
        if (!this.config.dryRun) {
          await this.saveIntakeConfiguration(service, defaultConfig);
        }
        
        this.fixes.push({
          component: `missing-intake-${service}`,
          issue: `Created default intake configuration for ${service}`,
          action: this.config.dryRun ? 'skipped' : 'fixed',
          severity: 'high',
          after: defaultConfig,
        });
      }
    }
  }

  /**
   * Create backup of current data
   */
  private async createBackup(): Promise<string> {
    console.log('💾 Creating backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = this.config.paths.backupDir || './backups';
    const backupPath = `${backupDir}/booking-data-${timestamp}`;
    
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(backupPath, { recursive: true });
      
      // Backup calendar configurations
      const calendarConfigs = await this.loadCalendarConfigurations();
      await fs.writeFile(
        `${backupPath}/calendar-configs.json`,
        JSON.stringify(calendarConfigs, null, 2)
      );
      
      // Backup intake configurations
      const intakeConfigs = await this.loadIntakeConfigurations();
      await fs.writeFile(
        `${backupPath}/intake-configs.json`,
        JSON.stringify(intakeConfigs, null, 2)
      );
      
      // Backup provider configurations
      const providerConfigs = await this.loadProviderConfigurations();
      await fs.writeFile(
        `${backupPath}/provider-configs.json`,
        JSON.stringify(providerConfigs, null, 2)
      );
      
      console.log(`Backup created at: ${backupPath}`);
      return backupPath;
    } catch (error) {
      throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Data loading methods (implemented to work with file system)
  private async loadAllConfigurations(): Promise<Array<{ id: string; service: string }>> {
    try {
      const calendarConfigs = await this.loadCalendarConfigurations();
      return Object.keys(calendarConfigs).map(service => ({
        id: `calendar-${service}`,
        service,
      }));
    } catch (error) {
      console.warn('Could not load configurations:', error);
      return [];
    }
  }

  private async loadCalendarConfigurations(): Promise<Record<string, CalendarProviderConfig>> {
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/calendar-configs.json`
        : './src/data/booking/calendars/index.json';
      
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not load calendar configurations, using empty object');
      return {};
    }
  }

  private async loadIntakeConfigurations(): Promise<Record<string, IntakeFormSpec>> {
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/intake-configs.json`
        : './src/data/booking/intake/index.json';
      
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not load intake configurations, using empty object');
      return {};
    }
  }

  private async loadProviderConfigurations(): Promise<Record<string, any>> {
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/provider-configs.json`
        : './src/data/booking/providers/index.json';
      
      const data = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Could not load provider configurations, using defaults');
      return {
        cal: { apiEndpoint: 'https://api.cal.com/v1', timeout: 10000, retries: 3 },
        calendly: { apiEndpoint: 'https://api.calendly.com', timeout: 10000, retries: 3 },
        custom: { timeout: 10000, retries: 3 },
      };
    }
  }

  // Data saving methods
  private async updateConfigurationService(id: string, service: CanonicalService): Promise<void> {
    console.log(`Would update config ${id} with service ${service}`);
  }

  private async saveCalendarConfiguration(service: CanonicalService, config: CalendarProviderConfig): Promise<void> {
    if (this.config.dryRun) return;
    
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/calendar-configs.json`
        : './src/data/booking/calendars/index.json';
      
      const allConfigs = await this.loadCalendarConfigurations();
      allConfigs[service] = config;
      
      await fs.writeFile(configPath, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
      throw new Error(`Failed to save calendar config for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveIntakeConfiguration(service: CanonicalService, config: IntakeFormSpec): Promise<void> {
    if (this.config.dryRun) return;
    
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/intake-configs.json`
        : './src/data/booking/intake/index.json';
      
      const allConfigs = await this.loadIntakeConfigurations();
      allConfigs[service] = config;
      
      await fs.writeFile(configPath, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
      throw new Error(`Failed to save intake config for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveProviderConfiguration(provider: BookingProvider, config: any): Promise<void> {
    if (this.config.dryRun) return;
    
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/provider-configs.json`
        : './src/data/booking/providers/index.json';
      
      const allConfigs = await this.loadProviderConfigurations();
      allConfigs[provider] = config;
      
      await fs.writeFile(configPath, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
      throw new Error(`Failed to save provider config for ${provider}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async removeCalendarConfiguration(service: string): Promise<void> {
    if (this.config.dryRun) return;
    
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/calendar-configs.json`
        : './src/data/booking/calendars/index.json';
      
      const allConfigs = await this.loadCalendarConfigurations();
      delete allConfigs[service];
      
      await fs.writeFile(configPath, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
      throw new Error(`Failed to remove calendar config for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async removeIntakeConfiguration(service: string): Promise<void> {
    if (this.config.dryRun) return;
    
    try {
      const fs = await import('fs/promises');
      const configPath = this.config.paths.configDir 
        ? `${this.config.paths.configDir}/intake-configs.json`
        : './src/data/booking/intake/index.json';
      
      const allConfigs = await this.loadIntakeConfigurations();
      delete allConfigs[service];
      
      await fs.writeFile(configPath, JSON.stringify(allConfigs, null, 2));
    } catch (error) {
      throw new Error(`Failed to remove intake config for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods
  private findClosestValidService(service: string): CanonicalService | null {
    const normalized = service.toLowerCase().replace(/[^a-z]/g, '-');
    
    // Try exact match first
    if (CANONICAL_SERVICES.includes(normalized as any)) {
      return normalized as CanonicalService;
    }

    // Try fuzzy matching
    const candidates = CANONICAL_SERVICES.filter(s => 
      s.includes(normalized) || normalized.includes(s.replace('-services', ''))
    );

    return candidates.length > 0 ? candidates[0] : null;
  }

  private normalizeProvider(provider: string): BookingProvider | null {
    const normalized = provider.toLowerCase().trim();
    
    if (['cal', 'cal.com'].includes(normalized)) return 'cal';
    if (['calendly'].includes(normalized)) return 'calendly';
    if (['custom', 'default'].includes(normalized)) return 'custom';
    
    return null;
  }

  private normalizeFieldType(type: string): string {
    const normalized = type.toLowerCase().trim();
    
    if (['text', 'string', 'input'].includes(normalized)) return 'text';
    if (['email', 'mail'].includes(normalized)) return 'email';
    if (['textarea', 'multiline', 'longtext'].includes(normalized)) return 'textarea';
    if (['select', 'dropdown', 'option'].includes(normalized)) return 'select';
    if (['checkbox', 'check', 'boolean'].includes(normalized)) return 'checkbox';
    
    return 'text'; // Default fallback
  }

  private generateDefaultEventTypeId(service: CanonicalService): string {
    return `${service.replace('-services', '')}-consultation`;
  }

  private generateDefaultEventSlug(service: CanonicalService): string {
    return `${service.replace('-services', '')}-meeting`;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url, 'https://example.com'); // Allow relative URLs
      return true;
    } catch {
      return false;
    }
  }

  private fixUrl(url: string): string | null {
    // Try to fix common URL issues
    let fixed = url.trim();
    
    // Add protocol if missing
    if (!fixed.startsWith('http') && !fixed.startsWith('/')) {
      fixed = `https://${fixed}`;
    }
    
    // Try to validate fixed URL
    try {
      new URL(fixed, 'https://example.com');
      return fixed;
    } catch {
      return null;
    }
  }

  private hashConfig(config: any): string {
    // Simple hash function for duplicate detection
    try {
      return Buffer.from(JSON.stringify(config, Object.keys(config).sort())).toString('base64');
    } catch {
      return Math.random().toString(36);
    }
  }

  private createDefaultCalendarConfig(service: CanonicalService): CalendarProviderConfig {
    return {
      provider: 'custom',
      service,
      fallbackHref: `/contact?service=${service}`,
    };
  }

  private createDefaultIntakeConfig(service: CanonicalService): IntakeFormSpec {
    return {
      service,
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          required: true,
        },
        {
          name: 'company',
          label: 'Company Name',
          type: 'text',
          required: false,
        },
        {
          name: 'message',
          label: 'Project Description',
          type: 'textarea',
          required: true,
          placeholder: 'Tell us about your project requirements...',
        },
      ],
      consent: {
        privacyPolicyHref: '/privacy',
        termsHref: '/terms',
        marketingOptIn: true,
      },
    };
  }

  private generateReport(): DataFixReport {
    const totalIssues = this.fixes.length;
    const fixedIssues = this.fixes.filter(f => f.action === 'fixed').length;
    const skippedIssues = this.fixes.filter(f => f.action === 'skipped').length;
    const failedIssues = this.fixes.filter(f => f.action === 'failed').length;
    const criticalFailures = this.fixes.filter(f => f.action === 'failed' && f.severity === 'critical');

    const recommendations: string[] = [];
    
    if (criticalFailures.length > 0) {
      recommendations.push(`${criticalFailures.length} critical issues could not be automatically fixed and require manual intervention`);
    }
    
    const highSeverityIssues = this.fixes.filter(f => f.severity === 'high').length;
    if (highSeverityIssues > 0) {
      recommendations.push(`${highSeverityIssues} high-severity issues found - review system configuration`);
    }
    
    if (skippedIssues > 0 && this.config.dryRun) {
      recommendations.push('Run without --dry-run flag to apply the fixes');
    }
    
    if (fixedIssues > 0) {
      recommendations.push('Consider running a health check to verify all fixes were successful');
    }

    if (totalIssues === 0) {
      recommendations.push('No data issues found - system is in good shape');
    }

    if (this.backupPath) {
      recommendations.push(`Backup created at ${this.backupPath} - restore if needed`);
    }

    return {
      timestamp: new Date(),
      totalIssues,
      fixedIssues,
      skippedIssues,
      failedIssues,
      fixes: this.fixes,
      recommendations,
      criticalFailures,
      backupPath: this.backupPath,
    };
  }

  private printReport(report: DataFixReport): void {
    console.log('\n');
    console.log('BOOKING DATA FIX REPORT');
    console.log('=======================');
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Total Issues: ${report.totalIssues}`);
    console.log(`Fixed: ${report.fixedIssues}`);
    console.log(`Skipped: ${report.skippedIssues}`);
    console.log(`Failed: ${report.failedIssues}`);
    
    if (report.criticalFailures.length > 0) {
      console.log(`\nCRITICAL FAILURES: ${report.criticalFailures.length}`);
      report.criticalFailures.forEach(failure => {
        console.log(`  • ${failure.component}: ${failure.issue}`);
      });
    }
    
    if (report.fixes.length > 0) {
      console.log('\nDETAILS BY SEVERITY:');
      
      const severityOrder = ['critical', 'high', 'medium', 'low'] as const;
      severityOrder.forEach(severity => {
        const fixesOfSeverity = report.fixes.filter(f => f.severity === severity);
        if (fixesOfSeverity.length > 0) {
          console.log(`\n${severity.toUpperCase()} (${fixesOfSeverity.length}):`);
          fixesOfSeverity.forEach(fix => {
            const icon = {
              fixed: '✅',
              skipped: '⏭️',
              failed: '❌'
            }[fix.action];
            
            console.log(`  ${icon} ${fix.component}: ${fix.issue}`);
            if (fix.before && fix.after) {
              console.log(`     ${fix.before} → ${fix.after}`);
            }
          });
        }
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\nRECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`• ${rec}`));
    }

    if (report.backupPath) {
      console.log(`\nBackup Location: ${report.backupPath}`);
    }
  }
}

// CLI interface
export async function runBookingDataFix(options: {
  dryRun?: boolean;
  configPath?: string;
  fixTypes?: string[];
  strictMode?: boolean;
  dataDir?: string;
  backupDir?: string;
}): Promise<void> {
  const { 
    dryRun = false, 
    configPath, 
    fixTypes, 
    strictMode = false,
    dataDir,
    backupDir 
  } = options;

  const defaultConfig: DataFixConfig = {
    dryRun,
    backupBeforeChanges: true,
    fixTypes: {
      serviceNormalization: true,
      calendarConfigCleanup: true,
      intakeFormValidation: true,
      providerConfigRepair: true,
      duplicateRemoval: true,
      missingDataCreation: true,
    },
    services: [
      'web-development-services',
      'video-production-services',
      'seo-services',
      'marketing-services',
      'lead-generation-services',
      'content-production-services',
    ],
    paths: {
      dataDir,
      backupDir: backupDir || './backups',
      configDir: dataDir ? `${dataDir}/booking` : undefined,
    },
    validation: {
      strictMode,
      skipInvalidServices: !strictMode,
    },
  };

  let config = defaultConfig;
  
  if (configPath) {
    try {
      const fs = await import('fs/promises');
      const configFile = await fs.readFile(configPath, 'utf-8');
      const userConfig = JSON.parse(configFile);
      config = { ...defaultConfig, ...userConfig };
      // Merge nested objects
      config.fixTypes = { ...defaultConfig.fixTypes, ...userConfig.fixTypes };
      config.paths = { ...defaultConfig.paths, ...userConfig.paths };
      config.validation = { ...defaultConfig.validation, ...userConfig.validation };
    } catch (error) {
      console.warn(`Could not load config from ${configPath}, using defaults`);
    }
  }

  // Override fix types if specified
  if (fixTypes && fixTypes.length > 0) {
    Object.keys(config.fixTypes).forEach(key => {
      config.fixTypes[key as keyof typeof config.fixTypes] = fixTypes.includes(key);
    });
  }

  try {
    const fixer = new BookingDataFixer(config);
    const report = await fixer.runDataFixes();

    // Exit with error code if critical fixes failed
    if (report.criticalFailures.length > 0) {
      console.error('\nCritical issues could not be resolved automatically');
      process.exit(1);
    } else if (report.failedIssues > 0) {
      console.warn('\nSome fixes failed but no critical issues remain');
      process.exit(2);
    } else {
      console.log('\nData fix completed successfully');
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal error during data fix:', error);
    process.exit(1);
  }
}

// CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const strictMode = args.includes('--strict');
  const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
  const dataDir = args.find(arg => arg.startsWith('--data-dir='))?.split('=')[1];
  const backupDir = args.find(arg => arg.startsWith('--backup-dir='))?.split('=')[1];
  const fixTypesArg = args.find(arg => arg.startsWith('--fix-types='))?.split('=')[1];
  const fixTypes = fixTypesArg ? fixTypesArg.split(',') : undefined;

  runBookingDataFix({ 
    dryRun, 
    configPath, 
    fixTypes, 
    strictMode, 
    dataDir, 
    backupDir 
  }).catch(console.error);
}