import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Header from '../components/Header';
import GradientSideRail from '../components/GradientSideRail';
import SmartImage from '../components/SmartImage.jsx';
import ClassDetailsPageService from '../services/ClassDetailsPageService.js';
import { getMateriaisPorCurso } from '../services/MaterialListPageService.js';

function ClassDetailsPage() {
  const { idCurso } = useParams();
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [computedMaterials, setComputedMaterials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const info = await ClassDetailsPageService.getCursoDetalhes(idCurso);
        setDados(info);
        // background: fetch authoritative materials and compute non-evaluation count
        (async () => {
          try {
            const matsResp = await getMateriaisPorCurso(Number(idCurso));
            const arr = Array.isArray(matsResp?.content) ? matsResp.content : (Array.isArray(matsResp) ? matsResp : []);
            const nonEvalCount = (arr || []).filter((m) => {
              const tipo = String(m?.tipo || m?.type || '').toLowerCase();
              if (tipo.includes('avaliacao')) return false;
              const title = String(m?.titulo || m?.title || m?.nomeApostila || m?.nomeVideo || '').toLowerCase();
              if (title.includes('avaliacao') || title.includes('prova')) return false;
              if (m?.idAvaliacao != null || m?.fkAvaliacao != null) return false;
              return true;
            }).length;
            setComputedMaterials(nonEvalCount);
          } catch (e) {
            console.debug('Falha ao buscar materiais para contagem no detalhe do curso', e);
            setComputedMaterials(null);
          }
        })();
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [idCurso]);

  const totalAlunos = dados?.totalAlunos ?? '-';
  const totalHoras = dados?.duracaoEstimada != null ? `${dados.duracaoEstimada}h` : '—';
  const totalMateriais = (computedMaterials != null) ? computedMaterials : (dados?.totalMateriais ?? '-');

  function formatTitle(raw) {
    if (!raw) return `Curso ${idCurso}`;
    const s = String(raw).trim();
    if (!s) return `Curso ${idCurso}`;
    // Title case
    const titleCased = s
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    // Truncate if too long
    const MAX = 50;
    return titleCased.length > MAX ? titleCased.slice(0, MAX - 1).trim() + '…' : titleCased;
  }

  return (
    <>
      <div className="min-h-screen bg-white relative">
        <GradientSideRail className="left-10" />
        <GradientSideRail className="right-10" variant="inverted" />
        <Header />

        {/* BackButton removido - gerenciado pelo Header */}

        <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">Cursos de Capacitação</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 via-pink-500 to-orange-400 mx-auto mt-2 rounded-md"></div>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-300 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                    <div className="w-36 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <SmartImage
                        src={dados?.imagem}
                        alt={dados?.tituloCurso || `Curso ${idCurso}`}
                        className="object-cover w-full h-full"
                        fallback="/default-course-icon.svg"
                      />
                    </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold text-gray-900">{formatTitle(dados?.tituloCurso)}</h3>
                      <div className="mt-2 text-sm text-gray-500">{dados?.subTitulo || ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400">{/* placeholder for actions */}</div>
                    </div>
                  </div>

                  <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="text-lg font-medium text-gray-700 mb-2">Conteúdo</h4>
                    {loading ? (
                      <p className="text-gray-500">Carregando...</p>
                    ) : error ? (
                      <p className="text-red-600">{error}</p>
                    ) : (
                      <p className="text-gray-600 leading-relaxed">{dados?.descricao || 'Sem descrição para este curso.'}</p>
                    )}
                  </div>
                </div>

                <div className="w-56 pl-6 border-l border-slate-200">
                  <div className="space-y-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div>
                      <div className="text-sm text-gray-500">Horas</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
                          {totalHoras}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">de curso</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Materiais</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold border border-green-100">
                          {String(totalMateriais ?? '-')}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">arquivos</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Alunos</div>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                          {String(totalAlunos ?? '-')}
                        </span>
                        <span className="ml-3 text-sm text-gray-600">inscritos</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
              <div className="grid grid-cols-3 gap-4">
                <Button
                  variant="Default"
                  label="Ver Alunos e Desempenho"
                  onClick={() => navigate(`/cursos/${idCurso}/participantes`)}
                />
                <Button
                  variant="Default"
                  label="Analisar Feedbacks"
                  onClick={() => navigate(`/cursos/${idCurso}/feedbacks`)}
                />
                <Button
                  variant="Default"
                  label="Visualizar Materiais do Curso"
                  onClick={() => navigate(`/cursos/${idCurso}/material`)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ClassDetailsPage;
