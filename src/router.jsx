
import { createBrowserRouter, Navigate } from "react-router-dom";

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
import MaterialsListPage from "./pages/MaterialsListPage.jsx";
import MaterialPage from "./pages/MaterialPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
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
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <Layout>
          <AccessPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cadastro",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout>
          <RegisterPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participante/:id",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <Layout>
          <UserPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/teste",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout>
          <TestPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <Layout footerType="full">
          <ClassListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <ClassDetailsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <MaterialsListPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/:idMaterial",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <MaterialPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/adicionar-avaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <CreateExamPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <ExamPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/teste/participantes",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <ClassUsersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/teste/cursos",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout>
          <UserClassesPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:id/avaliacoes",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <UserExamsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:idUsuario/avaliacoes/:idTentativa",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini">
          <AnswerSheetPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
