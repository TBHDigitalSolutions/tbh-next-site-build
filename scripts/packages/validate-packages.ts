// /scripts/packages/validate-packages.ts
// Comprehensive validation script for the package domain

import {
  validatePackageSystem,
  getPackageSystemStats,
  validateRecommendationSystem,
  getAllPackagesFromIndex,
  getAllAddOnsFromIndex,
  INTEGRATED_GROWTH_BUNDLES,
  getPackagesByService,
  getPackageById
} from "../src/data/packages";

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: any;
}

/**
 * Run comprehensive package domain validation
 */
export async function validatePackageDomain(): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log("🔍 Validating Package Domain...\n");

  try {
    // 1. Test basic imports
    console.log("✅ Testing basic imports...");
    const allPackages = getAllPackagesFromIndex();
    const allAddOns = getAllAddOnsFromIndex();
    const allBundles = INTEGRATED_GROWTH_BUNDLES;

    if (allPackages.length === 0) {
      errors.push("No packages found - check package imports");
    }

    if (allBundles.length === 0) {
      errors.push("No bundles found - check bundle imports");
    }

    // 2. Test function exports
    console.log("✅ Testing function exports...");
    try {
      const seoPackages = getPackagesByService("seo");
      const testPackage = getPackageById("seo-essential");
      console.log(`   Found ${seoPackages.length} SEO packages`);
      console.log(`   Test package lookup: ${testPackage ? "✅" : "❌"}`);
    } catch (error) {
      errors.push(`Function export test failed: ${error}`);
    }

    // 3. Run built-in validation
    console.log("✅ Running built-in validations...");
    const systemValidation = validatePackageSystem();
    if (!systemValidation.isValid) {
      errors.push(...systemValidation.errors);
      warnings.push(...systemValidation.warnings);
    }

    const recsValidation = validateRecommendationSystem();
    if (!recsValidation.isValid) {
      errors.push(...recsValidation.errors);
      warnings.push(...recsValidation.warnings);
    }

    // 4. Test package structure integrity
    console.log("✅ Testing package structure...");
    const packageIds = new Set();
    const duplicateIds: string[] = [];

    allPackages.forEach(pkg => {
      if (packageIds.has(pkg.id)) {
        duplicateIds.push(pkg.id);
      }
      packageIds.add(pkg.id);

      // Validate required fields
      if (!pkg.name || !pkg.service || !pkg.tier) {
        errors.push(`Package ${pkg.id} missing required fields`);
      }

      // Validate pricing
      if (!pkg.price.setup && !pkg.price.monthly) {
        warnings.push(`Package ${pkg.id} has no pricing information`);
      }
    });

    if (duplicateIds.length > 0) {
      errors.push(`Duplicate package IDs: ${duplicateIds.join(", ")}`);
    }

    // 5. Test bundle structure
    console.log("✅ Testing bundle structure...");
    allBundles.forEach(bundle => {
      if (!bundle.slug || !bundle.title || !bundle.category) {
        errors.push(`Bundle ${bundle.id || "unknown"} missing required fields`);
      }

      // Test pricing structure
      if (!bundle.pricing || !bundle.pricing.tiers) {
        warnings.push(`Bundle ${bundle.slug} missing pricing tiers`);
      }
    });

    // 6. Test service coverage
    console.log("✅ Testing service coverage...");
    const services = ["content", "leadgen", "marketing", "seo", "webdev", "video"];
    const serviceStats = getPackageSystemStats();

    services.forEach(service => {
      const servicePackages = getPackagesByService(service);
      if (servicePackages.length === 0) {
        warnings.push(`No packages found for service: ${service}`);
      }

      // Check tier coverage
      const tiers = ["Essential", "Professional", "Enterprise"];
      tiers.forEach(tier => {
        const tierPackages = servicePackages.filter(pkg => pkg.tier === tier);
        if (tierPackages.length === 0) {
          warnings.push(`No ${tier} tier package for ${service} service`);
        }
      });
    });

    console.log("\n📊 Package Domain Statistics:");
    console.log(`   Total Packages: ${allPackages.length}`);
    console.log(`   Total Add-ons: ${allAddOns.length}`);
    console.log(`   Total Bundles: ${allBundles.length}`);
    console.log(`   Services Covered: ${services.length}`);

    if (errors.length === 0) {
      console.log("\n✅ Package domain validation PASSED");
    } else {
      console.log("\n❌ Package domain validation FAILED");
      console.log("Errors:", errors);
    }

    if (warnings.length > 0) {
      console.log("\n⚠️ Warnings:", warnings);
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
      stats: serviceStats
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    errors.push(`Validation failed: ${errorMessage}`);
    console.error("❌ Validation script failed:", error);

    return {
      success: false,
      errors,
      warnings,
      stats: null
    };
  }
}

// Run validation if called directly
if (require.main === module) {
  validatePackageDomain()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error("Validation script error:", error);
      process.exit(1);
    });
}