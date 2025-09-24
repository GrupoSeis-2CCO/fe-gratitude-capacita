import React, { useEffect, useState } from "react";
import UserActions from "../components/UserActions";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function UserPage() {
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/usuarios/me/engajamento-diario`); // ajuste a rota conforme seu backend
        const data = await res.json();
        setDados(data);
      } catch (e) {
        setDados(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!dados) return <div>Erro ao carregar dados.</div>;

  // Supondo que o backend retorna { email, primeiroAcesso, ultimoAcesso, ultimoCursoAcessado, engajamento: [{ dia, acesso }] }
  const { email, primeiroAcesso, ultimoAcesso, ultimoCursoAcessado, engajamento } = dados;

  return (
    <div className="min-h-screen bg-gray-50 pt-[200px] p-8">
      {/* Título Principal */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Colaborador</h1>
      </div>

      {/* Card com informações principais */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          <div className="text-gray-700"><strong className="text-gray-900">Email:</strong> {email}</div>
          <div className="text-gray-700"><strong className="text-gray-900">Primeiro acesso:</strong> {primeiroAcesso}</div>
          <div className="text-gray-700"><strong className="text-gray-900">Último acesso:</strong> {ultimoAcesso}</div>
          <div className="text-gray-700"><strong className="text-gray-900">Último curso acessado:</strong> {ultimoCursoAcessado}</div>
        </div>
      </div>

      {/* Layout em duas colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {/* Coluna Esquerda - Ações */}
        <UserActions />

        {/* Coluna Direita - Gráfico */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Engajamento Diário do Participante</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engajamento} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="acesso" stroke="#FF6B35" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
