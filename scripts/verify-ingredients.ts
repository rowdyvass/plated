/**
 * Ingredient Verification Script
 *
 * Verifies that all ingredients have consistent definitions including:
 * - Valid top-down perspective
 * - Valid silhouette path
 * - Valid primary color (hex format)
 * - Valid dimensions
 * - Matching registry entry
 *
 * Run with: npx tsx scripts/verify-ingredients.ts
 */

import { ingredientDefinitions, getAllDefinitionIds } from '../src/data/ingredients/definitions';
import { hasIngredient, getAllIngredientIds } from '../src/components/ingredients/registry';

interface VerificationResult {
  id: string;
  issues: string[];
  warnings: string[];
  passed: boolean;
}

// Validate hex color format
function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Validate SVG path - basic check for path commands
function isValidSvgPath(path: string): boolean {
  if (!path || path.length < 5) return false;

  // Check for at least one valid path command
  const pathCommands = /[MmLlHhVvCcSsQqTtAaZz]/;
  return pathCommands.test(path);
}

// Verify a single ingredient
function verifyIngredient(id: string): VerificationResult {
  const def = ingredientDefinitions[id];
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!def) {
    return {
      id,
      issues: ['Definition not found'],
      warnings: [],
      passed: false,
    };
  }

  // Check perspective
  if (def.perspective !== 'top-down') {
    issues.push(`Perspective is "${def.perspective}", must be "top-down"`);
  }

  // Check silhouette path
  if (!def.silhouettePath) {
    issues.push('Missing silhouette path');
  } else if (!isValidSvgPath(def.silhouettePath)) {
    issues.push('Invalid or too short silhouette path');
  }

  // Check primary color
  if (!def.primaryColor) {
    issues.push('Missing primary color');
  } else if (!isValidHexColor(def.primaryColor)) {
    issues.push(`Invalid primary color format: ${def.primaryColor} (expected #RRGGBB)`);
  }

  // Check dimensions
  if (!def.dimensions) {
    issues.push('Missing dimensions');
  } else {
    if (typeof def.dimensions.width !== 'number' || def.dimensions.width <= 0) {
      issues.push(`Invalid width: ${def.dimensions.width}`);
    }
    if (typeof def.dimensions.height !== 'number' || def.dimensions.height <= 0) {
      issues.push(`Invalid height: ${def.dimensions.height}`);
    }
  }

  // Check category
  const validCategories = ['protein', 'vegetable', 'sauce', 'garnish'];
  if (!validCategories.includes(def.category)) {
    issues.push(`Invalid category: ${def.category}`);
  }

  // Check if has matching registry entry (warning only - some definitions may not have visuals yet)
  if (!hasIngredient(id)) {
    warnings.push('No matching component in registry');
  }

  return {
    id,
    issues,
    warnings,
    passed: issues.length === 0,
  };
}

// Check for orphaned registry entries
function findOrphanedRegistryEntries(): string[] {
  const registryIds = getAllIngredientIds();
  const definitionIds = new Set(getAllDefinitionIds());

  return registryIds.filter((id) => !definitionIds.has(id));
}

// Main verification function
function verifyAllIngredients(): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║           INGREDIENT VERIFICATION REPORT                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const allIds = getAllDefinitionIds();
  const results = allIds.map(verifyIngredient);

  // Group by status
  const passed = results.filter((r) => r.passed && r.warnings.length === 0);
  const passedWithWarnings = results.filter((r) => r.passed && r.warnings.length > 0);
  const failed = results.filter((r) => !r.passed);

  // Report failed ingredients
  if (failed.length > 0) {
    console.log('❌ FAILED INGREDIENTS:\n');
    failed.forEach((r) => {
      console.log(`  ✗ ${r.id}`);
      r.issues.forEach((issue) => console.log(`      - ${issue}`));
    });
    console.log();
  }

  // Report ingredients with warnings
  if (passedWithWarnings.length > 0) {
    console.log('⚠️  PASSED WITH WARNINGS:\n');
    passedWithWarnings.forEach((r) => {
      console.log(`  ⚠ ${r.id}`);
      r.warnings.forEach((warning) => console.log(`      - ${warning}`));
    });
    console.log();
  }

  // Report passed ingredients
  if (passed.length > 0) {
    console.log('✅ PASSED INGREDIENTS:\n');
    passed.forEach((r) => {
      console.log(`  ✓ ${r.id}`);
    });
    console.log();
  }

  // Check for orphaned registry entries
  const orphaned = findOrphanedRegistryEntries();
  if (orphaned.length > 0) {
    console.log('🔍 ORPHANED REGISTRY ENTRIES (no matching definition):\n');
    orphaned.forEach((id) => {
      console.log(`  ? ${id}`);
    });
    console.log();
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SUMMARY:');
  console.log(`  Total definitions: ${allIds.length}`);
  console.log(`  ✅ Passed: ${passed.length}`);
  console.log(`  ⚠️  Passed with warnings: ${passedWithWarnings.length}`);
  console.log(`  ❌ Failed: ${failed.length}`);
  console.log(`  🔍 Orphaned registry entries: ${orphaned.length}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Exit with error code if any failed
  if (failed.length > 0) {
    console.log('⛔ Verification FAILED. Please fix the issues above.\n');
    process.exit(1);
  } else {
    console.log('✨ All ingredients verified successfully!\n');
    process.exit(0);
  }
}

// Category breakdown
function showCategoryBreakdown(): void {
  const allIds = getAllDefinitionIds();

  const byCategory: Record<string, string[]> = {
    protein: [],
    vegetable: [],
    sauce: [],
    garnish: [],
  };

  allIds.forEach((id) => {
    const def = ingredientDefinitions[id];
    if (def && byCategory[def.category]) {
      byCategory[def.category].push(id);
    }
  });

  console.log('\n📊 INGREDIENTS BY CATEGORY:\n');
  Object.entries(byCategory).forEach(([category, ids]) => {
    console.log(`  ${category.toUpperCase()} (${ids.length}):`);
    ids.forEach((id) => console.log(`    - ${id}`));
    console.log();
  });
}

// Run verification
if (process.argv.includes('--breakdown')) {
  showCategoryBreakdown();
}

verifyAllIngredients();
