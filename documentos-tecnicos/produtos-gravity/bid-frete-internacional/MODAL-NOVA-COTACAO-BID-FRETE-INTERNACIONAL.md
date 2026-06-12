# Modal Nova Cotação — BID Frete Internacional (Técnico)

> **Status:** Implementado (passo Fornecedores completo em prod — 2026-06-12)  
> **PRs:** #284, #288, #290  
> **QA:** Aprovado (testes automatizados adiados — plano da tela virá no pipeline multi-agente)

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

---

## 2. Wizard — 5 passos

| # | Passo | Conteúdo principal |
|---|-------|-------------------|
| 1 | Modal e Operação | Tipo operação, modal frete, modalidade |
| 2 | Origem e Destino | Porto/aeroporto, país, endereço extra quando aplicável |
| 3 | Carga e Incoterm | Mercadoria, NCM, containers/volumes, incoterm + helper card |
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
| `ABERTA` | Aberta — Todos os fornecedores | Motor dispara para elegíveis (ativos + `aceita_cotacao_aberta_fornecedor_bid_frete_internacional`) |

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

---

## 4. Componente `SelecaoFornecedoresDisparo`

**Props:**

| Prop | Tipo | Papel |
|------|------|-------|
| `visibilidade` | `Visibilidade` | `ABERTA` \| `DIRECIONADA` |
| `fornecedores` | `Fornecedor[]` | Lista ativa carregada pelo modal |
| `carregando` | `boolean` | Loading do fetch |
| `selecionados` | `string[]` | IDs selecionados (Direcionada) |
| `onChangeSelecionados` | `(ids: string[]) => void` | Callback seleção |
| `canais` / `onChangeCanais` | `CanalDisparo[]` | Canais de envio |

### 4.1 Visibilidade **DIRECIONADA**

1. Link **Selecionar todos** / **Desmarcar todos** (`.bf-disparo-selecionar-todos`)
   - Estilo alinhado ao modal Admin *Rodar Testes*: roxo `#a78bfa`, `0.625rem`, peso 600
   - Marca/desmarca todos os `id_fornecedor_bid_frete_internacional` da lista
2. Lista scrollável (max-height 280px) — checkbox + nome + e-mail por fornecedor
3. **`BarrasNotasFornecedores`** abaixo da lista — toggle *Ver fornecedores e notas*

### 4.2 Visibilidade **ABERTA**

Renderiza `PreviewFornecedoresElegiveis`:

1. Cards de preview:
   - Total de **fornecedores elegíveis** (ativos + aceitam cotação aberta)
   - Contagem por `tipo_fornecedor_bid_frete_internacional` (`TIPO_FORNECEDOR_LABELS`)
2. Aviso ruidoso se `elegiveis.length === 0` — disparo não terá destinatários
3. **`BarrasNotasFornecedores`** com conjunto filtrado (elegíveis only)

### 4.3 `BarrasNotasFornecedores` (compartilhado)

Toggle expandível reutilizado em Aberta e Direcionada:

| Estado | Label i18n (default) |
|--------|---------------------|
| Fechado | `bidfrete.disparo.ver_notas` → **Ver fornecedores e notas** |
| Aberto | `bidfrete.disparo.ocultar_notas` → **Ocultar fornecedores e notas** |

- Ordenação: `nota_global_classificacao_bid_frete_internacional` decrescente
- Barra: escala 0–5 (`width: (nota/5)*100%`)
- `nota == null` → exibe `—` e barra vazia (comportamento esperado em seed sem classificação)
- **Direcionada:** exibe notas de **todos** os fornecedores ativos da lista (não só selecionados) — apoia decisão de seleção

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
  fornecedor_ids?: string[],           // só DIRECIONADA
  disparar_ao_criar: boolean,
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

---

## 7. Histórico de entregas (passo Fornecedores)

| PR | Data | Escopo |
|----|------|--------|
| #284 | 2026-06-10 | Preview Aberta (cards + barras), calendário global no prazo, `criarCotacaoComDisparo`, feedback ruidoso disparo |
| #288 | 2026-06-11 | Selecionar/Desmarcar todos (Direcionada), rótulo *Ver fornecedores e notas* |
| #290 | 2026-06-12 | `BarrasNotasFornecedores` também na Direcionada (abaixo da lista) |

---

## 8. Backlog técnico (não bloqueante)

| Item | Mandamento / skill |
|------|-------------------|
| Zod parse na lista `getFornecedores` | Mandamento 06 |
| Chaves i18n em `nucleo-global/Utilidades/Localization/locales/pt.json` | `skills/arquitetura/traducao` |
| `aria-expanded` / `aria-controls` no toggle de notas | `skills/ux/acessibilidade` |
| Plano de testes UNI/FUN/E2E da tela Nova Cotação | `skills/testes/multi-agente-plano-teste` |

---

## 9. Referências

- Padrão UX wizard: `skills/produtos-gravity/processo/SKILL.md` + `documentos-tecnicos/produtos-gravity/processo/PADRAO-UX-TELAS.md`
- Visão fornecedor (resposta/disparo): [DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md)
- Atlas DDD (refatoração histórica): `documentos-tecnicos/ddd-atlas/bid-frete/`
