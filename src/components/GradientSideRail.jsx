import React from "react";

export default function GradientSideRail({ className = "", variant = "default" }) {
  const colors = variant === "inverted" 
    ? { top: "#ff8800", bottom: "#0067B1" } 
    : { top: "#0067B1", bottom: "#ff8800" };

  return (
    <div className={`pointer-events-none absolute top-36 bottom-16 flex items-stretch ${className}`}>
      {/* Line */}
      <div className={`relative mx-auto w-[0.1875rem] rounded-full bg-gradient-to-b`} style={{ background: `linear-gradient(to bottom, ${colors.top}, ${colors.bottom})` }}>
        {/* Top Circle */}
        <span className="absolute -top-[0.75rem] left-1/2 h-[0.75rem] w-[0.75rem] -translate-x-1/2 rounded-full shadow-[0_0_0.375rem]" style={{ backgroundColor: colors.top, boxShadow: `0 0 0.375rem ${colors.top}66` }} />
        {/* Bottom Circle */}
        <span className="absolute -bottom-[0.75rem] left-1/2 h-[0.75rem] w-[0.75rem] -translate-x-1/2 rounded-full shadow-[0_0_0.375rem]" style={{ backgroundColor: colors.bottom, boxShadow: `0 0 0.375rem ${colors.bottom}66` }} />
      </div>
    </div>
  );
}
