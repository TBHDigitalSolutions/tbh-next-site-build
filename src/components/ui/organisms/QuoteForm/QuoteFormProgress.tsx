"use client";

import React from "react";
import "./QuoteFormProgress.css";

interface QuoteFormProgressProps {
    step: number;
    totalSteps: number;
}

const QuoteFormProgress: React.FC<QuoteFormProgressProps> = ({ step, totalSteps }) => {
    const progressPercentage = (step / totalSteps) * 100;

    return (
        <div className="quote-progress-container">
            {/* ✅ Step Labels */}
            <div className="quote-progress-steps">
                {Array.from({ length: totalSteps }, (_, index) => (
                    <span
                        key={index}
                        className={`quote-progress-step ${step > index ? "active-step" : ""}`}
                    >
                        Step {index + 1}
                    </span>
                ))}
            </div>

            {/* ✅ Progress Bar Container */}
            <div className="quote-progress-bar">
                <div
                    className="quote-progress-fill"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
    );
};

export default QuoteFormProgress;
