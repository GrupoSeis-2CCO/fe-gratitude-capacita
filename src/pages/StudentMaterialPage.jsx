import React, { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import GradientSideRail from "../components/GradientSideRail.jsx";
import TituloPrincipal from "../components/TituloPrincipal";
import Button from "../components/Button.jsx";
import { FileText } from 'lucide-react';

export default function StudentMaterialPage() {
	const { idCurso, idMaterial } = useParams();
	const navigate = useNavigate();
	
	// Função para extrair o videoId da URL do YouTube
	const getYouTubeVideoId = (url) => {
		const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
		const match = url.match(regex);
		return match ? match[1] : null;
	};
	
	// Mock data - em uma aplicação real viria da API
	const mockMaterials = {
		1: {
			id: 1,
			title: "Introdução",
			type: "video",
			videoUrl: "https://www.youtube.com/watch?v=coegGYaT7tQ", // Video do YouTube fornecido
			pdfUrl: null,
			duration: "5:11"
		},
		2: {
			id: 2,
			title: "Lorem Ipsum",
			type: "video", 
			videoUrl: "https://www.youtube.com/watch?v=coegGYaT7tQ",
			pdfUrl: null,
			duration: "8:30"
		},
		3: {
			id: 3,
			title: "Manual do Sistema",
			type: "pdf",
			videoUrl: null,
			pdfUrl: "/manual.pdf", // Usando o arquivo manual.pdf fornecido
			duration: null
		},
		4: {
			id: 4,
			title: "Manual do Sistema",
			type: "pdf",
			videoUrl: null,
			pdfUrl: "/manual.pdf",
			duration: null
		},
		5: {
			id: 5,
			title: "Lorem Ipsum",
			type: "video",
			videoUrl: "https://www.youtube.com/watch?v=coegGYaT7tQ",
			pdfUrl: null,
			duration: "12:45"
		}
	};

	const material = mockMaterials[idMaterial];
	
	if (!material) {
		return (
			<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
				<GradientSideRail className="left-10" />
				<GradientSideRail className="right-10" variant="inverted" />
				<div className="w-full max-w-4xl mx-auto flex-grow flex items-center justify-center">
					<div className="text-center">
						<h2 className="text-2xl font-semibold text-gray-800 mb-4">Material não encontrado</h2>
						<Button
							label="Voltar aos Materiais"
							variant="default"
							onClick={() => navigate(`/cursos/${idCurso}/material`)}
						/>
					</div>
				</div>
			</div>
		);
	}

	// Componente de Video Player - YouTube usando react-youtube
	const VideoPlayer = () => {
		// Extrai o ID do vídeo da URL do YouTube
		const videoId = getYouTubeVideoId(material.videoUrl);
		
		// Debug: log da URL e ID extraído
		console.log('Video URL:', material.videoUrl);
		console.log('Video ID extraído:', videoId);
		
		// Configurações do player do YouTube
		const playerOptions = {
			height: '500',
			width: '100%',
			playerVars: {
				autoplay: 0,
				controls: 1,
				disablekb: 0,
				enablejsapi: 1,
				fs: 1,
				iv_load_policy: 3,
				modestbranding: 1,
				rel: 0,
				showinfo: 0,
				start: 0
			}
		};

		return (
			<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div className="relative">
					{/* Player do YouTube */}
					<div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
						{videoId ? (
							<YouTube
								videoId={videoId}
								opts={playerOptions}
								onReady={(event) => {
									console.log('Player pronto!', event.target);
								}}
								onError={(error) => {
									console.error('Erro no player:', error);
								}}
								className="w-full h-full"
							/>
						) : (
							<div className="flex items-center justify-center h-full text-white">
								<div className="text-center">
									<p>Não foi possível extrair o ID do vídeo</p>
									<p className="text-sm mt-2">URL: {material.videoUrl}</p>
									<button 
										className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
										onClick={() => window.open(material.videoUrl, '_blank')}
									>
										Abrir no YouTube
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			
				{/* Ativar Transcrição */}
				<div className="mt-4">
					<button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded transition-colors">
						Ativar Transcrição
					</button>
				</div>
			</div>
		);
	};

	// Componente de PDF Viewer - Versão simples que sempre funciona
	const PDFViewer = () => {
		return (
			<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
				<div className="border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height: '700px' }}>
					{/* Header do PDF Viewer */}
					<div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<FileText size={20} className="text-red-600" />
							<span className="text-sm font-medium">{material.title}.pdf</span>
						</div>
						<div className="flex items-center gap-2">
							<button 
								className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
								onClick={() => {
									const link = document.createElement('a');
									link.href = material.pdfUrl;
									link.download = `${material.title}.pdf`;
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
								}}
							>
								Baixar PDF
							</button>
							<button 
								className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
								onClick={() => window.open(material.pdfUrl, '_blank')}
							>
								Abrir em Nova Aba
							</button>
						</div>
					</div>
					
					{/* Área do PDF - usando iframe como fallback confiável */}
					<div className="h-full bg-gray-50">
						<iframe
							src={`${material.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
							width="100%"
							height="100%"
							style={{ border: 'none' }}
							title={`PDF: ${material.title}`}
						>
							{/* Fallback para quando iframe não funcionar */}
							<div className="flex flex-col items-center justify-center h-full p-8">
								<FileText size={64} className="text-red-600 mb-4" />
								<p className="text-gray-600 mb-4">Não foi possível carregar o PDF no visualizador</p>
								<button 
									className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
									onClick={() => window.open(material.pdfUrl, '_blank')}
								>
									Abrir PDF em nova aba
								</button>
							</div>
						</iframe>
					</div>
				</div>
				
				{/* Controles informativos */}
				<div className="mt-4 flex items-center justify-center bg-gray-100 rounded p-3">
					<div className="text-sm text-gray-600">
						Use os controles nativos do PDF no visualizador acima ou 
						<button 
							className="text-blue-600 hover:text-blue-800 ml-1 underline"
							onClick={() => window.open(material.pdfUrl, '_blank')}
						>
							abra em nova aba
						</button>
					</div>
				</div>
			</div>
		);
	};

	const handleFinish = () => {
		// Aqui você pode implementar a lógica para marcar como concluído
		alert(`Material "${material.title}" finalizado!`);
		navigate(`/cursos/${idCurso}/material`);
	};

	return (
		<div className="relative min-h-screen flex flex-col bg-white px-8 pt-30 pb-20">
			{/* Decorative rails left and right */}
			<GradientSideRail className="left-10" />
			<GradientSideRail className="right-10" variant="inverted" />

			<div className="w-full max-w-5xl mx-auto flex-grow">
				<div className="text-center mb-8">
					<TituloPrincipal>
						Material {material.type === 'video' ? 'Vídeo' : 'PDF'} - {material.title}
					</TituloPrincipal>
				</div>

				{/* Renderiza o componente apropriado baseado no tipo */}
				{material.type === 'video' ? <VideoPlayer /> : <PDFViewer />}

				{/* Botão Finalizar */}
				<div className="flex justify-center">
					<Button
						label="Finalizar"
						variant="confirm"
						onClick={handleFinish}
						className="px-8 py-3"
					/>
				</div>
			</div>
		</div>
	);
}