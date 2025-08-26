import { createBrowserRouter, Navigate } from "react-router-dom";
import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AccessPage } from "./pages/AccessPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ClassUsersPage } from "./pages/ClassUsersPage.jsx";
import { UserClassesPage } from "./pages/UserClassesPage.jsx";
<<<<<<< HEAD
import  ProtectedRoute  from "./components/ProtectedRoute"; 
=======
import TestPage from "./pages/TestPage.jsx";
import ClassDetailsPage from "./pages/ClassDetailsPage.jsx";
>>>>>>> 7d3d36bff4a23c2e91f75e2c44bfb5ed7b838f55

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
      <ProtectedRoute> 
        <Layout>
          <AccessPage />
        </Layout>
      </ProtectedRoute>
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
      <ProtectedRoute> 
        <Layout>
          <UserPage />
        </Layout>
      </ProtectedRoute>
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
      <ProtectedRoute> 
        <Layout>
          <ClassUsersPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/participantes/teste/cursos",
    element: (
      <ProtectedRoute> 
        <Layout>
          <UserClassesPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <div>Página não encontrada</div>, 
  },
]);