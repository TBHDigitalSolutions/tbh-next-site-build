// src/components/ui/organisms/VideoPortfolioGallery/DebugModalWrapper.tsx
// Create this as a temporary debug component to test your modal
"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/molecules/Modal/Modal"; // Adjust path as needed

const DebugModalWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Modal Debug Test</h2>
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          padding: "1rem 2rem",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Open Test Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Test Modal"
        size="medium"
      >
        <div>
          <p>This is a test modal to verify the modal component works correctly.</p>
          <p>If you can see this, the modal is rendering properly.</p>
        </div>
      </Modal>
    </div>
  );
};

export default DebugModalWrapper;