import React, { useEffect, useState } from "react";
import Button from "../components/Button";
import ClassListPageService from "../services/ClassListPageService.js";
import { getUsers, sendToAll, sendToUser, sendToEmail } from "../services/notificationService";
import { getMailhogMessages, clearMailhogMessages } from "../services/mailhogService";

  // helpers to decode RFC2047 encoded-words and quoted-printable bodies from MailHog
  function decodeQuotedPrintable(input, charset = 'utf-8') {
    if (!input) return '';
    // remove soft line breaks
    const str = String(input).replace(/=\r?\n/g, '');
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      const ch = str.charAt(i);
      if (ch === '=' && i + 2 < str.length && /[0-9A-Fa-f]{2}/.test(str.substr(i + 1, 2))) {
        bytes.push(parseInt(str.substr(i + 1, 2), 16));
        i += 2;
      } else {
        bytes.push(str.charCodeAt(i));
      }
    }
    try {
      return new TextDecoder(charset).decode(new Uint8Array(bytes));
    } catch (e) {
      return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    }
  }

  function decodeRFC2047(s) {
    if (!s) return '';
    // replace multiple encoded-words
    return String(s).replace(/=\?([^?]+)\?([BbQq])\?([^?]+)\?=/g, (m, charset, enc, token) => {
      const cs = (charset || 'utf-8').toLowerCase();
      const encoding = (enc || 'Q').toUpperCase();
      if (encoding === 'Q') {
        // Q-encoding: underscores -> space, =XX sequences
        const qp = token.replace(/_/g, ' ');
        return decodeQuotedPrintable(qp, cs);
      } else {
        // B encoding (base64)
        try {
          const bin = atob(token.replace(/\s+/g, ''));
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          try { return new TextDecoder(cs).decode(bytes); } catch (e) { return new TextDecoder('utf-8').decode(bytes); }
        } catch (e) {
          return token;
        }
      }
    });
  }

export default function MailhogTestPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [manualEmail, setManualEmail] = useState("");
  const [previewEmail, setPreviewEmail] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [u, c] = await Promise.all([
          getUsers().catch(() => []),
          ClassListPageService.getCourses().catch(() => []),
        ]);
        setUsers(Array.isArray(u) ? u : []);
        setCourses(Array.isArray(c) ? c : []);
      } catch (e) {
        setStatus({ type: "error", text: `Erro ao carregar dados: ${e.message || e}` });
      }
    }
    load();
  }, []);

  // parse mailhog items into our local shape
  function parseMailhogItems(items) {
    return items.map(m => {
      const subjRaw = m?.Content?.Headers?.Subject?.[0] || (m?.Content?.Headers?.subject?.[0]) || '';
      const subj = decodeRFC2047(subjRaw);
      const rawBody = m?.Content?.Body || m?.Content?.Mime || '';
      // try quoted-printable decode; if it returns empty, fall back to raw
      const body = decodeQuotedPrintable(rawBody) || rawBody || '';
      // normalize subject spacing and punctuation
      let course = subj || null;
      if (course) {
        // collapse multiple spaces and remove space before punctuation
        course = course.replace(/\s+/g, ' ').replace(/\s+([,:;.!?])/g, '$1').trim();
      }
      if (course && course.startsWith('🎓 Novo Curso Lançado:')) course = course.replace('🎓 Novo Curso Lançado:', '').trim();
      const to = Array.isArray(m?.To) ? (m.To[0]?.Mailbox ? `${m.To[0].Mailbox}@${m.To[0].Domain}` : (m.To[0] || '')) : (m?.To || '');
      // try extract participant name from body (e.g., "Olá Nome,")
      let participantName = null;
      try {
        const mName = body.match(/Olá\s+([^,\n\r!]+)/i);
        if (mName && mName[1]) participantName = mName[1].trim();
      } catch (e) { /* ignore */ }

      return { kind: 'mailhog', subject: subj, body, to, course, participantName, ts: Date.now() };
    });
  }

  // polling / auto-refresh (always on)
  const REFRESH_INTERVAL_MS = 10000; // 10s

  async function fetchMailhog() {
    try {
      setLoading(true);
      const data = await getMailhogMessages();
      const items = (data && data.items) ? data.items : [];
      const parsed = parseMailhogItems(items);
      setSentEmails(parsed.reverse());
      setStatus({ type: 'success', text: `Carregadas ${parsed.length} mensagens do MailHog` });
    } catch (e) {
      setStatus({ type: 'error', text: `Falha ao buscar MailHog: ${e?.message || e}` });
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchMailhog();
    const id = setInterval(fetchMailhog, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const handleSendAll = async () => {
    setLoading(true);
    setStatus(null);
    try {
      if (!selectedCourse) {
        setStatus({ type: "error", text: "Selecione um curso antes de enviar para todos." });
        setLoading(false);
        return;
      }

      const payload = { idCurso: selectedCourse.idCurso };
      const resp = await sendToAll(payload);
      setStatus({ type: "success", text: `Enviadas: ${resp.enviadas ?? JSON.stringify(resp)}` });
  setSentEmails(prev => [{ kind: 'all', course: selectedCourse?.tituloCurso, count: resp.enviadas ?? 0, ts: Date.now() }, ...prev]);
    } catch (e) {
      setStatus({ type: "error", text: `Falha: ${e?.response?.data?.error || e.message || e}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSelected = async () => {
    if (!selectedUser) {
      setStatus({ type: "error", text: "Selecione um usuário primeiro." });
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
      setStatus({ type: "success", text: `Enviado para ${resp.email || selectedUser.email}` });
  setSentEmails(prev => [{ kind: 'single', to: resp.email || selectedUser.email, course: selectedCourse?.tituloCurso, ts: Date.now() }, ...prev]);
    } catch (e) {
      setStatus({ type: "error", text: `Falha: ${e?.response?.data?.error || e.message || e}` });
    } finally {
      setLoading(false);
    }
  };

  const handleSendToEmail = async () => {
    if (!manualEmail || manualEmail.trim() === "") {
      setStatus({ type: "error", text: "Informe um email para envio." });
      return;
    }
    if (!selectedCourse) {
      setStatus({ type: "error", text: "Selecione um curso antes de enviar." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
  const payload = { idCurso: selectedCourse.idCurso, emailAluno: manualEmail };
      const resp = await sendToEmail(payload);
      setStatus({ type: "success", text: `Enviado para ${resp.email || manualEmail}` });
  setSentEmails(prev => [{ kind: 'single', to: resp.email || manualEmail, course: selectedCourse?.tituloCurso, ts: Date.now() }, ...prev]);
    } catch (e) {
      setStatus({ type: "error", text: `Falha: ${e?.response?.data?.error || e.message || e}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-28">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Teste MailHog — Envio de Notificações</h1>

          <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-semibold">Selecionar curso</label>
              <select className="border p-2 w-full rounded" value={selectedCourse ? selectedCourse.idCurso : ''} onChange={(e) => {
                const c = courses.find(x => String(x.idCurso) === e.target.value);
                setSelectedCourse(c || null);
              }}>
                <option value="" disabled>Selecione um curso</option>
                {courses.map(c => (
                  <option key={c.idCurso} value={c.idCurso}>{c.tituloCurso}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold">Selecionar participante</label>
              <select
                className="border p-2 w-full rounded"
                onChange={(e) => setSelectedUser(users.find(u => String(u.idUsuario) === e.target.value))}
                value={selectedUser ? String(selectedUser.idUsuario) : ''}
              >
                <option value="">-- escolher participante --</option>
                {users.map((u) => (
                  <option key={u.idUsuario} value={u.idUsuario}>{u.nome} — {u.email}</option>
                ))}
              </select>
            </div>
          </section>

          {/* manual email inputs moved above buttons */}
          <div className="mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input placeholder="email@exemplo.com" className="border p-2 rounded" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Button variant="Default" label="Enviar para participante selecionado" onClick={handleSendSelected} />
            <Button variant="Confirm" label="Enviar para todos" onClick={handleSendAll} />
            <Button variant="Default" label="Enviar para email" onClick={handleSendToEmail} />
          </div>

          {status && (
            <div className={`p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {status.text}
            </div>
          )}

          <section className="mt-6">
            <h2 className="font-semibold mb-2">Lista de participantes (preview)</h2>
            <div className="border rounded max-h-64 overflow-auto p-2">
              {users.length === 0 ? (
                <div className="text-sm text-gray-600">Nenhum usuário encontrado.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left"><th>Id</th><th>Nome</th><th>Email</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.idUsuario}><td className="pr-3">{u.idUsuario}</td><td className="pr-3">{u.nome}</td><td>{u.email}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Emails enviados (sessão)</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded bg-red-200 text-sm" onClick={async () => {
                    try {
                      setLoading(true);
                      await clearMailhogMessages();
                      setSentEmails([]);
                      setStatus({ type: 'success', text: 'MailHog limpo com sucesso' });
                    } catch (e) {
                      setStatus({ type: 'error', text: `Falha ao limpar MailHog: ${e?.message || e}` });
                    } finally { setLoading(false); }
                  }}>Limpar MailHog</button>
                </div>
              </div>

              {sentEmails.length === 0 ? (
                <div className="text-sm text-gray-600">Nenhum email enviado nesta sessão.</div>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-auto">
                  {sentEmails.map((s, idx) => (
                    <li key={idx} className="p-2 bg-gray-50 rounded border cursor-pointer" onClick={() => setPreviewEmail(s)}>
                      <div className="text-sm text-gray-700">{s.course ? (s.participantName ? `${s.course} — ${s.participantName}` : s.course) : (s.kind === 'all' ? `Envio em massa (${s.count})` : `Para: ${s.to}`)}</div>
                      <div className="text-xs text-gray-500">{new Date(s.ts).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Modal preview */}
            {previewEmail && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded max-w-2xl w-full">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">Preview: {previewEmail.subject || previewEmail.course || 'Email'}</h4>
                    <button className="text-gray-600" onClick={() => setPreviewEmail(null)}>Fechar</button>
                  </div>
                  <div className="border rounded p-3 max-h-96 overflow-auto whitespace-pre-wrap text-sm">
                    {previewEmail.body || JSON.stringify(previewEmail, null, 2)}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
