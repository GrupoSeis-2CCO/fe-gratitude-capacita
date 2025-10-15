# Preview de Vídeo ao Colar URL + Ação ao Fim do Vídeo

Este documento descreve a implementação feita no frontend para mostrar um preview (miniatura + título) quando o usuário cola uma URL de vídeo no formulário de adicionar material, e como estender para detectar quando o vídeo termina (onEnded) e executar uma ação (por exemplo: modal, marcar conclusão, chamada de API).

Resumo curto
- Objetivo: exibir thumbnail e título (preview) para URLs de vídeo (YouTube/Vimeo) ao colar a URL no campo de `AddMaterialSection`.
- Arquivo principal alterado: `src/components/AddMaterialSection.jsx`.
- Abordagem: consulta oEmbed (YouTube -> Vimeo) client-side; exibe thumbnail + título; botão para remover a URL/preview.

Arquivos alterados
- `src/components/AddMaterialSection.jsx`
  - Adicionado estado: `videoPreview`, `loadingPreview`, `previewError`.
  - `useEffect` que dispara quando `urlVideo` muda e faz fetch para os endpoints oEmbed:
    - YouTube oEmbed: `https://www.youtube.com/oembed?url=<url>&format=json`
    - Vimeo oEmbed: `https://vimeo.com/api/oembed.json?url=<url>`
  - UI: quando houver preview, renderiza `<img src={thumbnail} />` e `title`.
  - Adicionado botão de remover URL para limpar `urlVideo` e `videoPreview`.

Como funciona (fluxo)
1. Usuário cola uma URL no campo de vídeo em `AddMaterialSection`.
2. `useEffect` detecta a mudança e chama os endpoints oEmbed (YouTube primeiro, se falhar tenta Vimeo).
3. Se o oEmbed responder com sucesso, o componente define `videoPreview` com os dados retornados.
4. A UI mostra a thumbnail e o título (e autor, quando disponível). Há estados para "Carregando preview..." e mensagens de erro.
5. Usuário pode remover a URL com o botão "Remover".

Contrato mínimo
- Input: string `urlVideo` (URL do vídeo colada pelo usuário).
- Output: objeto `videoPreview` com ao menos `title` e `thumbnail_url` (ou `thumbnail`) e possivelmente `author_name`.
- Erros: `previewError` com mensagem legível quando a fetch falhar ou provider não suportado.

Observações importantes / limitações
- CORS: Algumas chamadas oEmbed podem ser bloqueadas por CORS quando feitas diretamente do browser. Se o navegador bloquear a requisição, o preview não aparecerá. Em produção recomendamos fazer o fetch oEmbed no backend e expor um endpoint interno que o frontend chama.
- Providers suportados: hoje o código tenta YouTube e Vimeo. Provedores adicionais podem ser incluídos estendendo a rotina de oEmbed.
- URLs não suportadas: URLs genéricas (por exemplo um arquivo MP4 hospedado sem oEmbed) não terão preview via oEmbed.

Testes manuais rápidos
1. Inicie a aplicação: `npm run dev`.
2. Navegue até a página de Materiais (onde `AddMaterialSection` é usado).
3. Clique em "Adicionar Material" → selecione "URL" → cole uma URL do YouTube (ex: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`).
4. Aguarde o texto "Carregando preview..."; verifique se aparece a thumbnail e o título.
5. Clique em "Remover" para limpar.

Extensão: ação ao fim do vídeo (onEnded)
- Caso o objetivo seja disparar uma ação quando o usuário assistir o vídeo até o fim, a recomendação é usar um player (ex.: `react-player` ou `<video>`), exibir o player (por exemplo num modal) e usar o evento `onEnded` para executar a ação desejada.

Exemplo rápido (pseudo-code)
```jsx
import React, { useState } from 'react'
import ReactPlayer from 'react-player'
import ConfirmModal from '../components/ConfirmModal.jsx'

function VideoPlayerWithOnEnd({ url }) {
  const [showEndModal, setShowEndModal] = useState(false)

  return (
    <div>
      <ReactPlayer url={url} controls onEnded={() => setShowEndModal(true)} />

      <ConfirmModal
        open={showEndModal}
        title="Vídeo finalizado"
        message="Deseja marcar este vídeo como concluído?"
        onConfirm={() => {
          // exemplo de ação: chamar API para marcar conclusão
          // await api.post('/videos/concluir', { url })
          setShowEndModal(false)
        }}
        onCancel={() => setShowEndModal(false)}
      />
    </div>
  )
}
```

Onde integrar
- Manter o comportamento atual (thumbnail + título) no formulário de adicionar material.
- Colocar um botão "Visualizar" junto ao preview que abre um modal com `ReactPlayer` (só carrega o player quando o usuário escolhe assistir). No modal, use `onEnded` para executar a ação (mostrar modal de conclusão, chamar API, gravar progresso, etc.).

Recomendações técnicas e de segurança
- Fazer o oEmbed no backend se houver rejeição por CORS ou para controlar quotas/API keys.
- Para vídeos privados ou protegidos, o oEmbed não retornará metadados visíveis — trate isso como "sem preview".
- Não autoplay: carregue e reproduza o vídeo apenas mediante ação do usuário (botão "Assistir"), para evitar experiências indesejadas e consumo de banda.

Próximos passos possíveis (sugestões)
- Implementar botão "Visualizar" que abre modal com `ReactPlayer` e `onEnded` para ação pós-vídeo.
- Mover o fetch oEmbed para o backend para evitar CORS/problemas de cross-origin.
- Cachear respostas oEmbed no backend para reduzir latência e chamadas repetidas.
- Adicionar suporte a mais provedores (Twitch, DailyMotion) se necessário.

Comandos úteis
```bash
npm install         # se faltar dependências
npm run dev         # iniciar dev server
# Se for usar ReactPlayer no fluxo de reprodução:
npm install react-player
```

Responsável pela alteração
- Implementação feita por automação assistida no frontend (arquivo: `src/components/AddMaterialSection.jsx`).

---

Se quiser, eu posso:
- Implementar o modal com `ReactPlayer` e `onEnded` já integrado, com a chamada de API de conclusão pronta, ou
- Mover a lógica de oEmbed para um endpoint de backend (preciso das informações do backend para propor a rota/exemplo). Qual prefere que eu faça a seguir?