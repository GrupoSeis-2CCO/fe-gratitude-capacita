# ✏️ Input

Componente de input reutilizável para o projeto Gratitude Capacita.

## 💡 Uso Básico

```jsx
<Input
  value={value}
  onValueChange={setValue}
  placeholder="Digite algo..."
  type="text"
  required
/>
```

## 📝 Props

| Prop            | Tipo                      | Padrão      | Obrigatório    | Descrição                                                                   |
| --------------- | ------------------------- | ----------- | -------------- | --------------------------------------------------------------------------- |
| `onValueChange` | `function` | `null` | ✅ | Função necessária para utilizar o valor do input e atribuit a uma váriavel (useState)       |
| `value`         | `string`     | `""`        | ❌ | Valor que o input terá ao ser criado                |
| `type`          | `string`                  | `text`    | ❌ | Tipo do input                           |
| `placeholder`   | `string`                  | `''`        | ❌ | Texto placeholder.                                                          |
| `required`      | `boolean`                 | `false`     | ❌ | Define se o campo é obrigatório.                                            |

## Comportamento esperado

- Utilizar onValueChange com useState na página pai para utilizar o valor inputado diretamente pela página.

## Exemplo visual

<table>
<tr>
<td width="50%">

```jsx
// Exemplo em uma página pai
import { useState } from "react";
import Input from "../../components/Input";

export default function ExamplePage() {
  const [nome, setNome] = useState("");

  return (
    <div>
      <Input
        value={nome}
        onValueChange={setNome}
        placeholder="Seu nome completo"
      />
    </div>
  );
}
```

</td>
<td width="50%">

<div align="center">
  <img src="" alt="input estado padrão" />
</div>

</td>
</tr>
</table>