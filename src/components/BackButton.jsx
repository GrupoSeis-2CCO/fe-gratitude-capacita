import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button.jsx";

/**
 * BackButton padronizado.
 * Props:
 *  - to: rota de destino; se ausente usa navigate(-1)
 *  - onClick: sobrescreve comportamento padrão se fornecido
 *  - className: classes extras para o wrapper (além da posição padrão)
 */
export default function BackButton({ to = null, onClick = null, className = "" }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (typeof onClick === 'function') return onClick();
    if (to) return navigate(to);
    navigate(-1);
  };
  return (
    <div className={`absolute top-6 left-6 z-20 ${className}`}> 
      <Button variant="Ghost" label="← Voltar" onClick={handleClick} />
    </div>
  );
}
