// ===================================================================
// /src/search/core/buildIndex.ts
// ===================================================================
// Build-time static index generation

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { buildSearchIndex } from './indexer';

/**
 * Generate static search index for client-side search (Phase 1)
 */
export function writeStaticIndex(): void {
  try {
    console.log('[Search Build] Starting index generation...');
    
    const docs = buildSearchIndex();
    const outputDir = path.join(process.cwd(), 'public', 'search');
    const outputFile = path.join(outputDir, 'index.json');

    // Ensure directory exists
    mkdirSync(outputDir, { recursive: true });

    // Write the index
    writeFileSync(outputFile, JSON.stringify(docs, null, 2));

    console.log(`[Search Build] ✅ Generated ${docs.length} documents → ${outputFile}`);
    
    // Log stats
    const stats = docs.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('[Search Build] Index composition:', stats);

    // Calculate file size
    const stats2 = require('fs').statSync(outputFile);
    const fileSizeInBytes = stats2.size;
    const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2);
    
    console.log(`[Search Build] Index file size: ${fileSizeInMB} MB`);

    if (fileSizeInMB > '2.00') {
      console.warn('[Search Build] ⚠️  Index file is large (>2MB). Consider Phase 2 (API) implementation.');
    }

  } catch (error) {
    console.error('[Search Build] ❌ Failed to generate search index:', error);
    process.exit(1);
  }
}

/**
 * Generate metadata about the search index
 */
export function generateIndexMetadata(): void {
  try {
    const docs = buildSearchIndex();
    const metadata = {
      generatedAt: new Date().toISOString(),
      totalDocuments: docs.length,
      documentTypes: docs.reduce((acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      serviceKeys: [...new Set(docs.map(d => d.serviceKey).filter(Boolean))],
      categories: [...new Set(docs.map(d => d.category).filter(Boolean))],
      featuredCount: docs.filter(d => d.featured).length
    };

    const outputDir = path.join(process.cwd(), 'public', 'search');
    const metadataFile = path.join(outputDir, 'metadata.json');

    mkdirSync(outputDir, { recursive: true });
    writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));

    console.log('[Search Build] ✅ Generated index metadata');
  } catch (error) {
    console.error('[Search Build] ❌ Failed to generate metadata:', error);
  }
}

/**
 * CLI interface for build scripts
 */
if (require.main === module) {
  console.log('[Search Build] Building search index...');
  writeStaticIndex();
  generateIndexMetadata();
  console.log('[Search Build] Complete!');
}