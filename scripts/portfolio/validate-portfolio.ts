// scripts/portfolio/validate-portfolio.ts

import { 
  PORTFOLIO_ITEMS, 
  getGlobalStats, 
  validateCategory,
  checkAssets,
  validateMetrics,
  CANONICAL_CATEGORIES
} from '../../src/data/portfolio/index';
import { 
  validatePortfolioData, 
  quickValidationCheck, 
  checkDataIntegrity 
} from '../../src/data/portfolio/validation';
import { 
  checkToolsHealth, 
  logToolsValidation 
} from '../../src/data/portfolio/categoryTools';

// Parse command line arguments
const args = process.argv.slice(2);
const isQuick = args.includes('--quick');
const shouldFix = args.includes('--fix');
const isVerbose = args.includes('--verbose');
const isJson = args.includes('--json');

/**
 * Main validation function
 */
async function validatePortfolio(): Promise<void> {
  const startTime = Date.now();
  
  if (!isJson) {
    console.log('Portfolio Validation Script v2.1');
    console.log('=================================');
    console.log(`Mode: ${isQuick ? 'Quick' : 'Full'} validation`);
    console.log(`Auto-fix: ${shouldFix ? 'Enabled' : 'Disabled'}`);
    console.log(`Verbose: ${isVerbose ? 'Enabled' : 'Disabled'}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
  }

  try {
    if (isQuick) {
      // Quick validation for CI/CD
      const isValid = quickValidationCheck(PORTFOLIO_ITEMS);
      
      if (isJson) {
        console.log(JSON.stringify({
          success: isValid,
          timestamp: new Date().toISOString(),
          mode: 'quick',
          executionTime: Date.now() - startTime
        }));
      } else {
        console.log(isValid ? '✅ Quick validation passed' : '❌ Quick validation failed');
      }
      
      process.exit(isValid ? 0 : 1);
    }

    // Initialize validation results
    const validationResults = {
      timestamp: new Date().toISOString(),
      mode: 'full',
      steps: [] as any[],
      summary: {
        totalItems: PORTFOLIO_ITEMS.length,
        errors: 0,
        warnings: 0,
        qualityScore: 0,
        success: false
      },
      executionTime: 0
    };

    // Full validation report
    if (!isJson) {
      console.log('Running comprehensive portfolio validation...');
      console.log('');
    }

    // 1. Basic data validation
    const step1 = await validateBasicData();
    validationResults.steps.push(step1);
    if (!isJson) logValidationStep('1. Basic Data Validation', step1);

    // 2. Category validation
    const step2 = await validateCategories();
    validationResults.steps.push(step2);
    if (!isJson) logValidationStep('2. Category Validation', step2);

    // 3. Asset validation
    const step3 = await validateAssets();
    validationResults.steps.push(step3);
    if (!isJson) logValidationStep('3. Asset Validation', step3);

    // 4. Metrics validation
    const step4 = await validateMetricsData();
    validationResults.steps.push(step4);
    if (!isJson) logValidationStep('4. Metrics Validation', step4);

    // 5. Tools validation
    const step5 = await validateTools();
    validationResults.steps.push(step5);
    if (!isJson) logValidationStep('5. Tools Validation', step5);

    // 6. Data integrity check
    const step6 = await validateDataIntegrity();
    validationResults.steps.push(step6);
    if (!isJson) logValidationStep('6. Data Integrity Check', step6);

    // 7. Portfolio statistics
    const step7 = await generateStatistics();
    validationResults.steps.push(step7);
    if (!isJson) logValidationStep('7. Portfolio Statistics', step7);

    // 8. Generate recommendations
    const step8 = await generateRecommendations();
    validationResults.steps.push(step8);
    if (!isJson) logValidationStep('8. Recommendations', step8);

    // Calculate summary
    validationResults.summary.errors = validationResults.steps.reduce((sum, step) => sum + step.errors, 0);
    validationResults.summary.warnings = validationResults.steps.reduce((sum, step) => sum + step.warnings, 0);
    validationResults.summary.qualityScore = checkDataIntegrity(PORTFOLIO_ITEMS).qualityScore;
    validationResults.summary.success = validationResults.summary.errors === 0 && validationResults.summary.qualityScore >= 70;
    validationResults.executionTime = Date.now() - startTime;

    // Output results
    if (isJson) {
      console.log(JSON.stringify(validationResults, null, 2));
    } else {
      logFinalResults(validationResults);
    }

    // Exit with appropriate code
    process.exit(validationResults.summary.success ? 0 : 1);

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
      console.error('FATAL ERROR: Validation system failure');
      console.error('=====================================');
      console.error('Error:', errorResult.error);
      if (error instanceof Error && error.stack) {
        console.error('Stack:', error.stack);
      }
    }
    
    process.exit(1);
  }
}

/**
 * Validate basic data availability and structure
 */
async function validateBasicData() {
  const step = {
    name: 'Basic Data',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  if (PORTFOLIO_ITEMS.length === 0) {
    step.success = false;
    step.errors++;
    step.details.push('No portfolio items found');
  } else if (PORTFOLIO_ITEMS.length < 6) {
    step.warnings++;
    step.details.push(`Only ${PORTFOLIO_ITEMS.length} portfolio items (recommend ≥6)`);
  } else {
    step.details.push(`Found ${PORTFOLIO_ITEMS.length} portfolio items`);
  }

  return step;
}

/**
 * Validate category assignments
 */
async function validateCategories() {
  const step = {
    name: 'Categories',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  const invalidCategories: string[] = [];
  
  PORTFOLIO_ITEMS.forEach(item => {
    if (!CANONICAL_CATEGORIES.includes(item.category as any)) {
      invalidCategories.push(`${item.id}: invalid category "${item.category}"`);
      step.errors++;
      step.success = false;
    }
  });

  if (invalidCategories.length > 0) {
    step.details.push(...invalidCategories);
  } else {
    step.details.push('All categories are valid');
    
    // Check category distribution
    const stats = getGlobalStats();
    const emptyCategories = Object.entries(stats.categories)
      .filter(([, count]) => count === 0)
      .map(([category]) => category);
    
    if (emptyCategories.length > 0) {
      step.warnings++;
      step.details.push(`Empty categories: ${emptyCategories.join(', ')}`);
    }
  }

  return step;
}

/**
 * Validate assets (thumbnails, posters, alt text)
 */
async function validateAssets() {
  const step = {
    name: 'Assets',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  const assetIssues = checkAssets(PORTFOLIO_ITEMS);
  
  assetIssues.forEach(issue => {
    if (issue.includes('missing media.src') || issue.includes('missing thumbnail')) {
      step.errors++;
      step.success = false;
    } else {
      step.warnings++;
    }
  });

  if (assetIssues.length === 0) {
    step.details.push('All assets are properly configured');
  } else {
    if (isVerbose) {
      step.details.push(...assetIssues);
    } else {
      step.details.push(`${assetIssues.length} asset issues found (use --verbose for details)`);
    }
  }

  return step;
}

/**
 * Validate metrics format and content
 */
async function validateMetricsData() {
  const step = {
    name: 'Metrics',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  const metricIssues = validateMetrics(PORTFOLIO_ITEMS);
  
  metricIssues.forEach(issue => {
    if (issue.includes('should be string')) {
      step.errors++;
      step.success = false;
    } else {
      step.warnings++;
    }
  });

  if (metricIssues.length === 0) {
    step.details.push('All metrics are properly formatted');
  } else {
    if (isVerbose) {
      step.details.push(...metricIssues);
    } else {
      step.details.push(`${metricIssues.length} metric issues found`);
    }
  }

  return step;
}

/**
 * Validate tools configuration
 */
async function validateTools() {
  const step = {
    name: 'Tools',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  const toolsHealthy = checkToolsHealth();
  
  if (!toolsHealthy) {
    step.success = false;
    step.errors++;
    step.details.push('Tools configuration problems detected');
    
    if (isVerbose) {
      // Add detailed tools validation if verbose
      try {
        logToolsValidation();
      } catch (error) {
        step.details.push(`Tools validation error: ${error}`);
      }
    }
  } else {
    step.details.push('Tools configuration is valid');
  }

  return step;
}

/**
 * Validate overall data integrity
 */
async function validateDataIntegrity() {
  const step = {
    name: 'Data Integrity',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  const integrity = checkDataIntegrity(PORTFOLIO_ITEMS);
  
  step.details.push(`Quality Score: ${integrity.qualityScore}/100`);
  
  if (integrity.duplicateIds.length > 0) {
    step.errors += integrity.duplicateIds.length;
    step.success = false;
    step.details.push(`Duplicate IDs: ${integrity.duplicateIds.join(', ')}`);
  }

  if (integrity.missingAssets.length > 0) {
    step.warnings += integrity.missingAssets.length;
    step.details.push(`Missing assets: ${integrity.missingAssets.length}`);
  }

  if (integrity.orphanedFeatured.length > 0) {
    step.warnings += integrity.orphanedFeatured.length;
    step.details.push(`Orphaned featured items: ${integrity.orphanedFeatured.length}`);
  }

  if (integrity.qualityScore < 60) {
    step.errors++;
    step.success = false;
  } else if (integrity.qualityScore < 80) {
    step.warnings++;
  }

  return step;
}

/**
 * Generate portfolio statistics
 */
async function generateStatistics() {
  const step = {
    name: 'Statistics',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  try {
    const stats = getGlobalStats();
    
    step.details.push(`Total items: ${stats.total}`);
    step.details.push(`Featured items: ${stats.featured} (${((stats.featured / stats.total) * 100).toFixed(1)}%)`);
    step.details.push(`Total tags: ${stats.tags}`);
    
    if (isVerbose) {
      step.details.push('Category distribution:');
      Object.entries(stats.categories).forEach(([category, count]) => {
        const percentage = ((count / stats.total) * 100).toFixed(1);
        step.details.push(`  ${category}: ${count} (${percentage}%)`);
      });
    }
  } catch (error) {
    step.success = false;
    step.errors++;
    step.details.push(`Statistics generation failed: ${error}`);
  }

  return step;
}

/**
 * Generate actionable recommendations
 */
async function generateRecommendations() {
  const step = {
    name: 'Recommendations',
    success: true,
    errors: 0,
    warnings: 0,
    details: [] as string[]
  };

  try {
    const integrity = checkDataIntegrity(PORTFOLIO_ITEMS);
    
    if (integrity.recommendations.length === 0) {
      step.details.push('No recommendations - portfolio is optimally configured');
    } else {
      step.details.push(`${integrity.recommendations.length} recommendations available:`);
      if (isVerbose) {
        integrity.recommendations.forEach((rec, index) => {
          step.details.push(`  ${index + 1}. ${rec}`);
        });
      }
    }
  } catch (error) {
    step.errors++;
    step.success = false;
    step.details.push(`Recommendations generation failed: ${error}`);
  }

  return step;
}

/**
 * Log validation step results
 */
function logValidationStep(title: string, step: any) {
  console.log(title);
  console.log('-'.repeat(title.length));
  
  if (step.success && step.errors === 0) {
    console.log('✅ Passed');
  } else if (step.errors > 0) {
    console.log(`❌ Failed (${step.errors} errors, ${step.warnings} warnings)`);
  } else {
    console.log(`⚠️  Warnings (${step.warnings} warnings)`);
  }
  
  if (isVerbose && step.details.length > 0) {
    step.details.forEach((detail: string) => {
      console.log(`  ${detail}`);
    });
  }
  
  console.log('');
}

/**
 * Log final validation results
 */
function logFinalResults(results: any) {
  console.log('9. Final Validation Results');
  console.log('==========================');
  console.log(`Quality Score: ${results.summary.qualityScore}/100`);
  console.log(`Total Errors: ${results.summary.errors}`);
  console.log(`Total Warnings: ${results.summary.warnings}`);
  console.log(`Execution Time: ${results.executionTime}ms`);
  console.log('');
  
  if (results.summary.success) {
    console.log('✅ Portfolio validation completed successfully');
    console.log('All critical requirements met - portfolio is production ready');
  } else if (results.summary.qualityScore >= 60) {
    console.log('⚠️  Portfolio validation completed with issues');
    console.log('Some improvements recommended before production deployment');
  } else {
    console.log('❌ Portfolio validation failed');
    console.log('Critical issues must be resolved before deployment');
  }
  
  if (shouldFix && results.summary.errors > 0) {
    console.log('');
    console.log('Auto-fix suggestions:');
    console.log('Run: npm run fix:portfolio-data');
  }
}

// Run validation
validatePortfolio();