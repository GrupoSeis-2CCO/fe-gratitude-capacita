import React, { useState, useEffect } from "react";

export default function FeedbackModal({ isOpen, onClose, onSubmit, loading = false, error = null }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStars(0);
      setComment("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[42rem] max-w-full bg-white rounded-xl shadow-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Enviar feedback</h2>
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700">{error}</div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Sua avaliação</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map((n) => (
              <button
                key={n}
                type="button"
                className={`text-3xl focus:outline-none ${n <= stars ? "text-yellow-400" : "text-gray-300"}`}
                onClick={() => setStars(n)}
                aria-label={`${n} estrelas`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="comment" className="block text-gray-700 font-medium mb-2">Comentário (opcional)</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-blue-500"
            placeholder="Escreva seu feedback..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onSubmit({ stars, comment })}
            className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
