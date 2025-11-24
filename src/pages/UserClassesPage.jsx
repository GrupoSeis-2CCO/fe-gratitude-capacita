import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import BackButton from "../components/BackButton.jsx";
import { getCursosDoUsuario } from "../services/UserClassesPageService.js";
import { getMateriaisPorCurso } from "../services/MaterialListPageService.js";
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
    { header: (
        <abbr title="Para o curso ser marcado como finalizado, o participante precisa ter realizado a avaliação e alcançado a nota mínima exigida." className="cursor-help">
          Finalizado
        </abbr>
      ), accessor: "finalizado" },
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

        const initialMapped = (cursos || []).map(c => {
          // try common fields for materials total
          const materiaisTotais = c.materiaisTotais ?? c.materiaisTotal ?? c.totalMateriais ?? c.materialCount ?? c.qtdMateriais ?? null;

          // compute a defensive display for progresso
          let progressoDisplay = 'Incompleto';
          if (materiaisTotais === 0) {
            progressoDisplay = 'Sem materiais';
          } else if (typeof c.progressoCurso === 'number') {
            // if it's 0..1, transform to percent; if it's 0..100 assume percent
            if (c.progressoCurso > 0 && c.progressoCurso <= 1) progressoDisplay = `${Math.round(c.progressoCurso * 100)}%`;
            else progressoDisplay = `${Math.round(c.progressoCurso)}%`;
          } else if (typeof c.progressoCurso === 'string' && c.progressoCurso.trim() !== '') {
            progressoDisplay = c.progressoCurso;
          }

          return {
            raw: c,
            idCurso: c.idCurso ?? c.fkCurso ?? c.cursoId ?? c.id ?? null,
            nomeCurso: c.nomeCurso || c.tituloCurso || '—',
            progressoCurso: progressoDisplay,
            materiaisTotais,
            iniciado: c.iniciado ? formatIsoToPtBr(c.iniciado) : '—',
            finalizado: c.finalizado ? formatIsoToPtBr(c.finalizado) : 'Incompleto'
          };
        });

        // Ordena do mais recente ao mais antigo usando a data de início ('iniciado') quando disponível
        const withDates = initialMapped.map(item => {
          const raw = item.raw || {};
          const possible = raw.iniciado || raw.dataInicio || raw.data_inicio || raw.createdAt || raw.dataCriacao || raw.dt_inicio || raw.dtIniciado || raw.dtCriacao || raw.inicio;
          const parsed = possible ? new Date(possible).getTime() : 0;
          return { ...item, _sortDate: Number.isNaN(parsed) ? 0 : parsed };
        });
        withDates.sort((a, b) => (b._sortDate || 0) - (a._sortDate || 0));
        setData(withDates);

        // For entries where materiaisTotais is unknown but progressoCurso is a numeric percent,
        // verify server-side material count to avoid showing e.g. 50% when there are no materials.
        initialMapped.forEach(async (entry, idx) => {
          try {
            if ((entry.materiaisTotais === null || entry.materiaisTotais === undefined) && entry.idCurso) {
              const matsResp = await getMateriaisPorCurso(entry.idCurso);
              let matsArr = [];
              if (Array.isArray(matsResp)) matsArr = matsResp;
              else if (matsResp?.materiais) matsArr = matsResp.materiais;
              else if (matsResp?.data && Array.isArray(matsResp.data)) matsArr = matsResp.data;
              const filtered = (matsArr || []).filter(m => {
                const tipo = (m.tipo || m.type || '').toString().toLowerCase();
                const hidden = (typeof m.isApostilaOculto !== 'undefined') ? (Number(m.isApostilaOculto) === 1) : ((typeof m.isVideoOculto !== 'undefined') ? (Number(m.isVideoOculto) === 1) : !!m.hidden);
                const isEval = tipo.includes('avaliacao') || (m.avaliacao === true);
                return !isEval && !hidden;
              });
              const total = filtered.length;
              if (total === 0) {
                // update state to show 'Sem materiais'
                setData(prev => {
                  const copy = prev.slice();
                  const found = copy.find(p => p.idCurso === entry.idCurso);
                  if (found) found.progressoCurso = 'Sem materiais';
                  return copy;
                });
              } else {
                // optionally update materiaisTotais for display or keep existing percent
                setData(prev => {
                  const copy = prev.slice();
                  const found = copy.find(p => p.idCurso === entry.idCurso);
                  if (found) found.materiaisTotais = total;
                  return copy;
                });
              }
            }
          } catch (e) {
            // ignore per-course failures
          }
        });
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
      <BackButton to={routeParticipantId ? `/participante/${routeParticipantId}` : '/participantes'} />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Cursos do Participante</h1>
        {/* placeholder removed: ordering icon will be inside the card (top-left) */}

        {/* Card wrapper with border and shadow to improve visual hierarchy */}
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-200 p-6">
          {/* Mini blue accent removed to avoid layout artifacts */}
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
