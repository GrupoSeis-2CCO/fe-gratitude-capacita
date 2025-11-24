import React from "react";

export default function GradientSideRail({ className = "", variant = "default" }) {
  const colors = variant === "inverted" 
    ? { top: "#ff8800", bottom: "#0067B1" } 
    : { top: "#0067B1", bottom: "#ff8800" };

  return (
    // Component intentionally disabled: removed decorative side-rail to avoid UI overlap
    null
  );
}
