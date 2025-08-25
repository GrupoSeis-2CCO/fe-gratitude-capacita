import '../styles/Header.css';
import Link from '../components/Link.jsx';
import Button from '../components/Button.jsx';
import { userService } from '../services/userService';

function Header() {
  const isAuthenticated = !!localStorage.getItem('token');

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
}

export default Header;