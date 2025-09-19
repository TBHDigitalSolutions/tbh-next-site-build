#!/usr/bin/env tsx
/**
 * Export canonical slugs from taxonomy for lightweight consumption
 * Generates .generated/taxonomy-slugs.json for middleware and other tools
 * 
 * Usage:
 *   tsx scripts/taxonomy/export-slugs.ts
 *   tsx scripts/taxonomy/export-slugs.ts --output custom-path.json
 *   tsx scripts/taxonomy/export-slugs.ts --format minimal
 * 
 * Exit codes:
 *   0 = success, 1 = validation errors, 2 = unexpected crash
 */

import fs from "node:fs";
import path from "node:path";
import { logger, exitOk, exitFail } from "../_shared/logger";
import { servicesTree } from "../../src/data/taxonomy/servicesTree";
import type { 
  AnyServiceNode, 
  HubNode, 
  ServiceNode, 
  SubServiceNode 
} from "../../src/types/servicesTaxonomy.types";

const argv = process.argv.slice(2);
const VERBOSE = argv.includes("--verbose");
const JSON_OUTPUT = argv.includes("--json");
const FORMAT = argv.find(arg => arg.startsWith("--format="))?.split("=")[1] || "full";
const OUTPUT_PATH = argv.find(arg => arg.startsWith("--output="))?.split("=")[1] || 
                   path.resolve(process.cwd(), ".generated/taxonomy-slugs.json");

interface SlugExport {
  meta: {
    generated: string;
    version: string;
    totalHubs: number;
    totalServices: number;
    totalSubservices: number;
  };
  canonical: {
    hubs: string[];
    hubsSet: Record<string, boolean>;
  };
  hierarchy: {
    [hubSlug: string]: {
      services: string[];
      subservices: {
        [serviceSlug: string]: string[];
      };
    };
  };
  flat: {
    allSlugs: string[];
    byLevel: {
      L1: string[];
      L2: string[];
      L3: string[];
    };
  };
  paths: {
    [slug: string]: string;
  };
  middleware: {
    canonicalHubs: string[];
    matchers: string[];
  };
}

interface MinimalSlugExport {
  hubs: string[];
  services: { [hub: string]: string[] };
  subservices: { [hub: string]: { [service: string]: string[] } };
  paths: { [slug: string]: string };
}

function flattenTaxonomy(tree: AnyServiceNode): {
  hubs: HubNode[];
  services: ServiceNode[];
  subservices: SubServiceNode[];
} {
  const hubs: HubNode[] = [];
  const services: ServiceNode[] = [];
  const subservices: SubServiceNode[] = [];

  function traverse(node: AnyServiceNode) {
    if (node.kind === "hub" && node.slug !== "services") {
      hubs.push(node as HubNode);
      if (node.children) {
        node.children.forEach(child => traverse(child as AnyServiceNode));
      }
    } else if (node.kind === "service") {
      services.push(node as ServiceNode);
      if (node.children) {
        node.children.forEach(child => traverse(child as AnyServiceNode));
      }
    } else if (node.kind === "subservice") {
      subservices.push(node as SubServiceNode);
    }
  }

  if (tree.children) {
    tree.children.forEach(child => traverse(child as AnyServiceNode));
  }

  return { hubs, services, subservices };
}

function validateSlugs(hubs: HubNode[], services: ServiceNode[], subservices: SubServiceNode[]): string[] {
  const errors: string[] = [];
  const allSlugs = new Set<string>();

  // Check hub uniqueness and canonical format
  hubs.forEach(hub => {
    if (allSlugs.has(hub.slug)) {
      errors.push(`Duplicate hub slug: ${hub.slug}`);
    }
    allSlugs.add(hub.slug);

    if (!hub.slug.endsWith("-services") && hub.slug !== "services") {
      errors.push(`Hub slug should end with "-services": ${hub.slug}`);
    }
  });

  // Check service uniqueness within hubs
  const servicesByHub = new Map<string, Set<string>>();
  services.forEach(service => {
    const hubSlug = service.path.split("/")[2]; // /services/{hub}/{service}
    
    if (!servicesByHub.has(hubSlug)) {
      servicesByHub.set(hubSlug, new Set());
    }
    
    const hubServices = servicesByHub.get(hubSlug)!;
    if (hubServices.has(service.slug)) {
      errors.push(`Duplicate service slug in ${hubSlug}: ${service.slug}`);
    }
    hubServices.add(service.slug);

    if (allSlugs.has(service.slug)) {
      // This is OK - services can have same slug across different hubs
    }
    allSlugs.add(`${hubSlug}/${service.slug}`);
  });

  // Check subservice uniqueness and reserved slugs
  const subservicesByService = new Map<string, Set<string>>();
  subservices.forEach(sub => {
    const pathParts = sub.path.split("/"); // /services/{hub}/{service}/{sub}
    const hubSlug = pathParts[2];
    const serviceSlug = pathParts[3];
    const serviceKey = `${hubSlug}/${serviceSlug}`;
    
    if (!subservicesByService.has(serviceKey)) {
      subservicesByService.set(serviceKey, new Set());
    }
    
    const serviceSubs = subservicesByService.get(serviceKey)!;
    if (serviceSubs.has(sub.slug)) {
      errors.push(`Duplicate subservice slug in ${serviceKey}: ${sub.slug}`);
    }
    serviceSubs.add(sub.slug);

    if (sub.slug === "packages") {
      errors.push(`Reserved slug "packages" used at ${sub.path}`);
    }
  });

  return errors;
}

function generateFullExport(
  hubs: HubNode[], 
  services: ServiceNode[], 
  subservices: SubServiceNode[]
): SlugExport {
  const hierarchy: SlugExport["hierarchy"] = {};
  const paths: SlugExport["paths"] = {};
  const allSlugs: string[] = [];

  // Build hierarchy
  hubs.forEach(hub => {
    hierarchy[hub.slug] = {
      services: [],
      subservices: {}
    };
    paths[hub.slug] = hub.path;
    allSlugs.push(hub.slug);
  });

  services.forEach(service => {
    const hubSlug = service.path.split("/")[2];
    if (hierarchy[hubSlug]) {
      hierarchy[hubSlug].services.push(service.slug);
      hierarchy[hubSlug].subservices[service.slug] = [];
    }
    paths[service.slug] = service.path;
    allSlugs.push(service.slug);
  });

  subservices.forEach(sub => {
    const pathParts = sub.path.split("/");
    const hubSlug = pathParts[2];
    const serviceSlug = pathParts[3];
    
    if (hierarchy[hubSlug]?.subservices[serviceSlug]) {
      hierarchy[hubSlug].subservices[serviceSlug].push(sub.slug);
    }
    paths[sub.slug] = sub.path;
    allSlugs.push(sub.slug);
  });

  const canonicalHubs = hubs.map(h => h.slug).sort();

  return {
    meta: {
      generated: new Date().toISOString(),
      version: "1.0.0",
      totalHubs: hubs.length,
      totalServices: services.length,
      totalSubservices: subservices.length
    },
    canonical: {
      hubs: canonicalHubs,
      hubsSet: Object.fromEntries(canonicalHubs.map(h => [h, true]))
    },
    hierarchy,
    flat: {
      allSlugs: allSlugs.sort(),
      byLevel: {
        L1: hubs.map(h => h.slug).sort(),
        L2: services.map(s => s.slug).sort(),
        L3: subservices.map(s => s.slug).sort()
      }
    },
    paths,
    middleware: {
      canonicalHubs,
      matchers: [
        "/services/:path*",
        ...canonicalHubs.map(hub => `/${hub}/:path*`)
      ]
    }
  };
}

function generateMinimalExport(
  hubs: HubNode[], 
  services: ServiceNode[], 
  subservices: SubServiceNode[]
): MinimalSlugExport {
  const result: MinimalSlugExport = {
    hubs: hubs.map(h => h.slug).sort(),
    services: {},
    subservices: {},
    paths: {}
  };

  // Build services by hub
  hubs.forEach(hub => {
    result.services[hub.slug] = [];
    result.subservices[hub.slug] = {};
    result.paths[hub.slug] = hub.path;
  });

  services.forEach(service => {
    const hubSlug = service.path.split("/")[2];
    if (result.services[hubSlug]) {
      result.services[hubSlug].push(service.slug);
      result.subservices[hubSlug][service.slug] = [];
    }
    result.paths[service.slug] = service.path;
  });

  subservices.forEach(sub => {
    const pathParts = sub.path.split("/");
    const hubSlug = pathParts[2];
    const serviceSlug = pathParts[3];
    
    if (result.subservices[hubSlug]?.[serviceSlug]) {
      result.subservices[hubSlug][serviceSlug].push(sub.slug);
    }
    result.paths[sub.slug] = sub.path;
  });

  // Sort arrays for consistency
  Object.keys(result.services).forEach(hub => {
    result.services[hub].sort();
    Object.keys(result.subservices[hub]).forEach(service => {
      result.subservices[hub][service].sort();
    });
  });

  return result;
}

function ensureOutputDirectory(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.debug(`Created directory: ${dir}`);
  }
}

try {
  logger.debug("Flattening taxonomy from servicesTree");
  const { hubs, services, subservices } = flattenTaxonomy(servicesTree);

  logger.debug(`Found ${hubs.length} hubs, ${services.length} services, ${subservices.length} subservices`);

  // Validate slugs
  const errors = validateSlugs(hubs, services, subservices);
  if (errors.length > 0) {
    if (JSON_OUTPUT) {
      console.log(JSON.stringify({ 
        success: false, 
        errors,
        timestamp: new Date().toISOString()
      }));
    } else {
      logger.error("Taxonomy validation errors:");
      errors.forEach(error => logger.error(`- ${error}`));
    }
    exitFail();
  }

  // Generate export based on format
  let exportData: SlugExport | MinimalSlugExport;
  
  if (FORMAT === "minimal") {
    exportData = generateMinimalExport(hubs, services, subservices);
  } else {
    exportData = generateFullExport(hubs, services, subservices);
  }

  // Ensure output directory exists
  ensureOutputDirectory(OUTPUT_PATH);

  // Write the file
  const jsonContent = JSON.stringify(exportData, null, 2);
  fs.writeFileSync(OUTPUT_PATH, jsonContent, "utf8");

  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      success: true,
      outputPath: OUTPUT_PATH,
      format: FORMAT,
      meta: (exportData as SlugExport).meta || {
        totalHubs: hubs.length,
        totalServices: services.length,
        totalSubservices: subservices.length
      },
      timestamp: new Date().toISOString()
    }));
  } else {
    logger.info(`Exported ${FORMAT} taxonomy slugs to: ${OUTPUT_PATH}`);
    logger.info(`Canonical hubs: ${hubs.map(h => h.slug).join(", ")}`);
    if (VERBOSE) {
      logger.info(`Total items: ${hubs.length} hubs, ${services.length} services, ${subservices.length} subservices`);
    }
  }

  exitOk();

} catch (err) {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString()
    }));
  } else {
    logger.error("Unexpected error:", err);
  }
  process.exit(2);
}