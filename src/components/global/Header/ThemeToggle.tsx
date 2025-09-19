// src/components/core/navigation/Header/ThemeToggle.tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';

// ✅ Fixed import path - using correct @ path based on directory structure
import { useTheme } from '@/providers/ThemeProvider';

// ✅ Local styles
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={24} className="theme-icon" />
      ) : (
        <Sun size={24} className="theme-icon" />
      )}
    </button>
  );
};

export default ThemeToggle;