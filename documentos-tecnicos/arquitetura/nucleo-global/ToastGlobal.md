# Documentacao Tecnica — ToastGlobal

Sistema global de feedback visual para o usuario. Toda acao do sistema (salvar, criar, erro, aviso) exibe uma notificacao temporaria no canto inferior direito da tela. Nenhum erro ou sucesso fica invisivel.

---

## Visao Geral

O sistema de Toast tem 3 camadas que trabalham juntas:

| Camada | Componente | Responsabilidade |
| :--- | :--- | :--- |
| **1 — Visual** | `ToastGlobal` | Renderiza o toast individual (icone, mensagem, botao, progresso) |
| **2 — Gerenciador** | `ToastProvider` | Contexto React que gerencia a fila e empilhamento |
| **3 — Hook** | `useToast()` | API para qualquer componente disparar toasts |

**Localizacao:** `nucleo-global/Feedback/toast-global/`

---

## Anatomia do Toast

```
+--+----------------------------------------------+--+
|  | [icone]  Mensagem principal                   |X |
|  |          Ref: a7f3-b2c1  (opcional)           |  |
|  |          [ Tentar novamente ] (opcional)       |  |
+--+----------------------------------------------+--+
|========== barra de progresso ============        |
+--------------------------------------------------+

Barra lateral colorida (3px, lado esquerdo)
```

| Zona | Descricao |
| :--- | :--- |
| **Barra lateral** | 3px colorida a esquerda, identifica o tipo visualmente |
| **Icone** | Phosphor Icon 20px, cor do tipo |
| **Mensagem** | Texto principal, 0.875rem, font-weight 500 |
| **Ref** | Codigo de referencia para suporte (somente em erros 500), 0.6875rem, DM Mono |
| **Botao retry** | Pill button "Tentar novamente" com icone de refresh (somente em erros retry-able) |
| **Botao fechar** | X no canto superior direito, sempre presente |
| **Barra de progresso** | 2px na base, anima de 100% a 0% durante o tempo de auto-dismiss |

---

## 4 Variantes Visuais

| Variante | Cor da barra | Cor do icone | Icone Phosphor | Quando usar |
| :--- | :--- | :--- | :--- | :--- |
| `success` | `--success` (#22c55e) | Verde | `CheckCircle` | Acao concluida com sucesso |
| `error` | `--danger` (#ef4444) | Vermelho | `WarningCircle` | Acao falhou |
| `warning` | `--warning` (#f59e0b) | Amarelo | `Warning` | Situacao que exige atencao |
| `info` | `--accent` (#6366f1) | Indigo | `Info` | Informacao contextual |

---

## Tempo na Tela (auto-dismiss)

| Variante | Tempo padrao | Barra de progresso | Pode fechar manualmente |
| :--- | :--- | :--- | :--- |
| `success` | 3 segundos | Sim, anima 3s | Sim |
| `error` | 8 segundos | Sim, anima 8s | Sim |
| `error` (500) | 10 segundos | Sim, anima 10s | Sim |
| `warning` | 8 segundos | Sim, anima 8s | Sim |
| `warning` (persistente) | Sem auto-dismiss | Nao | Sim |
| `info` | 5 segundos | Sim, anima 5s | Sim |

**Regra:** toasts persistentes (sem auto-dismiss) sao usados apenas para estados que o usuario precisa resolver (ex: sem conexao, sessao expirando).

---

## Empilhamento

- Maximo **3 toasts visiveis** simultaneamente
- Novos toasts empilham de baixo para cima
- Se ja existem 3, o mais antigo e removido automaticamente
- Toasts aguardam na fila se o limite for atingido
- Posicao fixa: canto inferior direito, `bottom: 1.5rem`, `right: 1.5rem`
- Gap entre toasts: `0.75rem`
- Largura maxima: `420px`

---

## Catalogo Completo de Mensagens

### Sucesso (verde, 3s)

| Situacao | Mensagem |
| :--- | :--- |
| Dados salvos | Salvo com sucesso. |
| Workspace criado | Workspace criado! Vamos configurar sua empresa. |
| Convite enviado | Convite enviado para o e-mail informado. |
| Produto ativado | Produto ativado no seu workspace. |
| Produto desativado | Produto desativado. |
| Configuracao atualizada | Configuracao atualizada. |
| Membro adicionado | Membro adicionado a equipe. |
| Membro removido | Membro removido da equipe. |
| Permissao alterada | Permissao atualizada. |
| Arquivo exportado | Exportacao concluida. Verifique seus downloads. |
| E-mail enviado | E-mail enviado. |
| Atividade criada | Atividade registrada. |
| Operacao duplicada | Operacao duplicada com sucesso. |
| Conexao restaurada | Conexao restaurada. |

### Erro (vermelho, 8-10s, com botao "Tentar novamente")

| Situacao | Mensagem | Ref | Retry |
| :--- | :--- | :--- | :--- |
| Erro ao salvar | Nao foi possivel salvar. Tente novamente. | Nao | Sim |
| Erro ao criar workspace | Nao foi possivel criar o workspace. Tente novamente. | Nao | Sim |
| Erro ao carregar dados | Nao conseguimos carregar os dados. Tente novamente. | Nao | Sim |
| Erro ao enviar convite | Nao foi possivel enviar o convite. Verifique o e-mail e tente novamente. | Nao | Sim |
| Erro ao ativar produto | Nao foi possivel ativar o produto. Tente novamente. | Nao | Sim |
| Erro ao exportar | A exportacao falhou. Tente novamente. | Nao | Sim |
| Erro ao enviar e-mail | O e-mail nao pode ser enviado. Tente novamente. | Nao | Sim |
| Erro ao excluir | Nao foi possivel excluir. Tente novamente. | Nao | Sim |
| Erro de servidor (500) | Algo deu errado do nosso lado. Tente novamente em alguns instantes. | Sim | Sim |
| Erro desconhecido | Ocorreu um erro inesperado. Se o problema persistir, entre em contato com o suporte. | Nao | Nao |
| Timeout | A operacao demorou mais que o esperado. Tente novamente. | Nao | Sim |

### Aviso (amarelo, 8s ou persistente)

| Situacao | Mensagem | Persistente |
| :--- | :--- | :--- |
| Sem permissao | Voce nao tem permissao para esta acao. Fale com o administrador do workspace. | Nao (8s) |
| Conexao instavel | Sua conexao esta instavel. Algumas acoes podem demorar mais. | Sim |
| Sem conexao | Voce esta sem conexao. Reconectaremos automaticamente. | Sim |
| Sessao expirando | Sua sessao vai expirar em breve. Salve seu trabalho. | Sim |
| Limite do plano | Voce atingiu o limite do seu plano para esta funcionalidade. | Nao (8s) |
| Muitas tentativas (429) | Muitas tentativas. Aguarde alguns segundos. | Nao (8s) |

### Informativo (azul/indigo, 5s)

| Situacao | Mensagem | Persistente |
| :--- | :--- | :--- |
| Processando em segundo plano | Estamos processando sua solicitacao. Voce sera notificado quando terminar. | Nao (5s) |
| Atualizacao disponivel | Nova versao disponivel. Recarregue a pagina para atualizar. | Sim |
| Manutencao programada | Manutencao programada para [data]. Salve seu trabalho antes. | Sim |

---

## Mapeamento HTTP para Mensagem

O `apiClient` intercepta respostas HTTP e dispara o toast automaticamente:

| Codigo HTTP | Codigo do backend | Acao no frontend |
| :--- | :--- | :--- |
| 400 | `VALIDATION_ERROR` | Nao dispara toast — mostra erro inline no campo |
| 401 | `UNAUTHORIZED` | Redireciona para login silenciosamente |
| 403 | `FORBIDDEN` | Toast warning: "Voce nao tem permissao para esta acao." |
| 404 | `NOT_FOUND` | Toast error: "O item que voce procura nao foi encontrado." |
| 409 | `CONFLICT` | Toast error: "Este registro ja existe." |
| 422 | Regra de negocio | Toast error: mensagem vinda do backend (ja em PT-BR) |
| 429 | `RATE_LIMIT` | Toast warning: "Muitas tentativas. Aguarde alguns segundos." |
| 500 | `INTERNAL_ERROR` | Toast error + Ref (correlationId) + retry |
| 503 | `SERVICE_UNAVAILABLE` | Toast error: "Servico temporariamente indisponivel." |
| Rede | Fetch failed | Toast warning persistente: "Voce esta sem conexao." |
| Timeout | Timeout | Toast error + retry |

**Sucesso automatico:** toda requisicao POST/PUT/DELETE que retorna 2xx dispara toast success.

---

## Validacao Inline (campos de formulario)

Erros de validacao (HTTP 400 / `VALIDATION_ERROR`) NAO usam toast. Aparecem como mensagem vermelha abaixo do campo com erro.

| Campo | Mensagem |
| :--- | :--- |
| Campo obrigatorio vazio | Este campo e obrigatorio. |
| E-mail invalido | Digite um e-mail valido. |
| CNPJ invalido | CNPJ invalido. Verifique os numeros. |
| Valor fora do range | O valor deve estar entre [X] e [Y]. |
| Texto muito curto | Minimo de [X] caracteres. |
| Texto muito longo | Maximo de [X] caracteres. |
| Formato invalido | Formato invalido. Exemplo: [formato esperado]. |
| Nome ja em uso | Ja existe um workspace com este nome. |

**Anatomia do erro inline:**

```
LABEL DO CAMPO *
+-------------------------------+
| valor digitado                |  <- borda vermelha (--danger)
+-------------------------------+
[icone] Mensagem de erro          <- 0.8125rem, cor --danger, font-weight 500
```

---

## ErrorBoundary (tela de crash)

Quando um componente React quebra, em vez de tela branca o usuario ve:

| Elemento | Valor |
| :--- | :--- |
| **Icone** | Warning (Phosphor), 48px, cor `--warning` |
| **Titulo** | "Algo deu errado" |
| **Descricao** | "Esta pagina encontrou um problema e nao pode ser exibida corretamente." |
| **Botao primario** | "Recarregar pagina" (pill, accent, com icone ArrowClockwise) |
| **Ref** | "Se o problema continuar, informe ao suporte: Ref: [id]" — 0.6875rem, DM Mono, cor muted |

**Container:** centralizado, max-width 480px, bg `--bg-base`, border `--bg-surface`, radius 12px, shadow-md.

---

## Especificacao Tecnica de Estilos

### Toast Container (posicao fixa)

| Propriedade | Valor |
| :--- | :--- |
| `position` | `fixed` |
| `bottom` | `1.5rem` |
| `right` | `1.5rem` |
| `max-width` | `420px` |
| `width` | `100%` |
| `z-index` | `9999` |
| `display` | `flex` |
| `flex-direction` | `column-reverse` |
| `gap` | `0.75rem` |

### Toast Individual

| Propriedade | Valor |
| :--- | :--- |
| `background` | `var(--bg-base)` (#1e293b) |
| `border` | `1px solid var(--bg-surface)` |
| `border-radius` | `var(--radius-lg)` (12px) |
| `box-shadow` | `var(--shadow-md)` |
| `padding` | `0.875rem 1rem` |
| `gap` (interno) | `0.75rem` |
| `font-family` | Plus Jakarta Sans |

### Barra Lateral (indicador de tipo)

| Propriedade | Valor |
| :--- | :--- |
| `position` | `absolute`, left 0, top 0, bottom 0 |
| `width` | `3px` |
| `border-radius` | `12px 0 0 12px` |
| `background` | Cor do tipo (success/danger/warning/accent) |

### Mensagem

| Propriedade | Valor |
| :--- | :--- |
| `font-size` | `0.875rem` |
| `font-weight` | `500` |
| `line-height` | `1.5` |
| `color` | `var(--text-primary)` |

### Ref (correlationId)

| Propriedade | Valor |
| :--- | :--- |
| `font-size` | `0.6875rem` |
| `font-family` | DM Mono |
| `color` | `var(--text-muted)` |
| `margin-top` | `0.25rem` |

### Botao Tentar Novamente

| Propriedade | Valor |
| :--- | :--- |
| `padding` | `0.25rem 0.75rem` |
| `font-size` | `0.75rem` |
| `font-weight` | `600` |
| `border-radius` | `9999px` (pill) |
| `background` | `var(--bg-surface)` |
| `border` | `1px solid var(--bg-elevated)` |
| `margin-top` | `0.5rem` |
| Hover | `background: var(--bg-elevated)` |

### Botao Fechar (X)

| Propriedade | Valor |
| :--- | :--- |
| `width` / `height` | `18px` |
| `color` | `var(--text-muted)` |
| Hover | `color: var(--text-primary)` |

### Barra de Progresso

| Propriedade | Valor |
| :--- | :--- |
| `position` | `absolute`, bottom 0, left 0 |
| `height` | `2px` |
| `border-radius` | `0 0 12px 12px` |
| `background` | Cor do tipo |
| `animation` | `progress-shrink` de width 100% a 0%, linear |

### Animacao de Entrada

```css
@keyframes toast-in {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

Duracao: 0.3s, timing: ease-out.

---

## API do Hook useToast()

```tsx
const toast = useToast()

// Sucesso
toast.success('Salvo com sucesso.')

// Erro com retry
toast.error('Nao foi possivel salvar.', {
  retry: () => salvarDados()
})

// Erro 500 com ref
toast.error('Algo deu errado do nosso lado.', {
  ref: 'a7f3-b2c1',
  retry: () => salvarDados(),
  duration: 10000
})

// Aviso
toast.warning('Voce nao tem permissao para esta acao.')

// Aviso persistente
toast.warning('Voce esta sem conexao.', {
  persistent: true
})

// Informativo
toast.info('Estamos processando sua solicitacao.')
```

### Opcoes

| Opcao | Tipo | Padrao | Descricao |
| :--- | :--- | :--- | :--- |
| `duration` | `number` | Varia por tipo | Tempo em ms antes de auto-dismiss |
| `persistent` | `boolean` | `false` | Se true, nao faz auto-dismiss |
| `retry` | `() => void` | `undefined` | Callback do botao "Tentar novamente" |
| `ref` | `string` | `undefined` | Codigo de referencia para suporte |

---

## Integracao com apiClient

O `apiClient.ts` e modificado para interceptar automaticamente:

```tsx
// POST/PUT/DELETE com sucesso -> toast.success()
// Erro HTTP -> toast.error() com mensagem mapeada
// 500 -> inclui ref (x-correlation-id da response)
// 401 -> redireciona, sem toast
// 400 VALIDATION_ERROR -> sem toast (erro inline)
// Falha de rede -> toast.warning() persistente
// 5xx -> retry 1x automatico antes de mostrar erro
```

Nenhum componente precisa tratar erros manualmente. O interceptor cuida de tudo.

---

## Integracao no App

```tsx
// main.tsx
import { ToastProvider } from '@nucleo/toast-global'
import { ErrorBoundaryGlobal } from '@nucleo/error-boundary-global'

createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <ErrorBoundaryGlobal>
      <App />
    </ErrorBoundaryGlobal>
  </ToastProvider>
)
```

---

## Arquivos do Pacote

```
nucleo-global/Feedback/toast-global/
  src/
    ToastGlobal.tsx          <- componente visual do toast individual
    ToastProvider.tsx         <- contexto React + fila + empilhamento
    useToast.ts              <- hook publico
    toast-global.css         <- estilos
    index.ts                 <- exports
  package.json
  tsconfig.json

nucleo-global/Feedback/error-boundary-global/
  src/
    ErrorBoundaryGlobal.tsx  <- class component React
    error-boundary-global.css
    index.ts
  package.json
  tsconfig.json
```

---

## Preview Visual

Arquivo HTML estatico com todos os toasts renderizados e demo interativo:

`nucleo-global/Feedback/toast-global/preview-toast.html`

Abrir no browser para ver todas as variantes, animacoes e comportamentos.

---

## Regras de Uso

1. **Nunca** usar `alert()`, `window.confirm()` ou `console.log` para feedback ao usuario
2. **Nunca** criar divs inline de erro em componentes — usar `useToast()`
3. **Nunca** deixar um POST/PUT/DELETE sem feedback visual (sucesso ou erro)
4. **Sempre** incluir `correlationId` como Ref em erros 500
5. **Sempre** oferecer "Tentar novamente" em erros de rede, timeout e 5xx
6. **Validacao de campo** usa erro inline, nao toast
7. **401** redireciona silenciosamente, nao mostra toast
8. **ErrorBoundary** envolve cada rota — crash nunca resulta em tela branca
