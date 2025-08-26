# Footer Component

O componente Footer representa o rodapé da aplicação Gratitude Capacita, contendo informações de navegação, contato e logotipos da empresa.

## Uso

```jsx
import Footer from '../components/Footer.jsx';

function Layout({ children }) {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  );
}
```

## Características

- **Layout fixo**: Altura de 6.75rem (27 * 0.25rem) com flexbox para distribuição dos elementos
- **Background**: Fundo cinza escuro (#1D262D - gray-800)
- **Responsivo**: Elementos distribuídos em 3 seções iguais

## Seções

### 1. Logo Principal (Esquerda)
- Placeholder para logo da Gratitude Serviços
- Posicionado no canto esquerdo
- Retângulo cinza com texto "LOGO"

### 2. Links de Navegação (Centro)
- "Gerenciar Cursos"
- "Histórico de Acesso" 
- "Cadastrar Usuário"
- Texto em cinza (#949383) com fonte Inter extrabold

### 3. Informações de Contato (Direita)
- Título "Contato" em destaque
- Email: gratitude@gratitudeservicos.com.br (sublinhado)
- Telefone: (11) 98222-1092
- Endereço: Rua Riachuelo, 326 - Sé, São Paulo - SP

## Estilização

- **Cores**: 
  - Background: `bg-gray-800` (#1D262D)
  - Texto: `text-gray-400` (#949383) e `text-gray-300`
  - Logo placeholder: `bg-gray-600`
- **Fontes**: Inter com pesos variados (medium, bold, extrabold)
- **Decoração**: Email sublinhado (`underline`)
- **Layout**: Flexbox com 3 seções de largura igual (`flex-1`)

## Integração

O Footer é automaticamente incluído em todas as páginas através do componente Layout, garantindo consistência visual em toda a aplicação.
