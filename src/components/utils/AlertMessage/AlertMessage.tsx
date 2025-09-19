"use client"; // ✅ Ensures this is a Client Component

import React from "react";

interface AlertMessageProps {
    type: "success" | "error" | "warning";
    message: string;
}

const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
    const getColor = () => {
        switch (type) {
            case "success":
                return "green";
            case "error":
                return "red";
            case "warning":
                return "yellow";
            default:
                return "gray";
        }
    };

    return <div style={{ borderLeft: `5px solid ${getColor()}`, padding: "10px" }}>{message}</div>;
};

export default AlertMessage;
