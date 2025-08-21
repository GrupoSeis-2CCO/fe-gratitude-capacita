# 📚 Prompt Base - Projeto Gratitude Capacita

## 🎯 Contexto do Projeto

Este é um projeto educacional desenvolvido para nossa faculdade por uma equipe de 5 desenvolvedores. Trata-se de uma plataforma de capacitação e gestão de cursos com funcionalidades de autenticação, gerenciamento de usuários, turmas e materiais.

## 🛠️ Stack Tecnológica

- **Frontend**: React 19.1.1 + Vite
- **Roteamento**: React Router DOM v7.8.0
- **Estilização**: Tailwind CSS v4.1.12
- **HTTP Client**: Axios v1.11.0
- **Linting**: ESLint v9.29.0

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.jsx      # Botão com variantes (Default, Exit, Confirm, Cancel)
│   ├── Class.jsx       # Card de turma
│   ├── Header.jsx      # Cabeçalho da aplicação
│   ├── Link.jsx        # Link customizado
│   └── Table.jsx       # Tabela reutilizável
├── pages/              # Páginas da aplicação
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── UserPage.jsx
│   ├── AccessPage.jsx
│   ├── ClassDetailsPage.jsx
│   ├── ClassListPage.jsx
│   ├── ClassUsersPage.jsx
│   ├── UserClassesPage.jsx
│   ├── ExamPage.jsx
│   ├── CreateExamPage.jsx
│   ├── AnswerSheetPage.jsx
│   ├── FeedbackPage.jsx
│   ├── MaterialPage.jsx
│   ├── MaterialsListPage.jsx
│   ├── UserExamsPage.jsx
│   └── AccessHistoryPage.jsx
├── provider/           # Configuração de API
│   └── Api.js         # Instância do Axios
├── documentation/      # Documentação de componentes
├── App.jsx            # Componente principal
├── Layout.jsx         # Layout base com Header
├── router.jsx         # Configuração de rotas
├── main.jsx          # Entry point
└── index.css         # Estilos globais
```

## 🎨 Padrões de Estilização com Tailwind

### Classes Base Utilizadas
- **Cores principais**: `orange-500`, `orange-600` (gradientes para botões padrão)
- **Cores de estado**: 
  - Sucesso: `green-500`, `green-600`
  - Erro: `red-500`, `red-600` 
  - Cancelar: `gray-500`, `gray-600`
- **Espaçamentos**: `px-6 py-3` para botões, `p-4` para cards
- **Bordas**: `rounded-lg` padrão, `rounded-full` para botões arredondados
- **Transições**: `transition-all duration-200`

### Variantes de Componentes
```jsx
// Exemplo do componente Button
<Button variant="Default" label="Salvar" />
<Button variant="Exit" label="Sair" />
<Button variant="Confirm" label="Confirmar" />
<Button variant="Cancel" label="Cancelar" />
```

## 🔗 Padrões de Roteamento

### Estrutura de Rotas
- `/login` - Página de login
- `/cadastro` - Página de registro
- `/acessos` - Página de acessos
- `/participante/:id` - Perfil do usuário
- `/cursos/teste/participantes` - Usuários de uma turma
- `/participantes/teste/cursos` - Turmas de um usuário

### Layout Padrão
Todas as páginas utilizam o componente `Layout` que inclui o `Header` automaticamente.

## 🌐 Configuração de API

### Arquivo de Ambiente (.env)
Criar na raiz do projeto:
```env
VITE_API_URL=http://localhost:3000/api
```

### Uso da API
```jsx
import api from '../provider/Api.js';

// Exemplo de uso
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Erro na API:', error);
  }
};
```

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `UserPage.jsx`)
- **Funções**: camelCase (ex: `fetchUserData`)
- **Variáveis**: camelCase (ex: `userData`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `API_BASE_URL`)

### 🔄 Criação de Componentes Reutilizáveis

**REGRA IMPORTANTE**: Se um elemento/funcionalidade será usado em 3 ou mais lugares, SEMPRE criar um componente reutilizável!

#### Quando Criar Componentes:
- **Botões customizados** → Usar/expandir `Button.jsx`
- **Cards/containers repetitivos** → Criar componente específico
- **Formulários similares** → Criar componentes de input
- **Modais/popups** → Componente `Modal.jsx`
- **Loading states** → Componente `Loading.jsx`
- **Mensagens de erro/sucesso** → Componente `Alert.jsx`

#### Estrutura para Novos Componentes:
```jsx
// src/components/NomeDoComponente.jsx
import React from 'react';

function NomeDoComponente({ 
  // Props com valores padrão
  variant = 'default',
  size = 'medium',
  children,
  ...props 
}) {
  // Lógica do componente
  const getVariantClasses = () => {
    switch(variant) {
      case 'primary': return 'bg-primary-500 text-white';
      case 'secondary': return 'bg-gray-200 text-gray-800';
      default: return 'bg-white border border-gray-300';
    }
  };

  return (
    <div 
      className={`${getVariantClasses()} ${size === 'large' ? 'p-6' : 'p-4'} rounded-lg`}
      {...props}
    >
      {children}
    </div>
  );
}

export default NomeDoComponente;
```

#### Checklist para Componentes Reutilizáveis:
- [ ] Props bem definidas com valores padrão
- [ ] Variantes para diferentes contextos
- [ ] Classes Tailwind organizadas em funções
- [ ] Suporte a `children` quando apropriado
- [ ] Spread de props restantes (`...props`)
- [ ] Documentação das props principais

### Estrutura de Componentes
```jsx
import React from 'react';

function ComponentName({ prop1, prop2 }) {
  // Estados e hooks no topo
  const [state, setState] = useState(initialValue);
  
  // Funções auxiliares
  const handleFunction = () => {
    // lógica aqui
  };
  
  // Renderização
  return (
    <div className="tailwind-classes">
      {/* JSX aqui */}
    </div>
  );
}

export default ComponentName;
```

### Props e PropTypes
- Use destructuring para props: `{ prop1, prop2 }`
- Documente props complexas com comentários
- Use valores padrão quando apropriado

## 🎯 Padrões de Desenvolvimento

### Componentes Reutilizáveis
1. **Button**: Componente base para todos os botões
2. **Table**: Tabela padrão para listagens
3. **Class**: Card para exibição de turmas
4. **Link**: Links customizados
5. **Header**: Cabeçalho com navegação

### Estados e Gerenciamento
- Use `useState` para estados locais
- Considere Context API para estados globais se necessário
- Mantenha estados no componente mais próximo que precisa dele

### Tratamento de Erros
```jsx
try {
  const response = await api.get('/data');
  setData(response.data);
} catch (error) {
  console.error('Erro ao buscar dados:', error);
  // Mostrar feedback para o usuário
}
```

## 🚀 Comandos Essenciais

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar linting
npm run lint

# Preview da build
npm run preview
```

## 📋 Checklist para Novas Features

### Antes de Começar
- [ ] Verificar se a feature está alinhada com o escopo do projeto
- [ ] Criar branch específica para a feature
- [ ] Verificar dependências necessárias

### Durante o Desenvolvimento
- [ ] Seguir a estrutura de pastas estabelecida
- [ ] Usar componentes existentes quando possível
- [ ] Aplicar classes Tailwind seguindo os padrões
- [ ] Implementar tratamento de erros
- [ ] Testar responsividade

### Antes do Commit
- [ ] Executar `npm run lint` e corrigir erros
- [ ] Testar funcionalidade em diferentes navegadores
- [ ] Verificar se não quebrou outras funcionalidades
- [ ] Commit com mensagem descritiva

## 🤝 Workflow da Equipe

### Branches
- `main`: Branch principal (sempre estável)
- `develop`: Branch de desenvolvimento
- `feature/nome-da-feature`: Branches de features
- `fix/nome-do-fix`: Branches de correções

### Commits
Usar convenção de commits semânticos:
```
feat: adiciona nova funcionalidade de login
fix: corrige bug no componente Button
style: ajusta espaçamento no Header
refactor: melhora estrutura do componente Table
docs: atualiza documentação da API
```

### Code Review
- Sempre fazer pull request para `develop`
- Pelo menos 1 aprovação antes do merge
- Verificar se segue os padrões estabelecidos
- Testar localmente antes de aprovar

## 🎨 Guia de UI/UX

### Paleta de Cores (Tailwind)
- **Primária**: Orange (500-600)
- **Sucesso**: Green (500-600)
- **Erro**: Red (500-600)
- **Neutro**: Gray (500-600)

### 🎨 Tokenização de Cores Customizadas
Para cores específicas do projeto, edite o arquivo `tailwind.config.cjs`:

```javascript
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx,html,md}"],
  theme: {
    extend: {
      colors: {
        // Cores customizadas do projeto
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // orange-500
          600: '#ea580c', // orange-600
          900: '#9a3412',
        },
        success: {
          500: '#22c55e', // green-500
          600: '#16a34a', // green-600
        },
        danger: {
          500: '#ef4444', // red-500
          600: '#dc2626', // red-600
        }
      }
    },
  },
  plugins: [],
};
```

**Uso das cores tokenizadas:**
```jsx
// Em vez de: bg-orange-500
// Use: bg-primary-500

// Em vez de: bg-green-500
// Use: bg-success-500
```

### Espaçamentos Padrão
- **Botões**: `px-6 py-3`
- **Cards**: `p-4` ou `p-6`
- **Containers**: `container mx-auto px-4`
- **Margens**: `mb-4`, `mt-6`, etc.

### Responsividade
Sempre considerar breakpoints:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+

## 🔧 Troubleshooting Comum

### Problemas Frequentes
1. **Tailwind não funcionando**: Verificar `tailwind.config.cjs`
2. **Rotas não funcionando**: Verificar `router.jsx`
3. **API não conectando**: Verificar arquivo `.env`
4. **Componente não renderizando**: Verificar imports e exports

### Soluções Rápidas
```bash
# Limpar cache do Vite
npm run dev -- --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Verificar linting
npm run lint -- --fix
```

## 📚 Recursos Úteis

### Documentação
- [React 19 Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

### Ferramentas Recomendadas
- **VS Code** com extensões:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Prettier
  - ESLint

## 🎯 Objetivos de Qualidade

### Performance
- Componentes leves e reutilizáveis
- Lazy loading quando necessário
- Otimização de imagens

### Manutenibilidade
- Código limpo e bem documentado
- Componentes pequenos e focados
- Separação clara de responsabilidades

### Acessibilidade
- Usar elementos semânticos
- Adicionar `aria-labels` quando necessário
- Garantir contraste adequado

## 🚨 Regras Importantes

### ❌ NÃO FAZER
- Não criar arquivos CSS separados (usar apenas Tailwind)
- Não instalar bibliotecas sem discussão da equipe
- Não fazer commits direto na `main`
- Não deixar console.log em produção
- Não quebrar a estrutura de pastas estabelecida
- **NÃO duplicar código** - Se vai usar em 3+ lugares, crie um componente!

### ✅ SEMPRE FAZER
- Usar componentes existentes quando possível
- **Criar componentes reutilizáveis** para elementos repetitivos
- Seguir a convenção de nomenclatura
- Testar em diferentes tamanhos de tela
- Documentar código complexo
- Fazer commits pequenos e frequentes
- **Pensar em reutilização** antes de codificar

---

## 💡 Prompt para IA (Claude/ChatGPT)

Quando solicitar ajuda de IA, use este contexto:

```
Estou trabalhando em um projeto React + Vite + Tailwind CSS para uma plataforma educacional. 
O projeto usa:
- React 19.1.1 com React Router DOM v7
- Tailwind CSS v4.1.12 para estilização
- Axios para requisições HTTP
- Estrutura com componentes reutilizáveis (Button, Table, Header, etc.)
- Layout padrão com Header em todas as páginas
- Paleta de cores baseada em orange (primária), green (sucesso), red (erro)

[Descrever a tarefa específica aqui]

Mantenha o código consistente com os padrões existentes e use apenas Tailwind para estilização.
```

---

**Lembre-se**: Este documento é vivo e deve ser atualizado conforme o projeto evolui. Qualquer mudança significativa nos padrões deve ser discutida com toda a equipe! 🚀
