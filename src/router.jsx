import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { AccessPage } from "./pages/AcessPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
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
]);
