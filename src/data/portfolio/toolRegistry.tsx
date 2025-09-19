// /src/data/portfolio/toolRegistry.tsx
// React component registry for portfolio tools - bridges data layer to UI components

import React from "react";
import type { ToolComponentKey } from "./categoryTools";

// Import UI components (adjust paths based on your component structure)
// These imports should match your actual component locations
interface AuditTeaserProps {
  variant?: "website" | "seo" | "funnel";
  showDemo?: boolean;
  [key: string]: any;
}

interface ICPDefinitionBlockProps {
  mode?: "web-focused" | "video-focused" | "content-focused" | "leadgen-focused";
  layout?: "cards" | "tabs" | "accordion" | "comparison";
  interactive?: boolean;
  withExamples?: boolean;
  [key: string]: any;
}

interface PlaybookShowcaseProps {
  category?: string;
  playbooks?: Array<{ id: string; title: string }>;
  preset?: string;
  [key: string]: any;
}

// Stub components for development - replace with actual imports
const AuditTeaser: React.FC<AuditTeaserProps> = (props) => (
  <div className="border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
    <h3 className="text-lg font-semibold mb-2">
      {props.variant === "website" && "Website Audit"}
      {props.variant === "seo" && "SEO Audit"}
      {props.variant === "funnel" && "Funnel Audit"}
    </h3>
    <p className="text-gray-600 mb-4">
      Comprehensive analysis with actionable recommendations.
    </p>
    {props.showDemo && (
      <div className="bg-white/50 rounded p-3 mb-4">
        <div className="text-sm text-gray-500">Demo available</div>
      </div>
    )}
    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
      Start Audit
    </button>
  </div>
);

const ICPDefinitionBlock: React.FC<ICPDefinitionBlockProps> = (props) => (
  <div className="border rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50">
    <h3 className="text-lg font-semibold mb-2">ICP Workshop</h3>
    <p className="text-gray-600 mb-4">
      Define your ideal customer profile for {props.mode?.replace("-focused", "")} campaigns.
    </p>
    <div className="mb-4">
      <div className="text-sm text-gray-500 mb-2">Layout: {props.layout}</div>
      {props.interactive && (
        <div className="bg-white/50 rounded p-2 text-sm">Interactive mode enabled</div>
      )}
    </div>
    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
      Start Workshop
    </button>
  </div>
);

const PlaybookShowcase: React.FC<PlaybookShowcaseProps> = (props) => (
  <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-violet-50">
    <h3 className="text-lg font-semibold mb-2">
      {props.category ? `${props.category} Playbook` : "Resource Library"}
    </h3>
    <p className="text-gray-600 mb-4">
      Proven frameworks and templates for your projects.
    </p>
    {props.playbooks && (
      <div className="space-y-2 mb-4">
        {props.playbooks.map((playbook) => (
          <div key={playbook.id} className="bg-white/50 rounded p-2 text-sm">
            {playbook.title}
          </div>
        ))}
      </div>
    )}
    <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
      Download Resources
    </button>
  </div>
);

const ComingSoon: React.FC<any> = (props) => (
  <div className="border rounded-lg p-6 bg-gradient-to-br from-gray-50 to-slate-50">
    <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
    <p className="text-gray-600 mb-4">
      This tool is currently in development. Check back soon!
    </p>
    <button 
      className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
      disabled
    >
      Notify Me
    </button>
  </div>
);

// Tool component registry - maps string keys to React components
export const TOOL_REGISTRY = {
  AuditTeaser,
  ICPDefinitionBlock,
  PlaybookShowcase,
  ComingSoon,
} as const;

export type ToolKey = keyof typeof TOOL_REGISTRY;

// Component for rendering tools dynamically
export interface RenderToolProps {
  componentKey: ToolComponentKey;
  props?: Record<string, unknown>;
  className?: string;
}

export function RenderTool({ componentKey, props, className }: RenderToolProps) {
  const Component = TOOL_REGISTRY[componentKey] ?? TOOL_REGISTRY.ComingSoon;
  
  return (
    <div className={className}>
      <Component {...(props ?? {})} />
    </div>
  );
}

// Development helper to check component availability
export function validateToolRegistry(): { 
  available: ToolKey[]; 
  missing: string[];
} {
  const registeredKeys = Object.keys(TOOL_REGISTRY) as ToolKey[];
  const requiredKeys = ["AuditTeaser", "ICPDefinitionBlock", "PlaybookShowcase", "ComingSoon"];
  
  const available = registeredKeys.filter(key => TOOL_REGISTRY[key]);
  const missing = requiredKeys.filter(key => !TOOL_REGISTRY[key as ToolKey]);
  
  if (process.env.NODE_ENV === "development" && missing.length > 0) {
    console.warn("[toolRegistry] Missing components:", missing);
  }
  
  return { available, missing };
}

// Export component types for external use
export type { AuditTeaserProps, ICPDefinitionBlockProps, PlaybookShowcaseProps };