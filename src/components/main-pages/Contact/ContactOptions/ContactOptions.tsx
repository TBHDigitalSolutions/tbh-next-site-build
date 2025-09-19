"use client";

import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import SocialIcons from "@/components/ui/atoms/Icon/SocialIcons";
import "./ContactOptions.css";
 
const ContactOptions: React.FC = () => {
    return (
        <section className="contactoptions">
            {/* ✅ Section Heading */}
            <h2 className="contactoptions-title">Contact Information</h2>

            <div className="contactoptions-container">
                {/* 📍 Left Column - Location & Business Hours */}
                <div className="contactoptions-left">
                    <div className="contactoptions-item">
                        <FaMapMarkerAlt className="contactoptions-icon" />
                        <p>
                            <strong>Headquarters:</strong> St. Louis, MO
                        </p>
                    </div>

                    <div className="contactoptions-item">
                        <FaClock className="contactoptions-icon" />
                        <div>
                            <strong>Business Hours:</strong>
                            <ul className="contactoptions-hours">
                                <li>Monday–Friday: <strong>9:00 AM – 6:00 PM CST</strong></li>
                                <li>Saturday: <strong>10:00 AM – 2:00 PM CST</strong></li>
                                <li>Sunday: <strong>Closed</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 📞 Right Column - Contact Methods & Social Media */}
                <div className="contactoptions-right">
                    <h3 className="contactoptions-subtitle">Get in Touch</h3>
                    <div className="contactoptions-methods">
                        <a href="tel:+13145161866" className="contactoptions-link" aria-label="Call TBH Digital Solutions">
                            <FaPhone className="contactoptions-icon accent-icon" /> (314) 516-1866
                        </a>
                        <a href="mailto:contact@tbhdigitalsolutions.com" className="contactoptions-link" aria-label="Email TBH Digital Solutions">
                            <FaEnvelope className="contactoptions-icon accent-icon" /> contact@tbhdigitalsolutions.com
                        </a>
                    </div>

                    {/* 🔗 Social Media Links */}
                    <h3 className="contactoptions-subtitle">Connect With Us</h3>
                    <SocialIcons />
                </div>
            </div>
        </section>
    );
};

export default ContactOptions;
