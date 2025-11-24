import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Eager imports - only for critical initial routes
import Layout from "./Layout";
import { LoginPage } from "./pages/LoginPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CoursesRoutePage from "./pages/CoursesRoutePage.jsx";

// Lazy imports - loaded on demand
const UserPage = lazy(() => import("./pages/UserPage.jsx").then(m => ({ default: m.UserPage })));
const AccessPage = lazy(() => import("./pages/AccessPage.jsx").then(m => ({ default: m.AccessPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx").then(m => ({ default: m.RegisterPage })));
const ClassUsersPage = lazy(() => import("./pages/ClassUsersPage.jsx").then(m => ({ default: m.ClassUsersPage })));
const UserClassesPage = lazy(() => import("./pages/UserClassesPage.jsx").then(m => ({ default: m.UserClassesPage })));
const TestPage = lazy(() => import("./pages/TestPage.jsx"));
const ClassDetailsPage = lazy(() => import("./pages/ClassDetailsPage.jsx"));
const UserExamsPage = lazy(() => import("./pages/UserExamsPage.jsx"));
const CreateExamPage = lazy(() => import("./pages/CreateExamPage.jsx"));
const ExamPage = lazy(() => import("./pages/ExamPage.jsx"));
const ExamRoutePage = lazy(() => import("./pages/ExamRoutePage.jsx"));
const AnswerSheetPage = lazy(() => import("./pages/AnswerSheetPage.jsx"));
const StudentUserExamsPage = lazy(() => import("./pages/StudentUserExamsPage.jsx"));
const StudentAnswerSheetPage = lazy(() => import("./pages/StudentAnswerSheetPage.jsx"));
const ClassListPage = lazy(() => import("./pages/ClassListPage.jsx"));
const MaterialsListPage = lazy(() => import("./pages/MaterialsListPage.jsx"));
const MaterialsRoutePage = lazy(() => import("./pages/MaterialsRoutePage.jsx"));
const MaterialPage = lazy(() => import("./pages/MaterialPage.jsx"));
const MaterialRoutePage = lazy(() => import("./pages/MaterialRoutePage.jsx"));
const EditExamPage = lazy(() => import("./pages/EditExamPage.jsx"));
const TentativaDetalhePage = lazy(() => import("./pages/TentativaDetalhePage.jsx"));
const FeedbacksDoCursoPage = lazy(() => import("./pages/FeedbacksDoCursoPage.jsx"));
const StudentCourseFeedbacksPage = lazy(() => import("./pages/StudentCourseFeedbacksPage.jsx"));
const StudentProfile = lazy(() => import("./pages/StudentProfile.jsx"));
const MailhogTestPage = lazy(() => import("./pages/MailhogTestPage.jsx"));

// Wrapper component for Suspense
const LazyLoad = ({ children }) => (
  <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
    {children}
  </Suspense>
);

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
          <LazyLoad><AccessPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cadastro",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><RegisterPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "cursos/:idCurso/participante/:id",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><UserPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/perfil",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini" headerType="student">
          <LazyLoad><StudentProfile /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participante/:id",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><UserPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/teste",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <Layout footerType="mini">
          <LazyLoad><TestPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/mailhog-test",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><MailhogTestPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <AdminDashboardPage />
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
          <LazyLoad><ClassDetailsPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/feedbacks",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><FeedbacksDoCursoPage /></LazyLoad>
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
          <LazyLoad><StudentCourseFeedbacksPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <LazyLoad><MaterialsRoutePage /></LazyLoad>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/:idMaterial",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <LazyLoad><MaterialRoutePage /></LazyLoad>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/adicionar-avaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><CreateExamPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <LazyLoad><ExamRoutePage /></LazyLoad>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao/:idAvaliacao",
    element: (
      <ProtectedRoute allowedUserTypes={[1,2]}>
        <LazyLoad><ExamRoutePage /></LazyLoad>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/participantes",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><ClassUsersPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:id/cursos",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><UserClassesPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:id/avaliacoes",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini" headerType="default">
          <LazyLoad><UserExamsPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/:idUsuario/avaliacoes/:idTentativa",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini" headerType="default">
          <LazyLoad><AnswerSheetPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/avaliacoes",
    element: (
      <ProtectedRoute allowedUserTypes={[2]}>
        <Layout footerType="mini" headerType="student">
          <LazyLoad><StudentUserExamsPage /></LazyLoad>
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
          <LazyLoad><TentativaDetalhePage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cursos/:idCurso/material/avaliacao/editar",
    element: (
      <ProtectedRoute allowedUserTypes={[1]}>
        <Layout footerType="mini">
          <LazyLoad><EditExamPage /></LazyLoad>
        </Layout>
      </ProtectedRoute>
    ),
  },
]);
