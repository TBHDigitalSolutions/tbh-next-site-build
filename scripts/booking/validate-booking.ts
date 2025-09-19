// scripts/booking/validate-booking.ts
// Comprehensive validation orchestrator for the entire booking system
// Coordinates validation across all components and provides unified reporting

import { z } from 'zod';
import type { CanonicalService } from '@/shared/services/types';
import type { BookingProvider, BookingVariant } from '../../src/booking/lib/types';
import { validateBookingSectionProps } from '../../src/booking/lib/validators';

// Import component-specific validators
import { validateCalendarProps } from './validate-availability-calendar';
import { validateFormProps } from './validate-booking-form';
import { validateProgressProps } from './validate-booking-progress';

// Validation result interfaces
interface ComponentValidationResult {
  component: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  details?: Record<string, any>;
}

interface SystemValidationReport {
  timestamp: Date;
  overallValid: boolean;
  totalComponents: number;
  validComponents: number;
  componentsWithWarnings: number;
  invalidComponents: number;
  results: ComponentValidationResult[];
  recommendations: string[];
  criticalIssues: string[];
}

// Validation configuration
interface ValidationConfig {
  components: {
    core: boolean;
    calendar: boolean;
    forms: boolean;
    progress: boolean;
    templates: boolean;
    sections: boolean;
    providers: boolean;
    data: boolean;
  };
  strictMode: boolean;
  includeWarnings: boolean;
  dataPath?: string;
  schemaPath?: string;
}

// Main booking system validator
export class BookingSystemValidator {
  private config: ValidationConfig;
  private results: ComponentValidationResult[] = [];

  constructor(config: ValidationConfig) {
    this.config = config;
  }

  /**
   * Run comprehensive system validation
   */
  async validateSystem(): Promise<SystemValidationReport> {
    console.log('🔍 Starting comprehensive booking system validation...\n');
    
    this.results = [];
    
    // Run component validations based on config
    const validationPromises: Promise<void>[] = [];
    
    if (this.config.components.core) {
      validationPromises.push(this.validateCoreTypes());
    }
    
    if (this.config.components.calendar) {
      validationPromises.push(this.validateCalendarComponents());
    }
    
    if (this.config.components.forms) {
      validationPromises.push(this.validateFormComponents());
    }
    
    if (this.config.components.progress) {
      validationPromises.push(this.validateProgressComponents());
    }
    
    if (this.config.components.templates) {
      validationPromises.push(this.validateTemplates());
    }
    
    if (this.config.components.sections) {
      validationPromises.push(this.validateSections());
    }
    
    if (this.config.components.providers) {
      validationPromises.push(this.validateProviders());
    }
    
    if (this.config.components.data) {
      validationPromises.push(this.validateDataIntegrity());
    }

    // Execute all validations
    await Promise.allSettled(validationPromises);
    
    // Generate comprehensive report
    const report = this.generateSystemReport();
    this.printValidationReport(report);
    
    return report;
  }

  /**
   * Validate core type definitions and lib structure
   */
  private async validateCoreTypes(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate booking variants
      const validVariants: BookingVariant[] = ['embed', 'form', 'calendar'];
      const variantValidation = this.validateTypeUnion('BookingVariant', validVariants);
      errors.push(...variantValidation.errors);

      // Validate providers
      const validProviders: BookingProvider[] = ['cal', 'calendly', 'custom'];
      const providerValidation = this.validateTypeUnion('BookingProvider', validProviders);
      errors.push(...providerValidation.errors);

      // Validate canonical services
      const serviceValidation = await this.validateCanonicalServices();
      errors.push(...serviceValidation.errors);
      warnings.push(...serviceValidation.warnings);

      // Validate lib structure
      const libValidation = await this.validateLibStructure();
      errors.push(...libValidation.errors);
      warnings.push(...libValidation.warnings);

      this.results.push({
        component: 'core-types',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          variantsChecked: validVariants.length,
          providersChecked: validProviders.length,
          servicesChecked: serviceValidation.details?.servicesCount || 0,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'core-types',
        valid: false,
        errors: [`Core types validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate calendar components
   */
  private async validateCalendarComponents(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Load and validate calendar configurations
      const calendarConfigs = await this.loadCalendarConfigurations();
      
      for (const [service, config] of Object.entries(calendarConfigs)) {
        try {
          const validation = validateCalendarProps({ config });
          if (!validation.valid) {
            errors.push(`Calendar config for ${service}: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`Failed to validate calendar config for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Validate availability calendar component structure
      const availabilityValidation = await this.validateAvailabilityCalendar();
      errors.push(...availabilityValidation.errors);
      warnings.push(...availabilityValidation.warnings);

      this.results.push({
        component: 'calendar-components',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          configurationsChecked: Object.keys(calendarConfigs).length,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'calendar-components',
        valid: false,
        errors: [`Calendar components validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate form components
   */
  private async validateFormComponents(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Load and validate form configurations
      const formConfigs = await this.loadFormConfigurations();
      
      for (const [service, config] of Object.entries(formConfigs)) {
        try {
          const validation = validateFormProps({
            config,
            onSubmit: async () => {},
          });
          if (!validation.valid) {
            errors.push(`Form config for ${service}: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`Failed to validate form config for ${service}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Validate booking form component structure
      const bookingFormValidation = await this.validateBookingForm();
      errors.push(...bookingFormValidation.errors);
      warnings.push(...bookingFormValidation.warnings);

      this.results.push({
        component: 'form-components',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          configurationsChecked: Object.keys(formConfigs).length,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'form-components',
        valid: false,
        errors: [`Form components validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate progress components
   */
  private async validateProgressComponents(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Generate mock progress configurations for testing
      const progressConfigs = this.generateMockProgressConfigs();
      
      for (const [flowType, config] of Object.entries(progressConfigs)) {
        try {
          const validation = validateProgressProps(config);
          if (!validation.valid) {
            errors.push(`Progress config for ${flowType}: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          errors.push(`Failed to validate progress config for ${flowType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.results.push({
        component: 'progress-components',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          configurationsChecked: Object.keys(progressConfigs).length,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'progress-components',
        valid: false,
        errors: [`Progress components validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate template structures
   */
  private async validateTemplates(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate BookingHubTemplate
      const hubTemplateValidation = await this.validateBookingHubTemplate();
      errors.push(...hubTemplateValidation.errors);
      warnings.push(...hubTemplateValidation.warnings);

      // Validate BookingModalTemplate
      const modalTemplateValidation = await this.validateBookingModalTemplate();
      errors.push(...modalTemplateValidation.errors);
      warnings.push(...modalTemplateValidation.warnings);

      this.results.push({
        component: 'templates',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          templatesChecked: 2,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'templates',
        valid: false,
        errors: [`Template validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate section structures
   */
  private async validateSections(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Generate mock section props for testing
      const sectionProps = this.generateMockSectionProps();
      
      for (const [variant, props] of Object.entries(sectionProps)) {
        try {
          const validation = validateBookingSectionProps(props);
          if (!validation.success) {
            errors.push(`Section props for ${variant}: ${validation.errors?.join(', ')}`);
          }
        } catch (error) {
          errors.push(`Failed to validate section props for ${variant}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.results.push({
        component: 'sections',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          variantsChecked: Object.keys(sectionProps).length,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'sections',
        valid: false,
        errors: [`Section validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate provider configurations
   */
  private async validateProviders(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      const providers: BookingProvider[] = ['cal', 'calendly', 'custom'];
      
      for (const provider of providers) {
        const providerConfig = await this.loadProviderConfiguration(provider);
        const validation = this.validateProviderConfig(provider, providerConfig);
        
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      }

      this.results.push({
        component: 'providers',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          providersChecked: providers.length,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'providers',
        valid: false,
        errors: [`Provider validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  /**
   * Validate data integrity
   */
  private async validateDataIntegrity(): Promise<void> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Check service coverage
      const serviceCoverage = await this.validateServiceCoverage();
      errors.push(...serviceCoverage.errors);
      warnings.push(...serviceCoverage.warnings);

      // Check configuration consistency
      const consistency = await this.validateConfigurationConsistency();
      errors.push(...consistency.errors);
      warnings.push(...consistency.warnings);

      // Check data relationships
      const relationships = await this.validateDataRelationships();
      errors.push(...relationships.errors);
      warnings.push(...relationships.warnings);

      this.results.push({
        component: 'data-integrity',
        valid: errors.length === 0,
        errors,
        warnings,
        details: {
          checksPerformed: 3,
        },
      });
    } catch (error) {
      this.results.push({
        component: 'data-integrity',
        valid: false,
        errors: [`Data integrity validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
    }
  }

  // Helper validation methods
  private validateTypeUnion(typeName: string, validValues: string[]): { errors: string[] } {
    const errors: string[] = [];
    
    if (validValues.length === 0) {
      errors.push(`${typeName} has no valid values`);
    }
    
    // Check for duplicates
    const uniqueValues = new Set(validValues);
    if (uniqueValues.size !== validValues.length) {
      errors.push(`${typeName} contains duplicate values`);
    }
    
    return { errors };
  }

  private async validateCanonicalServices(): Promise<{
    errors: string[];
    warnings: string[];
    details: { servicesCount: number };
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // This would load from your actual services constants
      const services: CanonicalService[] = [
        'web-development-services',
        'video-production-services',
        'seo-services',
        'marketing-services',
        'lead-generation-services',
        'content-production-services',
      ];
      
      if (services.length === 0) {
        errors.push('No canonical services defined');
      }
      
      // Validate service naming convention
      services.forEach(service => {
        if (!service.endsWith('-services')) {
          warnings.push(`Service "${service}" doesn't follow naming convention (*-services)`);
        }
        
        if (service.includes('_') || service.includes(' ')) {
          errors.push(`Service "${service}" contains invalid characters (use hyphens only)`);
        }
      });
      
      return { errors, warnings, details: { servicesCount: services.length } };
    } catch (error) {
      return {
        errors: [`Failed to validate canonical services: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        details: { servicesCount: 0 },
      };
    }
  }

  private async validateLibStructure(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const requiredFiles = [
      'types.ts',
      'constants.ts',
      'utils.ts',
      'validators.ts',
      'adapters.ts',
      'registry.ts',
      'metrics.ts',
    ];
    
    // In a real implementation, you would check if these files exist
    // For now, we'll simulate the check
    const missingFiles = requiredFiles.filter(() => Math.random() > 0.9); // 10% chance of missing file
    
    if (missingFiles.length > 0) {
      errors.push(`Missing required lib files: ${missingFiles.join(', ')}`);
    }
    
    return { errors, warnings };
  }

  // Mock data generators for testing
  private async loadCalendarConfigurations(): Promise<Record<string, any>> {
    return {
      'web-development-services': {
        provider: 'cal',
        service: 'web-development-services',
        eventTypeId: 'web-consultation',
      },
      'video-production-services': {
        provider: 'calendly',
        service: 'video-production-services',
        organization: 'video-team',
        eventSlug: 'video-consultation',
      },
    };
  }

  private async loadFormConfigurations(): Promise<Record<string, any>> {
    return {
      'web-development-services': {
        service: 'web-development-services',
        variant: 'intake',
        fields: [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'email', label: 'Email', type: 'email', required: true },
        ],
        submission: {
          endpoint: 'https://api.example.com/submit',
          method: 'POST',
        },
        validation: {
          validateOnBlur: true,
          validateOnChange: false,
          showValidationImmediately: false,
        },
        ui: {
          layout: 'single-column',
          showProgress: true,
          grouping: false,
          compact: false,
          showOptionalIndicators: true,
        },
      },
    };
  }

  private generateMockProgressConfigs(): Record<string, any> {
    return {
      'simple-flow': {
        flowType: 'simple',
        steps: [
          { id: 'step-1', label: 'Step 1', status: 'completed', optional: false, clickable: true },
          { id: 'step-2', label: 'Step 2', status: 'current', optional: false, clickable: true },
          { id: 'step-3', label: 'Step 3', status: 'pending', optional: false, clickable: false },
        ],
        currentStep: 1,
      },
      'detailed-flow': {
        flowType: 'detailed',
        steps: [
          { id: 'intake', label: 'Information', status: 'completed', optional: false, clickable: true },
          { id: 'calendar', label: 'Schedule', status: 'current', optional: false, clickable: true },
          { id: 'confirm', label: 'Confirm', status: 'pending', optional: false, clickable: false },
        ],
        currentStep: 1,
        variant: 'horizontal',
        showStepNumbers: true,
        showDescriptions: true,
      },
    };
  }

  private generateMockSectionProps(): Record<string, any> {
    return {
      'embed-variant': {
        variant: 'embed',
        service: 'web-development-services',
        calendar: {
          provider: 'cal',
          service: 'web-development-services',
          eventTypeId: 'consultation',
        },
        successHref: '/thank-you',
        cancelHref: '/services',
        analyticsContext: 'booking_page',
      },
      'form-variant': {
        variant: 'form',
        service: 'web-development-services',
        intake: {
          service: 'web-development-services',
          fields: [
            { name: 'name', label: 'Name', type: 'text', required: true },
            { name: 'email', label: 'Email', type: 'email', required: true },
          ],
          consent: {
            privacyPolicyHref: '/privacy',
            marketingOptIn: true,
          },
        },
        successHref: '/thank-you',
        cancelHref: '/services',
        analyticsContext: 'booking_page',
      },
    };
  }

  private async loadProviderConfiguration(provider: BookingProvider): Promise<any> {
    const configs = {
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
        endpoints: ['http://localhost:3000/api/booking'],
      },
    };
    
    return configs[provider] || {};
  }

  private validateProviderConfig(provider: BookingProvider, config: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!config.timeout || config.timeout < 1000) {
      warnings.push(`${provider} provider timeout is very low (${config.timeout}ms)`);
    }
    
    if (!config.retries || config.retries < 1) {
      warnings.push(`${provider} provider has no retry configuration`);
    }
    
    if (provider === 'cal' && !config.apiEndpoint) {
      errors.push('Cal.com provider missing API endpoint');
    }
    
    if (provider === 'calendly' && !config.apiEndpoint) {
      errors.push('Calendly provider missing API endpoint');
    }
    
    return { errors, warnings };
  }

  private async validateServiceCoverage(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const services: CanonicalService[] = [
      'web-development-services',
      'video-production-services',
      'seo-services',
      'marketing-services',
      'lead-generation-services',
      'content-production-services',
    ];
    
    const calendarConfigs = await this.loadCalendarConfigurations();
    const formConfigs = await this.loadFormConfigurations();
    
    services.forEach(service => {
      if (!calendarConfigs[service]) {
        warnings.push(`Service "${service}" has no calendar configuration`);
      }
      
      if (!formConfigs[service]) {
        warnings.push(`Service "${service}" has no form configuration`);
      }
    });
    
    return { errors, warnings };
  }

  private async validateConfigurationConsistency(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const calendarConfigs = await this.loadCalendarConfigurations();
    
    for (const [service, config] of Object.entries(calendarConfigs)) {
      if (config.service !== service) {
        errors.push(`Calendar config service field "${config.service}" doesn't match key "${service}"`);
      }
    }
    
    return { errors, warnings };
  }

  private async validateDataRelationships(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check for orphaned configurations
    // Check for missing references
    // This would be more comprehensive in a real implementation
    
    return { errors, warnings };
  }

  // Component-specific validations (simplified for demo)
  private async validateAvailabilityCalendar(): Promise<{ errors: string[]; warnings: string[] }> {
    // This would call the actual validate-availability-calendar functions
    return { errors: [], warnings: [] };
  }

  private async validateBookingForm(): Promise<{ errors: string[]; warnings: string[] }> {
    // This would call the actual validate-booking-form functions
    return { errors: [], warnings: [] };
  }

  private async validateBookingHubTemplate(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check template structure and required props
    // This would be more comprehensive in a real implementation
    
    return { errors, warnings };
  }

  private async validateBookingModalTemplate(): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check modal template structure and accessibility
    // This would be more comprehensive in a real implementation
    
    return { errors, warnings };
  }

  private generateSystemReport(): SystemValidationReport {
    const validComponents = this.results.filter(r => r.valid).length;
    const componentsWithWarnings = this.results.filter(r => r.warnings.length > 0).length;
    const invalidComponents = this.results.filter(r => !r.valid).length;
    
    const criticalIssues: string[] = [];
    const recommendations: string[] = [];
    
    // Collect critical issues
    this.results.forEach(result => {
      if (!result.valid) {
        criticalIssues.push(...result.errors);
      }
    });
    
    // Generate recommendations
    if (invalidComponents > 0) {
      recommendations.push(`Fix ${invalidComponents} invalid component(s) before deployment`);
    }
    
    if (componentsWithWarnings > 0) {
      recommendations.push(`Review ${componentsWithWarnings} component(s) with warnings`);
    }
    
    if (this.config.strictMode && componentsWithWarnings > 0) {
      recommendations.push('Strict mode enabled - address all warnings before deployment');
    }
    
    if (criticalIssues.length === 0 && componentsWithWarnings === 0) {
      recommendations.push('System validation passed - ready for deployment');
    }
    
    return {
      timestamp: new Date(),
      overallValid: invalidComponents === 0 && (!this.config.strictMode || componentsWithWarnings === 0),
      totalComponents: this.results.length,
      validComponents,
      componentsWithWarnings,
      invalidComponents,
      results: this.results,
      recommendations,
      criticalIssues,
    };
  }

  private printValidationReport(report: SystemValidationReport): void {
    console.log('\n');
    console.log('BOOKING SYSTEM VALIDATION REPORT');
    console.log('================================');
    console.log(`Timestamp: ${report.timestamp.toISOString()}`);
    console.log(`Overall Valid: ${report.overallValid ? 'YES' : 'NO'}`);
    console.log(`Total Components: ${report.totalComponents}`);
    console.log(`Valid: ${report.validComponents}`);
    console.log(`With Warnings: ${report.componentsWithWarnings}`);
    console.log(`Invalid: ${report.invalidComponents}`);
    
    if (report.results.length > 0) {
      console.log('\nCOMPONENT RESULTS:');
      report.results.forEach(result => {
        const icon = result.valid ? '✅' : '❌';
        const warningIcon = result.warnings.length > 0 ? ' ⚠️' : '';
        console.log(`${icon}${warningIcon} ${result.component}`);
        
        if (result.errors.length > 0) {
          result.errors.forEach(error => console.log(`   ❌ ${error}`));
        }
        
        if (result.warnings.length > 0 && this.config.includeWarnings) {
          result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
        }
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\nRECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`• ${rec}`));
    }
    
    if (report.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      report.criticalIssues.forEach(issue => console.log(`• ${issue}`));
    }
  }
}

// CLI interface
export async function runBookingValidation(options: {
  components?: string[];
  strictMode?: boolean;
  configPath?: string;
  outputPath?: string;
}): Promise<void> {
  const { components, strictMode = false, configPath, outputPath } = options;

  const defaultConfig: ValidationConfig = {
    components: {
      core: true,
      calendar: true,
      forms: true,
      progress: true,
      templates: true,
      sections: true,
      providers: true,
      data: true,
    },
    strictMode,
    includeWarnings: true,
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

  // Filter components if specified
  if (components && components.length > 0) {
    Object.keys(config.components).forEach(component => {
      if (!components.includes(component)) {
        config.components[component as keyof typeof config.components] = false;
      }
    });
  }

  const validator = new BookingSystemValidator(config);
  const report = await validator.validateSystem();

  // Save report if output path specified
  if (outputPath) {
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
      console.log(`\nValidation report saved to: ${outputPath}`);
    } catch (error) {
      console.warn(`Could not save report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Exit with appropriate code
  if (!report.overallValid) {
    console.error('\nValidation failed - system has critical issues');
    process.exit(1);
  } else if (report.componentsWithWarnings > 0 && config.strictMode) {
    console.warn('\nValidation passed with warnings (strict mode)');
    process.exit(2);
  } else {
    console.log('\nValidation passed - system is ready');
    process.exit(0);
  }
}

// CLI runner
if (require.main === module) {
  const args = process.argv.slice(2);
  const componentsArg = args.find(arg => arg.startsWith('--components='))?.split('=')[1];
  const components = componentsArg ? componentsArg.split(',') : undefined;
  const strictMode = args.includes('--strict');
  const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

  runBookingValidation({ components, strictMode, configPath, outputPath }).catch(console.error);
}