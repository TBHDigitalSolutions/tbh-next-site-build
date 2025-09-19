// scripts/portfolio/check-portfolio-health.ts

import { 
  PORTFOLIO_ITEMS, 
  getGlobalStats
} from '../../src/data/portfolio/index';
import { checkDataIntegrity } from '../../src/data/portfolio/validation';
import { getToolsStats, checkToolsHealth } from '../../src/data/portfolio/categoryTools';

/**
 * Production health check for portfolio system
 * Supports monitoring, CI/CD, and development workflows
 */
async function checkPortfolioHealth(): Promise<void> {
  const startTime = Date.now();
  console.log('Portfolio Health Check v2.1');
  console.log('============================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('');

  let overallHealth = 100;
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    // 1. Basic system availability
    console.log('1. System Availability Check');
    console.log('---------------------------');
    
    if (PORTFOLIO_ITEMS.length === 0) {
      issues.push('CRITICAL: No portfolio items found');
      overallHealth -= 50;
      console.log('❌ No portfolio items available');
    } else if (PORTFOLIO_ITEMS.length < 6) {
      warnings.push(`LOW_CONTENT: Only ${PORTFOLIO_ITEMS.length} portfolio items (recommend ≥6)`);
      overallHealth -= 10;
      console.log(`⚠️  Low content: ${PORTFOLIO_ITEMS.length} items`);
    } else {
      console.log(`✅ Portfolio items: ${PORTFOLIO_ITEMS.length}`);
    }

    // 2. Data integrity assessment
    console.log('');
    console.log('2. Data Integrity Assessment');
    console.log('----------------------------');
    
    const integrity = checkDataIntegrity(PORTFOLIO_ITEMS);
    console.log(`Quality Score: ${integrity.qualityScore}/100`);
    
    if (!integrity.valid) {
      const problemCount = integrity.duplicateIds.length + integrity.missingAssets.length;
      issues.push(`DATA_INTEGRITY: ${problemCount} critical data problems found`);
      overallHealth -= 30;
      console.log(`❌ Data integrity issues: ${problemCount} problems`);
    } else {
      console.log('✅ Data integrity: Valid');
    }

    // 3. Quality threshold checks
    if (integrity.qualityScore < 60) {
      issues.push(`QUALITY_CRITICAL: Data quality critically low (${integrity.qualityScore}/100)`);
      overallHealth -= 25;
    } else if (integrity.qualityScore < 80) {
      warnings.push(`QUALITY_LOW: Data quality below optimal (${integrity.qualityScore}/100)`);
      overallHealth -= 10;
    }

    // 4. Tools system health
    console.log('');
    console.log('3. Tools System Health');
    console.log('---------------------');
    
    const toolsHealthy = checkToolsHealth();
    if (!toolsHealthy) {
      issues.push('TOOLS_CONFIG: Tools configuration problems detected');
      overallHealth -= 15;
      console.log('❌ Tools system: Unhealthy');
    } else {
      console.log('✅ Tools system: Healthy');
    }

    // 5. Content coverage analysis
    console.log('');
    console.log('4. Content Coverage Analysis');
    console.log('----------------------------');
    
    const stats = getGlobalStats();
    const emptyCategories = Object.entries(stats.categories)
      .filter(([, count]) => count === 0)
      .map(([category]) => category);
    
    if (emptyCategories.length > 0) {
      warnings.push(`EMPTY_CATEGORIES: ${emptyCategories.length} categories without content: ${emptyCategories.join(', ')}`);
      overallHealth -= emptyCategories.length * 5;
      console.log(`⚠️  Empty categories: ${emptyCategories.length}`);
    } else {
      console.log('✅ All categories have content');
    }

    // 6. Featured content availability
    console.log('');
    console.log('5. Featured Content Check');
    console.log('-------------------------');
    
    if (stats.featured === 0) {
      issues.push('NO_FEATURED: No featured content available for hub page');
      overallHealth -= 20;
      console.log('❌ No featured content');
    } else if (stats.featured < 6) {
      warnings.push(`LOW_FEATURED: Only ${stats.featured} featured items (recommend ≥6)`);
      overallHealth -= 5;
      console.log(`⚠️  Low featured content: ${stats.featured} items`);
    } else {
      console.log(`✅ Featured content: ${stats.featured} items`);
    }

    // 7. Content balance analysis
    const featuredPercentage = (stats.featured / stats.total) * 100;
    if (featuredPercentage > 60) {
      warnings.push(`HIGH_FEATURED_RATIO: Too many featured items (${featuredPercentage.toFixed(1)}% - recommend <50%)`);
      overallHealth -= 5;
    }

    // 8. Calculate final health score
    overallHealth = Math.max(0, Math.min(100, overallHealth));
    
    console.log('');
    console.log('6. Health Score Summary');
    console.log('======================');
    console.log(`Overall Health Score: ${overallHealth}/100`);
    
    // 9. Status classification with visual indicators
    if (overallHealth >= 90) {
      console.log('🟢 STATUS: EXCELLENT - System operating at optimal capacity');
    } else if (overallHealth >= 75) {
      console.log('🟡 STATUS: GOOD - System healthy with minor optimizations available');
    } else if (overallHealth >= 50) {
      console.log('🟠 STATUS: WARNING - System functional but requires attention');
    } else {
      console.log('🔴 STATUS: CRITICAL - Immediate intervention required');
    }

    // 10. Issue reporting
    console.log('');
    console.log('7. Issues and Recommendations');
    console.log('=============================');
    
    if (issues.length > 0) {
      console.log('Critical Issues (Require Immediate Action):');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('Warnings (Recommend Action):');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
      console.log('');
    }

    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ No issues detected - system is operating optimally');
      console.log('');
    }

    // 11. System metrics summary
    logSystemMetrics(stats);

    // 12. Performance metrics
    const executionTime = Date.now() - startTime;
    console.log(`Execution Time: ${executionTime}ms`);
    console.log('');

    // 13. Final determination
    const isHealthy = overallHealth >= 70 && issues.length === 0;
    const exitMessage = `Health Check ${isHealthy ? 'PASSED' : 'FAILED'}`;
    
    if (isHealthy) {
      console.log(`✅ ${exitMessage}`);
    } else {
      console.log(`❌ ${exitMessage}`);
    }

    // Exit with appropriate code for automation
    process.exit(isHealthy ? 0 : 1);

  } catch (error) {
    console.error('');
    console.error('FATAL ERROR: Health check system failure');
    console.error('==========================================');
    console.error('Error:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('Stack:', error.stack);
    }
    
    console.error(`Execution Time: ${Date.now() - startTime}ms`);
    process.exit(1);
  }
}

/**
 * Log comprehensive system metrics
 */
function logSystemMetrics(stats: ReturnType<typeof getGlobalStats>): void {
  console.log('8. System Metrics');
  console.log('================');
  console.log(`Portfolio Items: ${stats.total}`);
  console.log(`Featured Items: ${stats.featured} (${((stats.featured / stats.total) * 100).toFixed(1)}%)`);
  console.log(`Active Categories: ${Object.keys(stats.categories).length}/6`);
  console.log(`Total Tags: ${stats.tags}`);
  console.log('');

  const toolsStats = getToolsStats();
  console.log('Tools Metrics:');
  console.log(`├─ Total Tools: ${toolsStats.totalTools}`);
  console.log(`├─ Featured Tools: ${toolsStats.featuredTools}`);
  console.log(`└─ Average per Category: ${toolsStats.averageToolsPerCategory.toFixed(1)}`);
  console.log('');

  console.log('Category Distribution:');
  Object.entries(stats.categories)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, count], index, array) => {
      const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0.0';
      const connector = index === array.length - 1 ? '└─' : '├─';
      console.log(`${connector} ${category}: ${count} (${percentage}%)`);
    });
  console.log('');
}

/**
 * Simple ping function for monitoring systems
 */
function pingPortfolioSystem(): boolean {
  try {
    const hasItems = PORTFOLIO_ITEMS.length > 0;
    const hasValidTools = getToolsStats().totalTools > 0;
    const hasValidStats = getGlobalStats().total > 0;
    const hasValidIntegrity = checkDataIntegrity(PORTFOLIO_ITEMS).qualityScore > 50;

    return hasItems && hasValidTools && hasValidStats && hasValidIntegrity;
  } catch (error) {
    console.error('Ping failed:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Command line argument handling
const args = process.argv.slice(2);

if (args.includes('--ping')) {
  // Simple ping for monitoring systems
  try {
    const isUp = pingPortfolioSystem();
    const status = isUp ? 'UP' : 'DOWN';
    const timestamp = new Date().toISOString();
    
    console.log(`${timestamp} Portfolio System: ${status}`);
    process.exit(isUp ? 0 : 1);
  } catch (error) {
    console.log(`${new Date().toISOString()} Portfolio System: DOWN (Error: ${error})`);
    process.exit(1);
  }
} else if (args.includes('--json')) {
  // JSON output for programmatic consumption
  try {
    const stats = getGlobalStats();
    const integrity = checkDataIntegrity(PORTFOLIO_ITEMS);
    const toolsStats = getToolsStats();
    
    const healthData = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      healthScore: integrity.qualityScore,
      metrics: {
        totalItems: stats.total,
        featuredItems: stats.featured,
        totalTools: toolsStats.totalTools,
        categories: stats.categories,
        qualityScore: integrity.qualityScore
      },
      issues: integrity.duplicateIds.length + integrity.missingAssets.length,
      warnings: integrity.recommendations.length
    };
    
    console.log(JSON.stringify(healthData, null, 2));
    process.exit(0);
  } catch (error) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, null, 2));
    process.exit(1);
  }
} else {
  // Full health check
  checkPortfolioHealth();
}