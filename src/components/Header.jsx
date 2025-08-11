import '../styles/Header.css'
import Link from '../components/Link.jsx';
import Button from '../components/Button.jsx';

function Header(){

    return (
        <header className="Header">
            <Link
                text="Gerenciar Cursos"
                // TODO: Adicionar redirecionamento
            />

            <Link
                text="Histórico de Acessos"
                // TODO: Adicionar redirecionamento
            />

            <Link
                text="Cadastrar Usuário"
                // TODO: Adicionar redirecionamento
            />

            <Button
                label="Sair"
                variant="Exit"
                rounded
            />
        </header>
    )
}

export default Header;