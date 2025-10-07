import json from "@/data/packages/__generated__/packages/cms-migration-lite.json";
import { PackageSchema } from "@/packages/lib/package-schema";
const base = PackageSchema.parse(json);
export default base;
