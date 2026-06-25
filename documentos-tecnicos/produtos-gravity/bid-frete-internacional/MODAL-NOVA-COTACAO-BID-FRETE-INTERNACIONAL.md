# Modal Nova Cotação — BID Frete Internacional (Técnico)

> **Status:** Implementado (passo Fornecedores — WIP UX pós-#302)  
> **PRs:** #284, #288, #290, #302  
> **QA:** Doc atualizada; testes automatizados no fechamento da tela

---

## 1. SSOT de código

| Artefato | Caminho |
|----------|---------|
| Modal wizard (5 passos) | `servicos-global/produto/bid-frete-internacional/client/src/pages/modal-nova-cotacao-bid-frete-internacional.tsx` |
| Seleção fornecedores + disparo | `servicos-global/produto/bid-frete-internacional/client/src/pages/selecao-fornecedores-disparo-bid-frete-internacional.tsx` |
| API client | `servicos-global/produto/bid-frete-internacional/client/src/shared/api.ts` |
| POST cotação + disparo | `servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes.ts` |

**Rota frontend:** `/produto/bid-frete-internacional/cotacoes/nova`  
**Shell:** `ModalPassoPassoGlobal` (`@nucleo/modal-passo-passo-global`)

**Carga perigosa (DG):** ver [CARGA-PERIGOSA-TECNICO.md](./CARGA-PERIGOSA-TECNICO.md) — passo 1 (toggle) + passo 3 (combo ONU).

---

## 2. Wizard — 5 passos

| # | Passo | Conteúdo principal |
|---|-------|-------------------|
| 1 | Modal e Operação | Tipo operação, modal frete, modalidade, **toggle Carga perigosa** |
| 2 | Origem e Destino | Porto/aeroporto/rodoviário por modal — ver [ROTA-COTACAO-POR-MODAL-TECNICO.md](./ROTA-COTACAO-POR-MODAL-TECNICO.md) |
| 3 | Carga e Incoterm | Mercadoria, NCM, **classificação ONU (se DG)**, containers/volumes, incoterm + helper card |
| 4 | **Fornecedores** | Prazo, visibilidade, anônima, canais, seleção/disparo — **este documento detalha** |
| 5 | Resumo | Valor alvo, moeda, receipt visual da rota |

---

## 3. Passo 4 — Fornecedores e envio

### 3.1 Prazo para respostas

- Campo opcional: `data_limite_resposta_cotacao_bid_frete_internacional`
- **UI:** `CampoCalendarioGlobal` (data) + `<input type="time">` (hora) — grid `.nc-prazo-data-hora`
- **Estado no form:** string `"YYYY-MM-DDTHH:mm"` (sem timezone)
- **POST:** convertido para ISO via `new Date(...).toISOString()` antes do envio (exigência `z.string().datetime()` no backend)

### 3.2 Visibilidade da cotação

| Valor DDD | Label UI | Comportamento de disparo |
|-----------|----------|--------------------------|
| `DIRECIONADA` | Direcionada — Escolher fornecedores | Apenas `fornecedor_ids` selecionados recebem disparo |
| `ABERTA` | Aberta — Todos os fornecedores | Elegíveis (ativos + aceita aberta); UI pode excluir; POST envia subset em `fornecedor_ids` |

Campo: `visibilidade_cotacao_bid_frete_internacional`  
Toggle anônima: `anonima_cotacao_bid_frete_internacional`

### 3.3 Canais de disparo

Checkboxes em `canaisDisparo: CanalDisparo[]`:

- `EMAIL` — E-mail (Resend)
- `WHATSAPP` — WhatsApp

Enviados no POST como `canais_disparo` + flag `disparar_ao_criar` quando há canal marcado e há destinatários.

### 3.4 Carregamento de fornecedores

No passo 4 (`step === 4`), **ambas** as visibilidades disparam:

```ts
getFornecedores({ limit: 200, status: 'ATIVO' })
```

Motivo: alimentar preview (Aberta) e lista de checkboxes (Direcionada).

**Loading:** enquanto `carregando === true`, `GravityLoader` (`CarregandoFornecedoresDisparo`) abaixo dos canais — Aberta e Direcionada.

---

## 4. Componente `SelecaoFornecedoresDisparo`

**Helpers exportados:** `fornecedoresElegiveisCotacaoAberta`, `idsFornecedoresDisparoCotacaoAberta`.

**Props:**

| Prop | Tipo | Papel |
|------|------|-------|
| `visibilidade` | `Visibilidade` | `ABERTA` \| `DIRECIONADA` |
| `fornecedores` | `Fornecedor[]` | Lista ativa carregada pelo modal |
| `carregando` | `boolean` | Loading do fetch |
| `selecionados` | `string[]` | IDs selecionados (Direcionada) |
| `onChangeSelecionados` | `(ids: string[]) => void` | Callback seleção |
| `canais` / `onChangeCanais` | `CanalDisparo[]` | Canais de envio |
| `excluidosDisparo` | `string[]` | IDs removidos manualmente (Aberta) |
| `onExcluirFornecedorDisparo` | `(id) => void` | Excluir do disparo (Aberta) |

### 4.1 Visibilidade **DIRECIONADA**

1. Link **Selecionar todos** / **Desmarcar todos**
2. Lista — checkbox + nome + **meta** (`tipo` ou `tipo · nota/5`) — não exibe e-mail sintético Cadastros
3. **`BarrasNotasFornecedores`** com barras horizontais de nota

### 4.2 Visibilidade **ABERTA**

1. Cards preview (elegíveis − excluídos)
2. Aviso se zero elegíveis ou `todos_excluidos`
3. **`BarrasNotasFornecedores`:** nome + meta + lixeira Admin (`Trash` bold 16px, botão 28×28); sem barras horizontais

Estado pai: `fornecedorIdsExcluidosDisparo` — reset ao trocar visibilidade.

### 4.3 `BarrasNotasFornecedores` (compartilhado)

Toggle *Ver/Ocultar fornecedores e notas*. Direcionada: barras 0–5 para todos ativos. Aberta com excluir: meta + lixeira.

---

## 5. API — criação com disparo

### 5.1 Client: `criarCotacaoComDisparo`

```ts
// api.ts — REGRA 08: falha de disparo não pode ser silenciosa
export async function criarCotacaoComDisparo(input): Promise<{
  cotacao: Cotacao
  disparo: { disparos: number; enviados?: boolean; message?: string } | null
  disparo_erro: string | null
}>
```

`criarCotacao()` delega para esta variante e retorna só `cotacao`.

### 5.2 Payload relevante (passo 4)

```ts
{
  visibilidade_cotacao_bid_frete_internacional: 'ABERTA' | 'DIRECIONADA',
  anonima_cotacao_bid_frete_internacional: boolean,
  data_limite_resposta_cotacao_bid_frete_internacional?: string, // ISO
  fornecedor_ids?: string[],           // DIRECIONADA: selecionados; ABERTA: elegíveis − excluídos UI
  disparar_ao_criar: boolean,          // ABERTA: true se ids elegíveis restantes > 0
  canais_disparo: ('EMAIL' | 'WHATSAPP')[],
}
```

### 5.3 Feedback no modal (REGRA 08)

Se `disparar_ao_criar` era intencional e:

- `disparo_erro` presente → `alert` com mensagem de falha (cotação já persistida)
- `disparo.disparos === 0` → `alert` orientando verificar fornecedores

### 5.4 Backend

`POST /api/v1/bid-frete-internacional/cotacoes` retorna:

```json
{ "cotacao": { ... }, "disparo": { "disparos": N }, "disparo_erro": "..." }
```

Implementação: `server/src/routes/cotacoes.ts` + `motor-bid-frete-internacional.ts`.

**ABERTA com `fornecedor_ids`:** `filtrarIdsFornecedoresElegiveisCotacaoAberta` no POST antes de `motorBid.disparar`. Sem `fornecedor_ids` → `dispararCotacaoAberta`.

### 5.5 Resolução de contatos (multi destinatário — PR #338)

**SSOT de contatos:** Cadastros (`fornecedor` + `fornecedor_contato`). O espelho BID guarda e-mail principal legado; demais canais vêm ao vivo no disparo.

| Peça | Caminho |
|------|---------|
| Resolver e-mails/WhatsApp | `server/src/services/resolver-contatos-disparo-bid-frete-internacional.ts` |
| Busca Cadastros S2S | `server/src/services/buscar-fornecedor-cadastros-disparo.ts` |
| Garantir espelho BID | `server/src/services/garantir-fornecedores-espelho-disparo-bid-frete-internacional.ts` |
| UI e-mails por fornecedor | `client/src/pages/contato-email-fornecedor-disparo-bid-frete-internacional.tsx` |
| Shared (client + server) | `shared/contato-disparo-bid-frete-internacional.ts`, `shared/formatar-resultado-disparo-bid-frete-internacional.ts` |

**Ordem de resolução (EMAIL):**

1. Todos os registros `contatos_fornecedor` com `tipo_canal_fornecedor_contato = EMAIL` (principal primeiro, depois `ordem_fornecedor_contato`; dedupe case-insensitive)
2. Fallback `email_fornecedor` (Cadastros)
3. Fallback `email_fornecedor_bid_frete_internacional` (espelho BID)

**Filtro:** exclui `@interno.gravity.local` e strings vazias (REGRA 08 — disparo sem destinatário falha alto na UI).

**Motor:** `motor-bid-frete-internacional.ts` envia **1 e-mail por endereço** resolvido quando canal `EMAIL` está marcado; resultado agregado em `formatar-resultado-disparo-bid-frete-internacional`.

**Testes UNI:** `testes/testes-unitarios/produto-gravity/bid-frete-internacional/resolver-contatos-disparo-bid-frete-internacional.test.ts`, `formatar-resultado-disparo-bid-frete-internacional.test.ts`

**Cadastros / Configurador:** contrato `email_fornecedor` + `contatos_fornecedor[]` — ver [EMPRESA-FORNECEDOR-OPERACAO.md](../cadastros/EMPRESA-FORNECEDOR-OPERACAO.md) § Contatos do fornecedor.

---

## 6. Chaves i18n (defaults inline — pendente `pt.json`)

| Chave | Default PT |
|-------|------------|
| `bidfrete.disparo.hint_aberta` | A cotação será enviada a todos os fornecedores ativos que aceitam cotação aberta. |
| `bidfrete.disparo.hint_direcionada` | Selecione os fornecedores que receberão o pedido de cotação por e-mail. |
| `bidfrete.disparo.selecionar_todos` | Selecionar todos |
| `bidfrete.disparo.desmarcar_todos` | Desmarcar todos |
| `bidfrete.disparo.ver_notas` | Ver fornecedores e notas |
| `bidfrete.disparo.ocultar_notas` | Ocultar fornecedores e notas |
| `bidfrete.disparo.preview` | Preview |
| `bidfrete.disparo.total_elegiveis` | Fornecedores elegíveis |
| `bidfrete.disparo.sem_elegiveis` | Nenhum fornecedor ativo aceita cotação aberta — o disparo não terá destinatários. |
| `bidfrete.disparo.sem_fornecedores` | Nenhum fornecedor ativo cadastrado. |
| `bidfrete.disparo.carregando_fornecedores` | Carregando fornecedores… |
| `bidfrete.disparo.todos_excluidos` | Todos os fornecedores elegíveis foram excluídos… |
| `bidfrete.disparo.excluir_fornecedor` | Excluir do disparo |

---

## 7. Histórico de entregas (passo Fornecedores)

| PR | Data | Escopo |
|----|------|--------|
| #284 | 2026-06-10 | Preview Aberta (cards + barras), calendário global no prazo, `criarCotacaoComDisparo`, feedback ruidoso disparo |
| #288 | 2026-06-11 | Selecionar/Desmarcar todos (Direcionada), rótulo *Ver fornecedores e notas* |
| #290 | 2026-06-12 | `BarrasNotasFornecedores` também na Direcionada (abaixo da lista) |
| #302 | 2026-06-12 | GravityLoader, meta tipo/nota, excluir Aberta, POST subset + filtro server-side |
| #338 | 2026-06-15 | Multi-e-mail/WhatsApp no disparo; resolução Cadastros `fornecedor_contato`; feedback agregado por fornecedor |

---

## 8. Backlog técnico (não bloqueante)

| Item | Mandamento / skill |
|------|-------------------|
| Zod parse na lista `getFornecedores` | Mandamento 06 |
| Chaves i18n em `nucleo-global/Utilidades/Localization/locales/pt.json` | `skills/arquitetura/traducao` |
| `aria-expanded` / `aria-controls` no toggle de notas | `skills/ux/acessibilidade` |
| Plano de testes UNI/FUN/E2E da tela Nova Cotação | Fechamento da tela — `skills/testes/multi-agente-plano-teste` |

---

## 9. Referências

- Padrão UX wizard: `skills/produtos-gravity/processo/SKILL.md` + `documentos-tecnicos/produtos-gravity/processo/PADRAO-UX-TELAS.md`
- Visão fornecedor (resposta/disparo): [DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md)
- Atlas DDD (refatoração histórica): `documentos-tecnicos/ddd-atlas/bid-frete/`
