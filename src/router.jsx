import { createBrowserRouter } from "react-router-dom";

import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AccessPage } from "./pages/AccessPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Layout>
        <LoginPage />
      </Layout>
    ),
  },
  {
    path: "/acessos",
    element: (
      <Layout>
        <AccessPage />
      </Layout>
    ),
  },
  {
    path: "/cadastro",
    element: (
      <Layout>
        <RegisterPage />
      </Layout>
    ),
  },
  {
    path: "/participante/:id",
    element: (
      <Layout>
        <UserPage />
      </Layout>
    ),
  },
  {
    path: "/cursos/teste/participantes",
    element: (
      <Layout>
        <ClassUsersPage />
      </Layout>
    ),
  },
  {
    path: "/participantes/teste/cursos",
    element: (
      <Layout>
        <UserClassesPage />
      </Layout>
    ),
  },
]);
