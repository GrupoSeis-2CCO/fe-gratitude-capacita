import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button.jsx";

/**
 * BackButton padronizado.
 * Props:
 *  - to: rota de destino; se ausente usa navigate(-1)
 *  - onClick: sobrescreve comportamento padrao se fornecido
 *  - className: classes extras para o wrapper
 *  - sticky: controla se fica colado no topo (default false)
 */
export default function BackButton({ to = null, onClick = null, className = "", sticky = false }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (typeof onClick === 'function') return onClick();
    if (to) return navigate(to);
    navigate(-1);
  };
  const containerClasses = sticky ? "sticky top-0 left-0 z-30 mt-2 mb-4" : "";
  return (
    <div className={`${containerClasses} ${className}`}>
      <Button
        variant="Ghost"
        label="<- Voltar"
        onClick={handleClick}
        className="px-4 py-2 text-sm shadow"
      />
    </div>
  );
}
