import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import { getCursosDoUsuario } from "../services/UserClassesPageService.js";
import { useParams } from 'react-router-dom';

export function UserClassesPage() {
  const routeParams = useParams();
  const routeParticipantId = routeParams.id ?? routeParams.idUsuario ?? routeParams.participanteId ?? null;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const columns = [
    { header: "Curso", accessor: "nomeCurso" },
    { header: "Progresso do Curso", accessor: "progressoCurso" },
    { header: "Iniciado", accessor: "iniciado" },
    { header: "Finalizado", accessor: "finalizado" },
  ];

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Determina participanteId na seguinte ordem:
        // 1) rota (participanteId)
        // 2) id presente no JWT armazenado no localStorage (tenta várias chaves comuns)
        // 3) fallback para 1 (somente se não houver outra opção)
  const pidFromRoute = routeParticipantId ? Number(routeParticipantId) : null;
        const pidFromToken = getUserIdFromJwt();
        const pid = pidFromRoute || pidFromToken || 1;
        if (!pid) {
          console.warn('Nenhum participanteId encontrado na rota nem no token; usando fallback 1');
        }
        const cursos = await getCursosDoUsuario(pid);
        if (!mounted) return;

        const mapped = (cursos || []).map(c => ({
          nomeCurso: c.nomeCurso || '—',
          progressoCurso: c.progressoCurso || 'Incompleto',
          iniciado: c.iniciado ? formatIsoToPtBr(c.iniciado) : '—',
          finalizado: c.finalizado ? formatIsoToPtBr(c.finalizado) : 'Incompleto'
        }));
        setData(mapped);
      } catch (err) {
        console.error('Erro ao carregar cursos do usuário:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false };
  }, [routeParticipantId]);

  return (
    <div className="min-h-screen bg-gray-50 pt-[200px] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Cursos do Participante</h1>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <Table
            columns={columns}
            data={data}
            headerClassName="bg-[#0067B1] text-white"
            rowClassName="odd:bg-[#DAEEFF] even:bg-[#B5DEFF] hover:bg-[#99ccff] transition-colors"
          />
        )}
      </div>
    </div>
  );
}

function formatIsoToPtBr(iso) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const day = d.getDate();
    let month = d.toLocaleString('pt-BR', { month: 'long' });
    if (month && month.length > 0) month = month.charAt(0).toUpperCase() + month.slice(1);
    const year = d.getFullYear();
    return `${day} de ${month} de ${year}`;
  } catch (e) {
    return iso;
  }
}

export default UserClassesPage;

// tenta localizar um JWT no localStorage e extrair o campo 'id' do payload
function getUserIdFromJwt() {
  try {
    const possibleKeys = ['token', 'authToken', 'accessToken', 'jwt', 'Authorization', 'auth'];
    let token = null;
    for (const k of possibleKeys) {
      const v = localStorage.getItem(k);
      if (v) { token = v; break; }
    }
    // também tenta procurar por storage 'persist:root' (redux) ou 'user' JSON
    if (!token) {
      const root = localStorage.getItem('persist:root');
      if (root) {
        try {
          const parsed = JSON.parse(root);
          for (const key of Object.keys(parsed)) {
            const val = parsed[key];
            try {
              const p = JSON.parse(val);
              if (p && (p.token || p.accessToken || p.jwt)) { token = p.token || p.accessToken || p.jwt; break; }
            } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore */ }
      }
    }
    if (!token) return null;
    // se token vier com 'Bearer ...'
    if (token.startsWith('Bearer ')) token = token.slice(7);
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
    // campos comuns / variações: id, sub, userId, user_id, usuarioId, usuario_id, usuario, user
    if (!payload) return null;
    // payload pode conter um objeto 'user'
    const tryFromUserObj = (p) => {
      if (!p) return null;
      if (typeof p === 'object') {
        return p.id || p.userId || p.user_id || p.usuarioId || p.usuario_id || null;
      }
      return null;
    };

    return (
      payload.id ||
      payload.sub ||
      payload.userId ||
      payload.user_id ||
      payload.userId ||
      payload.usuarioId ||
      payload.usuario_id ||
      payload.usuario ||
      payload.user ||
      tryFromUserObj(payload.user) ||
      tryFromUserObj(payload.usuario) ||
      null
    );
  } catch (e) {
    console.warn('Falha ao decodificar JWT para extrair id:', e);
    return null;
  }
}
