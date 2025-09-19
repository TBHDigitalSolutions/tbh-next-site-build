import React from 'react';
import './CapabilitiesGrid.css';

// ============================
// TypeScript Interfaces
// ============================

interface CapabilitySkill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface Capability {
  id: string;
  icon: string;
  title: string;
  description: string;
  skills: CapabilitySkill[];
  proficiency: number; // 0-100 percentage
  proficiencyLabel?: string;
}

interface CapabilitiesGridProps {
  title?: string;
  subtitle?: string;
  capabilities: Capability[];
  className?: string;
  showProficiency?: boolean;
  showSkills?: boolean;
  columns?: 2 | 3 | 4;
}

// ============================
// Default Data
// ============================

const defaultCapabilities: Capability[] = [
  {
    id: 'web-development',
    icon: '💻',
    title: 'Web Development',
    description: 'Full-stack web development with modern frameworks and technologies.',
    skills: [
      { name: 'React', level: 'expert' },
      { name: 'Next.js', level: 'expert' },
      { name: 'TypeScript', level: 'advanced' },
      { name: 'Node.js', level: 'advanced' }
    ],
    proficiency: 95,
    proficiencyLabel: 'Expert Level'
  },
  {
    id: 'digital-marketing',
    icon: '📈',
    title: 'Digital Marketing',
    description: 'Strategic digital marketing campaigns that drive results and ROI.',
    skills: [
      { name: 'SEO', level: 'expert' },
      { name: 'PPC', level: 'advanced' },
      { name: 'Social Media', level: 'expert' },
      { name: 'Analytics', level: 'advanced' }
    ],
    proficiency: 90,
    proficiencyLabel: 'Expert Level'
  },
  {
    id: 'branding-design',
    icon: '🎨',
    title: 'Branding & Design',
    description: 'Creative branding solutions that capture your business essence.',
    skills: [
      { name: 'Logo Design', level: 'expert' },
      { name: 'UI/UX', level: 'advanced' },
      { name: 'Brand Strategy', level: 'expert' },
      { name: 'Graphic Design', level: 'advanced' }
    ],
    proficiency: 88,
    proficiencyLabel: 'Expert Level'
  },
  {
    id: 'content-creation',
    icon: '✍️',
    title: 'Content Creation',
    description: 'Compelling content that engages audiences and drives conversions.',
    skills: [
      { name: 'Copywriting', level: 'expert' },
      { name: 'Video Production', level: 'advanced' },
      { name: 'Photography', level: 'intermediate' },
      { name: 'Content Strategy', level: 'expert' }
    ],
    proficiency: 85,
    proficiencyLabel: 'Advanced Level'
  },
  {
    id: 'automation',
    icon: '⚡',
    title: 'Process Automation',
    description: 'Streamline workflows with intelligent automation solutions.',
    skills: [
      { name: 'Zapier', level: 'expert' },
      { name: 'API Integration', level: 'advanced' },
      { name: 'Workflow Design', level: 'expert' },
      { name: 'Data Analysis', level: 'advanced' }
    ],
    proficiency: 92,
    proficiencyLabel: 'Expert Level'
  },
  {
    id: 'consulting',
    icon: '🎯',
    title: 'Strategic Consulting',
    description: 'Expert guidance to transform your digital presence and operations.',
    skills: [
      { name: 'Business Strategy', level: 'expert' },
      { name: 'Digital Transformation', level: 'expert' },
      { name: 'Market Analysis', level: 'advanced' },
      { name: 'Growth Planning', level: 'expert' }
    ],
    proficiency: 93,
    proficiencyLabel: 'Expert Level'
  }
];

// ============================
// Main Component
// ============================

const CapabilitiesGrid: React.FC<CapabilitiesGridProps> = ({
  title = "Our Core Capabilities",
  subtitle = "Comprehensive digital solutions powered by expertise, creativity, and cutting-edge technology.",
  capabilities = defaultCapabilities,
  className = '',
  showProficiency = true,
  showSkills = true,
  columns = 3
}) => {
  const gridStyle = {
    '--grid-columns': columns
  } as React.CSSProperties;

  const renderSkills = (skills: CapabilitySkill[]) => {
    if (!showSkills) return null;

    return (
      <div className="capability-skills">
        <div className="capability-skills-title">Key Skills</div>
        <div className="capability-skills-list">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="capability-skill-tag"
              title={skill.level ? `${skill.name} - ${skill.level}` : skill.name}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderProficiency = (capability: Capability) => {
    if (!showProficiency) return null;

    return (
      <div className="capability-proficiency">
        <div className="capability-proficiency-label">
          <span>Proficiency</span>
          <span>{capability.proficiencyLabel || `${capability.proficiency}%`}</span>
        </div>
        <div className="capability-proficiency-bar">
          <div
            className="capability-proficiency-fill"
            style={{ width: `${capability.proficiency}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <section className={`capabilities-grid ${className}`}>
      <div className="capabilities-grid-header">
        <h2 className="capabilities-grid-title">{title}</h2>
        {subtitle && (
          <p className="capabilities-grid-subtitle">{subtitle}</p>
        )}
      </div>

      <div 
        className="capabilities-grid-container" 
        style={gridStyle}
      >
        {capabilities.map((capability) => (
          <div key={capability.id} className="capability-item">
            <div className="capability-icon" role="img" aria-label={capability.title}>
              {capability.icon}
            </div>
            
            <h3 className="capability-title">{capability.title}</h3>
            
            <p className="capability-description">
              {capability.description}
            </p>

            {renderSkills(capability.skills)}
            {renderProficiency(capability)}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CapabilitiesGrid;
export type { CapabilitiesGridProps, Capability, CapabilitySkill };