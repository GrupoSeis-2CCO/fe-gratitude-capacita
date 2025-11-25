import React from 'react';
import { useLocation } from 'react-router-dom';
import Link from '../components/Link.jsx';
import Button from '../components/Button.jsx';
import BackButton from '../components/BackButton.jsx';
import { userService } from '../services/UserService.js';

function Header() {
  if (!userService.isLoggedIn()) {
    return null;
  }
  
  return (
    <header className="absolute gap-4 w-full h-24 bg-gray-800 flex items-center justify-between px-8 z-10">
      {/* Logo ou Voltar à esquerda */}
      <div className="flex items-center justify-center w-20">
        {isRootPage ? (
          <img src="/GratitudeLogo.svg" alt="Gratitude Logo" className="w-20 h-20" />
        ) : (
          <BackButton className="!static !m-0 !p-0" />
        )}
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
          onClick={() => userService.logout()}
        />
      </div>
    </header>
  )
}

export default Header;
