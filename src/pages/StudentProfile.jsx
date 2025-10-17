import React, { useEffect, useState, useRef } from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal.jsx";
import Button from "../components/Button.jsx";
import { Eye, EyeOff, User } from 'lucide-react';
import { getProfile, updateProfile, changePassword, uploadAvatar, getStats } from "../services/StudentProfileService.js";

export default function StudentProfile() {
  // Acesso já é verificado pelo ProtectedRoute no router; sem redireciono interno aqui

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordAtual, setShowPasswordAtual] = useState(false);
  const [showPasswordNova, setShowPasswordNova] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ senhaAtual: "", novaSenha: "" });
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    cargo: "",
    departamento: "",
    fotoUrl: null,
  });
  const [stats, setStats] = useState({ cursosConcluidos: 0, cursosFaltantes: 0, horasEstudo: 0, ultimaAtividade: null });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [emailError, setEmailError] = useState("");

  // Utilidades
  const validateEmail = (email) => {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(String(email).trim());
  };

  const formatPhoneBR = (val) => {
    const digits = String(val || "").replace(/\D/g, "").slice(0, 11);
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${ddd}) ${rest}`;
    if (digits.length <= 10) {
      // Fixo: (11) 1234-5678
      return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
    // Celular: (11) 91234-5678
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getProfile();
        const s = await getStats();
        if (!mounted) return;
        setFormData((prev) => ({ ...prev, ...profile }));
        setStats(s);
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
      } finally { setLoading(false); }
    })();
    return () => { mounted = false };
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmailError("");
      setFormData(prev => ({ ...prev, email: value }));
      return;
    }
    if (field === 'telefone') {
      const masked = formatPhoneBR(value);
      setFormData(prev => ({ ...prev, telefone: masked }));
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // Validação básica de e-mail
      if (!validateEmail(formData.email)) {
        setEmailError("Informe um e-mail válido (ex.: nome@empresa.com)");
        return;
      }
      const payload = {
        id: formData.id,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        departamento: formData.departamento,
      };
      const resp = await updateProfile(payload);
      setIsEditing(false);
    } catch (e) { console.error('Falha ao salvar perfil:', e); }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.senhaAtual || !passwordForm.novaSenha) return;
    try {
      await changePassword({ id: formData.id, ...passwordForm });
      setPasswordForm({ senhaAtual: "", novaSenha: "" });
      alert('Senha alterada com sucesso.');
    } catch (e) {
      if (e?.response?.status === 401) alert('Senha atual incorreta.');
      else alert('Erro ao alterar senha.');
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;
    // Validação leve de tamanho (até 5MB conforme ajuda visual)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }
    try {
      setUploading(true);
      const resp = await uploadAvatar(file, formData.id);
      const url = resp.fotoUrl || resp.url;
      setFormData(prev => ({ ...prev, fotoUrl: url }));
    } catch (e) {
      console.error('Erro ao enviar avatar:', e);
      alert('Falha ao enviar imagem.');
    } finally {
      setUploading(false);
      // limpa o input para permitir reenvio do mesmo arquivo se necessário
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <div className="min-h-screen pt-28 p-8">Carregando...</div>;

  return (
    <div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
      <GradientSideRail className="left-10" />
      <GradientSideRail className="right-10" variant="inverted" />

      <div className="w-full max-w-6xl mx-auto flex-grow">
        <div className="text-center mb-10">
          <TituloPrincipal>Meu Perfil</TituloPrincipal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <User size={24} className="text-orange-500" />
                  Informações Pessoais
                </h2>
                {!isEditing ? (
                  <Button variant="Default" label="Editar Perfil" onClick={() => setIsEditing(true)} />
                ) : (
                  <div className="flex gap-3">
                    <Button variant="Confirm" label="Salvar" onClick={handleSave} />
                    <Button variant="Cancel" label="Cancelar" onClick={() => setIsEditing(false)} />
                  </div>
                )}
              </div>

              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {formData.fotoUrl ? (
                    <img src={formData.fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">Sem foto</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleAvatarChange(e.target.files[0])}
                  />
                  <Button
                    variant="Default"
                    label={uploading ? "Enviando..." : (formData.fotoUrl ? "Trocar foto" : "Anexar imagem")}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={uploading}
                  />
                  <div className="text-xs text-gray-500 mt-2">PNG/JPG até 5MB</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
                  {isEditing ? (
                    <input type="text" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  ) : (
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.nome}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full p-3 border ${emailError ? 'border-red-500' : 'border-gray-300'} rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100`}
                      />
                      {emailError && <div className="mt-1 text-sm text-red-600">{emailError}</div>}
                    </>
                  ) : (
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">CPF</label>
                  <p className="text-gray-600 p-3 bg-gray-100 rounded-lg">{formData.cpf}</p>
                  <span className="text-xs text-gray-500">CPF não pode ser alterado</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 91234-5678"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  ) : (
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.telefone || '—'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cargo</label>
                  <p className="text-gray-600 p-3 bg-gray-100 rounded-lg">{formData.cargo || 'Colaborador'}</p>
                  <span className="text-xs text-gray-500">Alterado apenas pelo administrador</span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Departamento</label>
                  {isEditing ? (
                    <input type="text" value={formData.departamento || ''} onChange={(e) => handleInputChange('departamento', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                  ) : (
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.departamento || '—'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">Segurança</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Senha Atual</label>
                  <div className="relative">
                    <input type={showPasswordAtual ? "text" : "password"} value={passwordForm.senhaAtual} onChange={(e) => setPasswordForm(p => ({ ...p, senhaAtual: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 pr-12" />
                    <button type="button" onClick={() => setShowPasswordAtual(!showPasswordAtual)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPasswordAtual ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                  <div className="relative">
                    <input type={showPasswordNova ? "text" : "password"} value={passwordForm.novaSenha} onChange={(e) => setPasswordForm(p => ({ ...p, novaSenha: e.target.value }))} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 pr-12" />
                    <button type="button" onClick={() => setShowPasswordNova(!showPasswordNova)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                      {showPasswordNova ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="Default" label="Alterar Senha" onClick={handleChangePassword} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Minhas Estatísticas</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cursos Concluídos</span>
                  <span className="font-bold text-green-600">{stats.cursosConcluidos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cursos que Faltam</span>
                  <span className="font-bold text-orange-600">{stats.cursosFaltantes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Horas de Estudo</span>
                  <span className="font-bold text-blue-600">{stats.horasEstudo}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Última Atividade</span>
                  <span className="font-bold text-gray-600">{stats.ultimaAtividade ? new Date(stats.ultimaAtividade).toLocaleString('pt-BR') : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
