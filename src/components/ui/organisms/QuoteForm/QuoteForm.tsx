"use client";

import React, { useState } from "react";
import QuoteFormProgress from "./QuoteFormProgress";
import InputField from "@/components/ui/atoms/Input/InputField";
import AlertMessage from "@/components/utils/AlertMessage/AlertMessage";
import { FaArrowRight, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
import "@/components/feature-modules/products-services/QuoteForm.css"; 

const QuoteForm: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        serviceType: "",
        additionalDetails: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const serviceOptions = [
        "SaaS Solutions",
        "Web Development",
        "Marketing Services",
        "Content Creation",
        "Other",
    ];

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
    };

    // Move to next step with validation
    const nextStep = () => {
        if (step === 1 && (!formData.fullName || !formData.email)) {
            setError("Please fill in your name and email.");
            return;
        }
        if (step === 2 && !formData.serviceType) {
            setError("Please select a service type.");
            return;
        }
        setStep(step + 1);
    };

    // Move to previous step
    const prevStep = () => setStep(step - 1);

    // Submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="quote-form">
            <h2 className="quote-form-title">Request a Custom Quote</h2>

            {/* ✅ Progress Bar */}
            <QuoteFormProgress step={step} totalSteps={3} />

            {submitted ? (
                <AlertMessage
                    type="success"
                    message="Thank you! We have received your request and will get back to you shortly."
                />
            ) : (
                <form onSubmit={handleSubmit} className="quote-form-body">
                    {error && <AlertMessage type="error" message={error} />}

                    {/* ✅ Step 1: Contact Details */}
                    {step === 1 && (
                        <div className="quote-form-group">
                            <InputField
                                label="Full Name"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <InputField
                                label="Phone Number (Optional)"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    {/* ✅ Step 2: Select Service */}
                    {step === 2 && (
                        <div className="quote-form-group">
                            <InputField
                                label="Select a Service"
                                name="serviceType"
                                type="text"
                                value={formData.serviceType}
                                onChange={handleChange}
                                placeholder="Choose a service..."
                                required
                            />
                        </div>
                    )}

                    {/* ✅ Step 3: Additional Details */}
                    {step === 3 && (
                        <div className="quote-form-group">
                            <InputField
                                label="Additional Details (Optional)"
                                name="additionalDetails"
                                type="text"
                                value={formData.additionalDetails}
                                onChange={handleChange}
                                placeholder="Describe your project requirements..."
                                textarea
                                rows={4}
                            />
                        </div>
                    )}

                    {/* ✅ Navigation Buttons */}
                    <div className="quote-form-actions">
                        {step > 1 && (
                            <button
                                type="button"
                                className="quote-form-back"
                                onClick={prevStep}
                            >
                                <FaArrowLeft /> Back
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                type="button"
                                className="quote-form-next"
                                onClick={nextStep}
                            >
                                Next <FaArrowRight />
                            </button>
                        ) : (
                            <button type="submit" className="quote-form-submit">
                                Submit <FaPaperPlane />
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default QuoteForm;
