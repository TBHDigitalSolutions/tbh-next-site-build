// src/components/ui/molecules/FeatureList/index.ts
/* Barrel: re-export the default component under a named export,
   and forward the types. This lets consumers do:

   import { FeatureList } from ".../FeatureList";
   // or import FeatureList from ".../FeatureList/FeatureList";
*/

export { default as FeatureList } from "./FeatureList";
export type { FeatureListProps, FeatureItem, FeatureState } from "./FeatureList";
