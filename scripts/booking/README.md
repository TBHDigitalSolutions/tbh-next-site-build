# Booking System Scripts

Comprehensive tooling for monitoring, testing, validation, and maintenance of the booking system.

## Overview

This directory contains production-ready scripts for managing the booking system across all environments. Each script is designed to work independently or as part of automated workflows.

## Scripts

### 📊 `booking-stats.ts`
**Purpose**: Generate comprehensive booking system analytics and performance metrics.

**Features**:
- Booking conversion rates and funnel analysis
- Provider performance metrics (Cal.com, Calendly, Custom)
- Service-specific statistics and trends
- System health indicators
- Performance bottleneck identification

**Usage**:
```bash
# Generate stats for last 7 days (text format)
npm run booking:stats

# Generate stats for specific date range (JSON format)
npm run booking:stats "2025-01-01" "2025-01-31" json

# Save report to file
npm run booking:stats -- --output=./reports/booking-stats.json
```

**Output**: Detailed analytics report with conversion rates, popular services, provider performance, and recommendations.

---

### 🔍 `check-booking-health.ts`
**Purpose**: Monitor booking system health across all components and providers.

**Features**:
- Provider API connectivity testing (Cal.com, Calendly, Custom)
- Data integrity validation
- Configuration consistency checks
- Performance metric monitoring
- Database connectivity verification
- External dependency health checks

**Usage**:
```bash
# Run full health check
npm run booking:health

# Use custom config
npm run booking:health -- --config=./config/health-check.json

# CI/CD integration (exits with error codes)
npm run booking:health && echo "System healthy"
```

**Exit Codes**:
- `0`: All systems healthy
- `1`: Critical issues found
- `2`: Degraded performance detected

---

### 🔧 `fix-booking-data.ts`
**Purpose**: Automatically repair common data issues and inconsistencies.

**Features**:
- Service slug normalization
- Calendar configuration cleanup
- Intake form validation and repair
- Provider configuration fixes
- Duplicate removal
- Missing configuration creation

**Usage**:
```bash
# Dry run (see what would be fixed)
npm run booking:fix -- --dry-run

# Apply all fixes
npm run booking:fix

# Fix specific types only
npm run booking:fix -- --fix-types=serviceNormalization,duplicateRemoval

# Use custom config
npm run booking:fix -- --config=./config/fix-config.json
```

**Safety Features**:
- Automatic backups before changes
- Dry run mode for testing
- Selective fix types
- Rollback capability

---

### 🚀 `migrate-booking.ts`
**Purpose**: Handle schema migrations and data structure updates safely.

**Features**:
- Version-aware migrations
- Automatic backup creation
- Rollback functionality
- Data validation after each step
- Dry run support

**Usage**:
```bash
# Migrate to latest version
npm run booking:migrate 1.4.0

# Dry run migration
npm run booking:migrate 1.4.0 -- --dry-run

# Rollback to previous version
npm run booking:rollback

# Rollback to specific version
npm run booking:rollback 1.2.0
```

**Migration Path**: `1.0.0 → 1.1.0 → 1.2.0 → 1.3.0 → 1.4.0`

**Features Added by Version**:
- `1.1.0`: Provider configurations and version tracking
- `1.2.0`: Analytics configuration and normalized calendar configs
- `1.3.0`: Enhanced intake forms with field validation
- `1.4.0`: Booking flow configurations and legacy deprecation

---

### 🧪 `test-providers.ts`
**Purpose**: Comprehensive testing of all booking providers.

**Features**:
- Cal.com API and embed testing
- Calendly API and widget testing
- Custom provider endpoint testing
- Performance benchmarking
- Health scoring and recommendations

**Usage**:
```bash
# Test all providers
npm run booking:test-providers

# Test specific providers only
npm run booking:test-providers -- --providers=cal,calendly

# Save detailed report
npm run booking:test-providers -- --output=./reports/provider-tests.json

# Use custom config
npm run booking:test-providers -- --config=./config/provider-test-config.json
```

**Test Categories**:
- API connectivity and authentication
- Embed script functionality
- Webhook configuration
- Response time and reliability
- Error handling and recovery

---

### ✅ `validate-booking.ts`
**Purpose**: Comprehensive validation orchestrator for the entire booking system.

**Features**:
- Core type and lib structure validation
- Component prop validation (calendar, forms, progress)
- Template structure validation
- Section configuration validation
- Provider configuration validation
- Data integrity and relationship validation

**Usage**:
```bash
# Validate entire system
npm run booking:validate

# Strict mode (treat warnings as errors)
npm run booking:validate -- --strict

# Validate specific components only
npm run booking:validate -- --components=core,calendar,forms

# Save validation report
npm run booking:validate -- --output=./reports/validation.json
```

**Validation Components**:
- `core`: Type definitions and lib structure
- `calendar`: Calendar components and configurations
- `forms`: Form components and intake configurations
- `progress`: Progress indicators and flow configurations
- `templates`: Template structure and props
- `sections`: Section orchestration and variants
- `providers`: Provider configurations and capabilities
- `data`: Data integrity and relationships

---

### 📋 Individual Component Validators

#### `validate-availability-calendar.ts`
Validates calendar components, time slot data, and provider configurations.

#### `validate-booking-form.ts`
Validates form configurations, field definitions, and submission handlers.

#### `validate-booking-progress.ts`
Validates progress indicators, flow configurations, and step definitions.

## Configuration

### Environment Variables
```bash
# Provider API Keys (for testing)
CAL_API_KEY=your_cal_api_key
CALENDLY_API_KEY=your_calendly_api_key

# Database connection (for health checks)
DATABASE_URL=your_database_url

# Custom endpoints (for testing)
CUSTOM_BOOKING_ENDPOINT=http://localhost:3000/api/booking
```

### Config Files

#### Health Check Config (`health-check.json`)
```json
{
  "timeoutMs": 5000,
  "retries": 2,
  "providers": {
    "cal": {
      "enabled": true,
      "apiKey": "${CAL_API_KEY}"
    },
    "calendly": {
      "enabled": true,
      "apiKey": "${CALENDLY_API_KEY}"
    },
    "custom": {
      "enabled": true,
      "endpoints": ["${CUSTOM_BOOKING_ENDPOINT}"]
    }
  },
  "services": [
    "web-development-services",
    "video-production-services",
    "seo-services",
    "marketing-services",
    "lead-generation-services",
    "content-production-services"
  ]
}
```

#### Fix Config (`fix-config.json`)
```json
{
  "dryRun": false,
  "backupBeforeChanges": true,
  "fixTypes": {
    "serviceNormalization": true,
    "calendarConfigCleanup": true,
    "intakeFormValidation": true,
    "providerConfigRepair": true,
    "duplicateRemoval": true,
    "missingDataCreation": true
  }
}
```

## Automation & CI/CD

### GitHub Actions Integration
```yaml
# .github/workflows/booking-health.yml
name: Booking System Health Check
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  push:
    paths: ['src/booking/**', 'src/data/booking/**']

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run health check
        run: npm run booking:health
        env:
          CAL_API_KEY: ${{ secrets.CAL_API_KEY }}
          CALENDLY_API_KEY: ${{ secrets.CALENDLY_API_KEY }}
      - name: Upload health report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: health-report
          path: ./reports/
```

### Pre-deployment Validation
```yaml
# .github/workflows/booking-validation.yml
name: Pre-deployment Validation
on:
  pull_request:
    paths: ['src/booking/**']

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Validate booking system
        run: npm run booking:validate -- --strict
      - name: Test providers
        run: npm run booking:test-providers
        env:
          CAL_API_KEY: ${{ secrets.CAL_API_KEY }}
          CALENDLY_API_KEY: ${{ secrets.CALENDLY_API_KEY }}
```

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "booking:stats": "tsx scripts/booking/booking-stats.ts",
    "booking:health": "tsx scripts/booking/check-booking-health.ts",
    "booking:fix": "tsx scripts/booking/fix-booking-data.ts",
    "booking:migrate": "tsx scripts/booking/migrate-booking.ts migrate",
    "booking:rollback": "tsx scripts/booking/migrate-booking.ts rollback",
    "booking:test-providers": "tsx scripts/booking/test-providers.ts",
    "booking:validate": "tsx scripts/booking/validate-booking.ts",
    "booking:validate-calendar": "tsx scripts/booking/validate-availability-calendar.ts",
    "booking:validate-form": "tsx scripts/booking/validate-booking-form.ts",
    "booking:validate-progress": "tsx scripts/booking/validate-booking-progress.ts"
  }
}
```

## Monitoring & Alerting

### Daily Health Checks
Set up automated daily health checks that alert on:
- Provider downtime or high error rates
- Data integrity issues
- Performance degradation
- Configuration inconsistencies

### Performance Monitoring
Track key metrics:
- Booking conversion rates
- Provider response times
- Form completion rates
- Error frequencies

### Alert Thresholds
- **Critical**: Provider completely down, data corruption detected
- **Warning**: Provider slow (>5s), conversion rate drops >20%
- **Info**: Configuration changes, successful migrations

## Troubleshooting

### Common Issues

#### Provider Test Failures
1. **API Key Issues**: Verify API keys are valid and have proper permissions
2. **Network Connectivity**: Check firewall settings and DNS resolution
3. **Rate Limiting**: Implement proper retry logic with exponential backoff

#### Data Integrity Issues
1. **Service Mismatches**: Run `booking:fix` to normalize service slugs
2. **Missing Configurations**: Use `missingDataCreation` fix type
3. **Duplicate Entries**: Run duplicate removal fix type

#### Migration Problems
1. **Backup Issues**: Ensure proper write permissions for backup directory
2. **Version Detection**: Manually specify current version if auto-detection fails
3. **Validation Failures**: Check data integrity before attempting migration

### Support Commands

```bash
# Check system status
npm run booking:health

# Fix common issues
npm run booking:fix --dry-run  # See what would be fixed
npm run booking:fix            # Apply fixes

# Get detailed analytics
npm run booking:stats -- --output=debug-report.json

# Validate specific components
npm run booking:validate -- --components=calendar,forms
```

## Development

### Adding New Scripts
1. Follow the established pattern in existing scripts
2. Include comprehensive error handling
3. Support dry-run mode where applicable
4. Add configuration options
5. Include CLI interface with proper argument parsing
6. Update this README with usage instructions

### Testing Scripts
Each script includes built-in validation and testing utilities. Use the dry-run modes to verify behavior before making changes.

### Contributing
1. Ensure scripts work across all environments
2. Add appropriate exit codes for CI/CD integration
3. Include comprehensive logging
4. Test with edge cases and error conditions
5. Update documentation

## Security Considerations

- API keys should be stored in environment variables or secure vaults
- Backup files may contain sensitive data - ensure proper encryption
- Log sensitive information at debug level only
- Validate all external inputs and configurations
- Use secure connections for all API calls

## Performance Notes

- Scripts are designed to be run independently or in parallel
- Large datasets may require chunked processing
- Use appropriate timeouts for external API calls
- Consider rate limiting when testing multiple providers
- Cache expensive operations where possible

---

For additional support or questions, refer to the booking system documentation or contact the development team.