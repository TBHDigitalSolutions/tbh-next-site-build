"use client";

import React, { useState } from 'react';
import './WorkflowSteps.css';

// ============================
// TypeScript Interfaces
// ============================

interface WorkflowStepAction {
  label: string;
  type: 'primary' | 'secondary';
  onClick?: () => void;
  href?: string;
  icon?: string;
}

interface WorkflowStepDetail {
  label: string;
  value: string;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  duration: string;
  status: 'pending' | 'active' | 'completed' | 'disabled';
  deliverables: string[];
  tools: string[];
  details?: WorkflowStepDetail[];
  actions?: WorkflowStepAction[];
  estimatedHours?: number;
  dependencies?: string[];
}

interface WorkflowStepsProps {
  title?: string;
  subtitle?: string;
  steps: WorkflowStep[];
  className?: string;
  showSummary?: boolean;
  interactive?: boolean;
  onStepClick?: (step: WorkflowStep) => void;
  onActionClick?: (step: WorkflowStep, action: WorkflowStepAction) => void;
}

// ============================
// Default Data
// ============================

const defaultSteps: WorkflowStep[] = [
  {
    id: 'discovery',
    title: 'Discovery & Research',
    description: 'We begin by understanding your business goals, target audience, and current challenges through comprehensive research and stakeholder interviews.',
    icon: '🔍',
    duration: '1-2 weeks',
    status: 'completed',
    estimatedHours: 40,
    deliverables: [
      'Business Requirements Document',
      'User Personas',
      'Competitive Analysis',
      'Technical Assessment'
    ],
    tools: ['Figma', 'Miro', 'Google Analytics', 'Surveys'],
    details: [
      { label: 'Team Size', value: '2-3 specialists' },
      { label: 'Client Involvement', value: 'High' }
    ],
    actions: [
      { label: 'View Deliverables', type: 'primary', href: '/deliverables/discovery' },
      { label: 'Schedule Meeting', type: 'secondary' }
    ]
  },
  {
    id: 'strategy',
    title: 'Strategy & Planning',
    description: 'Based on our research, we develop a comprehensive digital strategy and detailed project roadmap tailored to your specific needs.',
    icon: '📋',
    duration: '1 week',
    status: 'completed',
    estimatedHours: 30,
    deliverables: [
      'Digital Strategy Document',
      'Project Roadmap',
      'Technology Stack Recommendations',
      'Timeline & Milestones'
    ],
    tools: ['Notion', 'Jira', 'Slack', 'Microsoft Project'],
    details: [
      { label: 'Team Size', value: '3-4 specialists' },
      { label: 'Client Involvement', value: 'Medium' }
    ],
    actions: [
      { label: 'Review Strategy', type: 'primary' },
      { label: 'Download Roadmap', type: 'secondary' }
    ],
    dependencies: ['discovery']
  },
  {
    id: 'design',
    title: 'Design & Prototyping',
    description: 'Our creative team crafts beautiful, user-centered designs with interactive prototypes to visualize the final product.',
    icon: '🎨',
    duration: '2-3 weeks',
    status: 'active',
    estimatedHours: 80,
    deliverables: [
      'Wireframes & User Flows',
      'High-Fidelity Designs',
      'Interactive Prototypes',
      'Design System & Style Guide'
    ],
    tools: ['Figma', 'Adobe Creative Suite', 'Principle', 'InVision'],
    details: [
      { label: 'Team Size', value: '2-3 designers' },
      { label: 'Client Involvement', value: 'High' }
    ],
    actions: [
      { label: 'View Progress', type: 'primary' },
      { label: 'Provide Feedback', type: 'secondary' }
    ],
    dependencies: ['strategy']
  },
  {
    id: 'development',
    title: 'Development & Integration',
    description: 'Our experienced developers bring the designs to life using cutting-edge technologies and best practices for optimal performance.',
    icon: '⚙️',
    duration: '4-6 weeks',
    status: 'pending',
    estimatedHours: 200,
    deliverables: [
      'Functional Website/Application',
      'Content Management System',
      'API Integrations',
      'Database Setup'
    ],
    tools: ['React', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
    details: [
      { label: 'Team Size', value: '3-4 developers' },
      { label: 'Client Involvement', value: 'Low' }
    ],
    actions: [
      { label: 'Technical Specs', type: 'secondary' }
    ],
    dependencies: ['design']
  },
  {
    id: 'testing',
    title: 'Testing & Quality Assurance',
    description: 'Rigorous testing across all devices and browsers ensures everything works perfectly before launch.',
    icon: '🧪',
    duration: '1-2 weeks',
    status: 'pending',
    estimatedHours: 60,
    deliverables: [
      'Test Reports',
      'Cross-browser Compatibility',
      'Performance Optimization',
      'Security Audit'
    ],
    tools: ['Jest', 'Cypress', 'Lighthouse', 'BrowserStack'],
    details: [
      { label: 'Team Size', value: '2 QA specialists' },
      { label: 'Client Involvement', value: 'Medium' }
    ],
    actions: [
      { label: 'Testing Checklist', type: 'secondary' }
    ],
    dependencies: ['development']
  },
  {
    id: 'launch',
    title: 'Launch & Support',
    description: 'We handle the entire launch process and provide ongoing support to ensure your success.',
    icon: '🚀',
    duration: '1 week + ongoing',
    status: 'pending',
    estimatedHours: 40,
    deliverables: [
      'Live Website/Application',
      'Analytics Setup',
      'Training Documentation',
      'Support Plan'
    ],
    tools: ['AWS', 'Cloudflare', 'Google Analytics', 'Hotjar'],
    details: [
      { label: 'Team Size', value: '2-3 specialists' },
      { label: 'Client Involvement', value: 'High' }
    ],
    actions: [
      { label: 'Launch Checklist', type: 'secondary' }
    ],
    dependencies: ['testing']
  }
];

// ============================
// Main Component
// ============================

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  title = "Our Step-by-Step Process",
  subtitle = "A detailed breakdown of how we transform your vision into reality through our proven methodology.",
  steps = defaultSteps,
  className = '',
  showSummary = true,
  interactive = true,
  onStepClick,
  onActionClick
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  // Calculate summary statistics
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  const totalEstimatedHours = steps.reduce((sum, step) => sum + (step.estimatedHours || 0), 0);
  const completedHours = steps
    .filter(step => step.status === 'completed')
    .reduce((sum, step) => sum + (step.estimatedHours || 0), 0);

  const handleStepClick = (step: WorkflowStep) => {
    if (!interactive) return;
    
    if (expandedStep === step.id) {
      setExpandedStep(null);
    } else {
      setExpandedStep(step.id);
    }
    
    if (onStepClick) {
      onStepClick(step);
    }
  };

  const handleActionClick = (step: WorkflowStep, action: WorkflowStepAction) => {
    if (action.onClick) {
      action.onClick();
    } else if (action.href) {
      window.open(action.href, '_blank');
    }
    
    if (onActionClick) {
      onActionClick(step, action);
    }
  };

  const getStepStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'active': return 'In Progress';
      case 'pending': return 'Pending';
      case 'disabled': return 'Disabled';
      default: return 'Unknown';
    }
  };

  const renderStepDetails = (step: WorkflowStep) => {
    if (!step.details?.length) return null;

    return (
      <div className="workflow-step-details">
        {step.details.map((detail, index) => (
          <div key={index} className="workflow-step-detail">
            <div className="workflow-step-detail-label">{detail.label}</div>
            <div className="workflow-step-detail-value">{detail.value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderDeliverables = (deliverables: string[]) => {
    if (!deliverables.length) return null;

    return (
      <div className="workflow-step-deliverables">
        <div className="workflow-step-deliverables-title">Key Deliverables</div>
        <div className="workflow-step-deliverables-list">
          {deliverables.map((deliverable, index) => (
            <span key={index} className="workflow-step-deliverable">
              {deliverable}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderTools = (tools: string[]) => {
    if (!tools.length) return null;

    return (
      <div className="workflow-step-tools">
        <div className="workflow-step-tools-title">Tools & Technologies</div>
        <div className="workflow-step-tools-list">
          {tools.map((tool, index) => (
            <span key={index} className="workflow-step-tool">
              {tool}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderActions = (step: WorkflowStep) => {
    if (!step.actions?.length) return null;

    return (
      <div className="workflow-step-actions">
        {step.actions.map((action, index) => (
          <button
            key={index}
            className={`workflow-step-action workflow-step-action--${action.type}`}
            onClick={() => handleActionClick(step, action)}
          >
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  const renderStep = (step: WorkflowStep, index: number) => {
    const isExpanded = expandedStep === step.id;
    const stepClasses = [
      'workflow-step',
      `workflow-step--${step.status}`,
      isExpanded ? 'workflow-step--expanded' : ''
    ].filter(Boolean).join(' ');

    return (
      <div
        key={step.id}
        className={stepClasses}
        onClick={() => handleStepClick(step)}
      >
        <div className="workflow-step-marker">
          <div className="workflow-step-number">
            {step.status === 'completed' ? '✓' : index + 1}
          </div>
          {step.icon && (
            <div className="workflow-step-icon">
              <span role="img" aria-label={step.title}>{step.icon}</span>
            </div>
          )}
        </div>

        <div className="workflow-step-content">
          <div className="workflow-step-header">
            <h3 className="workflow-step-title">{step.title}</h3>
            <span className="workflow-step-duration">{step.duration}</span>
          </div>

          <p className="workflow-step-description">{step.description}</p>

          {isExpanded && (
            <>
              {renderStepDetails(step)}
              {renderDeliverables(step.deliverables)}
              {renderTools(step.tools)}
              {renderActions(step)}
            </>
          )}

          <div className="workflow-step-status">
            <div className="workflow-step-status-indicator" />
            <span className="workflow-step-status-text">
              {getStepStatusText(step.status)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    if (!showSummary) return null;

    const estimatedWeeks = Math.ceil(totalEstimatedHours / 40); // Assuming 40 hours per week
    const completedWeeks = Math.ceil(completedHours / 40);

    return (
      <div className="workflow-steps-summary">
        <div className="workflow-steps-summary-header">
          <h3 className="workflow-steps-summary-title">Project Overview</h3>
          <div className="workflow-steps-summary-stats">
            <div className="workflow-steps-summary-stat">
              <span className="workflow-steps-summary-stat-value">
                {completedSteps}/{totalSteps}
              </span>
              <span className="workflow-steps-summary-stat-label">Steps</span>
            </div>
            <div className="workflow-steps-summary-stat">
              <span className="workflow-steps-summary-stat-value">
                {Math.round(progressPercentage)}%
              </span>
              <span className="workflow-steps-summary-stat-label">Complete</span>
            </div>
            <div className="workflow-steps-summary-stat">
              <span className="workflow-steps-summary-stat-value">
                {estimatedWeeks}
              </span>
              <span className="workflow-steps-summary-stat-label">Est. Weeks</span>
            </div>
          </div>
        </div>

        <div className="workflow-steps-summary-progress">
          <div
            className="workflow-steps-summary-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="workflow-steps-summary-timeline">
          Estimated completion: {estimatedWeeks - completedWeeks} weeks remaining
        </div>
      </div>
    );
  };

  return (
    <section className={`workflow-steps ${className}`}>
      <div className="workflow-steps-header">
        <h2 className="workflow-steps-title">{title}</h2>
        {subtitle && (
          <p className="workflow-steps-subtitle">{subtitle}</p>
        )}
      </div>

      <div className="workflow-steps-container">
        <div className="workflow-steps-list">
          {steps.map(renderStep)}
        </div>
      </div>

      {renderSummary()}
    </section>
  );
};

export default WorkflowSteps;
export type { WorkflowStepsProps, WorkflowStep, WorkflowStepAction, WorkflowStepDetail };