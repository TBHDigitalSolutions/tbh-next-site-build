// scripts/portfolio/migrate-portfolio.ts

import { 
  migrateLegacyItems, 
  MIGRATED_PORTFOLIO_ITEMS,
  getMigrationStats 
} from '../../src/data/portfolio/items/migrated-items';
import { validateProject } from '../../src/data/portfolio/validation';
import fs from 'fs/promises';
import path from 'path';

// Command line arguments
const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');

/**
 * Migration script for legacy portfolio items
 */
async function migratePortfolioItems(): Promise<void> {
  const startTime = Date.now();
  
  if (!isJson) {
    console.log('Portfolio Migration Script v2.1');
    console.log('================================');
    console.log(`Mode: ${isDryRun ? 'Dry Run (Preview Only)' : 'Live Migration'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
  }

  const migrationResults = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'live',
    summary: {
      totalLegacyItems: 0,
      validMigratedItems: 0,
      invalidItems: 0,
      integrationStatus: 'unknown',
      categoryDistribution: {} as Record<string, number>
    },
    validationResults: [] as any[],
    integrationCheck: {
      isIntegrated: false,
      mainIndexExists: false,
      integrationRequired: false,
      integrationInstructions: [] as string[]
    },
    recommendations: [] as string[],
    executionTime: 0
  };

  try {
    // 1. Validate migrated items
    if (!isJson) {
      console.log('1. Validating Migrated Items');
      console.log('----------------------------');
    }
    
    await validateMigratedItems(migrationResults);

    // 2. Check integration status
    if (!isJson) {
      console.log('');
      console.log('2. Checking Integration Status');
      console.log('------------------------------');
    }
    
    await checkIntegrationStatus(migrationResults);

    // 3. Generate migration report
    if (!isJson) {
      console.log('');
      console.log('3. Generating Migration Report');
      console.log('------------------------------');
    }
    
    await generateMigrationReport(migrationResults);

    // 4. Provide integration guidance
    await generateIntegrationGuidance(migrationResults);

    // Calculate execution time
    migrationResults.executionTime = Date.now() - startTime;

    // Output results
    if (isJson) {
      console.log(JSON.stringify(migrationResults, null, 2));
    } else {
      displayMigrationResults(migrationResults);
    }

    // Exit with appropriate code
    const hasErrors = migrationResults.summary.invalidItems > 0;
    process.exit(hasErrors ? 1 : 0);

  } catch (error) {
    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime
    };

    if (isJson) {
      console.log(JSON.stringify(errorResult));
    } else {
      console.error('');
      console.error('FATAL ERROR: Migration system failure');
      console.error('====================================');
      console.error('Error:', errorResult.error);
    }
    
    process.exit(1);
  }
}

/**
 * Validate all migrated items
 */
async function validateMigratedItems(results: any) {
  results.summary.totalLegacyItems = MIGRATED_PORTFOLIO_ITEMS.length;
  
  MIGRATED_PORTFOLIO_ITEMS.forEach((item, index) => {
    const validation = validateProject(item);
    const validationResult = {
      index,
      id: item.id,
      isValid: validation !== null,
      category: item.category,
      issues: [] as string[]
    };

    if (validation === null) {
      results.summary.invalidItems++;
      validationResult.issues.push('Failed project schema validation');
    } else {
      results.summary.validMigratedItems++;
      
      // Additional validation checks
      if (!item.media.thumbnail) {
        validationResult.issues.push('Missing thumbnail');
      }
      
      if (item.media.type === 'video' && !item.media.poster) {
        validationResult.issues.push('Video missing poster');
      }
      
      if (item.featured && !item.priority) {
        validationResult.issues.push('Featured item without priority');
      }
    }

    results.validationResults.push(validationResult);
  });

  if (!isJson) {
    console.log(`Validated ${results.summary.validMigratedItems}/${results.summary.totalLegacyItems} migrated items`);
    
    if (results.summary.invalidItems > 0) {
      console.log(`⚠️  ${results.summary.invalidItems} items failed validation`);
    } else {
      console.log('✅ All migrated items passed validation');
    }
  }
}

/**
 * Check if migrated items are integrated into main portfolio
 */
async function checkIntegrationStatus(results: any) {
  const mainIndexPath = path.join(process.cwd(), 'src/data/portfolio/index.ts');
  
  try {
    const indexContent = await fs.readFile(mainIndexPath, 'utf8');
    results.integrationCheck.mainIndexExists = true;
    
    // Check for migration imports
    const hasMigratedImport = indexContent.includes('MIGRATED_PORTFOLIO_ITEMS');
    const hasImportStatement = indexContent.includes('from "./items/migrated-items"') || 
                              indexContent.includes('from \'./items/migrated-items\'');
    
    results.integrationCheck.isIntegrated = hasMigratedImport && hasImportStatement;
    results.integrationCheck.integrationRequired = !results.integrationCheck.isIntegrated;
    
    if (results.integrationCheck.isIntegrated) {
      if (!isJson) {
        console.log('✅ Migrated items are integrated into main portfolio');
      }
      results.summary.integrationStatus = 'integrated';
    } else {
      if (!isJson) {
        console.log('⚠️  Migrated items not yet integrated into main portfolio');
      }
      results.summary.integrationStatus = 'pending';
    }
    
  } catch (error) {
    results.integrationCheck.mainIndexExists = false;
    results.integrationCheck.integrationRequired = true;
    results.summary.integrationStatus = 'error';
    
    if (!isJson) {
      console.log('❌ Could not check main portfolio index file');
    }
  }
}

/**
 * Generate comprehensive migration report
 */
async function generateMigrationReport(results: any) {
  // Category distribution
  const categories = results.validationResults.reduce((acc: any, item: any) => {
    if (item.isValid) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {});
  
  results.summary.categoryDistribution = categories;

  // Migration statistics
  const migrationStats = getMigrationStats();
  results.migrationStats = migrationStats;

  if (!isJson) {
    console.log('Migration statistics:');
    console.log(`├─ Total Items: ${results.summary.totalLegacyItems}`);
    console.log(`├─ Valid Items: ${results.summary.validMigratedItems}`);
    console.log(`├─ Invalid Items: ${results.summary.invalidItems}`);
    console.log(`└─ Integration: ${results.summary.integrationStatus}`);
    
    if (isVerbose && Object.keys(categories).length > 0) {
      console.log('');
      console.log('Items by category:');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    }
    
    if (isVerbose && results.summary.invalidItems > 0) {
      console.log('');
      console.log('Validation issues:');
      results.validationResults
        .filter((item: any) => !item.isValid || item.issues.length > 0)
        .forEach((item: any) => {
          console.log(`  ${item.id}:`);
          item.issues.forEach((issue: string) => {
            console.log(`    - ${issue}`);
          });
        });
    }
  }
}

/**
 * Generate integration guidance and recommendations
 */
async function generateIntegrationGuidance(results: any) {
  if (results.integrationCheck.integrationRequired) {
    results.integrationCheck.integrationInstructions = [
      'Add import statement to your main index.ts:',
      'import { MIGRATED_PORTFOLIO_ITEMS } from "./items/migrated-items";',
      '',
      'Merge with your existing items:',
      'const PORTFOLIO_ITEMS = [...RAW_PORTFOLIO_ITEMS, ...MIGRATED_PORTFOLIO_ITEMS];',
      '',
      'Or replace RAW_PORTFOLIO_ITEMS if migrating completely:',
      'export const PORTFOLIO_ITEMS: Project[] = validateProjects([...RAW_PORTFOLIO_ITEMS, ...MIGRATED_PORTFOLIO_ITEMS]);'
    ];
  }

  // Generate recommendations
  if (results.summary.invalidItems > 0) {
    results.recommendations.push('Fix validation issues before integrating migrated items');
  }

  if (results.summary.validMigratedItems < results.summary.totalLegacyItems) {
    results.recommendations.push('Review and fix invalid legacy items to maximize migration success');
  }

  if (results.integrationCheck.integrationRequired) {
    results.recommendations.push('Complete integration to make migrated items available in the main portfolio');
  }

  if (Object.keys(results.summary.categoryDistribution).length > 0) {
    const categoriesWithItems = Object.keys(results.summary.categoryDistribution);
    results.recommendations.push(`Migrated items cover ${categoriesWithItems.length} categories: ${categoriesWithItems.join(', ')}`);
  }

  // Quality recommendations
  const itemsWithIssues = results.validationResults.filter((item: any) => item.issues.length > 0);
  if (itemsWithIssues.length > 0) {
    results.recommendations.push(`Address ${itemsWithIssues.length} items with minor issues for optimal quality`);
  }
}

/**
 * Display comprehensive migration results
 */
function displayMigrationResults(results: any) {
  console.log('4. Migration Summary');
  console.log('===================');
  console.log(`Migration Status: ${results.summary.integrationStatus.toUpperCase()}`);
  console.log(`Total Legacy Items: ${results.summary.totalLegacyItems}`);
  console.log(`Successfully Migrated: ${results.summary.validMigratedItems}`);
  console.log(`Failed Validation: ${results.summary.invalidItems}`);
  console.log(`Execution Time: ${results.executionTime}ms`);
  console.log('');

  if (results.integrationCheck.integrationRequired) {
    console.log('5. Integration Instructions');
    console.log('==========================');
    results.integrationCheck.integrationInstructions.forEach((instruction: string) => {
      console.log(instruction);
    });
    console.log('');
  }

  if (results.recommendations.length > 0) {
    console.log('6. Recommendations');
    console.log('==================');
    results.recommendations.forEach((rec: string, index: number) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log('');
  }

  // Final status
  if (results.summary.invalidItems === 0 && results.integrationCheck.isIntegrated) {
    console.log('✅ Migration completed successfully - all items integrated and validated');
  } else if (results.summary.invalidItems === 0) {
    console.log('⚠️  Migration validation successful - integration required');
  } else {
    console.log('❌ Migration completed with validation issues - review required');
  }

  console.log('');
  console.log('Migration script completed');
}

// Run the migration
migratePortfolioItems();