"use client";

import React, { useEffect, useRef, useState } from "react";
import { IoLogInOutline } from "react-icons/io5";
import "./Login.css";

const Login: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Escape to close + initial focus
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowModal(false);
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal]);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="header-login"
        aria-haspopup="dialog"
        aria-expanded={showModal}
        aria-label="Open login dialog"
      >
        <IoLogInOutline />
      </button>

      {showModal && (
        <div
          className="login-modal-backdrop"
          role="presentation"
          onClick={() => setShowModal(false)}
        >
          <div
            className="login-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="login-title" className="login-title">Login Portal</h3>
            <p className="login-subtext">Coming soon for clients and admins.</p>
            <div className="login-actions">
              <button
                ref={closeRef}
                className="login-close"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;