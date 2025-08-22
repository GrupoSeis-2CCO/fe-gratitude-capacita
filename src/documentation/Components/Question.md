# Question Component

Componente para exibir questões de múltipla escolha com alternativas A, B, C, D.

## Uso Básico

```jsx
import Question from '../components/Question';

const questoes = [
  "Alternativa 1",
  "Alternativa 2", 
  "Alternativa 3",
  "Alternativa 4"
];

function ExemploBasico() {
  const [resposta, setResposta] = useState(null);
  
  return (
    <Question
      questionNumber={1}
      questionText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed in libero rhoncus, congue lectus et, vulputate dolor. Maecenas sed eros augue."
      alternatives={questoes}
      selectedAnswer={resposta}
      onAnswerSelect={setResposta}
    />
  );
}
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `questionNumber` | `number` | `1` | Número da questão exibido no título |
| `questionText` | `string` | `""` | Texto do enunciado da questão |
| `alternatives` | `string[]` | `[]` | Array com as 4 alternativas |
| `selectedAnswer` | `number` \\| `null` | `null` | Índice da alternativa selecionada (0-3) |
| `correctAnswer` | `number` \\| `null` | `null` | Índice da alternativa correta (0-3) |
| `showResult` | `boolean` | `false` | Se deve mostrar o resultado (cores de certo/errado) |
| `onAnswerSelect` | `function` | `undefined` | Callback chamado quando uma alternativa é selecionada |

## Estados Visuais

### Estado Normal
- Alternativas não selecionadas: fundo cinza claro
- Alternativa selecionada: fundo azul claro

### Estado de Resultado (showResult=true)
- Alternativa correta: fundo amarelo (como no design original)
- Alternativa selecionada incorreta: fundo vermelho
- Outras alternativas: fundo cinza claro

## Exemplo com Resultado

```jsx
<Question
  questionNumber={1}
  questionText="Qual é a capital do Brasil?"
  alternatives={[
    "São Paulo",
    "Rio de Janeiro", 
    "Brasília",
    "Belo Horizonte"
  ]}
  selectedAnswer={1}
  correctAnswer={2}
  showResult={true}
/>
```

## Acessibilidade

- Utiliza elementos `button` semânticos
- Suporte completo ao teclado
- Estados visuais claros para feedback
- Desabilitação automática quando `showResult=true`

## Estilo

O componente segue o design fornecido do Figma:
- Cards com sombra e bordas arredondadas
- Tipografia Inter em tamanhos adequados
- Cores conforme especificação (amarelo para correto, vermelho para incorreto)
- Layout responsivo com Tailwind CSS
