"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "./CTAForm.css";

// ✅ Zod schema
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
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
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// ✅ Infer form type from schema
type CTAFormInputs = z.infer<typeof schema>;

const CTAForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CTAFormInputs>({
    resolver: zodResolver(schema), // << use zodResolver
    mode: "onTouched",
  });

  const onSubmit: SubmitHandler<CTAFormInputs> = (data) => {
    console.log("Form Submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="cta-form" noValidate>
      <div className="cta-form-wrapper">
        {/* Name */}
        <div className="cta-form-group">
          <label htmlFor="name" className="cta-form-label">Your Name</label>
          <input
            {...register("name")}
            id="name"
            className={`cta-form-input ${errors.name ? "cta-form-input-error" : ""}`}
            placeholder="John Doe"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="cta-form-error">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="cta-form-group">
          <label htmlFor="email" className="cta-form-label">Your Email</label>
          <input
            {...register("email")}
            id="email"
            type="email"
            className={`cta-form-input ${errors.email ? "cta-form-input-error" : ""}`}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="cta-form-error">{errors.email.message}</p>}
        </div>

        {/* Phone (optional) */}
        <div className="cta-form-group">
          <label htmlFor="phone" className="cta-form-label">Phone (Optional)</label>
          <input
            {...register("phone")}
            id="phone"
            type="tel"
            className="cta-form-input"
            placeholder="+1 (123) 456-7890"
          />
          {errors.phone && <p className="cta-form-error">{errors.phone.message}</p>}
        </div>

        {/* Inquiry Type */}
        <div className="cta-form-group">
          <label htmlFor="inquiryType" className="cta-form-label">Inquiry Type</label>
          <select
            {...register("inquiryType")}
            id="inquiryType"
            className={`cta-form-select ${errors.inquiryType ? "cta-form-input-error" : ""}`}
            aria-invalid={!!errors.inquiryType}
            defaultValue=""
          >
            <option value="" disabled>Select an option</option>
            <option value="website">Website Development</option>
            <option value="marketing">Digital Marketing</option>
            <option value="content">Content Creation</option>
          </select>
          {errors.inquiryType && <p className="cta-form-error">{errors.inquiryType.message}</p>}
        </div>

        {/* Message */}
        <div className="cta-form-group">
          <label htmlFor="message" className="cta-form-label">Your Message</label>
          <textarea
            {...register("message")}
            id="message"
            className={`cta-form-textarea ${errors.message ? "cta-form-input-error" : ""}`}
            placeholder="Type your message here..."
            aria-invalid={!!errors.message}
          />
          {errors.message && <p className="cta-form-error">{errors.message.message}</p>}
        </div>

        {/* Submit */}
        <div className="cta-form-button-container">
          <button type="submit" className="cta-form-button">Send Message</button>
        </div>
      </div>
    </form>
  );
};

export default CTAForm;
