// shared-ui/components/form/StatsHighlight.tsx

"use client";

import React, { useEffect, useState } from "react";

// ✅ Use a relative import to pull in the shared‑UI Divider
import Divider from "@/components/core/layout/Divider/Divider";

import "./StatsHighlight.css";
import * as FaIcons from "react-icons/fa";
import * as HiIcons from "react-icons/hi2";
import * as BsIcons from "react-icons/bs"; 

// ✅ Type Definition for Props
interface StatItem {
  id: number;
  label: string;
  value: string;
  description: string;
  icon: string;
}

interface StatsHighlightProps {
  stats: StatItem[];
}

// ✅ Dynamic Icon Resolver
const getIconComponent = (iconName: string) => {
  return FaIcons[iconName] || HiIcons[iconName] || BsIcons[iconName] || null;
};

const StatsHighlight: React.FC<StatsHighlightProps> = ({ stats }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(".stats-highlight");
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
          setIsVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial run

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="stats-highlight">
      <div className="stats-highlight-container">
        {/* ✅ Stats Grid */}
        <div className={`stats-highlight-grid ${isVisible ? "animate" : ""}`}>
          {stats.map((stat, index) => {
            const Icon = getIconComponent(stat.icon);
            return (
              <div
                key={stat.id}
                className="stats-highlight-item"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* ✅ Icon */}
                {Icon && (
                  <div className="stats-highlight-icon-wrapper">
                    <Icon className="stats-highlight-icon" aria-hidden="true" />
                  </div>
                )}

                {/* ✅ Value */}
                <span className="stats-highlight-value">{stat.value}</span>

                {/* ✅ Label */}
                <p className="stats-highlight-label">{stat.label}</p>

                {/* ✅ Divider Below Label (Animated Disappear & Reappear) */}
                <Divider className="stats-highlight-divider hover-effect" />

                {/* ✅ Description */}
                <p className="stats-highlight-description">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsHighlight;
