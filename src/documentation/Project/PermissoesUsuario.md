# 🔐 Regras de Permissão de Usuário

Este documento descreve as regras de permissão implementadas para diferenciar o acesso entre **Colaborador (tipo 1)** e **Funcionário (tipo 2)** na plataforma Gratitude Capacita.

## 📋 Tipos de Usuário

### Colaborador (tipo 1)

- Acesso limitado às funcionalidades básicas
- Foco em aprendizado e desenvolvimento pessoal
- Não pode gerenciar outros usuários

### Funcionário (tipo 2)

- Acesso completo à plataforma
- Pode gerenciar usuários e conteúdo
- Funções administrativas

## 🚨 Sistema de Alertas e Redirecionamento

### Funcionalidades Implementadas

- ✅ **Detecção de usuário não logado**: Alerta específico para usuários sem token
- ✅ **Detecção de falta de permissão**: Alerta específico para usuários logados sem permissão
- ✅ **Redirecionamento automático**: Usuários são redirecionados para `/login`
- ✅ **Mensagens personalizadas**: Diferentes mensagens para cada tipo de bloqueio
- ✅ **Preservação de contexto**: A página de origem é salva para possível redirecionamento após login

### Tipos de Alerta

1. **Usuário não logado**: "🔒 Você precisa estar logado para acessar esta página. Faça login para continuar."
2. **Sem permissão**: "🚫 Acesso negado. Esta página é restrita para: [Tipo]. Você está logado como: [Seu Tipo]."
3. **Logout**: "✅ Você foi desconectado com sucesso."

## 🛡️ Matriz de Permissões por Rota

| Rota                                                | Colaborador (1) | Funcionário (2) | Descrição                                     |
| --------------------------------------------------- | :-------------: | :-------------: | --------------------------------------------- |
| `/login`                                            |       ✅        |       ✅        | Página de login - acesso público              |
| `/acessos`                                          |       ❌        |       ✅        | Histórico de acessos - apenas funcionários    |
| `/cadastro`                                         |       ❌        |       ✅        | Cadastro de usuários - apenas funcionários    |
| `/participante/:id`                                 |       ✅        |       ❌        | Perfil do colaborador - apenas colaboradores  |
| `/teste`                                            |       ✅        |       ✅        | Página de teste - ambos os tipos              |
| `/cursos`                                           |       ✅        |       ✅        | Lista de cursos - ambos os tipos              |
| `/cursos/:idCurso`                                  |       ✅        |       ✅        | Detalhes do curso - ambos os tipos            |
| `/cursos/:idCurso/material`                         |       ✅        |       ✅        | Materiais do curso - ambos os tipos           |
| `/cursos/:idCurso/material/:idMaterial`             |       ✅        |       ✅        | Material específico - ambos os tipos          |
| `/cursos/:idCurso/material/adicionar-avaliacao`     |       ❌        |       ✅        | Criar avaliação - apenas funcionários         |
| `/cursos/:idCurso/material/avaliacao`               |       ✅        |       ✅        | Fazer avaliação - ambos os tipos              |
| `/cursos/teste/participantes`                       |       ❌        |       ✅        | Gerenciar participantes - apenas funcionários |
| `/participantes/teste/cursos`                       |       ✅        |       ✅        | Cursos do participante - ambos os tipos       |
| `/participantes/:id/avaliacoes`                     |       ✅        |       ✅        | Avaliações do participante - ambos os tipos   |
| `/participantes/:idUsuario/avaliacoes/:idTentativa` |       ✅        |       ✅        | Gabarito da avaliação - ambos os tipos        |

## 🔧 Implementação Técnica

### Estrutura de Arquivos

```
src/
├── hooks/
│   └── useAuth.js              # Hook para gerenciamento de autenticação
├── components/
│   ├── ProtectedRoute.jsx      # Componente de proteção de rotas
│   └── Notification.jsx        # Componente de notificação (opcional)
├── contexts/
│   └── NotificationContext.jsx # Contexto global de notificações (opcional)
└── services/
    └── UserService.js          # Serviços de usuário
```

### Hook useAuth

Criado hook personalizado com funcionalidades essenciais:

```javascript
const {
  isAuthenticated,
  getCurrentUser,
  checkPermission,
  redirectToLogin,
  logout,
} = useAuth();

// Verificar se usuário está logado
const loggedIn = isAuthenticated();

// Obter dados do usuário atual
const user = getCurrentUser();

// Verificar permissão para tipos específicos
const hasAccess = checkPermission([2]); // Apenas funcionários

// Redirecionar para login com mensagem
redirectToLogin("Mensagem personalizada");

// Logout com mensagem
logout("Até logo!");
```

### UserService.js

Adicionadas funções utilitárias para verificação de permissões:

```javascript
// Obter tipo do usuário atual
getCurrentUserType: () => {
  return parseInt(localStorage.getItem("userType")) || null;
},

// Verificar se é colaborador
isColaborador: () => {
  return userService.getCurrentUserType() === 1;
},

// Verificar se é funcionário
isFuncionario: () => {
  return userService.getCurrentUserType() === 2;
},

// Verificar permissão geral
hasPermission: (allowedUserTypes) => {
  const currentUserType = userService.getCurrentUserType();
  return allowedUserTypes.includes(currentUserType);
},
```

### ProtectedRoute Component

O componente `ProtectedRoute` usa a prop `allowedUserTypes` para controlar o acesso:

```jsx
<ProtectedRoute allowedUserTypes={[1, 2]}>
  <Layout>
    <ComponentePage />
  </Layout>
</ProtectedRoute>
```

### Router Configuration

Cada rota protegida especifica quais tipos de usuário podem acessá-la:

```jsx
// Apenas funcionários
<ProtectedRoute allowedUserTypes={[2]}>

// Apenas colaboradores
<ProtectedRoute allowedUserTypes={[1]}>

// Ambos os tipos
<ProtectedRoute allowedUserTypes={[1, 2]}>
```

## 🚨 Regras de Segurança

1. **Validação no Frontend e Backend**: As permissões devem ser validadas tanto no frontend quanto no backend
2. **Token Validation**: Sempre verificar a validade do token antes de verificar permissões
3. **Fallback Behavior**: Em caso de erro, redirecionar para login
4. **Auditoria**: Registrar tentativas de acesso não autorizadas

## 📝 Como Adicionar Novas Permissões

1. **Identifique o nível de acesso necessário** para a nova funcionalidade
2. **Atualize a rota** no `router.jsx` com `allowedUserTypes` apropriado
3. **Documente** a nova permissão neste arquivo
4. **Teste** com ambos os tipos de usuário

## 🔄 Histórico de Mudanças

- **2025-09-08**:
  - ✅ Implementação inicial das regras de permissão para colaborador e funcionário
  - ✅ Sistema de alertas e redirecionamento implementado
  - ✅ Hook `useAuth` criado para centralizar lógica de autenticação
  - ✅ Componente `ProtectedRoute` atualizado com alertas específicos
  - ✅ LoginPage atualizada para exibir mensagens de redirecionamento
  - ✅ Sistema de notificações elegante criado (opcional)
  - ✅ Documentação completa das permissões

## 🧪 Como Testar

### Cenários de Teste

1. **Acesso sem login**:

   - Acesse qualquer rota protegida sem token
   - Deve mostrar alerta "Você precisa estar logado..."
   - Deve redirecionar para `/login`

2. **Acesso sem permissão**:

   - Faça login como colaborador (tipo 1)
   - Tente acessar `/cadastro` (restrito para funcionários)
   - Deve mostrar alerta "Acesso negado..."
   - Deve redirecionar para `/login`

3. **Acesso autorizado**:
   - Faça login com permissões adequadas
   - Acesse rotas permitidas
   - Deve funcionar normalmente

### Comandos de Teste

```bash
# Testar build
npm run build

# Testar linting
npm run lint

# Executar aplicação
npm run dev
```
