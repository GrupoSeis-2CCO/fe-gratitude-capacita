import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../components/Button.jsx";
import { userService } from "../services/UserService.js";
import { ChevronLeft, ChevronRight } from "lucide-react";

function StudentHeader({ navItems: navItemsProp, homePath = "/cursos", activeMatcher }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const defaultNavItems = [
    { label: "Meus Cursos", path: "/cursos" },
    { label: "Minhas Avaliacoes", path: "/avaliacoes" },
    { label: "Meu Perfil", path: "/perfil" },
  ];

  const navItems = Array.isArray(navItemsProp) && navItemsProp.length ? navItemsProp : defaultNavItems;

  const isActive = (path) => {
    if (typeof activeMatcher === "function") {
      return activeMatcher(path, location.pathname);
    }
    if (path === homePath) {
      return location.pathname.startsWith(homePath) && location.pathname.split("/").length === homePath.split("/").filter(Boolean).length + 1;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-gray-800 shadow-md">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 md:w-14 md:h-14">
            <div
              className="cursor-pointer"
              onClick={() => navigate(homePath)}
              aria-label="Ir para cursos">
              <img src="/GratitudeLogo.svg" alt="Gratitude Logo" className="w-10 h-10 md:w-14 md:h-14" />
            </div>
          </div>
        </div>

        {/* Nav Desktop - aparece inline no centro */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "text-white bg-orange-600"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Setas de navegação mobile - centro */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white/70 hover:text-white active:scale-95 transition-all"
            aria-label="Voltar"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-2 text-white/70 hover:text-white active:scale-95 transition-all"
            aria-label="Avançar"
          >
            <ChevronRight size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* Botões direita */}
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-md border border-gray-700 px-2 py-2 text-gray-200 hover:text-white hover:border-gray-500 md:hidden cursor-pointer"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Alternar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="hidden md:block">
            <Button label="Sair" variant="Exit" rounded onClick={() => userService.logout()} />
          </div>
        </div>
      </div>

      {/* Nav Mobile - dropdown */}
      <nav className={`${menuOpen ? "block" : "hidden"} md:hidden border-t border-gray-700`}>
        <div className="flex flex-col px-4 py-3 gap-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => { setMenuOpen(false); navigate(item.path); }}
              className={`text-base font-medium px-4 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "text-white bg-orange-600"
                  : "text-gray-300 hover:text-white hover:bg-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
          <Button label="Sair" variant="Exit" rounded className="w-full mt-2" onClick={() => userService.logout()} />
        </div>
      </nav>
    </header>
  );
}

export default StudentHeader;
