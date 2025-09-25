import Button from '../components/Button.jsx';
import { userService } from '../services/UserService';

function StudentHeader(){

    return (
        <header className="absolute gap-4 w-full h-24 bg-gray-800 flex items-center justify-between px-8 z-10">
            {/* Logo à esquerda */}
            <div className="flex items-center">
                <img src="/GratitudeLogo.svg" alt="Gratitude Logo" className="w-20 h-20" />
            </div>

            {/* Título central */}
            <div className="flex items-center">
                <h1 className="text-white text-xl font-semibold">Assistir Cursos</h1>
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