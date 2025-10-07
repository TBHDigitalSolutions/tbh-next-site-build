import json from "@/data/packages/__generated__/packages/content-upload-retainer.json";
import { PackageSchema } from "@/packages/lib/package-schema";
const base = PackageSchema.parse(json);
export default base;
