import React, { useState } from "react";
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button";
import ActionButton from "../components/ActionButton";
import { User, Settings, Shield, Bell, Eye, EyeOff } from 'lucide-react';

export function ProfilePage() {
	const [isEditing, setIsEditing] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		name: "João Silva Santos",
		email: "joao.silva@gratitudeservicos.com.br",
		cpf: "123.456.789-00",
		phone: "(11) 98765-4321",
		password: "••••••••"
	});

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSave = () => {
		setIsEditing(false);
		// Aqui seria feita a chamada à API
		console.log('Dados salvos:', formData);
	};

	const handleCancel = () => {
		setIsEditing(false);
		// Resetar dados se necessário
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-[#F2F2F2] px-8 pt-13 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-6xl mx-auto flex-grow">
				<div className="text-center mb-10">
					<TituloPrincipal>Meu Perfil</TituloPrincipal>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Coluna Esquerda - Informações do Perfil */}
					<div className="lg:col-span-2">
						{/* Card de Informações Pessoais */}
						<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
							<div className="flex justify-between items-center mb-6">
								<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
									<User size={24} className="text-orange-500" />
									Informações Pessoais
								</h2>
								{!isEditing ? (
									<Button 
										variant="Default" 
										label="Editar Perfil" 
										onClick={() => setIsEditing(true)}
									/>
								) : (
									<div className="flex gap-3">
										<Button 
											variant="Confirm" 
											label="Salvar" 
											onClick={handleSave}
										/>
										<Button 
											variant="Cancel" 
											label="Cancelar" 
											onClick={handleCancel}
										/>
									</div>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Nome Completo
									</label>
									{isEditing ? (
										<input
											type="text"
											value={formData.name}
											onChange={(e) => handleInputChange('name', e.target.value)}
											className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
										/>
									) : (
										<p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.name}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Email
									</label>
									{isEditing ? (
										<input
											type="email"
											value={formData.email}
											onChange={(e) => handleInputChange('email', e.target.value)}
											className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
										/>
									) : (
										<p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.email}</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										CPF
									</label>
									<p className="text-gray-600 p-3 bg-gray-100 rounded-lg">{formData.cpf}</p>
									<span className="text-xs text-gray-500">CPF não pode ser alterado</span>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Telefone
									</label>
									{isEditing ? (
										<input
											type="tel"
											value={formData.phone}
											onChange={(e) => handleInputChange('phone', e.target.value)}
											className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
										/>
									) : (
										<p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formData.phone}</p>
									)}
								</div>

								{/* Cargo and Departamento removed from profile view */}
							</div>
						</div>

						{/* Card de Segurança */}
						<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
							<h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
								<Shield size={24} className="text-orange-500" />
								Segurança
							</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Senha Atual
									</label>
									<div className="relative">
										<input
											type={showPassword ? "text" : "password"}
											value={formData.password}
											readOnly={!isEditing}
											className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 pr-12"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
										>
											{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
										</button>
									</div>
								</div>

								<Button 
									variant="Default" 
									label="Alterar Senha" 
									onClick={() => {/* Implementar mudança de senha */}}
								/>
							</div>
						</div>
					</div>

					{/* Coluna Direita - Ações e Configurações */}
					<div className="lg:col-span-1">
						{/* Ações Rápidas */}
						<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
								<Settings size={20} className="text-orange-500" />
								Ações Rápidas
							</h2>
							<div className="space-y-3">
								<ActionButton
									icon="📊"
									text="Meu Desempenho"
									onClick={() => console.log("Meu Desempenho clicado")}
								/>
								<ActionButton
									icon="📚"
									text="Meus Cursos"
									onClick={() => console.log("Meus Cursos clicado")}
								/>
								<ActionButton
									icon="📋"
									text="Minhas Avaliações"
									onClick={() => console.log("Minhas Avaliações clicado")}
								/>
							
							</div>
						</div>

						

						{/* Estatísticas Rápidas */}
						<div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
							<h2 className="text-xl font-bold text-gray-800 mb-4">Minhas Estatísticas</h2>
							<div className="space-y-4">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Cursos Concluídos</span>
									<span className="font-bold text-green-600">12</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Cursos em Andamento</span>
									<span className="font-bold text-orange-600">3</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Horas de Estudo</span>
									<span className="font-bold text-blue-600">245h</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Última Atividade</span>
									<span className="font-bold text-gray-600">Hoje</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
