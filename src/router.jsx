import { createBrowserRouter, Navigate } from "react-router-dom";
import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AccessPage } from "./pages/AccessPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ClassUsersPage } from "./pages/ClassUsersPage.jsx";
import { UserClassesPage } from "./pages/UserClassesPage.jsx";
import  ProtectedRoute  from "./components/ProtectedRoute"; 

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