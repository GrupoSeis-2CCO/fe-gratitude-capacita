import React from "react";

export default function TituloPrincipal({ children }) {
  return (
    <h1 className="text-4xl font-bold text-center bg-white rounded-lg p-2 mb-4">
      {children}
    </h1>
  );
}
