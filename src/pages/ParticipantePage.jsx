
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ParticipantePage() {
  const { id } = useParams();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/usuarios/${id}/engajamento-diario`);
        const data = await res.json();
        setDados(data);
      } catch (e) {
        setDados(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div>Carregando...</div>;
  if (!dados) return <div>Erro ao carregar dados.</div>;

  // Supondo que o backend retorna { email, primeiroAcesso, ultimoAcesso, ultimoCursoAcessado, engajamento: [{ dia, acesso }] }
  const { email, primeiroAcesso, ultimoAcesso, ultimoCursoAcessado, engajamento } = dados;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Dados do Participante</h1>
      <div className="mb-6 bg-white rounded shadow p-4">
        <p><b>Email:</b> {email}</p>
        <p><b>Primeiro acesso:</b> {primeiroAcesso}</p>
        <p><b>Último acesso:</b> {ultimoAcesso}</p>
        <p><b>Último curso acessado:</b> {ultimoCursoAcessado}</p>
      </div>
      <h2 className="text-xl font-semibold mb-2">Engajamento Diário</h2>
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
  );
}
