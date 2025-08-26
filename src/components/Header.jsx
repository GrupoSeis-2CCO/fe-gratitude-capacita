<<<<<<< HEAD
import '../styles/Header.css';
=======
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
import Link from '../components/Link.jsx';
import Button from '../components/Button.jsx';
import { userService } from '../services/userService';

function Header() {
  const isAuthenticated = !!localStorage.getItem('token');

<<<<<<< HEAD
  const handleLogout = () => {
    userService.logout();
  };

  return (
    <header className="Header">
      {isAuthenticated ? (
        <>
          <Link
            text="Gerenciar Cursos"
            redirect="/cursos"
          />

          <Link
            text="Histórico de Acessos"
            redirect="/acessos"
          />

          <Link
            text="Cadastrar Usuário"
            redirect="/cadastro"
          />

          <Button 
            label="Sair" 
            variant="Exit" 
            rounded 
            onClick={handleLogout} 
          />
        </>
      ) : (
        <Link 
          text="Entrar" 
          redirect="/login" 
        />
      )}
    </header>
  );
=======
    return (
        <header className="absolute top-0 left-0 w-full h-25 bg-gray-800 flex items-center justify-between px-8 ">
            {/* Logo à esquerda */}
            <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
                        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.3"/>
                        <circle cx="12" cy="12" r="6" fill="currentColor"/>
                        <circle cx="12" cy="9" r="2" fill="white"/>
                        <path d="M8 15 Q8 13 12 13 Q16 13 16 15 L16 17 Q16 19 12 19 Q8 19 8 17 Z" fill="white"/>
                    </svg>
                </div>
            </div>

            {/* Links no centro */}
            <div className="flex items-center gap-40">
                <Link
                    text="Gerenciar Cursos"
                    redirect="/cursos"
                />

                <Link
                    text="Histórico de acesso"
                    redirect="/acessos"
                />

                <Link
                    text="Cadastrar Usuário"
                    redirect="/cadastro"
                />
            </div>

            {/* Botão Sair à direita */}
            <div>
                <Button
                    label="Sair"
                    variant="Exit"
                    rounded
                />
            </div>
        </header>
    )
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55
}

export default Header;