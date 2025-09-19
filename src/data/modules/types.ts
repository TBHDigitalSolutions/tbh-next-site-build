// src/data/modules/types.ts

export type ModuleItemType = 
  | "case-study" 
  | "portfolio" 
  | "booking" 
  | "audit" 
  | "icp"
  | "tool"
  | "resource"
  | "calculator"
  | "checklist";

export interface ModuleItem {
  type: ModuleItemType;
  title: string;
  description: string;
  href: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
  hubSpecific?: boolean;
}

export interface ModuleSelectorInput {
  hub: string;
  service?: string;
  sub?: string;
  limit?: number;
  context?: "hub" | "service" | "subservice";
}