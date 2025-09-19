// scripts/booking/migrate-booking.ts
// Data migration utilities for booking system schema changes and updates
// Handles versioning, backward compatibility, and safe data transformations

import { z } from 'zod';
import type { CanonicalService } from '@/shared/services/types';
import type { BookingProvider, BookingVariant } from '../../src/booking/lib/types';

// Migration interfaces
interface MigrationStep {
  version: string;
  description: string;
  up: (data: any) => Promise<any>;
  down: (data: any) => Promise<any>;
  validate?: (data: any) => boolean;
}

interface MigrationResult {
  step: string;
  success: boolean;
  message: string;
  duration: number;
  details?: Record<string, any>;
}

interface MigrationReport {
  fromVersion: string;
  toVersion: string;
  timestamp: Date;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  results: MigrationResult[];
  rollbackAvailable: boolean;
}

// Migration configuration
interface MigrationConfig {
  dryRun: boolean;
  createBackups: boolean;
  validateAfterEach: boolean;
  stopOnError: boolean;
  backupPath?: string;
  dataPath?: string;
}

// Schema versions for validation
const SchemaVersions = {
  '1.0.0': z.object({
    services: z.array(z.string()),
    calendars: z.record(z.any()),
    intake: z.record(z.any()),
  }),
  '1.1.0': z.object({
    version: z.string(),
    services: z.array(z.string()),
    calendars: z.record(z.any()),
    intake: z.record(z.any()),
    providers: z.record(z.any()).optional(),
  }),
  '1.2.0': z.object({
    version: z.string(),
    services: z.array(z.string()),
    calendars: z.record(z.any()),
    intake: z.record(z.any()),
    providers: z.record(z.any()),
    analytics: z.record(z.any()).optional(),
  }),
} as const;

// Migration manager class
export class BookingMigrationManager {
  private config: MigrationConfig;
  private migrations: MigrationStep[] = [];
  private currentVersion: string = '1.0.0';

  constructor(config: MigrationConfig) {
    this.config = config;
    this.initializeMigrations();
  }

  /**
   * Initialize all migration steps
   */
  private initializeMigrations(): void {
    this.migrations = [
      {
        version: '1.1.0',
        description: 'Add provider configurations and version tracking',
        up: this.migration_1_1_0_up.bind(this),
        down: this.migration_1_1_0_down.bind(this),
        validate: this.validateVersion_1_1_0.bind(this),
      },
      {
        version: '1.2.0',
        description: 'Add analytics configuration and normalize calendar configs',
        up: this.migration_1_2_0_up.bind(this),
        down: this.migration_1_2_0_down.bind(this),
        validate: this.validateVersion_1_2_0.bind(this),
      },
      {
        version: '1.3.0',
        description: 'Restructure intake forms with field validation',
        up: this.migration_1_3_0_up.bind(this),
        down: this.migration_1_3_0_down.bind(this),
        validate: this.validateVersion_1_3_0.bind(this),
      },
      {
        version: '1.4.0',
        description: 'Add booking flow configurations and deprecate legacy formats',
        up: this.migration_1_4_0_up.bind(this),
        down: this.migration_1_4_0_down.bind(this),
        validate: this.validateVersion_1_4_0.bind(this),
      },
    ];
  }

  /**
   * Run migration to target version
   */
  async migrate(targetVersion: string): Promise<MigrationReport> {
    console.log(`🚀 Starting migration from ${this.currentVersion} to ${targetVersion}...`);
    
    if (this.config.dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made');
    }

    const startTime = Date.now();
    const results: MigrationResult[] = [];
    
    // Load current data
    const currentData = await this.loadCurrentData();
    this.currentVersion = this.detectCurrentVersion(currentData);
    
    console.log(`Current version detected: ${this.currentVersion}`);

    // Create backup if requested
    if (this.config.createBackups && !this.config.dryRun) {
      await this.createBackup(currentData);
    }

    // Find migration path
    const migrationSteps = this.findMigrationPath(this.currentVersion, targetVersion);
    
    if (migrationSteps.length === 0) {
      console.log('✅ No migration needed - already at target version');
      return {
        fromVersion: this.currentVersion,
        toVersion: targetVersion,
        timestamp: new Date(),
        totalSteps: 0,
        successfulSteps: 0,
        failedSteps: 0,
        results: [],
        rollbackAvailable: false,
      };
    }

    console.log(`Migration path: ${migrationSteps.map(s => s.version).join(' → ')}`);

    // Execute migration steps
    let currentData_mut = { ...currentData };
    
    for (const step of migrationSteps) {
      const stepResult = await this.executeMigrationStep(step, currentData_mut);
      results.push(stepResult);

      if (stepResult.success) {
        currentData_mut = stepResult.details?.newData || currentData_mut;
        console.log(`✅ ${step.version}: ${step.description}`);
      } else {
        console.error(`❌ ${step.version}: ${stepResult.message}`);
        
        if (this.config.stopOnError) {
          console.log('🛑 Migration stopped due to error');
          break;
        }
      }
    }

    // Save migrated data if not dry run
    if (!this.config.dryRun) {
      await this.saveData(currentData_mut);
    }

    const report: MigrationReport = {
      fromVersion: this.currentVersion,
      toVersion: targetVersion,
      timestamp: new Date(),
      totalSteps: migrationSteps.length,
      successfulSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length,
      results,
      rollbackAvailable: this.config.createBackups,
    };

    const duration = Date.now() - startTime;
    console.log(`🎉 Migration completed in ${duration}ms`);
    
    this.printMigrationReport(report);
    return report;
  }

  /**
   * Rollback to previous version using backup
   */
  async rollback(targetVersion?: string): Promise<MigrationReport> {
    console.log('🔄 Starting rollback...');
    
    if (!this.config.createBackups) {
      throw new Error('Rollback not available - backups were not created');
    }

    const backups = await this.listAvailableBackups();
    
    if (backups.length === 0) {
      throw new Error('No backups available for rollback');
    }

    const targetBackup = targetVersion 
      ? backups.find(b => b.version === targetVersion)
      : backups[0]; // Most recent backup

    if (!targetBackup) {
      throw new Error(`No backup found for version ${targetVersion}`);
    }

    console.log(`Rolling back to version ${targetBackup.version} from ${targetBackup.timestamp}`);
    
    const backupData = await this.loadBackup(targetBackup.path);
    
    if (!this.config.dryRun) {
      await this.saveData(backupData);
    }

    console.log('✅ Rollback completed');
    
    return {
      fromVersion: this.currentVersion,
      toVersion: targetBackup.version,
      timestamp: new Date(),
      totalSteps: 1,
      successfulSteps: 1,
      failedSteps: 0,
      results: [{
        step: 'rollback',
        success: true,
        message: `Rolled back to version ${targetBackup.version}`,
        duration: 0,
      }],
      rollbackAvailable: true,
    };
  }

  // Migration step implementations
  private async migration_1_1_0_up(data: any): Promise<any> {
    return {
      ...data,
      version: '1.1.0',
      providers: {
        cal: {
          apiEndpoint: 'https://api.cal.com/v1',
          timeout: 10000,
          retries: 3,
        },
        calendly: {
          apiEndpoint: 'https://api.calendly.com',
          timeout: 10000,
          retries: 3,
        },
        custom: {
          timeout: 10000,
          retries: 3,
        },
      },
    };
  }

  private async migration_1_1_0_down(data: any): Promise<any> {
    const { version, providers, ...rest } = data;
    return rest;
  }

  private validateVersion_1_1_0(data: any): boolean {
    try {
      SchemaVersions['1.1.0'].parse(data);
      return true;
    } catch {
      return false;
    }
  }

  private async migration_1_2_0_up(data: any): Promise<any> {
    // Normalize calendar configurations
    const normalizedCalendars: Record<string, any> = {};
    
    for (const [service, config] of Object.entries(data.calendars || {})) {
      normalizedCalendars[service] = this.normalizeCalendarConfig(config as any);
    }

    return {
      ...data,
      version: '1.2.0',
      calendars: normalizedCalendars,
      analytics: {
        enabled: true,
        events: [
          'booking_view',
          'booking_submit',
          'booking_success',
          'booking_error',
        ],
        providers: ['google-analytics', 'custom'],
      },
    };
  }

  private async migration_1_2_0_down(data: any): Promise<any> {
    const { analytics, ...rest } = data;
    return {
      ...rest,
      version: '1.1.0',
    };
  }

  private validateVersion_1_2_0(data: any): boolean {
    try {
      SchemaVersions['1.2.0'].parse(data);
      return true;
    } catch {
      return false;
    }
  }

  private async migration_1_3_0_up(data: any): Promise<any> {
    // Restructure intake forms with enhanced field validation
    const normalizedIntake: Record<string, any> = {};
    
    for (const [service, config] of Object.entries(data.intake || {})) {
      normalizedIntake[service] = this.normalizeIntakeConfig(config as any);
    }

    return {
      ...data,
      version: '1.3.0',
      intake: normalizedIntake,
      fieldValidation: {
        patterns: {
          email: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+,
          phone: '^[\\+]?[\\d\\s\\(\\)\\-\\.]{10,},
          url: '^https?:\\/\\/.+',
        },
        messages: {
          required: 'This field is required',
          email: 'Please enter a valid email address',
          phone: 'Please enter a valid phone number',
          url: 'Please enter a valid URL',
        },
      },
    };
  }

  private async migration_1_3_0_down(data: any): Promise<any> {
    const { fieldValidation, ...rest } = data;
    return {
      ...rest,
      version: '1.2.0',
    };
  }

  private validateVersion_1_3_0(data: any): boolean {
    return data.version === '1.3.0' && 
           data.fieldValidation && 
           data.fieldValidation.patterns &&
           data.fieldValidation.messages;
  }

  private async migration_1_4_0_up(data: any): Promise<any> {
    // Add booking flow configurations
    const bookingFlows: Record<string, any> = {};
    
    for (const service of data.services || []) {
      bookingFlows[service] = {
        variant: this.getDefaultVariantForService(service),
        steps: [
          { id: 'service-selection', required: true },
          { id: 'form-intake', required: true },
          { id: 'calendar-booking', required: true },
          { id: 'confirmation', required: false },
        ],
        timeouts: {
          session: 1800000, // 30 minutes
          provider: 10000,  // 10 seconds
        },
      };
    }

    return {
      ...data,
      version: '1.4.0',
      bookingFlows,
      deprecated: {
        legacyCalendarFormats: [
          'old-cal-format',
          'legacy-calendly-format',
        ],
        migrationNote: 'Legacy formats will be removed in version 2.0.0',
      },
    };
  }

  private async migration_1_4_0_down(data: any): Promise<any> {
    const { bookingFlows, deprecated, ...rest } = data;
    return {
      ...rest,
      version: '1.3.0',
    };
  }

  private validateVersion_1_4_0(data: any): boolean {
    return data.version === '1.4.0' && 
           data.bookingFlows && 
           Object.keys(data.bookingFlows).length > 0;
  }

  // Helper methods for migrations
  private normalizeCalendarConfig(config: any): any {
    // Normalize provider names
    if (config.provider === 'cal.com') {
      config.provider = 'cal';
    }

    // Ensure required fields exist
    if (config.provider === 'cal' && !config.eventTypeId) {
      config.eventTypeId = 'default-consultation';
    }

    if (config.provider === 'calendly' && !config.organization) {
      config.organization = 'default-org';
    }

    // Add timeout if missing
    if (!config.timeout) {
      config.timeout = 10000;
    }

    return config;
  }

  private normalizeIntakeConfig(config: any): any {
    // Ensure fields have proper structure
    if (config.fields) {
      config.fields = config.fields.map((field: any) => ({
        ...field,
        id: field.id || field.name,
        validation: field.validation || {},
      }));
    }

    // Ensure consent configuration exists
    if (!config.consent) {
      config.consent = {
        privacyPolicyHref: '/privacy',
        marketingOptIn: true,
      };
    }

    return config;
  }

  private getDefaultVariantForService(service: string): BookingVariant {
    const variantMap: Record<string, BookingVariant> = {
      'web-development-services': 'form',
      'video-production-services': 'embed',
      'seo-services': 'calendar',
      'marketing-services': 'form',
      'lead-generation-services': 'form',
      'content-production-services': 'form',
    };

    return variantMap[service] || 'embed';
  }

  // Utility methods
  private async executeMigrationStep(
    step: MigrationStep, 
    data: any
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Running migration ${step.version}: ${step.description}`);
      
      const newData = await step.up(data);
      const duration = Date.now() - startTime;
      
      // Validate if validation function provided
      if (step.validate && this.config.validateAfterEach) {
        const isValid = step.validate(newData);
        if (!isValid) {
          return {
            step: step.version,
            success: false,
            message: 'Migration validation failed',
            duration,
          };
        }
      }

      return {
        step: step.version,
        success: true,
        message: `Successfully migrated to ${step.version}`,
        duration,
        details: { newData },
      };
    } catch (error) {
      return {
        step: step.version,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown migration error',
        duration: Date.now() - startTime,
      };
    }
  }

  private detectCurrentVersion(data: any): string {
    // Detect version based on data structure
    if (data.version) {
      return data.version;
    }
    
    if (data.bookingFlows) return '1.4.0';
    if (data.fieldValidation) return '1.3.0';
    if (data.analytics) return '1.2.0';
    if (data.providers) return '1.1.0';
    
    return '1.0.0';
  }

  private findMigrationPath(fromVersion: string, toVersion: string): MigrationStep[] {
    const fromIndex = this.getVersionIndex(fromVersion);
    const toIndex = this.getVersionIndex(toVersion);
    
    if (fromIndex === -1 || toIndex === -1) {
      throw new Error(`Invalid version: ${fromVersion} or ${toVersion}`);
    }
    
    if (fromIndex >= toIndex) {
      return []; // No migration needed or downgrade
    }
    
    return this.migrations.slice(fromIndex, toIndex);
  }

  private getVersionIndex(version: string): number {
    const versions = ['1.0.0', ...this.migrations.map(m => m.version)];
    return versions.indexOf(version);
  }

  private async loadCurrentData(): Promise<any> {
    try {
      if (this.config.dataPath) {
        const fs = await import('fs/promises');
        const data = await fs.readFile(this.config.dataPath, 'utf-8');
        return JSON.parse(data);
      }
      
      // Load from your actual data layer
      return this.loadFromDataLayer();
    } catch (error) {
      console.warn('Could not load current data, using empty structure');
      return {
        services: [],
        calendars: {},
        intake: {},
      };
    }
  }

  private async loadFromDataLayer(): Promise<any> {
    // This would load from your actual data layer
    // For demo, return sample data
    return {
      services: [
        'web-development-services',
        'video-production-services',
        'seo-services',
      ],
      calendars: {
        'web-development-services': {
          provider: 'cal.com',
          eventTypeId: 'web-consultation',
        },
      },
      intake: {
        'web-development-services': {
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
          ],
        },
      },
    };
  }

  private async saveData(data: any): Promise<void> {
    try {
      if (this.config.dataPath) {
        const fs = await import('fs/promises');
        await fs.writeFile(this.config.dataPath, JSON.stringify(data, null, 2));
        console.log(`Data saved to ${this.config.dataPath}`);
      } else {
        await this.saveToDataLayer(data);
      }
    } catch (error) {
      throw new Error(`Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async saveToDataLayer(data: any): Promise<void> {
    // This would save to your actual data layer
    console.log('Data would be saved to data layer');
  }

  private async createBackup(data: any): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = this.config.backupPath || './backups';
    const filename = `booking-data-${this.currentVersion}-${timestamp}.json`;
    
    try {
      const fs = await import('fs/promises');
      await fs.mkdir(backupPath, { recursive: true });
      await fs.writeFile(`${backupPath}/${filename}`, JSON.stringify(data, null, 2));
      console.log(`Backup created: ${backupPath}/${filename}`);
    } catch (error) {
      console.warn(`Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async listAvailableBackups(): Promise<Array<{
    version: string;
    timestamp: string;
    path: string;
  }>> {
    const backupPath = this.config.backupPath || './backups';
    
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(backupPath);
      
      return files
        .filter(file => file.startsWith('booking-data-') && file.endsWith('.json'))
        .map(file => {
          const match = file.match(/booking-data-(.+)-(.+)\.json$/);
          return {
            version: match?.[1] || 'unknown',
            timestamp: match?.[2] || 'unknown',
            path: `${backupPath}/${file}`,
          };
        })
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      return [];
    }
  }

  private async loadBackup(backupPath: string): Promise<any> {
    try {
      const fs = await import('fs/promises');
      const data = await fs.readFile(backupPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(`Failed to load backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private printMigrationReport(report: MigrationReport): void {
    console.log('\n');
    console.log('MIGRATION REPORT');
    console.log('================');
    console.log(`From: ${report.fromVersion}`);
    console.log(`To: ${report.toVersion}`);
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Total Steps: ${report.totalSteps}`);
    console.log(`Successful: ${report.successfulSteps}`);
    console.log(`Failed: ${report.failedSteps}`);
    
    if (report.results.length > 0) {
      console.log('\nSTEPS:');
      report.results.forEach(result => {
        const icon = result.success ? '✅' : '❌';
        console.log(`${icon} ${result.step}: ${result.message} (${result.duration}ms)`);
      });
    }
    
    if (report.rollbackAvailable) {
      console.log('\n💾 Rollback available - use the rollback command if needed');
    }
  }
}

// CLI interface
export async function runBookingMigration(options: {
  targetVersion: string;
  dryRun?: boolean;
  configPath?: string;
  dataPath?: string;
  backupPath?: string;
}): Promise<void> {
  const {
    targetVersion,
    dryRun = false,
    configPath,
    dataPath,
    backupPath,
  } = options;

  const defaultConfig: MigrationConfig = {
    dryRun,
    createBackups: true,
    validateAfterEach: true,
    stopOnError: true,
    dataPath,
    backupPath,
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

  const migrationManager = new BookingMigrationManager(config);
  const report = await migrationManager.migrate(targetVersion);

  // Exit with error code if migration failed
  if (report.failedSteps > 0) {
    console.error('Migration failed - check logs for details');
    process.exit(1);
  }

  console.log('Migration completed successfully');
}

export async function runBookingRollback(options: {
  targetVersion?: string;
  configPath?: string;
  backupPath?: string;
}): Promise<void> {
  const { targetVersion, configPath, backupPath } = options;

  const config: MigrationConfig = {
    dryRun: false,
    createBackups: false, // Don't create new backups during rollback
    validateAfterEach: false,
    stopOnError: true,
    backupPath,
  };

  const migrationManager = new BookingMigrationManager(config);
  const report = await migrationManager.rollback(targetVersion);

  if (report.failedSteps > 0) {
    console.error('Rollback failed - check logs for details');
    process.exit(1);
  }

  console.log('Rollback completed successfully');
}

// CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'migrate') {
    const targetVersion = args[1];
    if (!targetVersion) {
      console.error('Usage: migrate <targetVersion> [--dry-run] [--config=path] [--data=path] [--backup=path]');
      process.exit(1);
    }
    
    const dryRun = args.includes('--dry-run');
    const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
    const dataPath = args.find(arg => arg.startsWith('--data='))?.split('=')[1];
    const backupPath = args.find(arg => arg.startsWith('--backup='))?.split('=')[1];
    
    runBookingMigration({ targetVersion, dryRun, configPath, dataPath, backupPath })
      .catch(console.error);
      
  } else if (command === 'rollback') {
    const targetVersion = args[1];
    const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
    const backupPath = args.find(arg => arg.startsWith('--backup='))?.split('=')[1];
    
    runBookingRollback({ targetVersion, configPath, backupPath })
      .catch(console.error);
      
  } else {
    console.error('Usage: migrate|rollback [options]');
    console.error('Commands:');
    console.error('  migrate <version>  - Migrate to target version');
    console.error('  rollback [version] - Rollback to version (latest backup if not specified)');
    process.exit(1);
  }
}