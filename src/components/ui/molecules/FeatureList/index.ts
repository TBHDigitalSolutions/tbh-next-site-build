/* Barrel: re-export the default component under a named export,
   and forward the types. This lets consumers do:

   import { FeatureList } from "@/components/ui/molecules/FeatureList";
   // or
   import FeatureList from "@/components/ui/molecules/FeatureList/FeatureList";
*/
export { default as FeatureList } from "./FeatureList";
export type { FeatureListProps, FeatureItem, FeatureState } from "./FeatureList";
