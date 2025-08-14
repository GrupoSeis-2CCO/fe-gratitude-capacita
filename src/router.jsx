import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { AccessPage } from "./pages/AccessPage";
import { RegisterPage } from "./pages/RegisterPage";
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
]);
