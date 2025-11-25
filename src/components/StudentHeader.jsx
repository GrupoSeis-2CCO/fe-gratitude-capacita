import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button.jsx';
import BackButton from '../components/BackButton.jsx';
import { userService } from '../services/UserService';

function StudentHeader(){
    const navigate = useNavigate();
    const location = useLocation();

    // Função para determinar se um link está ativo
    const isActive = (path) => {
        if (path === '/cursos') {
            return location.pathname.startsWith('/cursos') && location.pathname.split('/').length === 2;
        }
        return location.pathname === path;
    };

    const isRootPage = ['/cursos', '/avaliacoes', '/perfil'].includes(location.pathname);

    return (
        <header className="absolute gap-4 w-full h-24 bg-gray-800 flex items-center justify-between px-8 z-10">
            {/* Logo ou Voltar à esquerda */}
            <div className="flex items-center justify-center w-20">
                {isRootPage ? (
                    <div className="cursor-pointer" onClick={() => navigate('/cursos')}>
                        <img src="/GratitudeLogo.svg" alt="Gratitude Logo" className="w-20 h-20" />
                    </div>
                ) : (
                    <BackButton className="!static !m-0 !p-0" />
                )}
            </div>

            {/* Menu de navegação central */}
            <div className="flex items-center space-x-8">
                <button
                    onClick={() => navigate('/cursos')}
                    className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${
                        isActive('/cursos') 
                            ? 'text-white bg-orange-600' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    Meus Cursos
                </button>
                
                <button
                    onClick={() => navigate('/avaliacoes')}
                    className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${
                        isActive('/avaliacoes') 
                            ? 'text-white bg-orange-600' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    Minhas Avaliações
                </button>

                <button
                    onClick={() => navigate('/perfil')}
                    className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${
                        isActive('/perfil') 
                            ? 'text-white bg-orange-600' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                >
                    Meu Perfil
                </button>
            </div>

            {/* Botão Sair à direita */}
            <div>
                <Button
                    label="Sair"
                    variant="Exit"
                    rounded
                    onClick={() => userService.logout()}
                />
            </div>
        </header>
    )
}

export default StudentHeader;