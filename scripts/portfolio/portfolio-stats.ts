// scripts/portfolio/portfolio-stats.ts

import { 
  PORTFOLIO_ITEMS,
  getGlobalStats,
  getCategoryStats,
  getAllTags
} from '../../src/data/portfolio/index';
import { checkDataIntegrity } from '../../src/data/portfolio/validation';
import { getToolsStats } from '../../src/data/portfolio/categoryTools';

// Command line arguments
const args = process.argv.slice(2);
const isJson = args.includes('--json');
const isVerbose = args.includes('--verbose');
const category = args.find(arg => arg.startsWith('--category='))?.split('=')[1];

/**
 * Generate comprehensive portfolio statistics
 */
async function generatePortfolioStats(): Promise<void> {
  const startTime = Date.now();
  
  if (!isJson) {
    console.log('Portfolio Statistics Report v2.1');
    console.log('=================================');
    console.log(`Generated: ${new Date().toISOString()}`);
    console.log(`Scope: ${category ? `Category "${category}"` : 'All categories'}`);
    console.log('');
  }

  try {
    const globalStats = getGlobalStats();
    const toolsStats = getToolsStats();
    const integrity = checkDataIntegrity(PORTFOLIO_ITEMS);
    const allTags = getAllTags();

    // Filter data by category if specified
    const filteredItems = category 
      ? PORTFOLIO_ITEMS.filter(item => item.category === category)
      : PORTFOLIO_ITEMS;

    if (category && filteredItems.length === 0) {
      throw new Error(`No items found for category: ${category}`);
    }

    const statsData = {
      metadata: {
        timestamp: new Date().toISOString(),
        scope: category || 'all',
        executionTime: 0,
        totalItems: filteredItems.length
      },
      overview: generateOverviewStats(globalStats, toolsStats, integrity, filteredItems),
      categories: generateCategoryStats(globalStats, filteredItems),
      mediaTypes: generateMediaTypeStats(filteredItems),
      tags: generateTagStats(filteredItems),
      clients: generateClientStats(filteredItems),
      tools: generateToolsStats(toolsStats),
      quality: generateQualityStats(integrity),
      performance: generatePerformanceStats(filteredItems),
      recommendations: integrity.recommendations
    };

    statsData.metadata.executionTime = Date.now() - startTime;

    if (isJson) {
      console.log(JSON.stringify(statsData, null, 2));
    } else {
      displayTextReport(statsData);
    }

    process.exit(0);

  } catch (error) {
    const errorData = {
      error: true,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      executionTime: Date.now() - startTime
    };

    if (isJson) {
      console.log(JSON.stringify(errorData, null, 2));
    } else {
      console.error('Error generating statistics:', errorData.message);
    }

    process.exit(1);
  }
}

/**
 * Generate overview statistics
 */
function generateOverviewStats(globalStats: any, toolsStats: any, integrity: any, items: any[]) {
  return {
    totalItems: items.length,
    featuredItems: items.filter(item => item.featured).length,
    featuredPercentage: items.length > 0 ? ((items.filter(item => item.featured).length / items.length) * 100).toFixed(1) : '0.0',
    qualityScore: integrity.qualityScore,
    totalCategories: Object.keys(globalStats.categories).length,
    activeCategories: Object.values(globalStats.categories).filter((count: number) => count > 0).length,
    totalTags: globalStats.tags,
    totalTools: toolsStats.totalTools,
    uniqueClients: new Set(items.filter(item => item.client).map(item => item.client)).size
  };
}

/**
 * Generate category-specific statistics
 */
function generateCategoryStats(globalStats: any, items: any[]) {
  const categoryData = Object.entries(globalStats.categories)
    .map(([category, count]) => {
      const categoryItems = items.filter(item => item.category === category);
      const featured = categoryItems.filter(item => item.featured).length;
      const percentage = items.length > 0 ? ((count as number / items.length) * 100).toFixed(1) : '0.0';
      
      return {
        category,
        total: count,
        featured,
        percentage: parseFloat(percentage),
        hasContent: count > 0
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    distribution: categoryData,
    emptyCategories: categoryData.filter(cat => !cat.hasContent).map(cat => cat.category),
    mostPopular: categoryData[0]?.category || null,
    leastPopular: categoryData[categoryData.length - 1]?.category || null
  };
}

/**
 * Generate media type statistics
 */
function generateMediaTypeStats(items: any[]) {
  const mediaTypes = items.reduce((acc, item) => {
    acc[item.media.type] = (acc[item.media.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const distribution = Object.entries(mediaTypes)
    .map(([type, count]) => ({
      type,
      count,
      percentage: items.length > 0 ? ((count / items.length) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count);

  return {
    distribution,
    mostCommon: distribution[0]?.type || null,
    totalTypes: distribution.length
  };
}

/**
 * Generate tag statistics
 */
function generateTagStats(items: any[]) {
  const tagCounts = items.reduce((acc, item) => {
    item.tags?.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  return {
    totalUniqueTags: Object.keys(tagCounts).length,
    averageTagsPerItem: items.length > 0 ? 
      (items.reduce((sum, item) => sum + (item.tags?.length || 0), 0) / items.length).toFixed(1) : '0.0',
    topTags,
    itemsWithoutTags: items.filter(item => !item.tags || item.tags.length === 0).length
  };
}

/**
 * Generate client statistics
 */
function generateClientStats(items: any[]) {
  const clientCounts = items.reduce((acc, item) => {
    if (item.client) {
      acc[item.client] = (acc[item.client] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topClients = Object.entries(clientCounts)
    .map(([client, count]) => ({ client, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalClients: Object.keys(clientCounts).length,
    itemsWithClients: items.filter(item => item.client).length,
    itemsWithoutClients: items.filter(item => !item.client).length,
    topClients,
    averageItemsPerClient: Object.keys(clientCounts).length > 0 ? 
      (Object.values(clientCounts).reduce((sum: number, count) => sum + count, 0) / Object.keys(clientCounts).length).toFixed(1) : '0.0'
  };
}

/**
 * Generate tools statistics
 */
function generateToolsStats(toolsStats: any) {
  return {
    totalTools: toolsStats.totalTools,
    featuredTools: toolsStats.featuredTools,
    averagePerCategory: toolsStats.averageToolsPerCategory,
    categoryDistribution: toolsStats.categoryStats,
    badgeDistribution: toolsStats.toolsByBadge || {}
  };
}

/**
 * Generate quality statistics
 */
function generateQualityStats(integrity: any) {
  return {
    overallScore: integrity.qualityScore,
    isValid: integrity.valid,
    issues: {
      duplicateIds: integrity.duplicateIds.length,
      missingAssets: integrity.missingAssets.length,
      orphanedFeatured: integrity.orphanedFeatured.length
    },
    grade: getQualityGrade(integrity.qualityScore)
  };
}

/**
 * Generate performance metrics
 */
function generatePerformanceStats(items: any[]) {
  return {
    itemsWithMetrics: items.filter(item => item.metrics && item.metrics.length > 0).length,
    itemsWithExternalLinks: items.filter(item => item.href).length,
    itemsWithDescriptions: items.filter(item => item.description).length,
    averageDescriptionLength: items
      .filter(item => item.description)
      .reduce((sum, item) => sum + item.description.length, 0) / 
      Math.max(1, items.filter(item => item.description).length)
  };
}

/**
 * Get quality grade based on score
 */
function getQualityGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Display formatted text report
 */
function displayTextReport(data: any) {
  console.log('📊 OVERVIEW');
  console.log('===========');
  console.log(`Total Portfolio Items: ${data.overview.totalItems}`);
  console.log(`Featured Items: ${data.overview.featuredItems} (${data.overview.featuredPercentage}%)`);
  console.log(`Quality Score: ${data.overview.qualityScore}/100 (Grade: ${data.quality.grade})`);
  console.log(`Active Categories: ${data.overview.activeCategories}/${data.overview.totalCategories}`);
  console.log(`Unique Tags: ${data.overview.totalTags}`);
  console.log(`Unique Clients: ${data.overview.uniqueClients}`);
  console.log(`Total Tools: ${data.overview.totalTools}`);
  console.log('');

  console.log('📁 CATEGORY BREAKDOWN');
  console.log('=====================');
  data.categories.distribution.forEach((cat: any) => {
    const status = cat.hasContent ? '✅' : '❌';
    console.log(`${status} ${cat.category}: ${cat.total} items (${cat.percentage}%) | Featured: ${cat.featured}`);
  });
  
  if (data.categories.emptyCategories.length > 0) {
    console.log(`\nEmpty Categories: ${data.categories.emptyCategories.join(', ')}`);
  }
  console.log('');

  console.log('🎬 MEDIA TYPES');
  console.log('==============');
  data.mediaTypes.distribution.forEach((media: any) => {
    console.log(`${media.type}: ${media.count} (${media.percentage}%)`);
  });
  console.log('');

  console.log('🏷️  TOP TAGS');
  console.log('=============');
  data.tags.topTags.slice(0, 10).forEach((tag: any, index: number) => {
    console.log(`${index + 1}. ${tag.tag}: ${tag.count} items`);
  });
  console.log(`\nTag Statistics:`);
  console.log(`├─ Total Unique Tags: ${data.tags.totalUniqueTags}`);
  console.log(`├─ Average Tags per Item: ${data.tags.averageTagsPerItem}`);
  console.log(`└─ Items Without Tags: ${data.tags.itemsWithoutTags}`);
  console.log('');

  console.log('👥 CLIENT ANALYSIS');
  console.log('==================');
  console.log(`Total Clients: ${data.clients.totalClients}`);
  console.log(`Items with Clients: ${data.clients.itemsWithClients}`);
  console.log(`Items without Clients: ${data.clients.itemsWithoutClients}`);
  console.log(`Average Items per Client: ${data.clients.averageItemsPerClient}`);
  
  if (isVerbose && data.clients.topClients.length > 0) {
    console.log('\nTop Clients:');
    data.clients.topClients.forEach((client: any, index: number) => {
      console.log(`  ${index + 1}. ${client.client}: ${client.count} items`);
    });
  }
  console.log('');

  console.log('🛠️  TOOLS OVERVIEW');
  console.log('==================');
  console.log(`Total Tools: ${data.tools.totalTools}`);
  console.log(`Featured Tools: ${data.tools.featuredTools}`);
  console.log(`Average per Category: ${data.tools.averagePerCategory.toFixed(1)}`);
  
  if (isVerbose) {
    console.log('\nTools by Category:');
    Object.entries(data.tools.categoryDistribution).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });
    
    console.log('\nTools by Badge:');
    Object.entries(data.tools.badgeDistribution).forEach(([badge, count]) => {
      console.log(`  ${badge}: ${count}`);
    });
  }
  console.log('');

  console.log('⚡ QUALITY METRICS');
  console.log('==================');
  console.log(`Overall Quality: ${data.quality.overallScore}/100 (${data.quality.grade})`);
  console.log(`Data Validity: ${data.quality.isValid ? 'Valid' : 'Invalid'}`);
  console.log(`Duplicate IDs: ${data.quality.issues.duplicateIds}`);
  console.log(`Missing Assets: ${data.quality.issues.missingAssets}`);
  console.log(`Orphaned Featured: ${data.quality.issues.orphanedFeatured}`);
  console.log('');

  console.log('📈 CONTENT METRICS');
  console.log('==================');
  console.log(`Items with Metrics: ${data.performance.itemsWithMetrics}`);
  console.log(`Items with External Links: ${data.performance.itemsWithExternalLinks}`);
  console.log(`Items with Descriptions: ${data.performance.itemsWithDescriptions}`);
  console.log(`Average Description Length: ${data.performance.averageDescriptionLength.toFixed(0)} chars`);
  console.log('');

  if (data.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS');
    console.log('==================');
    data.recommendations.forEach((rec: string, index: number) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.log('');
  }

  console.log('📋 REPORT SUMMARY');
  console.log('=================');
  console.log(`Generated: ${data.metadata.timestamp}`);
  console.log(`Execution Time: ${data.metadata.executionTime}ms`);
  console.log(`Scope: ${data.metadata.scope}`);
  console.log(`Total Items Analyzed: ${data.metadata.totalItems}`);
  console.log('');
  console.log('Report completed successfully ✅');
}

// Run the statistics generation
generatePortfolioStats();