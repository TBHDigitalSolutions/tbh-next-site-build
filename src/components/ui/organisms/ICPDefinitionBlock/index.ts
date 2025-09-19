/* ============================
   🎯 ICP Definition Block - Barrel Export
   ============================
   
   Exports for the Ideal Customer Profile Definition Block component
   including types, component, and utilities
   ============================ */

// Main component export
export { ICPDefinitionBlock } from './ICPDefinitionBlock';

// Default export for convenience
export { ICPDefinitionBlock as default } from './ICPDefinitionBlock';

// Type exports
export type {
  ICPCharacteristic,
  ICPPersona,
  ICPDefinitionBlockProps
} from './ICPDefinitionBlock';

/* ============================
   USAGE EXAMPLES
   ============================

   Basic Usage:
   ```tsx
   import { ICPDefinitionBlock } from '@/components/features/products-services/ICPDefinitionBlock';

   <ICPDefinitionBlock
     title="Our Ideal Customer Profiles"
     subtitle="Understanding who we serve best helps us deliver exceptional value."
     mode="detailed"
     layout="cards"
     showActions={true}
   />
   ```

   With Custom Data:
   ```tsx
   import { ICPDefinitionBlock, ICPPersona } from '@/components/features/products-services/ICPDefinitionBlock';

   const customPersonas: ICPPersona[] = [
     {
       id: 'enterprise-cto',
       name: 'Jennifer Martinez',
       title: 'Chief Technology Officer',
       company: 'Enterprise Corp',
       // ... rest of persona data
     }
   ];

   <ICPDefinitionBlock
     personas={customPersonas}
     mode="interactive"
     layout="tabs"
     onPersonaClick={(persona) => console.log('Selected:', persona.name)}
   />
   ```

   Minimal Configuration:
   ```tsx
   import ICPDefinitionBlock from '@/components/features/products-services/ICPDefinitionBlock';

   <ICPDefinitionBlock />
   ```

   ============================ */