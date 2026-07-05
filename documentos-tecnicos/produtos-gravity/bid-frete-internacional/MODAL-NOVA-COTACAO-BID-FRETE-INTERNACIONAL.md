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
| Elegibilidade disparo × modal (SSOT) | `servicos-global/produto/bid-frete-internacional/shared/fornecedor-elegivel-disparo-bid-frete-internacional.ts` |
| Filtro client por modal | `servicos-global/produto/bid-frete-internacional/client/src/shared/filtrar-fornecedores-disparo-bid-frete-internacional.ts` |
| Filtro server + motor | `server/src/services/filtrar-fornecedores-disparo-bid-frete-internacional.ts`, `motor-bid-frete-internacional.ts` |
| Schema Zod fornecedor (flags Cadastros) | `shared/fornecedor-bid-frete-internacional-api-schema.ts` |
| API client | `servicos-global/produto/bid-frete-internacional/client/src/shared/api.ts` |
| POST cotação + disparo | `servicos-global/produto/bid-frete-internacional/server/src/routes/cotacoes.ts` |

**Rota frontend:** `/produto/bid-frete-internacional/cotacoes/nova`  
**Shell:** `ModalPassoPassoGlobal` (`@nucleo/modal-passo-passo-global`)

**Carga perigosa (DG):** ver [CARGA-PERIGOSA-TECNICO.md](./CARGA-PERIGOSA-TECNICO.md) — passo 1 (toggle) + passo 3 (combo ONU).

### 2.1 Passo 1 — Nº da cotação (TASK-000407)

| Item | Valor |
|------|-------|
| Campo UI | Primeiro bloco do passo 1 — `form.numero_cotacao_bid_frete_internacional` |
| Geração inicial | `gerarNumeroCotacaoFreteInternacional()` em `shared/numeracao-bid-frete-internacional.ts` (prefixo `COT-YYYYMMDD-NNNN`) |
| Tipografia | Mesma fonte dos demais `.nc-input` do wizard (`font-family: inherit`) — **não** usar mono no input |
| Validação client | `canNext()` exige texto não vazio após trim |
| POST | `numero_cotacao_bid_frete_internacional` opcional no body; servidor usa valor informado ou gera novo |
| Zod server | `CriarCotacaoSchemaBase` — `z.string().min(1).max(64).optional()` |

---

## 2. Wizard — 5 passos

| # | Passo | Conteúdo principal |
|---|-------|-------------------|
| 1 | Modal e Operação | **Nº da cotação** (auto-gerado, editável), tipo operação, modal frete, modalidade, **toggle Carga perigosa** |
| 2 | Origem e Destino | Porto/aeroporto principal + **alternativas opcionais** (multi-select Cadastros) — §2.1 |
| 3 | Carga e Incoterm | Mercadoria, NCM, **classificação ONU (se DG)**, containers/volumes, incoterm + helper card |
| 4 | **Fornecedores** | Prazo, visibilidade, anônima, canais, seleção/disparo — **este documento detalha** |
| 5 | Resumo | Valor alvo, moeda (SSOT Cadastros), receipt da rota + **listas de portos/aeroportos opcionais** — §2.1 |

### 2.1 Portos/Aeroportos alternativos (opcionais)

Toggle por lado (origem/destino) no passo **Origem e Destino**. Quando habilitado, multi-select busca catálogo global de portos (marítimo) ou aeroportos (aéreo) via Cadastros.

| Campo Prisma (cotação) | Tipo | Uso |
|------------------------|------|-----|
| `habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional` | Boolean | Liga alternativas na origem |
| `codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional` | JSONB `string[]` \| null | Códigos UN/LOCODE ou IATA |
| `habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional` | Boolean | Liga alternativas no destino |
| `codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional` | JSONB `string[]` \| null | Idem destino |

**SSOT regras:** `shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional.ts` — parse persistência, elegíveis para fornecedor (principal + opcionais), textos de exibição.

**UI comprador:**

| Tela | Peça | Comportamento |
|------|------|---------------|
| Passo 2 | `modal-nova-cotacao-bid-frete-internacional.tsx` | Toggle + multi-select |
| Passo 5 Resumo | idem | Linhas «Portos/Aeroportos de Origem/Destino opcionais: x, y, z» (`.nc-receipt-details--locais-opcionais`) |
| Detalhe cotação | `cotacao-detalhe.tsx` card **Rota** | `InfoRow` com mesmos rótulos |

**Hooks client:** `client/src/shared/locais-opcionais-cotacao-bid-frete-internacional.ts` — `useTextosLocaisOpcionaisCotacaoBidFrete`, `useResolverRotuloLocalLogisticoCotacaoBidFrete`.

**API:** `POST`/`PATCH /cotacoes` aceitam os quatro campos; Zod + `refinamentoOpcoesPortoAeroportoCotacao` exige ≥1 código quando toggle ligado.

**Fornecedor (resposta):** quando há opcionais, o agente **deve** escolher qual local usa — ver [DDD-VISAO-FORNECEDOR](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md) § Resposta — locais opcionais.

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

### 3.5 Elegibilidade por modal e tipo de parceiro (Cadastros)

A lista do passo 4 **não** usa a permissão RBAC `visao_fornecedor:cotar` (“Pode cotar frete internacional”). Essa permissão governa o **usuário fornecedor** (visão fornecedor, HUB, responder cotações) — ver [DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md). O wizard do **comprador** filtra parceiros pelas flags `pode_ser_*` do Cadastros e pelo `modal_cotacao_bid_frete_internacional` escolhido no passo 1.

**SSOT da regra:** `shared/fornecedor-elegivel-disparo-bid-frete-internacional.ts` (consumido no client, `POST /cotacoes` e motor de disparo).

| Flag Cadastros / tipo | Marítimo / Aéreo | Rodoviário |
|----------------------|------------------|------------|
| Agente de carga | Sim | Sim |
| Armador | Sim | Sim |
| Cia aérea | Sim | Sim |
| Transportadora rodoviária **internacional** | **Não** | Sim |
| Transportadora rodoviária **nacional** | **Não** | **Não** |
| Nacional **+** internacional | Não | Sim (internacional prevalece) |

**Client:** `filtrarFornecedoresDisparoBidFreteInternacional()` após `getFornecedores`; seleção e exclusões resetam ao trocar modal.

**GET /fornecedores:** inclui as cinco flags booleanas quando a lista vem do espelho Cadastros (`mapCadastrosParaBidFornecedor`). Contrato Zod: `shared/fornecedor-bid-frete-internacional-api-schema.ts`.

**Server:** `filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional` no `POST /cotacoes` (Direcionada e Aberta com subset) e revalidação no `motorBid.disparar` / `dispararCotacaoAberta`. A lista admin de fornecedores **não** aplica este filtro.

**Testes:** UNI `fornecedor-elegivel-disparo-bid-frete-internacional.test.ts`; FUN `TST-FUN-BIDFRT-000121`.

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
  disparo_pendente: boolean // true → backend disparou em background; client faz polling
}>
```

`criarCotacao()` delega para esta variante e retorna só `cotacao`.

### 5.2 Payload relevante (passo 4)

```ts
{
  numero_cotacao_bid_frete_internacional?: string, // opcional — wizard passo 1; omitido → servidor gera COT-*
  visibilidade_cotacao_bid_frete_internacional: 'ABERTA' | 'DIRECIONADA',
  anonima_cotacao_bid_frete_internacional: boolean,
  data_limite_resposta_cotacao_bid_frete_internacional?: string, // ISO
  fornecedor_ids?: string[],           // DIRECIONADA: selecionados; ABERTA: elegíveis − excluídos UI
  disparar_ao_criar: boolean,          // ABERTA: true se ids elegíveis restantes > 0
  canais_disparo: ('EMAIL' | 'WHATSAPP')[],
}
```

### 5.3 Feedback honesto no modal (REGRA 08 — PRs #627/#632)

A UI **nunca afirma envio que o banco não confirmou**. Sem `alert()` nativo — só `addNotification` + banner no modal.

Fluxo pós-201 com `disparo_pendente: true`:

1. Banner amarelo *"Cotação salva — confirmando envio"* (tipo `aguardando`)
2. Polling `aguardarConfirmacaoDisparoCotacao` (`client/src/shared/aguardar-confirmacao-disparo-bid-frete-internacional.ts`): `GET /cotacoes/:id` a cada 2s, máx. 45s, até todos os disparos saírem de `PENDENTE`. **Nunca lança** — 502/timeout de rede são retentados (`falhasConsulta`)
3. Resultado final por status real no banco:
   - todos `ENVIADO` → verde *"X de Y entregues"* (`sucesso`)
   - mistura → amarelo (`parcial`), com nomes e primeiro erro
   - todos `ERRO_ENVIO` → vermelho com `erro_envio_...` (`erro`)
   - timeout ainda `PENDENTE` → vermelho *"Envio não confirmado"* (`nao_confirmado`)

Se o `catch` do submit rodar **após** a cotação salva (ex.: falha do polling), o modal de sucesso permanece e o feedback vira `nao_confirmado` — nunca a mensagem "Erro ao criar cotação".

Helpers: `formatarFeedbackDisparoBidFrete`, `tipoNotificacaoFeedbackDisparo`, `corBordaFeedbackDisparo` (`shared/formatar-resultado-disparo-bid-frete-internacional.ts`).

### 5.4 Backend — disparo assíncrono pós-201 (PRs #622–#624/#632)

`POST /api/v1/bid-frete-internacional/cotacoes` com `disparar_ao_criar` responde **antes** do envio (Resend pode exceder o timeout HTTP do Railway ~30s):

```json
{ "cotacao": { ... }, "disparo": null, "disparo_pendente": true }
```

- Job em background agendado em `res.on('finish')` **e** `res.on('close')` (idempotente) com Prisma dedicado `withTenantIsolation(basePrisma, tenantId)`
- Motor marca cada disparo `PENDENTE → ENVIADO | ERRO_ENVIO`; e-mail via sidecar `127.0.0.1:8008` (`BID_FRETE_SIDECAR=1`), timeout 25s + `Promise.race`
- **Watchdog pós-job:** qualquer disparo da cotação ainda `PENDENTE` ao final vira `ERRO_ENVIO` com mensagem diagnóstica — nenhum registro fica pendente para sempre
- **Cron (5 min) roda TAMBÉM em sidecar** (`startCronJobs()` incondicional no `index.ts` — era o bug local×prod do #632): reenvia `PENDENTE` entre 2min e 24h; `PENDENTE` >24h vira `ERRO_ENVIO` **sem reenvio** (evita rajada de e-mails velhos)
- Logs Railway: prefixo `[disparo-bg]` (iniciando/concluído/watchdog)

Implementação: `server/src/routes/cotacoes.ts` + `motor-bid-frete-internacional.ts` + `tarefas-agendadas.ts`.

**ABERTA com `fornecedor_ids`:** `filtrarIdsFornecedoresElegiveisCotacaoAberta` + `filtrarFornecedorIdsElegiveisDisparoBidFreteInternacional` (modal) no POST antes de `motorBid.disparar`. Sem `fornecedor_ids` → `dispararCotacaoAberta` (também filtra por modal no motor).

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
| TASK-000405 | 2026-07-04 | Portos/aeroportos alternativos opcionais (passo 2, resumo, detalhe Rota, seleção fornecedor) — §2.1 |
| — | 2026-07-03 | Elegibilidade disparo × modal/tipo (flags Cadastros); Zod flags em GET fornecedores; FUN TST-000121 |
| #622–#624 | 2026-07-03 | Disparo assíncrono pós-201 (`disparo_pendente`); Prisma dedicado no background; timeout 25s; e-mail força sidecar `127.0.0.1:8008` |
| #627 | 2026-07-03 | Feedback honesto: polling resiliente (não lança em 502), sem `alert()` nativo, `nao_confirmado` em timeout |
| #632 | 2026-07-04 | **Root cause prod:** cron não rodava em sidecar (`if (!BID_FRETE_SIDECAR)`); cron incondicional + watchdog PENDENTE→ERRO_ENVIO + limpeza >24h sem reenvio + logs `[disparo-bg]` |

---

## 8. Passo 2 — Sem filtro de país nos selects de porto/aeroporto (TASK-000415)

Os hooks `usePortosPorPais` / `useAeroportosPorPais` no passo **Origem e Destino** recebem sempre `codigoPais = ''` (catálogo global). O valor de `origem_pais_cotacao_bid_frete_internacional` / `destino_pais_cotacao_bid_frete_internacional` **não** é repassado como query `?pais=` na API.

| Antes (bug) | Depois (correto) |
|-------------|------------------|
| País preenchido no form (ex.: `US`) filtrava portos/aeroportos só daquele país | Busca sempre no catálogo inteiro do Cadastros |
| Com checkbox «Exibir campos… país» desmarcado, o filtro ficava **invisível** | Hamburg (DEHAM), Frankfurt (FRA) etc. aparecem ao digitar o termo |
| Usuário via só cidades US com «ham» no nome | Resultados globais ordenados por país + nome no Cadastros |

**Regra:** o país do formulário é preenchido **depois** da seleção do porto/aeroporto (snapshot para persistência), mas não restringe o dropdown. Commit de referência: `fc6c8426d` (`manual-gravity-8001`).

### 8.1 Server — snapshot de rota resolve terminal individualmente (TASK-000415)

Na gravação (POST/PATCH de cotação), o server deriva o snapshot de rota a partir de uma página do catálogo do Cadastros (`carregar-contexto-catalogo-rota-bid-frete-internacional.ts`). Como o Cadastros tem mais portos ativos que o limite da página, um porto fora da página faria o snapshot cair no fallback «nome = código» e reprovar na validação (ex.: `Nome gravado (BRSSZ) não corresponde ao Cadastros (Santos)`). A função `garantirTerminaisRotaNoContextoCatalogo` resolve cada código de origem/destino individualmente (`GET /portos/:codigo`, `/aeroportos/:codigo`) e injeta no contexto quando ausente — o snapshot nunca depende do tamanho ou da ordenação do catálogo.

---

## 9. Backlog técnico (não bloqueante)

| Item | Mandamento / skill |
|------|-------------------|
| Chaves i18n em `nucleo-global/Utilidades/Localization/locales/pt.json` | `skills/arquitetura/traducao` |
| `aria-expanded` / `aria-controls` no toggle de notas | `skills/ux/acessibilidade` |
| Plano de testes UNI/FUN/E2E da tela Nova Cotação | Fechamento da tela — `skills/testes/multi-agente-plano-teste` |

---

## 10. Referências

- Padrão UX wizard: `skills/produtos-gravity/processo/SKILL.md` + `documentos-tecnicos/produtos-gravity/processo/PADRAO-UX-TELAS.md`
- Visão fornecedor (resposta/disparo): [DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md](./DDD-VISAO-FORNECEDOR-BID-FRETE-INTERNACIONAL-TECNICO.md)
- Atlas DDD (refatoração histórica): `documentos-tecnicos/ddd-atlas/bid-frete/`
