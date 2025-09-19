// src/components/features/products-services/AuditTeaser/AuditTeaser.tsx

"use client";

import React, { useState, useEffect } from "react";
import "./AuditTeaser.css";

// ============================
// TYPE DEFINITIONS
// ============================

export interface AuditService {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  timeframe: string;
  price?: string;
  featured?: boolean;
}

export interface AuditResult {
  category: string;
  score: number;
  maxScore: number;
  issues: number;
  color: 'success' | 'warning' | 'danger';
}

export interface AuditTeaserProps {
  /** Main heading for the section */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Call-to-action text */
  ctaText?: string;
  /** Secondary CTA text */
  secondaryCTAText?: string;
  /** Available audit services */
  services?: AuditService[];
  /** Sample audit results for demo */
  sampleResults?: AuditResult[];
  /** Show demo results */
  showDemo?: boolean;
  /** Show pricing */
  showPricing?: boolean;
  /** Show urgency indicators */
  showUrgency?: boolean;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'detailed' | 'hero';
  /** Background style */
  background?: 'gradient' | 'dark' | 'pattern';
  /** Custom onClick handlers */
  onCTAClick?: () => void;
  onSecondaryCTAClick?: () => void;
  onServiceClick?: (service: AuditService) => void;
  /** Custom CSS class name */
  className?: string;
}

// ============================
// UTILITY FUNCTIONS
// ============================

const getAuditIcon = (icon: string): string => {
  const iconMap: { [key: string]: string } = {
    'website': '🌐',
    'seo': '🔍',
    'performance': '⚡',
    'security': '🔒',
    'accessibility': '♿',
    'mobile': '📱',
    'analytics': '📊',
    'conversion': '💹',
    'content': '📝',
    'technical': '⚙️',
    'design': '🎨',
    'ux': '👤',
    'code': '💻',
    'infrastructure': '🏗️',
    'database': '🗄️',
    'api': '🔗',
    'compliance': '📋',
    'gdpr': '🛡️',
    'speed': '🚀',
    'uptime': '📈',
    'backup': '💾',
    'monitoring': '👁️',
    'social': '📱',
    'email': '📧',
    'ppc': '💰',
    'brand': '🏆',
    'competitor': '🎯',
    'market': '📈',
    'audit': '🔍',
    'report': '📊',
    'analysis': '🧪',
    'optimization': '⚡',
    'improvement': '📈',
    'fix': '🔧',
    'warning': '⚠️',
    'error': '❌',
    'success': '✅',
    'info': 'ℹ️'
  };
  return iconMap[icon] || '🔍';
};

const getScoreColor = (score: number, maxScore: number): 'success' | 'warning' | 'danger' => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'success';
  if (percentage >= 60) return 'warning';
  return 'danger';
};

const getScoreGrade = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
};

const formatPrice = (price: string): { currency: string; amount: string; period?: string } => {
  const match = price.match(/(\$|€|£)?(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/(month|week|year|project))?/i);
  if (match) {
    return {
      currency: match[1] || '$',
      amount: match[2],
      period: match[3]
    };
  }
  return { currency: '$', amount: price };
};

// ============================
// SAMPLE DATA
// ============================

const defaultServices: AuditService[] = [
  {
    id: 'website-audit',
    title: 'Complete Website Audit',
    description: 'Comprehensive analysis of your website\'s performance, SEO, security, and user experience.',
    icon: 'website',
    features: ['SEO Analysis', 'Performance Check', 'Security Scan', 'Mobile Optimization', 'Accessibility Review'],
    timeframe: '3-5 business days',
    price: '$299',
    featured: true
  },
  {
    id: 'seo-audit',
    title: 'SEO Deep Dive Audit',
    description: 'In-depth SEO analysis to identify opportunities for improved search rankings.',
    icon: 'seo',
    features: ['Keyword Analysis', 'Technical SEO', 'Content Review', 'Backlink Analysis', 'Competitor Research'],
    timeframe: '2-3 business days',
    price: '$199'
  },
  {
    id: 'security-audit',
    title: 'Security Vulnerability Audit',
    description: 'Thorough security assessment to identify and fix potential vulnerabilities.',
    icon: 'security',
    features: ['Vulnerability Scan', 'Code Review', 'Access Control Check', 'Data Protection', 'Compliance Review'],
    timeframe: '1-2 business days',
    price: '$399'
  }
];

const defaultSampleResults: AuditResult[] = [
  { category: 'SEO', score: 72, maxScore: 100, issues: 8, color: 'warning' },
  { category: 'Performance', score: 45, maxScore: 100, issues: 15, color: 'danger' },
  { category: 'Security', score: 88, maxScore: 100, issues: 3, color: 'success' },
  { category: 'Accessibility', score: 91, maxScore: 100, issues: 2, color: 'success' },
  { category: 'Mobile', score: 67, maxScore: 100, issues: 12, color: 'warning' }
];

// ============================
// MAIN COMPONENT
// ============================

export const AuditTeaser: React.FC<AuditTeaserProps> = ({
  title = "Discover What's Holding Your Website Back",
  subtitle = "Get a comprehensive audit and unlock your website's full potential with actionable insights and optimization recommendations.",
  ctaText = "Get Your Free Audit",
  secondaryCTAText = "View Sample Report",
  services = defaultServices,
  sampleResults = defaultSampleResults,
  showDemo = true,
  showPricing = true,
  showUrgency = true,
  variant = 'default',
  background = 'gradient',
  onCTAClick,
  onSecondaryCTAClick,
  onServiceClick,
  className = "",
}) => {
  // ============================
  // STATE MANAGEMENT
  // ============================
  
  const [activeService, setActiveService] = useState<string>(services[0]?.id || '');
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(0);

  // ============================
  // EFFECTS
  // ============================
  
  useEffect(() => {
    setIsAnimated(true);
  }, []);

  useEffect(() => {
    if (showDemo && sampleResults.length > 1) {
      const interval = setInterval(() => {
        setCurrentResultIndex((prev) => (prev + 1) % sampleResults.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showDemo, sampleResults.length]);

  // ============================
  // EVENT HANDLERS
  // ============================
  
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      // Default behavior - could open modal, navigate, etc.
      console.log('Primary CTA clicked - Get Audit');
    }
  };

  const handleSecondaryCTAClick = () => {
    if (onSecondaryCTAClick) {
      onSecondaryCTAClick();
    } else {
      // Default behavior
      console.log('Secondary CTA clicked - View Sample');
    }
  };

  const handleServiceClick = (service: AuditService) => {
    setActiveService(service.id);
    if (onServiceClick) {
      onServiceClick(service);
    }
  };

  // ============================
  // RENDER HELPERS
  // ============================
  
  const renderHeader = () => (
    <div className="audit-header">
      <h2 className="audit-title">{title}</h2>
      <p className="audit-subtitle">{subtitle}</p>
      
      {showUrgency && (
        <div className="urgency-banner">
          <span className="urgency-icon">⚡</span>
          <span className="urgency-text">Limited Time: Free audit for the first 50 websites this month!</span>
          <span className="urgency-countdown">27 spots remaining</span>
        </div>
      )}
    </div>
  );

  const renderDemo = () => {
    if (!showDemo) return null;

    const currentResult = sampleResults[currentResultIndex];
    if (!currentResult) return null;

    return (
      <div className="audit-demo">
        <h3 className="demo-title">See What You'll Get</h3>
        <div className="demo-preview">
          <div className="demo-score-card">
            <div className="score-category">{currentResult.category} Analysis</div>
            <div className={`score-display ${currentResult.color}`}>
              <div className="score-number">{currentResult.score}</div>
              <div className="score-max">/{currentResult.maxScore}</div>
              <div className="score-grade">{getScoreGrade(currentResult.score, currentResult.maxScore)}</div>
            </div>
            <div className="score-issues">
              {currentResult.issues} issues found
            </div>
            <div className="score-bar">
              <div 
                className={`score-fill ${currentResult.color}`}
                style={{ width: `${(currentResult.score / currentResult.maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="demo-insights">
            <h4>Key Insights:</h4>
            <ul>
              <li>🔍 Detailed analysis of {currentResult.category.toLowerCase()} performance</li>
              <li>📊 Benchmarking against industry standards</li>
              <li>🎯 Prioritized action items for improvement</li>
              <li>📈 Projected impact of recommended changes</li>
            </ul>
          </div>
        </div>
        
        <div className="demo-indicators">
          {sampleResults.map((_, index) => (
            <button
              key={index}
              className={`demo-indicator ${index === currentResultIndex ? 'active' : ''}`}
              onClick={() => setCurrentResultIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderServices = () => (
    <div className="audit-services">
      <h3 className="services-title">Choose Your Audit Type</h3>
      <div className="services-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`
              service-card 
              ${service.featured ? 'featured' : ''}
              ${activeService === service.id ? 'active' : ''}
            `}
            onClick={() => handleServiceClick(service)}
          >
            {service.featured && (
              <div className="featured-badge">
                ⭐ Most Popular
              </div>
            )}
            
            <div className="service-icon">
              {getAuditIcon(service.icon)}
            </div>
            
            <h4 className="service-title">{service.title}</h4>
            <p className="service-description">{service.description}</p>
            
            <div className="service-features">
              {service.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">✅</span>
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
              {service.features.length > 3 && (
                <div className="feature-more">
                  +{service.features.length - 3} more features
                </div>
              )}
            </div>
            
            <div className="service-meta">
              <div className="service-timeframe">
                <span className="meta-icon">⏱️</span>
                <span className="meta-text">{service.timeframe}</span>
              </div>
              
              {showPricing && service.price && (
                <div className="service-price">
                  {(() => {
                    const { currency, amount, period } = formatPrice(service.price);
                    return (
                      <>
                        <span className="price-currency">{currency}</span>
                        <span className="price-amount">{amount}</span>
                        {period && <span className="price-period">/{period}</span>}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            
            <button className="service-select-btn">
              {activeService === service.id ? 'Selected' : 'Select This Audit'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCTAs = () => (
    <div className="audit-ctas">
      <button 
        className="cta-button primary"
        onClick={handleCTAClick}
      >
        <span className="cta-icon">🚀</span>
        <span className="cta-text">{ctaText}</span>
      </button>
      
      <button 
        className="cta-button secondary"
        onClick={handleSecondaryCTAClick}
      >
        <span className="cta-icon">📊</span>
        <span className="cta-text">{secondaryCTAText}</span>
      </button>
      
      <div className="cta-guarantee">
        <span className="guarantee-icon">🛡️</span>
        <span className="guarantee-text">100% actionable insights guaranteed</span>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="audit-stats">
      <div className="stat-item">
        <div className="stat-number">500+</div>
        <div className="stat-label">Audits Completed</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">98%</div>
        <div className="stat-label">Client Satisfaction</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">48hrs</div>
        <div className="stat-label">Average Delivery</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">150+</div>
        <div className="stat-label">Issues Identified</div>
      </div>
    </div>
  );

  const renderBenefits = () => (
    <div className="audit-benefits">
      <h3 className="benefits-title">Why Choose Our Audit?</h3>
      <div className="benefits-grid">
        <div className="benefit-item">
          <div className="benefit-icon">🎯</div>
          <h4 className="benefit-title">Actionable Insights</h4>
          <p className="benefit-description">Get specific, prioritized recommendations you can implement immediately.</p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">👥</div>
          <h4 className="benefit-title">Expert Analysis</h4>
          <p className="benefit-description">Our certified specialists review every aspect of your digital presence.</p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">📈</div>
          <h4 className="benefit-title">Proven Results</h4>
          <p className="benefit-description">Clients see average improvements of 40% in key metrics within 90 days.</p>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon">🚀</div>
          <h4 className="benefit-title">Fast Delivery</h4>
          <p className="benefit-description">Comprehensive audit report delivered within 48-72 hours.</p>
        </div>
      </div>
    </div>
  );

  // ============================
  // MAIN RENDER
  // ============================
  
  return (
    <section 
      className={`
        audit-teaser
        variant-${variant}
        background-${background}
        ${isAnimated ? 'animated' : ''}
        ${className}
      `}
    >
      {renderHeader()}
      
      {variant === 'hero' && renderStats()}
      
      {renderDemo()}
      
      {variant !== 'compact' && renderServices()}
      
      {renderBenefits()}
      
      {renderCTAs()}
      
      {/* Background decoration */}
      <div className="audit-bg-decoration"></div>
      
      {/* Floating elements for visual interest */}
      <div className="floating-elements">
        <div className="floating-icon icon-1">🔍</div>
        <div className="floating-icon icon-2">📊</div>
        <div className="floating-icon icon-3">⚡</div>
        <div className="floating-icon icon-4">🎯</div>
      </div>
    </section>
  );
};

export default AuditTeaser;