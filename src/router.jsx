import { createBrowserRouter } from "react-router-dom";

import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AccessPage } from "./pages/AccessPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ClassUsersPage } from "./pages/ClassUsersPage.jsx";
import { UserClassesPage } from "./pages/UserClassesPage.jsx";
import TestPage from "./pages/TestPage.jsx";
import ClassDetailsPage from "./pages/ClassDetailsPage.jsx";
import UserExamsPage from "./pages/UserExamsPage.jsx";

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
    path: "/teste",
    element: (
      <Layout>
        <TestPage />
      </Layout>
    ),
  },
  {
    path: "/cursos/:idCurso",
    element: (
      <Layout>
        <ClassDetailsPage />
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
  {
    path: "/participantes/:id/avaliacoes",
    element: (
      <Layout>
        <UserExamsPage />
      </Layout>
    ),
  },
]);
