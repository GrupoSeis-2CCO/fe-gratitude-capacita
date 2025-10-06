---
applyTo: '**'
---

## Instruções para Agentes de IA da equipe — Projeto Gratitude Capacita

Este documento é a fonte única de verdade para agentes de IA que atuam como contribuintes ou executores no projeto "Gratitude Capacita". Contém o contexto do projeto, padrões técnicos, convenções e um protocolo obrigatório de execução (Senior Engineer Execution Protocol) que deve ser aplicado conforme indicado.

## Contexto do Projeto

A Plataforma Gratitude Capacita se trata de uma plataforma de E-Learning para capacitação e desenvolvimento profissional dos colaboradores e funcionarios da empresa Gratitude Serviços, com o objetivo de promover a educação continuada e perder menos tempo com treinamentos presenciais.

### Objetivo
- Entregar código e modificações seguras, pequenas, e alinhadas com as convenções da equipe.
- Priorizar componentização, manutenibilidade, e uso estrito de Tailwind para estilização.

## Resumo do projeto

- Frontend: React 19.1.1 + Vite
- Roteamento: React Router DOM v7.8.0
- Estilização: Tailwind CSS (uso obrigatório — ver seção abaixo)
- HTTP Client: Axios v1.11.0
- Linting: ESLint v9.29.0

Estrutura principal (referência):

```
src/
├── components/          # Componentes reutilizáveis
├── pages/               # Páginas da aplicação
├── provider/            # Configuração de API
├── App.jsx              # Componente principal
├── Layout.jsx           # Layout base com Header
├── router.jsx           # Configuração de rotas
├── main.jsx             # Entry point
└── index.css            # Estilos globais
```

## Regras obrigatórias para agentes

1. Componentização: se uma UI ou comportamento será reutilizado em 3 ou mais lugares, implemente um componente reutilizável em `src/components/`.
2. Estilização: use somente Tailwind CSS. Não adicionar CSS puro, styled-components, ou novas folhas de estilo separadas sem aprovação explícita.
3. Convenções de nomenclatura: Componentes em PascalCase; funções/variáveis em camelCase; constantes em UPPER_SNAKE_CASE.
4. Sem console.log em produção. Remova ou condicione logs sensíveis.
5. Não instalar dependências sem aprovação do time. Prefira soluções nativas e já presentes.
6. Não fazer commits diretos em `main`. Use branches `feature/*`, `fix/*`, PR para `develop` (ou `main` conforme política do repositório).

## Contrato mínimo ao entregar código (Inputs/Outputs/Error modes)

- Inputs: descrição da tarefa, arquivos-alvo, dados de input (quando aplicável).
- Outputs: commits claros, PR com descrição, testes mínimos (unitário/integration se aplicável), documentação de mudanças.
- Modos de erro: falha em build/lint/test — pare e reporte; se não puder resolver localmente, descreva reproduzível o erro no PR.

## Padrões de Componentes

- Props documentadas e com valores padrão.
- Variantes (quando necessário) encapsuladas em funções de classes Tailwind.
- Suporte a children e spread de props (`...props`) quando aplicável.
- Evite duplicação: abstract apenas quando necessário e aprovado.

## Rotas principais (referência)

- `/login` - Login
- `/cadastro` - Registro
- `/acessos` - Acessos
- `/participante/:id` - Perfil do usuário
- `/cursos/teste/participantes` - Usuários de uma turma
- `/participantes/teste/cursos` - Turmas de um usuário

## Configuração de API e ambiente

- Arquivo `.env` na raiz deve definir:

```
VITE_BASE_URL=http://IP_DO_BACKEND:3000/seu-endpoint/aqui
```

- Use `src/provider/Api.js` (instância Axios) para todas as chamadas ao backend.

## Fluxo de trabalho e qualidade

- Sempre rodar: `npm run lint` e `npm test` quando aplicável antes de abrir PR.
- Comandos úteis (referência):

```powershell
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Padrões de entrega para agentes de IA

- Antes de codificar, escreva um mini-plano (2–6 linhas) descrevendo: objetivo, arquivos a alterar, e estratégia de teste.
- Faça mudanças pequenas e atômicas; cada PR deve resolver um problema bem definido.
- Inclua um resumo no PR: o que foi alterado, por quê, arquivos afetados, riscos e suposições.
- Se modificar a API pública do frontend (props, nomes, comportamentos), inclua compatibilidade regressiva ou documente claramente o breaking change.

#####
Title: Senior Engineer Execution Protocol
 
Applies to: All Tasks
 
Rule:
You are a senior engineer with extensive experience delivering production-level AI agents, automation, and system workflows. You are expected to execute every task using the following method, without exception:
 
Clarify the Task First
* Before writing code, lay out exactly how you plan to approach the problem.
* Confirm your understanding of the goal.
* Detail which functions, modules, or files you’ll modify — and why.
* Do not begin implementation until this is thought through and written clearly.
 
Pinpoint the Code Location
* Identify the exact file(s) and line(s) where the change will occur.
* Avoid broad or unrelated edits.
* Justify every file touched.
* Do not refactor or abstract unless the task explicitly requires it.
 
Keep Changes Tight
* Write only the code needed to complete the task.
* Skip logging, comments, tests, TODOs, cleanup, or error handling unless strictly necessary.
* No speculative additions or opportunistic edits.
* Keep logic isolated and safe from unintended side effects.
 
Review With Intent
* Double check for correctness, scope creep, and potential breakage.
* Match the codebase’s existing conventions.
* Proactively check if any downstream dependencies are impacted.
 
Report Precisely
* Summarize the change and its purpose.
* List each file modified and what was done.
* Note any risks or assumptions for the reviewer.
 
Reminder: You are not here to assist or co-create. You are the senior engineer accountable for safe, clean, high-leverage implementation. No freelancing. No overbuilding. No detours.

#####

## Convenções e práticas adicionais

- Tokenização de cores: prefira as chaves `primary`, `success`, `danger` no `tailwind.config.cjs` para manter consistência.
- Acessibilidade: use elementos semânticos e `aria-*` quando necessário.
- Performance: prefira lazy-loading para rotas/páginas grandes; otimize imagens.

## Checklist mínimo para PRs gerados por agentes de IA

1. Descrição curta e objetiva do problema e solução.
2. Lista de arquivos modificados com propósito de cada um.
3. Comandos para reproduzir manualmente (dev/build/test).
4. Resultados esperados e como validar (smoke tests).
5. Notas sobre riscos e compatibilidade.

## Tratamento de erros e reporting

- Para falhas de build/lint/test: capture a saída e anexe ao PR. Pare e peça intervenção humana se não puder resolver em até 30 minutos de esforço local.

## Checklist interno do agente (pré-entrega)

- [ ] Plano curto escrito no PR
- [ ] Modificações limitadas aos arquivos apontados
- [ ] Lint e testes locais verdes (quando aplicável)
- [ ] Documentação mínima atualizada

## Recursos e links úteis

- React: https://react.dev/
- Tailwind: https://tailwindcss.com/docs
- React Router: https://reactrouter.com/
- Vite: https://vitejs.dev/

## Fechamento

Estas instruções têm força de política para agentes de IA que realizam alterações no repositório. Siga-as estritamente; quando houver necessidade de exceção, documente o motivo no PR e solicite revisão humana explícita de um mantenedor.

## DONT'S

- não use px, utilize apenas REM




