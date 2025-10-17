import { createBrowserRouter, Navigate } from "react-router-dom";

import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AccessPage } from "./pages/AccessPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import ProfileRoutePage from "./pages/ProfileRoutePage.jsx";
import { ClassUsersPage } from "./pages/ClassUsersPage.jsx";
import { UserClassesPage } from "./pages/UserClassesPage.jsx";
import TestPage from "./pages/TestPage.jsx";
import ClassDetailsPage from "./pages/ClassDetailsPage.jsx";
import UserExamsPage from "./pages/UserExamsPage.jsx";
import CreateExamPage from "./pages/CreateExamPage.jsx";
import ExamPage from "./pages/ExamPage.jsx";
import ExamRoutePage from "./pages/ExamRoutePage.jsx";
import AnswerSheetPage from "./pages/AnswerSheetPage.jsx";
import StudentUserExamsPage from "./pages/StudentUserExamsPage.jsx";
import StudentAnswerSheetPage from "./pages/StudentAnswerSheetPage.jsx";
import ClassListPage from "./pages/ClassListPage.jsx";
import CoursesRoutePage from "./pages/CoursesRoutePage.jsx";
import MaterialsListPage from "./pages/MaterialsListPage.jsx";
import MaterialsRoutePage from "./pages/MaterialsRoutePage.jsx";
import MaterialPage from "./pages/MaterialPage.jsx";
import MaterialRoutePage from "./pages/MaterialRoutePage.jsx";
// import FeedbackPage from "./pages/FeedbackPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EditExamPage from "./pages/EditExamPage.jsx";

// Novos: páginas que criamos
import TentativaDetalhePage from "./pages/TentativaDetalhePage.jsx";
import FeedbacksDoCursoPage from "./pages/FeedbacksDoCursoPage.jsx";
import StudentCourseFeedbacksPage from "./pages/StudentCourseFeedbacksPage.jsx";

// 1 = funcionário
// 2 = colaborador

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <Layout footerType="mini">
        <LoginPage />
      </Layout>
    ),
  },
  {
    path: "/acessos",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <AccessPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cadastro",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <RegisterPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "cursos/:idCurso/participante/:id",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <UserPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/perfil",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <ProfileRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/participante/:id",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <UserPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/teste",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <Layout footerType="mini">
          <TestPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <CoursesRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <ClassDetailsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/feedbacks",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <FeedbacksDoCursoPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    // Colaborador vê apenas o próprio feedback do curso
    path: "/cursos/:idCurso/meu-feedback",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini" headerType="student">
          <StudentCourseFeedbacksPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <MaterialsRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/:idMaterial",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <MaterialRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/adicionar-avaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <CreateExamPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <ExamRoutePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/participantes",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <ClassUsersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:id/cursos",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <UserClassesPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:id/avaliacoes",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini" headerType="default">
          <UserExamsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:idUsuario/avaliacoes/:idTentativa",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini" headerType="default">
          <AnswerSheetPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/avaliacoes",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini" headerType="student">
          <StudentUserExamsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    // Atualizado: usamos nossa página de detalhes de tentativa do aluno
    path: "/avaliacoes/:idCurso/:idTentativa",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini" headerType="student">
          <TentativaDetalhePage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao/editar",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <EditExamPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
