# 🚦 Como criar rotas no projeto

Este projeto utiliza o React Router para navegação entre páginas. Toda a configuração de rotas está centralizada no arquivo [`src/router.jsx`](/src/router.jsx).

## 📁 Estrutura Básica

- As páginas ficam em: [`src/pages/`](/src/pages/)
- As rotas são configuradas em: [`src/router.jsx`](/src/router.jsx)
- O roteador é usado no app em: [`src/App.jsx`](/src/App.jsx)

## 🛠️ Exemplo de configuração de rotas

Veja como deve ser o arquivo [`src/router.jsx`](/src/router.jsx):

```jsx
import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
  },
]);
```

## 🏗️ Como adicionar uma nova rota

1. **Crie sua página em [`src/pages`](/src/pages/)**  
   Exemplo: `src/pages/Sobre.tsx`

   ```jsx
   export function Sobre() {
     return <h1>Sobre</h1>;
   }
   ```

2. **Adicione a rota em `src/router.jsx`**

   ```jsx
   import { Sobre } from "./pages/Sobre";
   // ...
   export const router = createBrowserRouter([
     // ...outras rotas
     {
       path: "/sobre",
       element: <Sobre />,
     },
   ]);
   ```

3. **Acesse `/sobre` no navegador para ver sua nova página!**

## 🚀 Como o roteador é usado no app

No arquivo [`src/App.jsx`](../../App.jsx):

```jsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

## 📚 Resumo

- Crie um componente de página em [`src/pages`](/src/pages/)
- Importe e adicione no array do `createBrowserRouter` em [`src/router.jsx`](/src/router.jsx)
- Pronto! Sua rota está disponível

---

**Dica:** Para links de navegação, use o componente [`<Link>`](/src/documentation/Components/Link.md) do `react-router-dom`:

```jsx
import { Link } from "react-router-dom";

<Link to="/home">Ir para Home</Link>;
```
