import React from "react";

export default function OrangeAlert({ children }) {
  return (
    <div
      style={{
        background: "#FFEDCC",
        color: "#FF6B35",
        border: "1px solid #FF6B35",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "20px",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: "18px",
        animation: "slideIn 0.3s ease",
      }}
      className="orange-alert"
    >
      {children}
    </div>
  );
}