import React from 'react';
import Button from './Button';

export default function AddEvaluationSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex justify-center items-center mt-8">
      <Button 
        variant="Default" 
        label="Adicionar Avaliação" 
        onClick={() => { /* Navigate to evaluation creation page */ }}
      />
    </div>
  );
}
