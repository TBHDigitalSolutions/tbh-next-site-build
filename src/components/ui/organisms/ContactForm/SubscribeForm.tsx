// shared-ui/components/form/SubscribeForm..tsx

"use client";

import React, { useState } from "react";
import "./SubscribeForm.css";

interface SubscribeFormProps {
  onSubmit?: (email: string) => Promise<void>;
  placeholder?: string;
  buttonLabel?: string; 
  successMsg?: string;
  errorMsg?: string;
  className?: string;
}

export const SubscribeForm: React.FC<SubscribeFormProps> = ({
  onSubmit,
  placeholder = "Your email address",
  buttonLabel = "Subscribe",
  successMsg = "Thanks for subscribing!",
  errorMsg = "Something went wrong. Please try again.",
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Simulated fallback
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setStatus("success");
      setMessage(successMsg);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(errorMsg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`subscribe-form ${className}`}
      aria-label="Subscribe to newsletter"
    >
      <label htmlFor="email" className="sr-only">
        Email address
      </label>

      <input
        id="email"
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="subscribe-input"
        required
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="subscribe-button"
      >
        {status === "loading" ? "Subscribing..." : buttonLabel}
      </button>

      {message && (
        <p
          className={`subscribe-message ${
            status === "error" ? "error" : "success"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default SubscribeForm;
