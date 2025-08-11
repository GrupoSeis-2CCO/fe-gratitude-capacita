import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import Layout from "./Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: "/home",
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
]);
