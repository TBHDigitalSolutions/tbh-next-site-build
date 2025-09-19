// shared-ui/components/ui/ErrorFallback.tsx
import React from "react";

interface ErrorFallbackProps {
  children: React.ReactNode;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  children,
  className = "" 
}) => {
  return (
    <div 
      className={`error-fallback ${className}`}
      role="alert"
      aria-live="polite"
    >
      {children}
    </div>
  );
};

export default ErrorFallback;