// scripts/packages/build-package-data.ts

/** #!/usr/bin/env node
 * MDX → JSON builder (incremental, strict authoring guardrails)
 * JSON Schema Generator - Auto-generate from Zod SSOT
 * =============================================================================
 * 
 * PURPOSE
 * -----------------------------------------------------------------------------
 * Generates package-data.schema.json from the Zod PackageSchema SSOT.
 * This ensures the JSON Schema never drifts from runtime validation.
 * 
 * SINGLE SOURCE OF TRUTH WORKFLOW
 * -----------------------------------------------------------------------------
 * 1. Authors edit: src/packages/lib/package-schema.ts (Zod)
 * 2. Build runs: scripts/packages/build-json-schema.ts (this file)
 * 3. Generates: src/data/packages/__generated__/schema/package-data.schema.json
 * 4. Consumers: VS Code, JSON validators, documentation tools
 * 
 * KEY FEATURES
 * -----------------------------------------------------------------------------
 * - Automatic generation from Zod (no manual JSON Schema editing)
 * - Version tracking and timestamping
 * - Structural validation of output
 * - Comprehensive error handling
 * - Performance metrics
 * - CI-friendly output
 * 
 * INTEGRATION POINTS
 * -----------------------------------------------------------------------------
 * - VS Code: Provides autocomplete for package JSON files
 * - CI Pipeline: Part of data:all build step
 * - Documentation: Can be used by schema documentation generators
 * - External Tools: Standard JSON Schema format for validators
 * 
 * USAGE
 * -----------------------------------------------------------------------------
 * ```bash
 * npm run schema:build              # Generate schema
 * npm run schema:build -- --verbose # Detailed output
 * npm run data:all                  # Full pipeline (includes schema)
 * ```
 * 
 * VALIDATION
 * -----------------------------------------------------------------------------
 * After generation, the script validates:
 * - Required metadata fields present
 * - Properties object exists and is populated
 * - Schema structure is valid
 * - File successfully written
 * 
 * ERROR HANDLING
 * -----------------------------------------------------------------------------
 * - Import failures: Clear message about missing dependencies
 * - Generation failures: Zod-to-JSON-Schema error details
 * - Write failures: File system error reporting
 * - All failures exit with code 1 (CI-blocking)
 * 
 * DEPENDENCIES
 * -----------------------------------------------------------------------------
 * - zod-to-json-schema: Converts Zod schemas to JSON Schema
 * - fs-extra: Enhanced file system utilities
 * - PackageSchema: The Zod SSOT from src/packages/lib/package-schema.ts
 * 
 * @see src/packages/lib/package-schema.ts for the Zod SSOT
 * @see docs/packages/build-pipeline.md for pipeline documentation
 * @version 2.0.0
 */

import { writeFile } from "node:fs/promises";
import fse from "fs-extra";
import path from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";

// =============================================================================
// Configuration
// =============================================================================

const CONFIG = {
  /**
   * Source Zod schema file (relative to project root)
   */
  SOURCE_PATH: "src/packages/lib/package-schema.ts",
  
  /**
   * Output path for generated JSON Schema
   */
  OUTPUT_PATH: "src/data/packages/__generated__/schema/package-data.schema.json",
  
  /**
   * Schema ID - update to match your domain
   */
  SCHEMA_ID: "https://yourdomain.com/schemas/package-data.schema.json",
  
  /**
   * Schema title for documentation
   */
  SCHEMA_TITLE: "Package Data Schema",
  
  /**
   * Schema description
   */
  SCHEMA_DESCRIPTION:
    "Complete validation schema for package data files. " +
    "Generated automatically from Zod SSOT. " +
    "DO NOT EDIT BY HAND - regenerate with 'npm run schema:build'.",
  
  /**
   * Schema version - bump on breaking changes
   */
  VERSION: "2.0.0",
  
  /**
   * Verbose mode flag
   */
  VERBOSE: process.argv.includes("--verbose") || process.argv.includes("-v"),
  
  /**
   * Help flag
   */
  HELP: process.argv.includes("--help") || process.argv.includes("-h"),
} as const;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Formats duration in milliseconds to human-readable string
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(0)}s`;
}

/**
 * Prints help message
 */
function printHelp(): void {
  console.log(`
JSON Schema Generator v${CONFIG.VERSION}
Generates package-data.schema.json from Zod SSOT

USAGE:
  npm run schema:build [OPTIONS]

OPTIONS:
  --verbose, -v  Show detailed generation progress
  --help, -h     Show this help message

BEHAVIOR:
  - Reads: ${CONFIG.SOURCE_PATH}
  - Writes: ${CONFIG.OUTPUT_PATH}
  - Validates output structure
  - Exits with code 1 on errors

INTEGRATION:
  Run as part of: npm run data:all
  Used by: VS Code, validators, documentation tools

TROUBLESHOOTING:
  If generation fails:
  1. Verify ${CONFIG.SOURCE_PATH} exists
  2. Check PackageSchema is exported
  3. Ensure zod-to-json-schema is installed:
     npm install --save-dev zod-to-json-schema

For more information: docs/packages/build-pipeline.md
`);
}

/**
 * Logs message if verbose mode enabled
 */
function verbose(message: string): void {
  if (CONFIG.VERBOSE) {
    console.log(message);
  }
}

/**
 * Validates the generated schema structure
 */
function validateSchema(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required top-level fields
  const requiredFields = ["$schema", "$id", "title", "description", "version", "$comment"];
  for (const field of requiredFields) {
    if (!(field in schema)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Check for properties
  if (!schema.properties || typeof schema.properties !== "object") {
    errors.push("Schema missing 'properties' object");
  } else if (Object.keys(schema.properties).length === 0) {
    errors.push("Schema 'properties' object is empty");
  }
  
  // Check for required array
  if (!Array.isArray(schema.required) || schema.required.length === 0) {
    errors.push("Schema missing or empty 'required' array");
  }
  
  // Check specific expected properties
  const expectedProps = ["meta", "hero", "details_and_trust"];
  for (const prop of expectedProps) {
    if (!schema.properties?.[prop]) {
      errors.push(`Expected property '${prop}' not found in schema`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Main Generation Function
// =============================================================================

async function generateJsonSchema(): Promise<void> {
  const startTime = Date.now();
  
  console.log("\n🔨 JSON Schema Generator");
  console.log("─".repeat(70));
  console.log(`   Version: ${CONFIG.VERSION}`);
  console.log(`   Source: ${CONFIG.SOURCE_PATH}`);
  console.log(`   Output: ${CONFIG.OUTPUT_PATH}`);
  console.log("─".repeat(70));
  console.log();
  
  try {
    // -------------------------------------------------------------------------
    // Step 1: Import PackageSchema from Zod SSOT
    // -------------------------------------------------------------------------
    verbose("📦 Loading PackageSchema from Zod SSOT...");
    
    let PackageSchema: any;
    try {
      // Dynamic import with relative path resolution
      const modulePath = path.resolve(process.cwd(), "src/packages/lib/package-schema.js");
      verbose(`   Import path: ${modulePath}`);
      
      const schemaModule = await import(modulePath);
      PackageSchema = schemaModule.PackageSchema;
      
      if (!PackageSchema) {
        throw new Error(
          "PackageSchema not found in module exports. " +
          "Ensure it's exported from src/packages/lib/package-schema.ts"
        );
      }
      
      verbose("   ✅ PackageSchema loaded\n");
    } catch (importError) {
      console.error("\n❌ Failed to import PackageSchema:");
      console.error(importError);
      console.error("\n💡 Troubleshooting:");
      console.error(`   1. Verify file exists: ${CONFIG.SOURCE_PATH}`);
      console.error("   2. Check PackageSchema is exported");
      console.error("   3. Ensure TypeScript is compiled");
      console.error("   4. Try: npm run build\n");
      throw importError;
    }
    
    // -------------------------------------------------------------------------
    // Step 2: Convert Zod schema to JSON Schema
    // -------------------------------------------------------------------------
    verbose("🔄 Converting Zod to JSON Schema format...");
    
    let jsonSchema: any;
    try {
      jsonSchema = zodToJsonSchema(PackageSchema, {
        name: "PackageData",
        $refStrategy: "none", // Inline all references
        errorMessages: true, // Include Zod error messages
        target: "jsonSchema7", // Use JSON Schema Draft 7
        definitions: undefined, // Don't create separate definitions
      });
      
      verbose("   ✅ Conversion complete\n");
    } catch (conversionError) {
      console.error("\n❌ Zod to JSON Schema conversion failed:");
      console.error(conversionError);
      console.error("\n💡 This usually means:");
      console.error("   1. PackageSchema has unsupported Zod types");
      console.error("   2. Circular references in the schema");
      console.error("   3. zod-to-json-schema version incompatibility\n");
      throw conversionError;
    }
    
    // -------------------------------------------------------------------------
    // Step 3: Add metadata and documentation
    // -------------------------------------------------------------------------
    verbose("📝 Adding metadata and documentation...");
    
    const timestamp = new Date().toISOString();
    const gitHash = process.env.GIT_COMMIT_SHA || "local";
    
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      $id: CONFIG.SCHEMA_ID,
      title: CONFIG.SCHEMA_TITLE,
      description: CONFIG.SCHEMA_DESCRIPTION,
      version: CONFIG.VERSION,
      ...jsonSchema,
      $comment: [
        "AUTO-GENERATED",
        `Source: ${CONFIG.SOURCE_PATH}`,
        `Generated: ${timestamp}`,
        `Generator: scripts/packages/build-json-schema.ts v${CONFIG.VERSION}`,
        `Git: ${gitHash}`,
        "DO NOT EDIT BY HAND",
      ].join(" | "),
      additionalMetadata: {
        generatedAt: timestamp,
        generatorVersion: CONFIG.VERSION,
        sourceFile: CONFIG.SOURCE_PATH,
        zoToJsonSchemaVersion: require("zod-to-json-schema/package.json").version,
      },
    };
    
    verbose("   ✅ Metadata added\n");
    
    // -------------------------------------------------------------------------
    // Step 4: Validate generated schema structure
    // -------------------------------------------------------------------------
    verbose("🔍 Validating generated schema structure...");
    
    const validation = validateSchema(schema);
    
    if (!validation.valid) {
      console.warn("\n⚠️  Schema validation warnings:");
      validation.errors.forEach((error) => {
        console.warn(`   - ${error}`);
      });
      console.warn("\nProceeding with generation, but review warnings above.\n");
    } else {
      verbose("   ✅ Schema structure valid\n");
    }
    
    // Log schema statistics
    const propCount = Object.keys(jsonSchema.properties || {}).length;
    const requiredCount = Array.isArray(jsonSchema.required) ? jsonSchema.required.length : 0;
    
    verbose("📊 Schema statistics:");
    verbose(`   Properties: ${propCount}`);
    verbose(`   Required: ${requiredCount}`);
    if (jsonSchema.definitions) {
      verbose(`   Definitions: ${Object.keys(jsonSchema.definitions).length}`);
    }
    verbose("");
    
    // -------------------------------------------------------------------------
    // Step 5: Write to file
    // -------------------------------------------------------------------------
    verbose("💾 Writing schema to file...");
    
    try {
      await fse.ensureDir(path.dirname(CONFIG.OUTPUT_PATH));
      await writeFile(
        CONFIG.OUTPUT_PATH,
        JSON.stringify(schema, null, 2),
        "utf8"
      );
      verbose("   ✅ File written successfully\n");
    } catch (writeError) {
      console.error("\n❌ Failed to write schema file:");
      console.error(writeError);
      console.error("\n💡 Check:");
      console.error(`   1. Directory is writable: ${path.dirname(CONFIG.OUTPUT_PATH)}`);
      console.error("   2. Disk space available");
      console.error("   3. File permissions\n");
      throw writeError;
    }
    
    // -------------------------------------------------------------------------
    // Step 6: Verify file exists and is readable
    // -------------------------------------------------------------------------
    verbose("✔️  Verifying output file...");
    
    try {
      const stats = await fse.stat(CONFIG.OUTPUT_PATH);
      const sizeKB = (stats.size / 1024).toFixed(2);
      verbose(`   File size: ${sizeKB} KB\n`);
    } catch (statError) {
      console.warn("⚠️  Could not verify output file");
    }
    
    // -------------------------------------------------------------------------
    // Step 7: Success summary
    // -------------------------------------------------------------------------
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log("─".repeat(70));
    console.log("✅ JSON Schema generation SUCCESSFUL");
    console.log("─".repeat(70));
    console.log(`   Output: ${CONFIG.OUTPUT_PATH}`);
    console.log(`   Version: ${CONFIG.VERSION}`);
    console.log(`   Properties: ${propCount}`);
    console.log(`   Required fields: ${requiredCount}`);
    console.log(`   Duration: ${formatDuration(duration)}`);
    console.log(`   Timestamp: ${timestamp}`);
    console.log("─".repeat(70));
    console.log("\n💡 Next steps:");
    console.log("   - Schema is ready for use");
    console.log("   - VS Code will use it for autocomplete");
    console.log("   - Commit the generated file to version control\n");
    
  } catch (error) {
    // Catch-all error handler
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error("\n" + "═".repeat(70));
    console.error("❌ JSON SCHEMA GENERATION FAILED");
    console.error("═".repeat(70));
    
    if (error instanceof Error) {
      console.error(`\nError: ${error.message}`);
      
      if (CONFIG.VERBOSE && error.stack) {
        console.error("\nStack trace:");
        console.error(error.stack);
      }
    } else {
      console.error("\nUnknown error:", error);
    }
    
    console.error(`\nDuration: ${formatDuration(duration)}`);
    console.error("\n💡 Common solutions:");
    console.error("   1. Run: npm install --save-dev zod-to-json-schema");
    console.error("   2. Ensure: npm run build (compile TypeScript)");
    console.error("   3. Verify: src/packages/lib/package-schema.ts exists");
    console.error("   4. Check: PackageSchema is exported");
    console.error("   5. Try: npm run schema:build -- --verbose");
    console.error("\n📚 Documentation: docs/packages/build-pipeline.md");
    console.error("═".repeat(70) + "\n");
    
    process.exit(1);
  }
}

// =============================================================================
// Entry Point
// =============================================================================

async function main(): Promise<void> {
  // Show help if requested
  if (CONFIG.HELP) {
    printHelp();
    process.exit(0);
  }
  
  // Run generation
  await generateJsonSchema();
}

// Execute with global error handler
main().catch((error) => {
  console.error("\n❌ Unexpected error in schema generator:");
  console.error(error);
  
  if (error.stack) {
    console.error("\nStack trace:");
    console.error(error.stack);
  }
  
  console.error("\n💡 This is a bug. Please report it.\n");
  process.exit(1);
});