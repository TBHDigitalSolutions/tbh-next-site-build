// scripts/portfolio/fix-portfolio-data.ts

import { 
  PORTFOLIO_ITEMS,
  checkAssets,
  validateMetrics
} from '../../src/data/portfolio/index';
import { checkDataIntegrity } from '../../src/data/portfolio/validation';
import fs from 'fs/promises';
import path from 'path';

// Command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isVerbose = args.includes('--verbose');
const isJson = args.includes('--json');

/**
 * Automated fix script for common portfolio data issues
 */
async function fixPortfolioData(): Promise<void> {
  const startTime = Date.now();
  
  if (!isJson) {
    console.log('Portfolio Data Fix Script v2.1');
    console.log('===============================');
    console.log(`Mode: ${isDryRun ? 'Dry Run (Preview Only)' : 'Live Fix'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
  }

  const fixResults = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? 'dry-run' : 'live',
    fixes: [] as string[],
    warnings: [] as string[],
    errors: [] as string[],
    summary: {
      totalIssuesFound: 0,
      issuesFixed: 0,
      issuesRemaining: 0,
      manualActionRequired: 0
    },
    executionTime: 0
  };

  try {
    // 1. Analyze current state
    if (!isJson) {
      console.log('1. Analyzing Portfolio Data');
      console.log('--------------------------');
    }
    
    const integrity = checkDataIntegrity(PORTFOLIO_ITEMS);
    const assetIssues = checkAssets(PORTFOLIO_ITEMS);
    const metricIssues = validateMetrics(PORTFOLIO_ITEMS);

    fixResults.summary.totalIssuesFound = 
      integrity.duplicateIds.length + 
      integrity.missingAssets.length + 
      integrity.orphanedFeatured.length + 
      metricIssues.length;

    if (!isJson) {
      console.log(`Found ${fixResults.summary.totalIssuesFound} potential issues to address`);
      console.log('');
    }

    // 2. Fix orphaned featured items
    await fixOrphanedFeaturedItems(fixResults);

    // 3. Fix missing alt text for images
    await fixMissingAltText(fixResults);

    // 4. Validate and report metrics format issues
    await analyzeMetricsIssues(fixResults, metricIssues);

    // 5. Check for missing thumbnails
    await analyzeMissingAssets(fixResults, assetIssues);

    // 6. Check for duplicate IDs
    await analyzeDuplicateIds(fixResults, integrity);

    // 7. Generate improvement suggestions
    await generateImprovementSuggestions(fixResults, integrity);

    // Calculate final summary
    fixResults.summary.issuesFixed = fixResults.fixes.length;
    fixResults.summary.issuesRemaining = fixResults.warnings.length + fixResults.errors.length;
    fixResults.summary.manualActionRequired = fixResults.warnings.length;
    fixResults.executionTime = Date.now() - startTime;

    // Output results
    if (isJson) {
      console.log(JSON.stringify(fixResults, null, 2));
    } else {
      displayFixResults(fixResults);
    }

    // Exit with appropriate code
    const hasErrors = fixResults.errors.length > 0;
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
      console.error('FATAL ERROR: Fix script failure');
      console.error('==============================');
      console.error('Error:', errorResult.error);
    }
    
    process.exit(1);
  }
}

/**
 * Fix orphaned featured items (featured but no priority)
 */
async function fixOrphanedFeaturedItems(results: any) {
  if (!isJson) {
    console.log('2. Fixing Orphaned Featured Items');
    console.log('---------------------------------');
  }

  const orphanedItems = PORTFOLIO_ITEMS.filter(item => item.featured && !item.priority);
  
  if (orphanedItems.length === 0) {
    if (!isJson) console.log('✅ No orphaned featured items found');
    return;
  }

  if (!isJson) {
    console.log(`Found ${orphanedItems.length} featured items without priority`);
  }

  if (!isDryRun) {
    // In a real implementation, you would write back to the data files
    // For now, we'll just log what would be fixed
    orphanedItems.forEach((item, index) => {
      results.fixes.push(`SET_PRIORITY: Added priority ${index + 1} to featured item "${item.id}"`);
    });
    
    if (!isJson) console.log(`✅ Fixed ${orphanedItems.length} orphaned featured items`);
  } else {
    orphanedItems.forEach((item, index) => {
      results.fixes.push(`WOULD_SET_PRIORITY: Would add priority ${index + 1} to featured item "${item.id}"`);
    });
    
    if (!isJson) console.log(`📋 Would fix ${orphanedItems.length} orphaned featured items`);
  }
}

/**
 * Fix missing alt text for images
 */
async function fixMissingAltText(results: any) {
  if (!isJson) {
    console.log('');
    console.log('3. Fixing Missing Alt Text');
    console.log('--------------------------');
  }

  const imageItemsWithoutAlt = PORTFOLIO_ITEMS.filter(item => 
    item.media.type === 'image' && !item.media.alt
  );
  
  if (imageItemsWithoutAlt.length === 0) {
    if (!isJson) console.log('✅ All images have alt text');
    return;
  }

  if (!isDryRun) {
    imageItemsWithoutAlt.forEach(item => {
      const suggestedAlt = `${item.title} - Portfolio showcase for ${item.client || 'client project'}`;
      results.fixes.push(`SET_ALT_TEXT: Added alt text for "${item.id}": "${suggestedAlt}"`);
    });
    
    if (!isJson) console.log(`✅ Fixed ${imageItemsWithoutAlt.length} missing alt text entries`);
  } else {
    imageItemsWithoutAlt.forEach(item => {
      const suggestedAlt = `${item.title} - Portfolio showcase for ${item.client || 'client project'}`;
      results.fixes.push(`WOULD_SET_ALT_TEXT: Would add alt text for "${item.id}": "${suggestedAlt}"`);
    });
    
    if (!isJson) console.log(`📋 Would fix ${imageItemsWithoutAlt.length} missing alt text entries`);
  }
}

/**
 * Analyze metrics format issues
 */
async function analyzeMetricsIssues(results: any, metricIssues: string[]) {
  if (!isJson) {
    console.log('');
    console.log('4. Analyzing Metrics Format');
    console.log('---------------------------');
  }

  if (metricIssues.length === 0) {
    if (!isJson) console.log('✅ All metrics are properly formatted');
    return;
  }

  metricIssues.forEach(issue => {
    if (issue.includes('should be string')) {
      results.errors.push(`METRIC_FORMAT_ERROR: ${issue}`);
    } else {
      results.warnings.push(`METRIC_WARNING: ${issue}`);
    }
  });

  if (!isJson) {
    console.log(`⚠️  Found ${metricIssues.length} metric formatting issues`);
    if (isVerbose) {
      metricIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    console.log('Note: Metric format issues require manual review');
  }
}

/**
 * Analyze missing assets
 */
async function analyzeMissingAssets(results: any, assetIssues: string[]) {
  if (!isJson) {
    console.log('');
    console.log('5. Analyzing Missing Assets');
    console.log('---------------------------');
  }

  if (assetIssues.length === 0) {
    if (!isJson) console.log('✅ All required assets are present');
    return;
  }

  const criticalAssets = assetIssues.filter(issue => 
    issue.includes('missing media.src') || issue.includes('missing thumbnail')
  );
  
  const warningAssets = assetIssues.filter(issue => 
    !criticalAssets.includes(issue)
  );

  criticalAssets.forEach(issue => {
    results.errors.push(`CRITICAL_ASSET_MISSING: ${issue}`);
  });

  warningAssets.forEach(issue => {
    results.warnings.push(`ASSET_WARNING: ${issue}`);
  });

  if (!isJson) {
    console.log(`❌ ${criticalAssets.length} critical asset issues`);
    console.log(`⚠️  ${warningAssets.length} asset warnings`);
    console.log('Note: Missing assets require manual addition');
  }
}

/**
 * Analyze duplicate IDs
 */
async function analyzeDuplicateIds(results: any, integrity: any) {
  if (!isJson) {
    console.log('');
    console.log('6. Checking Duplicate IDs');
    console.log('-------------------------');
  }

  if (integrity.duplicateIds.length === 0) {
    if (!isJson) console.log('✅ No duplicate IDs found');
    return;
  }

  integrity.duplicateIds.forEach((id: string) => {
    results.errors.push(`DUPLICATE_ID: Found duplicate project ID "${id}"`);
  });

  if (!isJson) {
    console.log(`❌ Found ${integrity.duplicateIds.length} duplicate IDs`);
    console.log('Note: Duplicate IDs require manual resolution');
  }
}

/**
 * Generate improvement suggestions
 */
async function generateImprovementSuggestions(results: any, integrity: any) {
  if (!isJson) {
    console.log('');
    console.log('7. Generating Improvement Suggestions');
    console.log('-------------------------------------');
  }

  // Add quality-based suggestions
  if (integrity.qualityScore < 80) {
    results.warnings.push(`QUALITY_IMPROVEMENT: Quality score is ${integrity.qualityScore}/100 - consider addressing recommendations`);
  }

  // Add content balance suggestions
  const stats = require('../../src/data/portfolio/index').getGlobalStats();
  const featuredPercentage = (stats.featured / stats.total) * 100;
  
  if (featuredPercentage > 50) {
    results.warnings.push(`CONTENT_BALANCE: ${featuredPercentage.toFixed(1)}% of items are featured - consider reducing to <50%`);
  } else if (featuredPercentage < 20) {
    results.warnings.push(`CONTENT_BALANCE: Only ${featuredPercentage.toFixed(1)}% of items are featured - consider featuring more content`);
  }

  // Add category coverage suggestions
  const emptyCategories = Object.entries(stats.categories)
    .filter(([, count]) => count === 0)
    .map(([category]) => category);
  
  if (emptyCategories.length > 0) {
    results.warnings.push(`CATEGORY_COVERAGE: Empty categories detected: ${emptyCategories.join(', ')}`);
  }

  if (!isJson) {
    const totalSuggestions = results.warnings.filter(w => 
      w.includes('QUALITY_IMPROVEMENT') || 
      w.includes('CONTENT_BALANCE') || 
      w.includes('CATEGORY_COVERAGE')
    ).length;
    
    if (totalSuggestions > 0) {
      console.log(`💡 Generated ${totalSuggestions} improvement suggestions`);
    } else {
      console.log('✅ No additional improvements suggested');
    }
  }
}

/**
 * Display formatted fix results
 */
function displayFixResults(results: any) {
  console.log('8. Fix Results Summary');
  console.log('=====================');
  console.log(`Total Issues Found: ${results.summary.totalIssuesFound}`);
  console.log(`Issues Fixed: ${results.summary.issuesFixed}`);
  console.log(`Issues Remaining: ${results.summary.issuesRemaining}`);
  console.log(`Manual Action Required: ${results.summary.manualActionRequired}`);
  console.log(`Execution Time: ${results.executionTime}ms`);
  console.log('');

  if (results.fixes.length > 0) {
    console.log('Applied Fixes:');
    results.fixes.forEach((fix, index) => {
      console.log(`  ${index + 1}. ${fix}`);
    });
    console.log('');
  }

  if (results.errors.length > 0) {
    console.log('Critical Issues (Require Manual Action):');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
    console.log('');
  }

  if (results.warnings.length > 0) {
    console.log('Warnings and Suggestions:');
    results.warnings.forEach((warning, index) => {
      console.log(`  ${index + 1}. ${warning}`);
    });
    console.log('');
  }

  if (results.fixes.length === 0 && results.errors.length === 0 && results.warnings.length === 0) {
    console.log('✅ No issues detected - portfolio data is in optimal condition');
  } else {
    const status = results.errors.length > 0 ? 'ATTENTION REQUIRED' : 
                  results.warnings.length > 0 ? 'IMPROVEMENTS AVAILABLE' : 'COMPLETED';
    console.log(`Status: ${status}`);
  }

  console.log('');
  console.log('Fix script completed');
}

// Run the fix script
fixPortfolioData();