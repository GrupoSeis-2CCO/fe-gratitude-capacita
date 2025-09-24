# Integração Backend - FeedbackPage

## Resumo da Implementação

A página FeedbackPage.jsx foi integrada com o backend Spring Boot para buscar e exibir feedbacks de cursos em tempo real.

## Arquivos Modificados

### 1. `src/services/feedbackService.js` (CRIADO)
- Serviço para comunicação com API de feedbacks
- Métodos para buscar feedbacks por curso e criar novos feedbacks
- Tratamento de erros centralizado

### 2. `src/pages/FeedbackPage.jsx` (INTEGRADO)
- Substituição de dados mock por integração real com backend
- Estados de loading, erro e sucesso implementados
- Filtros funcionais por quantidade de estrelas
- Transformação de dados do formato backend para frontend
- Interface de usuário responsiva para todos os estados

### 3. `.env` (CONFIGURADO)
- URL da API configurada: `http://localhost:8080`

## Endpoints Utilizados

1. **GET /feedbacks/{idCurso}** (POST no backend)
   - Busca todos os feedbacks de um curso específico
   - Retorna lista de feedbacks com dados do usuário

2. **POST /feedbacks** (PREPARADO)
   - Criação de novos feedbacks
   - Estrutura pronta para implementação futura

## Estrutura de Dados

### Frontend para Backend:
```javascript
{
  idCurso: number,
  estrelas: number,
  motivo: string,
  fkUsuario: number
}
```

### Backend para Frontend:
```javascript
{
  fkCurso: number,
  estrelas: number,
  motivo: string,
  fkUsuario: {
    idUsuario: number,
    nome: string,
    // outros campos...
  },
  curso: {
    // dados do curso...
  }
}
```

## Estados da Interface

- **Loading**: Mostra "Carregando feedbacks..."
- **Erro**: Mostra mensagem de erro + botão "Tentar novamente"
- **Vazio**: Mostra "Nenhum feedback encontrado"
- **Filtrado**: Mostra mensagem quando filtros não retornam resultados
- **Sucesso**: Lista os feedbacks com filtros funcionais

## Funcionalidades Implementadas

✅ Busca de feedbacks por curso
✅ Estados de loading e erro
✅ Filtros por quantidade de estrelas
✅ Interface responsiva
✅ Transformação de dados
✅ Tratamento de erros
✅ Retry automático em caso de erro

## Como Usar

1. Navegue para `/cursos/{idCurso}/feedbacks`
2. A página carregará automaticamente os feedbacks do curso
3. Use o dropdown para filtrar por quantidade de estrelas
4. Em caso de erro, clique em "Tentar novamente"

## Configuração do Backend

Certifique-se de que o backend Spring Boot está rodando na porta 8080 e que os endpoints estão disponíveis conforme a documentação fornecida.