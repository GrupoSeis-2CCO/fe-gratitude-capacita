import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import { 
  getCollaborators, 
  getCourses, 
  sendToAllCollaborators, 
  sendToUser, 
  healthCheck 
} from "../services/emailNotificationService";

export default function EmailNotificationPage() {
  const [collaborators, setCollaborators] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);

  // Carregar colaboradores e cursos
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [collabRes, coursesRes, healthRes] = await Promise.all([
          getCollaborators().catch(() => ({ collaborators: [] })),
          getCourses().catch(() => []),
          healthCheck().catch(() => ({ status: "UNKNOWN" })),
        ]);

        setCollaborators(collabRes.collaborators || []);
        setCourses(Array.isArray(coursesRes) ? coursesRes : []);
        setSystemHealth(healthRes);
      } catch (e) {
        setStatus({ type: "error", text: `Erro ao carregar dados: ${e.message || e}` });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Enviar para todos os colaboradores
  const handleSendToAllCollaborators = async () => {
    if (!selectedCourse) {
      setStatus({ type: "error", text: "Selecione um curso antes de enviar." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const payload = { idCurso: selectedCourse.idCurso };
      const resp = await sendToAllCollaborators(payload);
      
      setStatus({ 
        type: "success", 
        text: `Notificações enviadas: ${resp.sent} de ${resp.totalCollaborators} colaboradores` 
      });
      
      setSentEmails(prev => [{
        kind: 'all-collaborators',
        course: selectedCourse?.tituloCurso,
        count: resp.sent,
        total: resp.totalCollaborators,
        ts: Date.now()
      }, ...prev]);
    } catch (e) {
      setStatus({ 
        type: "error", 
        text: `Falha: ${e?.response?.data?.error || e.message || e}` 
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar para colaborador selecionado
  const handleSendToSelected = async () => {
    if (!selectedUser) {
      setStatus({ type: "error", text: "Selecione um colaborador primeiro." });
      return;
    }

    if (!selectedCourse) {
      setStatus({ type: "error", text: "Selecione um curso antes de enviar." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const payload = { idCurso: selectedCourse.idCurso };
      const resp = await sendToUser(selectedUser.idUsuario, payload);
      
      setStatus({ 
        type: "success", 
        text: `Enviado para ${resp.nome} (${resp.email})` 
      });
      
      setSentEmails(prev => [{
        kind: 'single',
        to: resp.email,
        nome: resp.nome,
        course: selectedCourse?.tituloCurso,
        ts: Date.now()
      }, ...prev]);
    } catch (e) {
      setStatus({ 
        type: "error", 
        text: `Falha: ${e?.response?.data?.error || e.message || e}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-28">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Enviar e-mails sobre novos cursos</h1>
              <p className="text-sm text-gray-600">
                Envie e-mails informando sobre cursos novos — para um colaborador específico (selecione um colaborador) ou para todos os colaboradores.
              </p>
            </div>
            {/* indicador de health removido por solicitação do usuário */}
          </div>

          {/* Seleção de Curso e Colaborador */}
          <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Selecionar Curso *
                  </label>
              <select 
                className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={selectedCourse ? selectedCourse.idCurso : ''} 
                onChange={(e) => {
                  const c = courses.find(x => String(x.idCurso) === e.target.value);
                  setSelectedCourse(c || null);
                }}
              >
                <option value="" disabled>Selecione um curso</option>
                {courses.map(c => (
                  <option key={c.idCurso} value={c.idCurso}>
                    {c.tituloCurso} {c.oculto ? '(Oculto)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Selecionar Colaborador (opcional)
                  </label>
              <select
                className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setSelectedUser(collaborators.find(u => String(u.idUsuario) === e.target.value))}
                value={selectedUser ? String(selectedUser.idUsuario) : ''}
              >
                <option value="" disabled>Selecione</option>
                {collaborators.map((u) => (
                  <option key={u.idUsuario} value={u.idUsuario}>
                    {u.nome} — {u.email}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Button 
              variant="Confirm" 
              label={loading ? "Enviando..." : "Enviar para TODOS os Colaboradores"} 
              onClick={handleSendToAllCollaborators}
              disabled={loading || !selectedCourse}
            />
            <Button 
              variant="Default" 
              label="Enviar para colaborador selecionado" 
              onClick={handleSendToSelected}
              disabled={loading || !selectedCourse || !selectedUser}
            />
          </div>

          {/* Status/Feedback */}
          {status && (
            <div className={`p-4 rounded-lg mb-6 ${
              status.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {status.text}
            </div>
          )}

          {/* Estatísticas do Sistema */}
          {systemHealth?.stats && (
            <section className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Estatísticas do Sistema</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{systemHealth.stats.totalCollaborators}</div>
                  <div className="text-sm text-gray-600">Colaboradores</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{systemHealth.stats.totalCourses}</div>
                  <div className="text-sm text-gray-600">Cursos</div>
                </div>
              </div>
            </section>
          )}

          {/* Lista de Colaboradores */}
          <section className="mb-6">
            <h2 className="font-semibold mb-2 text-gray-700">
              Lista de Colaboradores ({collaborators.length})
            </h2>
            <div className="border rounded-lg max-h-48 overflow-auto">
              {collaborators.length === 0 ? (
                <div className="p-4 text-sm text-gray-600 text-center">
                  Nenhum colaborador encontrado.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-left">
                      <th className="p-2">Nome</th>
                      <th className="p-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collaborators.map(u => (
                      <tr key={u.idUsuario} className="border-t hover:bg-gray-50">
                        <td className="p-2">{u.nome}</td>
                        <td className="p-2">{u.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Histórico de Envios */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-700">
                Histórico de Envios (sessão)
              </h3>
              {sentEmails.length > 0 && (
                <button 
                  className="px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300"
                  onClick={() => setSentEmails([])}
                >
                  Limpar histórico
                </button>
              )}
            </div>

            {sentEmails.length === 0 ? (
              <div className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg text-center">
                Nenhum email enviado nesta sessão.
              </div>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-auto">
                {sentEmails.map((s, idx) => (
                  <li key={idx} className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                                <div className="font-medium text-gray-800">
                                  {s.kind === 'all-collaborators' 
                                    ? `Envio em massa (${s.count}/${s.total} colaboradores)` 
                                    : `Para: ${s.to || s.nome}`
                                  }
                                </div>
                        <div className="text-sm text-gray-600">
                          Curso: {s.course}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(s.ts).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Informational box removed per request */}
    </div>
  );
}
