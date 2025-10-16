import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTentativasPorMatricula, getTentativasPorUsuario } from '../services/UserExamsService.js';
import { api } from "../services/api.js";

export function UserExamsPageComponent(props) {
  return <UserExamsPage {...props} />;
}

export default function UserExamsPage({ courseId = 1 }) {
  const { cursoId, participanteId } = useParams();
  const effectiveCourseId = Number(cursoId || courseId || 1);
  const [loading, setLoading] = useState(true);
  const [tentativas, setTentativas] = useState([]);
  const [participanteAtual, setParticipanteAtual] = useState(participanteId ? Number(participanteId) : null);
  const navigate = useNavigate();

  // helper to set tentativas and log sample for debugging
  function setAndLogTentativas(list) {
    try {
      console.debug('UserExamsPage: setting tentativas count', Array.isArray(list) ? list.length : 0, 'firstItem:', Array.isArray(list) && list.length > 0 ? list[0] : null);
    } catch (e) {
      console.debug('UserExamsPage: setting tentativas (could not inspect)', e);
    }
    setTentativas(Array.isArray(list) ? list : []);
  }

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        let pid = Number(participanteId);
        if (!pid || Number.isNaN(pid)) {
          // fallback: buscar participante padrão (id 20)
          pid = 20;
        }
        setParticipanteAtual(pid);
        const tentativasResp = await getTentativasPorUsuario(pid);
        if (!mounted) return;
        
        // Ordenar do mais recente ao mais antigo
        const tentativasOrdenadas = Array.isArray(tentativasResp) 
          ? tentativasResp.sort((a, b) => {
              const dateA = new Date(a?.dtTentativa || a?.data || a?.dt || 0);
              const dateB = new Date(b?.dtTentativa || b?.data || b?.dt || 0);
              return dateB - dateA; // mais recente primeiro
            })
          : [];
        
        setAndLogTentativas(tentativasOrdenadas);
      } catch (err) {
        console.error('Erro ao carregar tentativas:', err);
        setTentativas([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false };
  }, [participanteId]);

  function formatIsoDateTime(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      const day = d.getDate();
      let month = d.toLocaleString('pt-BR', { month: 'long' });
      if (month && month.length > 0) month = month.charAt(0).toUpperCase() + month.slice(1);
      const year = d.getFullYear();
      const hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${day} de ${month} de ${year}, ${hours}h${minutes}`;
    } catch (e) {
      return iso;
    }
  }

  function getCursoTitulo(tentativa) {
    // Prefer course title from avaliação.fkCurso (backend returns course info there),
    // fall back to matricula.curso where available, otherwise show course id or generic label.
    const cursoFromAvaliacao = tentativa?.avaliacao?.fkCurso;
    if (cursoFromAvaliacao && (cursoFromAvaliacao.tituloCurso || cursoFromAvaliacao.idCurso)) {
      return cursoFromAvaliacao.tituloCurso || `Curso ${cursoFromAvaliacao.idCurso}`;
    }

    const cursoFromMatricula = tentativa?.matricula?.curso;
    if (cursoFromMatricula && (cursoFromMatricula.tituloCurso || cursoFromMatricula.idCurso)) {
      return cursoFromMatricula.tituloCurso || `Curso ${cursoFromMatricula.idCurso}`;
    }

    // Fallbacks using embedded keys
    const fkCursoFromId = tentativa?.idTentativaComposto?.idMatriculaComposto?.fkCurso || tentativa?.matricula?.idMatriculaComposto?.fkCurso || tentativa?.matricula?.fkCurso;
    if (fkCursoFromId) return `Curso ${fkCursoFromId}`;

    return `Curso ${effectiveCourseId}`;
  }

  // Nota: Tentativa object doesn't include a direct 'nota' field in the backend domain per mapper inspection.
  // We'll attempt to read tentativa?.avaliacao?.pontuacao or fallback to exibiting acertosMinimos if present.
  function getNotaText(tentativa) {
    if (!tentativa) return '—';

    // prefer explicit acertos/total returned by backend
    const acertos = tentativa.notaAcertos ?? tentativa?.nota_acertos ?? tentativa?.acertos ?? tentativa?.resultado?.acertos;
    let total = tentativa.notaTotal ?? tentativa?.nota_total ?? tentativa?.totalQuestoes ?? tentativa?.total ?? tentativa?.resultado?.total;

    // try to read total from avaliacao if not present
    if (total == null) {
      total = tentativa?.avaliacao?.totalQuestoes ?? tentativa?.avaliacao?.qtdQuestoes ?? tentativa?.avaliacao?.numeroQuestoes ?? tentativa?.avaliacao?.total;
    }

    // if both are present but both are 0, it means no answers were recorded
    if (acertos === 0 && total === 0) return 'Sem respostas';

    if (acertos != null && total != null) return `${acertos}/${total}`;

    // defensive checks for common keys (percent or raw score)
    const nota = tentativa.nota ?? tentativa.pontuacao ?? tentativa?.avaliacao?.nota ?? null;
    if (nota != null) return String(nota);

    // Fallback to showing minimum correct answers required by the avaliacao
    const acertosMinimos = tentativa?.avaliacao?.acertosMinimos ?? tentativa?.avaliacao?.acertos_minimos;
    if (acertosMinimos != null) return `Mín: ${acertosMinimos}`;

    return '—';
  }

  // Calcular número da tentativa por curso
  function getTentativaNumero(tentativa, currentIndex) {
    const cursoTitulo = getCursoTitulo(tentativa);
    
    // Filtrar tentativas do mesmo curso até o índice atual
    const tentativasMesmoCurso = tentativas.slice(0, currentIndex + 1).filter(t => getCursoTitulo(t) === cursoTitulo);
    
    // Retornar o número da tentativa (mais recente é 1, mais antiga é o maior número)
    return tentativasMesmoCurso.length;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Provas do Colaborador y</h1>
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Decorações visuais elegantes nos cantos */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-md z-10"></div>
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md z-10"></div>
        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full shadow-md z-10"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-md z-10"></div>
        
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-4 border-blue-900 relative z-0">
          {loading ? (
            <div className="p-8 text-center text-gray-600 text-lg">Carregando...</div>
          ) : tentativas.length === 0 ? (
            <div className="p-8 text-center text-gray-600 text-lg">Nenhuma prova encontrada para este participante.</div>
          ) : (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-800 to-blue-600 text-white">
                <th className="py-5 px-6 text-left font-bold text-lg tracking-wide">Curso</th>
                <th className="py-5 px-6 text-left font-bold text-lg tracking-wide">Data da Tentativa</th>
                <th className="py-5 px-6 text-center font-bold text-lg tracking-wide">Nota</th>
              </tr>
            </thead>
            <tbody>
              {tentativas.map((t, idx) => {
                // infer id for navigation
                const idTentativa = t?.idTentativaComposto?.idTentativa ?? t?.id ?? t?.idTentativa ?? idx;
                const cursoTitulo = getCursoTitulo(t);
                const tentativaNum = getTentativaNumero(t, idx);
                const nota = getNotaText(t);
                
                // Alternar cores das linhas
                const bgColor = idx % 2 === 0 ? 'bg-blue-50' : 'bg-white';
                
                return (
                  <tr 
                    key={idTentativa ?? idx} 
                    className={`${bgColor} hover:bg-blue-100 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 border-b border-gray-200`}
                    onClick={() => navigate(`/participantes/${participanteAtual || participanteId || ''}/avaliacoes/${idTentativa}`)}
                  >
                    <td className="py-5 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-900 text-base">{cursoTitulo}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          Tentativa {tentativaNum}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-gray-700 text-base">
                      {formatIsoDateTime(t?.dtTentativa || t?.data || t?.dt)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[90px] px-5 py-2.5 rounded-full font-bold text-sm tracking-wide shadow-sm ${
                        nota === 'Sem respostas' || nota === '—' 
                          ? 'bg-gray-200 text-gray-700' 
                          : 'bg-blue-100 text-blue-900 border-2 border-blue-200'
                      }`}>
                        {nota}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>
    </div>
  );
}
