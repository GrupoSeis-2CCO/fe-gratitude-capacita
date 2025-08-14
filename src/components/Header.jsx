import '../styles/Header.css'
import Link from '../components/Link.jsx';
import Button from '../components/Button.jsx';

function Header(){

    return (
        <header className="Header">
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
            />
        </header>
    )
}

export default Header;