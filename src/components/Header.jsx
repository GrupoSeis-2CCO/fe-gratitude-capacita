import React from "react";
import StudentHeader from "./StudentHeader.jsx";
import { userService } from "../services/UserService.js";

function Header() {
  const userType = userService?.getCurrentUserType?.() ?? null;

  if (!userService.isLoggedIn()) {
    return null;
  }

  const navItems = [
    { label: "Gerenciar Cursos", path: "/cursos" },
    { label: "Historico de acesso", path: "/acessos" },
    { label: "Cadastrar Usuario", path: "/cadastro" },
  ];

  if (userType === 1) {
    navItems.push({ label: "Dashboard", path: "/admin/dashboard" });
  }

  const activeMatcher = (path, pathname) => {
    if (path === "/cursos") return pathname.startsWith("/cursos");
    if (path === "/admin/dashboard") return pathname.startsWith("/admin/dashboard");
    return pathname === path;
  };

  return <StudentHeader navItems={navItems} homePath="/cursos" activeMatcher={activeMatcher} />;
}

export default Header;
