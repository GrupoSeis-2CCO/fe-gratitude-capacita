import '../styles/Header.css'
import Link from '../components/Link.jsx';
import Button from '../components/Button.jsx';

function Header(){

    return (
        <header className="Header">
            <Link
                text="Gerenciar Cursos"
            />

            <Link
                text="Histórico de Acessos"
            />

            <Link
                text="Cadastrar Usuário"
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