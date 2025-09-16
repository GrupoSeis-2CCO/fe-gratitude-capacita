import React from "react";
import { useParams } from "react-router-dom";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";

export default function FeedbackPage() {
  const { idCurso } = useParams();

  // Mock data for feedbacks
  const feedbacks = [
    {
      id: 1,
      aluno: "Aluno 1",
      rating: 3,
      comentario: "Nunc blandit quam molestie placerat molestie. Nam non velit nisl. Donec eget felis libero. Integer dui augue, efficitur sed efficitur ut, sagittis id eros. Integer non porttitor tortor. Aliquam a risus at nibh porta eleifend id et ex. In tristique purus sed tincidunt elementum. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      id: 2,
      aluno: "Aluno 1",
      rating: 2,
      comentario: "Nunc blandit quam molestie placerat molestie. Nam non velit nisl. Donec eget felis libero. Integer dui augue, efficitur sed efficitur ut, sagittis id eros. Integer non porttitor tortor. Aliquam a risus at nibh porta eleifend id et ex. In tristique purus sed tincidunt elementum. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      id: 3,
      aluno: "Aluno 1",
      rating: 1,
      comentario: "Nunc blandit quam molestie placerat molestie. Nam non velit nisl. Donec eget felis libero. Integer dui augue, efficitur sed efficitur ut, sagittis id eros. Integer non porttitor tortor. Aliquam a risus at nibh porta eleifend id et ex. In tristique purus sed tincidunt elementum. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    },
    {
      id: 4,
      aluno: "Aluno 1",
      rating: 5,
      comentario: "Nenhum comentário feito por esse colaborador. / -"
    }
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-2xl ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      {/* Decorative rails left and right */}
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-none mx-auto flex-grow">
        <div className="max-w-6xl mx-auto">
          <TituloPrincipal>Analisar Feedbacks do Curso {idCurso}</TituloPrincipal>
        </div>

        <div className="mt-8 w-full flex justify-center">
          <div className="w-[65rem]">
            {/* Filter Dropdown */}
            <div className="mb-6 flex items-center">
              <select className="border border-gray-300 rounded-lg p-2 text-sm bg-white focus:outline-none focus:border-blue-500">
                <option>Todos</option>
                <option>5 estrelas</option>
                <option>4 estrelas</option>
                <option>3 estrelas</option>
                <option>2 estrelas</option>
                <option>1 estrela</option>
              </select>
            </div>

            {/* Feedbacks Container */}
            <div className="rounded-lg border-[0.1875rem] border-[#1D262D] bg-white p-6 shadow-[0_0_0_0.1875rem_#1D262D]">
              <div className="space-y-6">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    {/* Student Name and Rating */}
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {feedback.aluno}
                      </h3>
                      <div className="flex items-center">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>

                    {/* Comment */}
                    <div className="text-gray-700 leading-relaxed">
                      {feedback.comentario}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
