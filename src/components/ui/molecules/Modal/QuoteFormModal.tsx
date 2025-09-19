"use client";

import React, { useState } from "react";
// ✅ Pull in the progress indicator from shared‑UI
import QuoteFormProgress from "@/components/ui/organisms/QuoteForm/QuoteFormProgress";
// ✅ Pull in the InputField from shared‑UI
import InputField from "@/components/ui/atoms/Input/InputField";
// ✅ Pull in the AlertMessage from shared‑UI
import AlertMessage from "@/components/utils/AlertMessage/AlertMessage";
// ✅ Pull in the Modal wrapper from shared‑UI
import Modal from "@/components/ui/molecules/Modal/Modal";

import { FaTimes, FaArrowRight, FaArrowLeft, FaPaperPlane } from "react-icons/fa";
// ✅ Import this component’s CSS from its own folder
import "./QuoteFormModal.css";

interface QuoteFormModalProps {
  isOpen: boolean;
  onClose: () => void; 
}

const QuoteFormModal: React.FC<QuoteFormModalProps> = ({ isOpen, onClose }) => {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="quote-form-modal">
        <button onClick={onClose} className="quote-form-close">
          <FaTimes size={20} />
        </button>

        <h2 className="quote-form-modal-title">Request a Custom Quote</h2>

        <QuoteFormProgress step={step} totalSteps={3} />

        {submitted ? (
          <AlertMessage
            type="success"
            message="Thank you! We have received your request and will get back to you shortly."
          />
        ) : (
          <form className="quote-form-modal-body">
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
          </form>
        )}
      </div>
    </Modal>
  );
};

export default QuoteFormModal;
