import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AccessPage } from "./pages/AccessPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { UserPage } from "./pages/UserPage.jsx";
import Layout from "./Layout";

export const router = createBrowserRouter([
  {
    path: "/cursos",
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
]);
