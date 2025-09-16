import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from './Button';

export default function AddEvaluationSection() {
  const navigate = useNavigate();
  const params = useParams();
  const idCurso = params.idCurso ?? params.id ?? null;

  const handleClick = () => {
    if (idCurso) {
      navigate(`/cursos/${idCurso}/material/adicionar-avaliacao`);
    } else {
      // fallback: go to cursos list
      navigate('/cursos');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-center items-center mt-8">
      <Button 
        variant="Default" 
        label="Adicionar Avaliação" 
        onClick={handleClick}
      />
    </div>
  );
}
