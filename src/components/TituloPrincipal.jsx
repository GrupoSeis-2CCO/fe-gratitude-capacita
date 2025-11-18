import React from "react";

export default function TituloPrincipal({ children }) {
  return (
    <h1 className="text-4xl font-bold text-center text-gray-900 bg-transparent p-2 mb-4">
      {children}
    </h1>
  );
}
