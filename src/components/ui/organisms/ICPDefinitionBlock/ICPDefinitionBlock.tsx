// src/components/features/products-services/ICPDefinitionBlock/ICPDefinitionBlock.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import "./ICPDefinitionBlock.css";

// ============================
// TYPE DEFINITIONS
// ============================

export interface ICPCharacteristic {
  id: string;
  category: 'demographic' | 'psychographic' | 'behavioral' | 'technographic' | 'firmographic';
  label: string;
  value: string;
  description?: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ICPPersona {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  company: string;
  industry: string;
  companySize: string;
  location: string;
  description: string;
  characteristics: ICPCharacteristic[];
  painPoints: string[];
  goals: string[];
  challenges: string[];
  preferredChannels: string[];
  budget?: string;
  decisionMakingProcess: string;
  featured?: boolean;
}

export interface ICPDefinitionBlockProps {
  /** Main section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  /** Array of ICP personas */
  personas?: ICPPersona[];
  /** Display mode */
  mode?: 'overview' | 'detailed' | 'comparison' | 'interactive';
  /** Layout variant */
  layout?: 'cards' | 'tabs' | 'accordion' | 'carousel';
  /** Show persona avatars */
  showAvatars?: boolean;
  /** Show characteristics breakdown */
  showCharacteristics?: boolean;
  /** Show pain points */
  showPainPoints?: boolean;
  /** Show goals and challenges */
  showGoals?: boolean;
  /** Show action buttons */
  showActions?: boolean;
  /** Enable interactive features */
  interactive?: boolean;
  /** Custom persona click handler */
  onPersonaClick?: (persona: ICPPersona) => void;
  /** Custom characteristic click handler */
  onCharacteristicClick?: (characteristic: ICPCharacteristic) => void;
  /** Custom action handlers */
  onCreateICPClick?: () => void;
  onAnalyzeICPClick?: () => void;
  /** Custom CSS class name */
  className?: string;
}

// ============================
// UTILITY FUNCTIONS
// ============================

const getCategoryIcon = (category: ICPCharacteristic['category']): string => {
  const iconMap = {
    'demographic': '👥',
    'psychographic': '🧠',
    'behavioral': '📊',
    'technographic': '💻',
    'firmographic': '🏢'
  };
  return iconMap[category];
};

const getCategoryColor = (category: ICPCharacteristic['category']): string => {
  const colorMap = {
    'demographic': '#FF6B6B',
    'psychographic': '#4ECDC4',
    'behavioral': '#45B7D1',
    'technographic': '#96CEB4',
    'firmographic': '#FFEAA7'
  };
  return colorMap[category];
};

const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
  const colorMap = {
    'high': 'var(--color-danger, #D7263D)',
    'medium': 'var(--color-warning, #FFC107)',
    'low': 'var(--color-success, #28A745)'
  };
  return colorMap[priority];
};

const getCharacteristicIcon = (icon: string): string => {
  const iconMap: { [key: string]: string } = {
    'age': '🎂',
    'gender': '👤',
    'income': '💰',
    'education': '🎓',
    'location': '📍',
    'family': '👨‍👩‍👧‍👦',
    'lifestyle': '🌟',
    'values': '❤️',
    'interests': '🎯',
    'personality': '🎭',
    'purchase': '🛒',
    'usage': '📱',
    'loyalty': '🏆',
    'engagement': '💬',
    'devices': '📱',
    'software': '💻',
    'platforms': '🌐',
    'tech-savvy': '🤖',
    'company-size': '🏢',
    'revenue': '📈',
    'industry': '🏭',
    'role': '💼',
    'budget': '💵',
    'decision': '🤝',
    'timeline': '⏰',
    'process': '🔄'
  };
  return iconMap[icon] || '📊';
};

// ============================
// SAMPLE DATA
// ============================

const defaultPersonas: ICPPersona[] = [
  {
    id: 'startup-founder',
    name: 'Sarah Johnson',
    title: 'Startup Founder',
    company: 'TechStart Inc.',
    industry: 'Technology',
    companySize: '5-20 employees',
    location: 'San Francisco, CA',
    description: 'Early-stage startup founder looking to establish digital presence and scale operations efficiently.',
    characteristics: [
      {
        id: 'age-range',
        category: 'demographic',
        label: 'Age Range',
        value: '28-35 years',
        icon: 'age',
        priority: 'medium'
      },
      {
        id: 'tech-savvy',
        category: 'technographic',
        label: 'Tech Adoption',
        value: 'Early Adopter',
        icon: 'tech-savvy',
        priority: 'high'
      },
      {
        id: 'budget-conscious',
        category: 'behavioral',
        label: 'Budget Approach',
        value: 'Cost-conscious',
        icon: 'budget',
        priority: 'high'
      }
    ],
    painPoints: [
      'Limited budget for marketing and development',
      'Need to establish credibility quickly',
      'Lack of technical expertise in-house',
      'Time constraints with multiple responsibilities'
    ],
    goals: [
      'Launch MVP within 6 months',
      'Gain initial market traction',
      'Build scalable business processes',
      'Attract first round of funding'
    ],
    challenges: [
      'Competing with established players',
      'Finding product-market fit',
      'Building customer trust',
      'Managing limited resources'
    ],
    preferredChannels: ['LinkedIn', 'Industry Forums', 'Startup Events', 'Direct Referrals'],
    budget: '$5,000-$25,000',
    decisionMakingProcess: 'Quick decision maker, values ROI and efficiency',
    featured: true
  },
  {
    id: 'marketing-director',
    name: 'Michael Chen',
    title: 'Marketing Director',
    company: 'Growth Corp',
    industry: 'SaaS',
    companySize: '50-200 employees',
    location: 'Austin, TX',
    description: 'Experienced marketing professional focused on driving growth and optimizing marketing operations.',
    characteristics: [
      {
        id: 'experience',
        category: 'demographic',
        label: 'Experience',
        value: '8+ years',
        icon: 'role',
        priority: 'high'
      },
      {
        id: 'data-driven',
        category: 'psychographic',
        label: 'Decision Style',
        value: 'Data-driven',
        icon: 'personality',
        priority: 'high'
      },
      {
        id: 'growth-focused',
        category: 'behavioral',
        label: 'Focus Area',
        value: 'Growth & Performance',
        icon: 'engagement',
        priority: 'high'
      }
    ],
    painPoints: [
      'Measuring marketing ROI accurately',
      'Coordinating across multiple channels',
      'Proving marketing impact to leadership',
      'Managing increasing complexity'
    ],
    goals: [
      'Increase qualified leads by 40%',
      'Improve marketing attribution',
      'Streamline marketing operations',
      'Demonstrate clear ROI'
    ],
    challenges: [
      'Attribution across touchpoints',
      'Budget optimization',
      'Team productivity',
      'Technology integration'
    ],
    preferredChannels: ['Email', 'Professional Networks', 'Industry Reports', 'Webinars'],
    budget: '$25,000-$100,000',
    decisionMakingProcess: 'Thorough evaluation process, requires buy-in from team',
    featured: false
  }
];

// ============================
// MAIN COMPONENT
// ============================

export const ICPDefinitionBlock: React.FC<ICPDefinitionBlockProps> = ({
  title = "Our Ideal Customer Profiles",
  subtitle = "Understanding who we serve best helps us deliver exceptional value and build lasting partnerships.",
  personas = defaultPersonas,
  mode = 'detailed',
  layout = 'cards',
  showAvatars = true,
  showCharacteristics = true,
  showPainPoints = true,
  showGoals = true,
  showActions = true,
  interactive = true,
  onPersonaClick,
  onCharacteristicClick,
  onCreateICPClick,
  onAnalyzeICPClick,
  className = "",
}) => {
  // ============================
  // STATE MANAGEMENT
  // ============================
  
  const [activePersona, setActivePersona] = useState<string>(personas[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'overview' | 'characteristics' | 'insights'>('overview');
  const [expandedPersonas, setExpandedPersonas] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // ============================
  // EFFECTS
  // ============================
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // ============================
  // EVENT HANDLERS
  // ============================
  
  const handlePersonaClick = (persona: ICPPersona) => {
    if (layout === 'accordion') {
      const newExpanded = new Set(expandedPersonas);
      if (newExpanded.has(persona.id)) {
        newExpanded.delete(persona.id);
      } else {
        newExpanded.add(persona.id);
      }
      setExpandedPersonas(newExpanded);
    } else {
      setActivePersona(persona.id);
    }

    if (onPersonaClick) {
      onPersonaClick(persona);
    }
  };

  const handleCharacteristicClick = (characteristic: ICPCharacteristic) => {
    if (onCharacteristicClick) {
      onCharacteristicClick(characteristic);
    }
  };

  // ============================
  // RENDER HELPERS
  // ============================
  
  const renderHeader = () => (
    <div className="icp-header">
      <h2 className="icp-title">{title}</h2>
      <p className="icp-subtitle">{subtitle}</p>
      
      {showActions && (
        <div className="icp-actions">
          <button 
            className="action-btn primary"
            onClick={onCreateICPClick}
          >
            <span className="btn-icon">👥</span>
            <span className="btn-text">Create Your ICP</span>
          </button>
          <button 
            className="action-btn secondary"
            onClick={onAnalyzeICPClick}
          >
            <span className="btn-icon">📊</span>
            <span className="btn-text">Analyze Customer Data</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderPersonaCard = (persona: ICPPersona) => (
    <div
      key={persona.id}
      className={`
        persona-card
        ${persona.featured ? 'featured' : ''}
        ${activePersona === persona.id ? 'active' : ''}
        ${interactive ? 'interactive' : ''}
      `}
      onClick={() => handlePersonaClick(persona)}
    >
      {/* Featured Badge */}
      {persona.featured && (
        <div className="featured-badge">
          ⭐ Primary ICP
        </div>
      )}

      {/* Persona Header */}
      <div className="persona-header">
        {showAvatars && (
          <div className="persona-avatar">
            {persona.avatar ? (
              <img src={persona.avatar} alt={persona.name} />
            ) : (
              <div className="avatar-placeholder">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>
        )}
        
        <div className="persona-info">
          <h3 className="persona-name">{persona.name}</h3>
          <div className="persona-title">{persona.title}</div>
          <div className="persona-company">
            {persona.company} • {persona.industry}
          </div>
        </div>
      </div>

      {/* Persona Details */}
      <div className="persona-details">
        <div className="persona-meta">
          <div className="meta-item">
            <span className="meta-icon">🏢</span>
            <span className="meta-text">{persona.companySize}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📍</span>
            <span className="meta-text">{persona.location}</span>
          </div>
          {persona.budget && (
            <div className="meta-item">
              <span className="meta-icon">💰</span>
              <span className="meta-text">{persona.budget}</span>
            </div>
          )}
        </div>

        <p className="persona-description">{persona.description}</p>

        {/* Characteristics */}
        {showCharacteristics && (
          <div className="persona-characteristics">
            <h4 className="section-title">Key Characteristics</h4>
            <div className="characteristics-grid">
              {persona.characteristics.slice(0, 3).map((char) => (
                <div
                  key={char.id}
                  className="characteristic-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCharacteristicClick(char);
                  }}
                  style={{ borderColor: getCategoryColor(char.category) }}
                >
                  <div className="char-icon">
                    {getCharacteristicIcon(char.icon)}
                  </div>
                  <div className="char-content">
                    <div className="char-label">{char.label}</div>
                    <div className="char-value">{char.value}</div>
                  </div>
                  <div 
                    className="char-priority"
                    style={{ backgroundColor: getPriorityColor(char.priority) }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pain Points */}
        {showPainPoints && (
          <div className="persona-pain-points">
            <h4 className="section-title">Primary Pain Points</h4>
            <ul className="pain-points-list">
              {persona.painPoints.slice(0, 3).map((point, index) => (
                <li key={index} className="pain-point-item">
                  <span className="pain-icon">🔴</span>
                  <span className="pain-text">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Goals */}
        {showGoals && (
          <div className="persona-goals">
            <h4 className="section-title">Key Goals</h4>
            <ul className="goals-list">
              {persona.goals.slice(0, 3).map((goal, index) => (
                <li key={index} className="goal-item">
                  <span className="goal-icon">🎯</span>
                  <span className="goal-text">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decision Making */}
        <div className="persona-decision">
          <h4 className="section-title">Decision Making</h4>
          <p className="decision-text">{persona.decisionMakingProcess}</p>
        </div>

        {/* Preferred Channels */}
        <div className="persona-channels">
          <h4 className="section-title">Preferred Channels</h4>
          <div className="channels-tags">
            {persona.preferredChannels.slice(0, 4).map((channel, index) => (
              <span key={index} className="channel-tag">
                {channel}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabsLayout = () => {
    const activePersonaData = personas.find(p => p.id === activePersona);
    if (!activePersonaData) return null;

    return (
      <div className="icp-tabs-layout">
        {/* Tab Navigation */}
        <div className="tabs-nav">
          {personas.map((persona) => (
            <button
              key={persona.id}
              className={`tab-btn ${activePersona === persona.id ? 'active' : ''}`}
              onClick={() => setActivePersona(persona.id)}
            >
              {showAvatars && (
                <div className="tab-avatar">
                  {persona.avatar ? (
                    <img src={persona.avatar} alt={persona.name} />
                  ) : (
                    <div className="avatar-placeholder small">
                      {persona.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                </div>
              )}
              <div className="tab-info">
                <div className="tab-name">{persona.name}</div>
                <div className="tab-title">{persona.title}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {renderPersonaCard(activePersonaData)}
        </div>
      </div>
    );
  };

  const renderAccordionLayout = () => (
    <div className="icp-accordion-layout">
      {personas.map((persona) => (
        <div
          key={persona.id}
          className={`
            accordion-item
            ${expandedPersonas.has(persona.id) ? 'expanded' : ''}
            ${persona.featured ? 'featured' : ''}
          `}
        >
          <div 
            className="accordion-header"
            onClick={() => handlePersonaClick(persona)}
          >
            {showAvatars && (
              <div className="accordion-avatar">
                {persona.avatar ? (
                  <img src={persona.avatar} alt={persona.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {persona.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>
            )}
            
            <div className="accordion-info">
              <h3 className="accordion-name">{persona.name}</h3>
              <div className="accordion-meta">
                {persona.title} • {persona.company}
              </div>
            </div>
            
            <div className="accordion-toggle">
              <span className="toggle-icon">
                {expandedPersonas.has(persona.id) ? '▼' : '▶'}
              </span>
            </div>
          </div>

          {expandedPersonas.has(persona.id) && (
            <div className="accordion-content">
              {renderPersonaCard(persona)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderCardsLayout = () => (
    <div className="icp-cards-layout">
      <div className="personas-grid">
        {personas.map(renderPersonaCard)}
      </div>
    </div>
  );

  const renderInsights = () => (
    <div className="icp-insights">
      <h3 className="insights-title">ICP Analysis Insights</h3>
      
      <div className="insights-grid">
        <div className="insight-card">
          <div className="insight-icon">📊</div>
          <div className="insight-content">
            <h4>Market Segments</h4>
            <p>We serve {personas.length} distinct customer segments with varying needs and characteristics.</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h4>Primary Focus</h4>
            <p>Early-stage companies represent 60% of our ideal customer base.</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">💰</div>
          <div className="insight-content">
            <h4>Budget Range</h4>
            <p>Average project budget ranges from $5K to $100K depending on company stage.</p>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <h4>Growth Stage</h4>
            <p>Most valuable customers are in rapid growth phases seeking scalable solutions.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================
  // MAIN RENDER
  // ============================
  
  return (
    <section 
      ref={containerRef}
      className={`
        icp-definition-block
        mode-${mode}
        layout-${layout}
        ${isVisible ? 'visible' : ''}
        ${className}
      `}
    >
      {renderHeader()}
      
      {layout === 'tabs' && renderTabsLayout()}
      {layout === 'accordion' && renderAccordionLayout()}
      {layout === 'cards' && renderCardsLayout()}
      
      {mode === 'detailed' && renderInsights()}
      
      {/* Background decoration */}
      <div className="icp-bg-decoration"></div>
    </section>
  );
};

export default ICPDefinitionBlock;