"use client";

import React, { useState, useEffect, useRef } from 'react';
import './WorkflowDiagram.css';

// ============================
// TypeScript Interfaces
// ============================

interface WorkflowNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration?: string;
  status: 'pending' | 'active' | 'completed';
  position?: { x: number; y: number }; // For circular layout
  connections?: string[]; // IDs of connected nodes
}

interface WorkflowConnection {
  from: string;
  to: string;
  type?: 'straight' | 'curved' | 'dashed';
}

interface WorkflowDiagramProps {
  title?: string;
  subtitle?: string;
  nodes: WorkflowNode[];
  connections?: WorkflowConnection[];
  layout?: 'horizontal' | 'vertical' | 'circular';
  className?: string;
  showProgress?: boolean;
  animated?: boolean;
  interactive?: boolean;
  centralNode?: {
    title: string;
    icon: string;
  };
  onNodeClick?: (node: WorkflowNode) => void;
}

// ============================
// Default Data
// ============================

const defaultNodes: WorkflowNode[] = [
  {
    id: 'discovery',
    title: 'Discovery',
    description: 'Research and analysis of your business needs',
    icon: '🔍',
    duration: '1-2 weeks',
    status: 'completed'
  },
  {
    id: 'strategy',
    title: 'Strategy',
    description: 'Develop comprehensive digital strategy',
    icon: '📋',
    duration: '1 week',
    status: 'completed'
  },
  {
    id: 'design',
    title: 'Design',
    description: 'Create wireframes and visual designs',
    icon: '🎨',
    duration: '2-3 weeks',
    status: 'active'
  },
  {
    id: 'development',
    title: 'Development',
    description: 'Build your digital solution',
    icon: '⚙️',
    duration: '4-6 weeks',
    status: 'pending'
  },
  {
    id: 'testing',
    title: 'Testing',
    description: 'Quality assurance and optimization',
    icon: '🧪',
    duration: '1-2 weeks',
    status: 'pending'
  },
  {
    id: 'launch',
    title: 'Launch',
    description: 'Deploy and go live',
    icon: '🚀',
    duration: '1 week',
    status: 'pending'
  }
];

const defaultConnections: WorkflowConnection[] = [
  { from: 'discovery', to: 'strategy' },
  { from: 'strategy', to: 'design' },
  { from: 'design', to: 'development' },
  { from: 'development', to: 'testing' },
  { from: 'testing', to: 'launch' }
];

// ============================
// Helper Functions
// ============================

const calculateCircularPositions = (nodes: WorkflowNode[], centerX: number, centerY: number, radius: number) => {
  const angleStep = (2 * Math.PI) / nodes.length;
  return nodes.map((node, index) => ({
    ...node,
    position: {
      x: centerX + radius * Math.cos(index * angleStep - Math.PI / 2),
      y: centerY + radius * Math.sin(index * angleStep - Math.PI / 2)
    }
  }));
};

const createSVGPath = (from: { x: number; y: number }, to: { x: number; y: number }, type: string = 'curved') => {
  if (type === 'straight') {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  }
  
  // Curved path
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offsetY = Math.abs(to.x - from.x) * 0.3;
  
  return `M ${from.x} ${from.y} Q ${midX} ${midY - offsetY} ${to.x} ${to.y}`;
};

// ============================
// Main Component
// ============================

const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  title = "Our Proven Workflow",
  subtitle = "A systematic approach that ensures exceptional results and seamless project delivery.",
  nodes = defaultNodes,
  connections = defaultConnections,
  layout = 'horizontal',
  className = '',
  showProgress = true,
  animated = true,
  interactive = true,
  centralNode,
  onNodeClick
}) => {
  const [processedNodes, setProcessedNodes] = useState<WorkflowNode[]>(nodes);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Calculate progress
  const completedNodes = nodes.filter(node => node.status === 'completed').length;
  const totalNodes = nodes.length;
  const progressPercentage = (completedNodes / totalNodes) * 100;

  // Update node positions for circular layout
  useEffect(() => {
    if (layout === 'circular' && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const radius = Math.min(rect.width, rect.height) * 0.35;
      
      setSvgDimensions({ width: rect.width, height: rect.height });
      setProcessedNodes(calculateCircularPositions(nodes, centerX, centerY, radius));
    } else {
      setProcessedNodes(nodes);
    }
  }, [layout, nodes]);

  // Handle window resize for circular layout
  useEffect(() => {
    const handleResize = () => {
      if (layout === 'circular' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(rect.width, rect.height) * 0.35;
        
        setSvgDimensions({ width: rect.width, height: rect.height });
        setProcessedNodes(calculateCircularPositions(nodes, centerX, centerY, radius));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, nodes]);

  const handleNodeClick = (node: WorkflowNode) => {
    if (interactive && onNodeClick) {
      onNodeClick(node);
    }
  };

  const renderNode = (node: WorkflowNode, index: number) => {
    const nodeClasses = [
      'workflow-node',
      `workflow-node--${node.status}`,
      layout === 'circular' ? 'workflow-node--circular' : ''
    ].filter(Boolean).join(' ');

    const nodeStyle = layout === 'circular' && node.position ? {
      left: `${node.position.x - 90}px`,
      top: `${node.position.y - 90}px`
    } : {};

    return (
      <div
        key={node.id}
        className={nodeClasses}
        style={{
          ...nodeStyle,
          animationDelay: animated ? `${index * 0.2}s` : '0s'
        }}
        onClick={() => handleNodeClick(node)}
      >
        <div className="workflow-node-status" />
        <div className="workflow-node-icon">
          <span role="img" aria-label={node.title}>{node.icon}</span>
          <div className="workflow-node-number">{index + 1}</div>
        </div>
        <h3 className="workflow-node-title">{node.title}</h3>
        <p className="workflow-node-description">{node.description}</p>
        {node.duration && (
          <span className="workflow-node-duration">{node.duration}</span>
        )}
      </div>
    );
  };

  const renderConnections = () => {
    if (layout === 'circular' && processedNodes[0]?.position) {
      return (
        <svg
          className="workflow-connection"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
          width={svgDimensions.width}
          height={svgDimensions.height}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                className="workflow-connection-arrow"
                points="0 0, 10 3.5, 0 7"
              />
            </marker>
          </defs>
          
          {connections.map((connection, index) => {
            const fromNode = processedNodes.find(n => n.id === connection.from);
            const toNode = processedNodes.find(n => n.id === connection.to);
            
            if (!fromNode?.position || !toNode?.position) return null;
            
            const path = createSVGPath(fromNode.position, toNode.position, connection.type);
            const isCompleted = fromNode.status === 'completed' && toNode.status !== 'pending';
            
            return (
              <path
                key={`${connection.from}-${connection.to}`}
                className={`workflow-connection-line ${isCompleted ? 'workflow-connection--completed' : ''}`}
                d={path}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </svg>
      );
    }
    
    return null;
  };

  const renderCentralNode = () => {
    if (layout === 'circular' && centralNode) {
      return (
        <div className="workflow-central-node">
          <div className="workflow-central-icon">
            {centralNode.icon}
          </div>
          <div className="workflow-central-title">
            {centralNode.title}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <div className="workflow-progress">
        <div className="workflow-progress-header">
          <h3 className="workflow-progress-title">Project Progress</h3>
          <span className="workflow-progress-percentage">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="workflow-progress-bar">
          <div 
            className="workflow-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="workflow-progress-steps">
          {processedNodes.map((node, index) => (
            <div
              key={node.id}
              className={`workflow-progress-step workflow-progress-step--${node.status}`}
            >
              {node.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className={`workflow-diagram workflow-diagram--${layout} ${className}`}>
      <div className="workflow-diagram-header">
        <h2 className="workflow-diagram-title">{title}</h2>
        {subtitle && (
          <p className="workflow-diagram-subtitle">{subtitle}</p>
        )}
      </div>

      <div 
        ref={containerRef}
        className="workflow-diagram-container"
      >
        {renderConnections()}
        
        <div className="workflow-diagram-grid">
          {processedNodes.map(renderNode)}
        </div>
        
        {renderCentralNode()}
      </div>

      {renderProgress()}
    </section>
  );
};

export default WorkflowDiagram;
export type { WorkflowDiagramProps, WorkflowNode, WorkflowConnection };