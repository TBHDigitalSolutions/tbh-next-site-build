"use client";

import React from "react";

interface InputFieldProps {
    label: string;
    type: string;
    name: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    textarea?: boolean; // ✅ Supports both input & textarea
    rows?: number; // ✅ Used for textarea
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    type,
    name,
    value,
    onChange,
    placeholder = "",
    required = false,
    error = "",
    textarea = false,
    rows = 3,
}) => {
    return (
        <div className="input-field">
            {/* ✅ Label */}
            <label htmlFor={name} className="input-label">
                {label} {required && <span className="input-required">*</span>}
            </label>

            {/* ✅ Input or Textarea */}
            {textarea ? (
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`input-element ${error ? "input-error" : ""}`}
                    rows={rows}
                />
            ) : (
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`input-element ${error ? "input-error" : ""}`}
                />
            )}

            {/* ✅ Error Message */}
            {error && <p className="input-error-message">{error}</p>}
        </div>
    );
};

export default InputField;
