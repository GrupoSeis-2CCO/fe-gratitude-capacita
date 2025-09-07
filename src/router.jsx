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
import CreateExamPage from "./pages/CreateExamPage.jsx";
import ExamPage from "./pages/ExamPage.jsx";
import AnswerSheetPage from "./pages/AnswerSheetPage.jsx";
import ClassListPage from "./pages/ClassListPage.jsx";

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
    path: "/cursos",
    element: (
      <Layout footerType="full">
        <ClassListPage />
      </Layout>
    ),
  },
  {
    path: "/cursos/:idCurso",
    element: (
      <Layout footerType="mini">
        <ClassDetailsPage />
      </Layout>
    ),
  },
  {
    path: "/cursos/:idCurso/material/adicionar-avaliacao",
    element: (
      <Layout footerType="mini">
        <CreateExamPage />
      </Layout>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao",
    element: (
      <Layout footerType="mini">
        <ExamPage />
      </Layout>
    ),
  },
  {
    path: "/cursos/teste/participantes",
    element: (
      <Layout footerType="mini">
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
      <Layout footerType="mini">
        <UserExamsPage />
      </Layout>
    ),
  },
  {
    path: "/participantes/:idUsuario/avaliacoes/:idTentativa",
    element: (
      <Layout footerType="mini">
        <AnswerSheetPage />
      </Layout>
    ),
  },
]);
