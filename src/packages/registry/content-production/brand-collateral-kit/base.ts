import json from "@/data/packages/__generated__/packages/brand-collateral-kit.json";
import { PackageSchema } from "@/packages/lib/package-schema";
const base = PackageSchema.parse(json);
export default base;
