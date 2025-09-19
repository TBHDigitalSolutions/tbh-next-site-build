"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// ✅ Point at your Button component
import Button from "@/components/ui/atoms/Button/Button";
import "./ContactForm.css";

/** Zod schema */
const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email format"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+()\-\d\s]{7,}$/.test(val),
      "Please enter a valid phone number"
    ),
  inquiryType: z.enum(["website", "marketing", "content"], {
    errorMap: () => ({ message: "Please select an inquiry type" }),
  }),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
  // consent must be checked
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must consent to be contacted" }),
  }),
});

/** Infer TS type from schema */
type ContactFormInputs = z.infer<typeof schema>;

const ContactForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
    console.log("Form Submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="contactform" noValidate>
      <div className="contactform-wrapper">
        {/* Name */}
        <div className="contactform-group">
          <label htmlFor="name" className="contactform-label">
            Your Name
          </label>
          <input
            {...register("name")}
            id="name"
            className={`contactform-input ${
              errors.name ? "contactform-input-error" : ""
            }`}
            placeholder="John Doe"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="contactform-error">{errors.name.message}</p>
          )}
        </div>

        {/* Email & Phone */}
        <div className="contactform-row">
          {/* Email */}
          <div className="contactform-group contactform-half">
            <label htmlFor="email" className="contactform-label">
              Your Email
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              className={`contactform-input ${
                errors.email ? "contactform-input-error" : ""
              }`}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="contactform-error">{errors.email.message}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div className="contactform-group contactform-half">
            <label htmlFor="phone" className="contactform-label">
              Phone
            </label>
            <input
              {...register("phone")}
              id="phone"
              type="tel"
              className="contactform-input"
              placeholder="+1 (123) 456-7890"
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="contactform-error">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Inquiry Type */}
        <div className="contactform-group">
          <label htmlFor="inquiryType" className="contactform-label">
            Inquiry Type
          </label>
          <select
            {...register("inquiryType")}
            id="inquiryType"
            className={`contactform-select ${
              errors.inquiryType ? "contactform-input-error" : ""
            }`}
            aria-invalid={!!errors.inquiryType}
            defaultValue=""
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="website">Website Development</option>
            <option value="marketing">Digital Marketing</option>
            <option value="content">Content Creation</option>
          </select>
          {errors.inquiryType && (
            <p className="contactform-error">{errors.inquiryType.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="contactform-group">
          <label htmlFor="message" className="contactform-label">
            Your Message
          </label>
          <textarea
            {...register("message")}
            id="message"
            className={`contactform-textarea ${
              errors.message ? "contactform-input-error" : ""
            }`}
            placeholder="Type your message here..."
            rows={4}
            aria-invalid={!!errors.message}
          />
          {errors.message && (
            <p className="contactform-error">{errors.message.message}</p>
          )}
        </div>

        {/* Consent */}
        <div className="contactform-group contactform-checkbox">
          <input
            {...register("consent")}
            type="checkbox"
            id="consent"
            className="contactform-checkbox-input"
            aria-invalid={!!errors.consent}
          />
          <label htmlFor="consent" className="contactform-checkbox-label">
            I consent to be contacted.
          </label>
          {errors.consent && (
            <p className="contactform-error">{errors.consent.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="contactform-button-container">
          <Button
            type="submit"
            variant="primary"
            size="large"
            className="contactform-button"
          >
            Send Message
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;
