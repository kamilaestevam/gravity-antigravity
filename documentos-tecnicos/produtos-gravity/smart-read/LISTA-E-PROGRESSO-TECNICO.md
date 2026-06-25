# Lista e progresso do wizard — Smart Read

> **Telas:** `ListaLeituraSmartRead`, wizard `ModalNovaLeituraSmartRead`  
> **BFF:** `servicos-global/produto/smart-read/server/` (porta **8033**)

---

## 1. Lista real (sem mock no client)

A lista **não** usa mais `dados-mock-lista-smart-read.ts` nem `VITE_SMART_READ_MOCK_DADOS`. Toda linha vem do BFF:

| Camada | Arquivo |
|--------|---------|
| Hook | `client/src/shared/use-transacoes-leitura-smart-read.ts` |
| HTTP | `client/src/shared/api.ts` → `listarTransacoes`, `obterMetricaLeitura` |
| Montagem | `server/src/lib/montar-lista-transacoes-leitura-smart-read.ts` |

### Fontes da lista (merge)

> **Arquitetura completa (legado DATI vs Gravity):** [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md).

1. **Primária (catálogo de ids):** legado dati `GET /import-control-center/external-readings/list` — leituras reais no **banco DATI**, não no Railway Gravity.
2. **Complemento:** Postgres `progresso_leitura_smart_read` — wizard em andamento / nome customizado (**escopo `id_workspace` da filial ativa**).
3. **Snapshot (prevalece na linha):** Postgres `snapshot_leitura_smart_read` — cópia congelada da extração normalizada + métricas para Lista/Insights (**mesmo escopo de workspace**).

O BFF intersecta ids do legado com ids vinculados ao **workspace ativo** (progresso ou snapshot). Se o legado retorna erro **e** não há progresso nem snapshot no workspace → lista vazia (`200`, `transacoes: []`). Não há fallback mock.

### Escopo workspace vs progresso por usuário (paridade Pedido / BID)

| Recurso | Escopo | Header / resolvedor |
|---------|--------|---------------------|
| **Lista** + métrica `readings` | **Workspace** — time da filial vê as mesmas leituras | `x-id-workspace`; fallback `x-id-organizacao` (`resolverIdWorkspaceLeituraSmartRead`) |
| **Wizard** `GET`/`PATCH` `/progresso` | **Usuário** — retomar sessão individual | `x-id-usuario` (+ `id_workspace` gravado no registro) |
| **POST** nova leitura | Grava vínculo com `id_workspace` resolvido (mesmo da lista) | `registrar-vinculo-leitura-usuario-smart-read.ts` |
| **GET** `/leituras/:id` | Só legado se leitura vinculada ao workspace; senão `404` | `leituraVinculadaAoWorkspaceSmartRead` |

Registros legados com `id_workspace` null continuam visíveis (`OR id_workspace IS NULL`) até backfill; novos POSTs sempre gravam workspace resolvido.

Helper: `server/src/lib/escopo-workspace-leitura-smart-read.ts`.

---

## 2. Contrato BFF — rotas de leitura

Headers obrigatórios (proxy Configurador / shell): `x-id-organizacao`, `x-id-usuario`. Workspace: `x-id-workspace` (shell: `gravity_company_id`); se ausente, o BFF usa `x-id-organizacao` como workspace ativo (mesmo padrão Pedido).

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/v1/smart-read/leituras` | Lista paginada por **workspace** (`pagina`, `limite`, `termo_busca`) |
| `GET` | `/api/v1/smart-read/leituras/metricas/readings` | Contagem para card «Leituras realizadas» (workspace) |
| `POST` | `/api/v1/smart-read/leituras` | Cria leitura no legado + upload + vínculo workspace → `202` |
| `GET` | `/api/v1/smart-read/leituras/:id_leitura` | Status/resultado — **snapshot (workspace)** → **legado** (se vinculada) → **progresso** (`catch`, `id_usuario` + workspace); grava snapshot após legado se elegível |
| `GET` | `/api/v1/smart-read/leituras/:id_leitura/progresso` | Progresso do wizard por **usuário** (`404` se ausente) |
| `PATCH` | `/api/v1/smart-read/leituras/:id_leitura/progresso` | Salva passo 2–4 + sessão (usuário) |
| `DELETE` | `/api/v1/smart-read/leituras/:id_leitura` | `501` — legado sem exclusão |

**Schemas Zod (bilateral — REGRA 07/09):**

- Server: `server/src/schemas/leitura-smart-read.ts`, `server/src/schemas/progresso-leitura-smart-read.ts`
- Client: `client/src/shared/schemas.ts`

### `TransacaoLeitura` (linha da lista)

**Hoje (runtime):** a coluna Status usa `status_leitura` legado (`PillStatusLeitura` em `colunas-lista-leitura-smart-read.tsx`).

**Alvo (§14):** expor `status_fluxo_leitura` + `passo_atual_leitura` no BFF e trocar a pill para `PillStatusFluxoLeitura`.

```typescript
{
  id_leitura: string
  nome_leitura: string | null
  status_leitura: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'  // legado IA — interno/polling
  // — alvo wiring §14 (ainda não no schema Zod bilateral):
  // status_fluxo_leitura: StatusFluxoLeitura
  // passo_atual_leitura: number | null
  total_arquivos: number
  media_acertos: number | null
  data_envio: string | null
  origem_leitura: 'API' | 'INTERFACE'
  nome_arquivo: string | null
  mensagem_erro: string | null
  // + métricas (MetricasTransacaoLeituraSchema)
}
```

**SSOT status de fluxo (contrato):** `shared/status-fluxo-leitura-smart-read.ts` — valores `UPPER_SNAKE`; rótulos PT-BR em `ROTULO_STATUS_FLUXO_LEITURA` (reexport previsto em `formatacao-leitura-smart-read.ts`).

### `EstadoProgressoLeitura` (PATCH/GET progresso)

```typescript
{
  passo: 2 | 3 | 4
  nome: string
  leitura: Leitura
  // — alvo §14 (ainda não no schema bilateral):
  // fluxo_finalizado?: boolean   // true ao concluir passo 4 → FINALIZADO
}
```

---

## 3. Nome da leitura (SSOT)

| Campo | Origem |
|-------|--------|
| `nome` (sessão) | Input do usuário no wizard — **prioridade na lista e ao retomar** |
| `leitura.nome_leitura` | Legado dati (`name`) ou espelho gravado no PATCH |
| Lista via progresso | `montar-lista` usa `sessao.nome \|\| sessao.leitura.nome_leitura` |
| Retomar wizard | `salvo.nome` antes de `leitura.nome_leitura` |

O legado costuma devolver nomes genéricos (`Leitura 01`). O nome escolhido no wizard **não** propaga ao legado — persiste só no Gravity.

### Edição do nome no wizard (UX)

| Regra | Implementação |
|-------|----------------|
| Padrão Gravity | `EdicaoTextoPopoverGlobal` (`@nucleo/tabela-virtual-global`) — **não** usar `window.prompt` |
| Componente | `client/src/components/nova-leitura-smart-read/edicao-nome-leitura-nova-leitura-smart-read.tsx` |
| Sidebar | `painel-lateral-arquivos-nova-leitura-smart-read.tsx` |
| Disponibilidade | Editável em **qualquer passo** (1–4) |
| Persistência | Passo ≥ 2 com análise concluída → `PATCH` imediato via `onConfirmarNome` no modal |

**Removido (legado dati):** rótulos «Starter» e contador «Documentos X/100» no topo da sidebar — planos comerciais não existem mais no Gravity.

---

## 4. Quando o progresso grava

| Evento | Persiste? |
|--------|-----------|
| Upload (passo 1) | Vínculo workspace em `progresso_leitura_smart_read` (hoje sem `status_fluxo`; alvo §14: stub `IA_ANALISANDO`, passo 2) |
| Análise concluída (passo 2) | Sim — `PATCH` automático (alvo §14: derivar `status_fluxo_progresso_leitura_smart_read`) |
| Continuar / Voltar passo | Sim — atualiza `passo_atual` (alvo §14: espelhar `status_fluxo` no progresso) |
| Concluir passo 4 | Sim — sessão no progresso (alvo §14: `fluxo_finalizado: true` → `FINALIZADO` no progresso e snapshot) |
| Renomear (qualquer passo) | Sim no estado local; `PATCH` imediato se passo ≥ 2 e análise concluída |
| Fechar modal | Sim + **recarrega lista** (`onFechar` → `onRecarregar`) |

**Primário:** `PATCH` → tabela `progresso_leitura_smart_read` (Railway, `SMART_READ_DATABASE_URL`).  
**Fallback:** `localStorage` chave `smart-read:leitura:{id}` se API indisponível.

Arquivos: `client/src/shared/persistencia-leitura-smart-read.ts`, `server/src/routes/progresso-leitura-smart-read.ts`.

---

## 5. Link «Nome da leitura» → retomar wizard (TASK-000308)

Coluna `nome_leitura` em `colunas-lista-leitura-smart-read.tsx` abre `ModalNovaLeituraSmartRead` com `idLeituraExistente`. O modal hidrata passo + nome via `GET /progresso` (ou legado + progresso).

---

## 6. Ambiente local

| Variável (`.env.local` raiz) | Uso |
|------------------------------|-----|
| `SMART_READ_DATABASE_URL` | Postgres **Gravity** (snapshot + progresso + painéis — **não** é o banco DATI) |
| `SMART_READ_LEGADO_URL` | API dati QA |
| `SMART_READ_LEGADO_CHAVE_GRAVITY` | Auth legado |
| `SMART_READ_ID_COMPANY_LEGADO_PADRAO` | Company id padrão |

Teste: `http://localhost:8000/smart-read/lista` (Configurador) + sidecar `8033`.

**Não usar:** `VITE_SMART_READ_MOCK_DADOS`, `SMART_READ_MOCK_LEGADO=1` (exceto dev sem legado).

### Rate limit do BFF (porta 8033)

| Ambiente | Comportamento |
|----------|----------------|
| **Produção / staging** (`NODE_ENV=production`, padrão Railway) | `express-rate-limit`: **100 req/min** por `x-id-organizacao` em `/api/*` |
| **Local** (`NODE_ENV` ≠ `production`) | Rate limit **desligado** (`skip` em `server/src/index.ts`) — evita 429 ao alternar abas com HMR |

Resposta 429: `{ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas requisicoes' } }` — exibida na faixa vermelha da Lista (`sr-erro`).

---

## 7. Limitações conhecidas

- Legado `GET /list` em QA pode retornar `500` — lista depende do complemento Postgres.
- `DELETE` leitura não implementado no legado.
- `data_envio` na lista via progresso usa `data_criacao` do registro (não `data_atualizacao`).

---

## 8. Testes

| Arquivo | Cobertura |
|---------|-----------|
| `testes/testes-unitarios/smart-read/progresso-leitura-smart-read.test.ts` | Schema sessão progresso |
| `testes/testes-unitarios/smart-read/status-fluxo-leitura.test.ts` | Derivação `status_fluxo_leitura` |
| `testes/testes-unitarios/smart-read/fixtures/leituras-fixture-insights-smart-read.ts` | Fixture Insights (não runtime) |

Pacote `/testes-criar` completo (FUN PATCH→GET nome, E2E link→retomar) — pendente no fechamento TASK-000308.

---

## 9. Layout da lista (paridade Pedido — TASK-000311 / PR #394)

A área da tabela **preenche o viewport** abaixo dos cards e abas de segmento (padrão `.lp-page` do Pedido, não altura fixa em px).

| Camada | Arquivo / classe |
|--------|------------------|
| Orquestração keep-alive | `SmartReadMultiView.tsx` — monta abas já visitadas (`visitados`) |
| Fetch só na aba ativa | `useTransacoesLeituraSmartRead(segmento, habilitado)` — `habilitado` = `painelAtivo('lista' \| 'insights' \| 'kanban')` |
| Insights (lista + detalhe) | `useDadosInsightsLeituraSmartRead(habilitado)` — `GET /leituras/:id` só com aba Insights ativa |
| Painel keep-alive (CSS) | `SmartReadVisualizacaoTabs.css` → `.smart-read-view-panel--ativo` + filho `.sr-pagina--lista` com `flex: 1` |
| Página lista | `ListaLeituraSmartRead.tsx` → `.sr-pagina--lista` |
| Wrapper tabela | `.sr-tabela-wrapper` (`flex: 1; min-height: 0`) |
| GTV | `.gtv-container` + `.gtv-tabela-scroll` (`flex: 1 1 0`) |

> **Regra:** aba montada mas oculta **não** dispara `GET /leituras` nem métricas — evita 429 em dev quando Insights e Lista coexistem no keep-alive (PR #449 + follow-up Kanban).

**Referência visual:** mesma altura total que Pedido (`/pedido/pedidos/lista`) — tabela + toolbar + rodapé dentro do bloco, scroll interno nas linhas.

---

## 10. Contagem e paginação (rodapé GTV)

Componente: `TabelaVirtualGlobal` em `tabela-transacoes-leitura-smart-read.tsx`.

| Prop | Valor |
|------|-------|
| `labelPai` | `['leitura', 'leituras']` |
| `labelFilho` | `['arquivo', 'arquivos']` |
| `totalFilhos` | Soma de `total_arquivos` das leituras visíveis (página ou filtradas) |
| `totalItens` | Total do BFF (`paginacao.total`) ou contagem pós-filtro client-side |
| `itensPorPagina` | `50` |
| `paginaAtual` / `onMudarPagina` | Server-side via `useTransacoesLeituraSmartRead` |

Rodapé exibido mesmo com uma página quando `labelPai` + `totalFilhos` estão definidos (ex.: `6 leituras · 6 arquivos · página 1 de 1`). Controles `« ‹ 1 2 3 › »` aparecem quando `totalPaginas > 1`.

---

## 11. Painéis da lista + colunas/filtros/export (PR #394)

### Painéis salvos (Postgres)

Mesmo padrão de [PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md): uma linha por aba em `lista_painel_usuario_global`, `config_json` v1 com colunas, filtros, ordenação, busca e `cards_topo`.

| Método | Rota |
|--------|------|
| `GET` | `/api/v1/smart-read/lista/paineis` — bootstrap «Principal» se vazio |
| `POST` | `/api/v1/smart-read/lista/paineis` |
| `PUT` | `/api/v1/smart-read/lista/paineis/:id` |
| `PUT` | `/api/v1/smart-read/lista/paineis/reordenar` |
| `DELETE` | `/api/v1/smart-read/lista/paineis/:id` |

| Camada | Arquivo |
|--------|---------|
| Rotas | `server/src/routes/lista-paineis-smart-read.ts` |
| Hook | `client/src/shared/use-lista-painel-smart-read.ts` |
| UI faixa painéis | `client/src/components/SmartReadListaPainelBar.tsx` |
| Layout faixa | `client/src/shared/smart-read-lista-layout.css` |
| Rótulos painel | `client/src/shared/rotulo-painel-lista-smart-read.ts` |
| Persistência debounce | `shared/persistenciaListaPainel.ts` (`podePersistirPainelLista`) |
| Config Zod | `shared/listaPainelConfigSchema.ts` |

### UI da faixa (TASK-000324)

**Painéis** no chrome da tabela (paridade `PedidosDashboardFaixaPaineis` / `BidFreteDashboardFaixaPaineis` — só `__paineis`, sem `__status`). **Segmento** fora da lista, como no master.

| Elemento | Arquivo / classe |
|----------|------------------|
| Barra roxa de painéis | `SmartReadListaPainelBar` — drag, renomear, excluir, criar via `+` |
| Faixa painéis (só PAINEIS) | `lp-faixa-navegacao` + `lp-faixa-navegacao__paineis` em `tabela-transacoes-leitura-smart-read.tsx` |
| Segmento envios/API | Abas «Visão geral» / «Transações API» em `sr-toolbar-lista--segmentos` em `ListaLeituraSmartRead.tsx` (acima do wrapper da tabela) |
| Wrapper página | `.sr-tabela-wrapper--faixa-unificada` em `ListaLeituraSmartRead.tsx` |

Handlers `handleCriarPainelLista` / `handleTrocarPainelLista` em `tabela-transacoes-leitura-smart-read.tsx` delegam a `useListaPainelSmartRead.criarPainel` / `trocarPainel` (salva config do painel anterior ao trocar). `aba_status_ativa` no `config_json` guarda o segmento (`envios` \| `transacoes-api`).

### Colunas, filtros e exportação

| Recurso | Arquivo principal |
|---------|-------------------|
| Catálogo de colunas (documento extraído) | `shared/catalogo-colunas-documento-smart-read.ts` |
| Colunas GTV | `shared/colunas-lista-leitura-smart-read.tsx` |
| Filtros por coluna | `shared/filtrar-transacoes-lista-smart-read.ts` + `FiltroPopoverColuna` |
| Exportação | `shared/acoes-exportacao-lista-smart-read.tsx` |
| Preferências → painel | `onSalvarPreferencias` → `useListaPainelSmartRead.persistirPainelAtual` |

### Testes adicionais (PR #394)

| Arquivo | Cobertura |
|---------|-----------|
| `testes/testes-unitarios/smart-read/extrair-valores-colunas-documento.test.ts` | Extração de valores para colunas dinâmicas |
| `testes/testes-unitarios/smart-read/agregar-caminhos-campos-dados.test.ts` | Agregação de caminhos no BFF |
| `testes/testes-unitarios/smart-read/fixtures/transacoes-fixture-insights-smart-read.ts` | SSOT transações Insights (fallback degradado) |

---

## 12. Colunas de métricas da leitura (TASK-000317 / PR #409)

Colunas agregadas **por leitura** (não são campos extraídos de um documento específico). Visíveis por padrão em `COLUNAS_PADRAO_LEITURA_SMART_READ` (`colunas-lista-leitura-smart-read.tsx`).

| Coluna | Campo `TransacaoLeitura` | Origem |
|--------|--------------------------|--------|
| Documentos | `total_documentos` | BFF / snapshot |
| Campos extraídos | `total_campos` | BFF / snapshot |
| Campos corretos | `campos_corretos` | BFF / snapshot |
| Campos errados | `campos_errados` | BFF / snapshot |
| Média de acertos | `media_acertos` | BFF / snapshot |
| Tempo extração (IA) | `tempo_extracao_ia_segundos` | Legado / snapshot |
| Tempo processo total | `tempo_processo_total_segundos` | Legado / snapshot |
| Saving (horas) | `saving_total_minutos` | `metricas-transacao-leitura-smart-read.ts` (SSOT tempos §INSIGHTS) |
| Saving (valor) | `saving_total_brl` | Idem + `PARAMETROS_FINANCEIROS_SMART_READ` |

Métricas de saving na lista usam o mesmo SSOT de tempos que Insights (`shared/dados-base-produto-tempo-smart-read.ts`). Ordem padrão da lista: expandir tudo + cursor somente leitura (PR #409).

---

## 13. KPI cards no topo da lista (TASK-000321)

Faixa acima das abas «Visão geral» / «Transações API». Componente: `client/src/components/lista-leitura-cards-smart-read.tsx`. Catálogo e ordem: `client/src/shared/use-preferencias-cards-smart-read.ts` (preferências em `localStorage` chave `smart-read:config:cards-v1`; ordem sempre segue o catálogo ao carregar).

| Ordem | Card | Valor principal | Fonte dos dados |
|------:|------|-----------------|-----------------|
| 1 | Leituras realizadas | Contagem total | `GET /leituras/metricas/readings` ou `paginacao.total` |
| 2 | Performance de acertos | Média % | `resolverMediaAcertosTransacaoLeituraSmartRead` — `media_acertos` ou `campos_corretos ÷ campos_extraídos` |
| 3 | Recursos reduzidos | Tempo economizado | `resolverSavingTransacaoLeituraSmartRead` com `tempo_extracao_ia_ms` real quando disponível |

**Recursos reduzidos** reutiliza o SSOT `shared/metricas-transacao-leitura-smart-read.ts`. `saving_total_minutos === 0` com documentos concluídos é tratado como ausente (reestima). `ProvedorMetodologiaSavingInsightsSmartRead` recebe `transacoes={transacoesFiltradas}` para o modal «Base de cálculo».

> **Não usar** placeholder «Em breve» neste card — se nenhuma leitura visível tiver totais para estimar saving, exibir `—` via `formatarSavingHorasLeitura` / `formatarSavingValorLeitura`.

---

## 14. Status de fluxo do wizard (coluna Status da Lista)

**Estado da entrega (2026-06):** fundação persistida + contrato SSOT + testes unitários de derivação. A **Lista ainda exibe** `status_leitura` legado (`PillStatusLeitura`); o wiring BFF/client para `status_fluxo_leitura` está **pendente** (checklist §14.4).

**Objetivo:** a coluna **Status** passa a exibir o **fluxo do usuário** (`status_fluxo_leitura`), mantendo `status_leitura` só para polling/IA/backend.

| Status UI (pill) | Código persistido | Nº passo | Legado `status_leitura` típico |
|------------------|-------------------|:--------:|--------------------------------|
| Pronto para análise | `PRONTO_PARA_ANALISE` | 1 | `PENDING` / stub |
| IA analisando | `IA_ANALISANDO` | 2 | `PROCESSING` |
| Conferência (usuário) | `CONFERENCIA_PELO_USUARIO` | 3 | `COMPLETED` |
| Validado (usuário) | `DADOS_VALIDADOS_PELO_USUARIO` | 4 | `COMPLETED` |
| Finalizado | `FINALIZADO` | — | `COMPLETED` |
| Falhou | `FALHOU` | 2* | `FAILED` |

\* Falhou costuma ocorrer no passo 2.

### 14.1 Persistência (Postgres Gravity) — **entregue**

| Tabela | Coluna | Papel |
|--------|--------|--------|
| `progresso_leitura_smart_read` | `status_fluxo_progresso_leitura_smart_read` | Fonte de verdade durante o wizard |
| `progresso_leitura_smart_read` | `passo_atual_progresso_leitura_smart_read` | Passo 1–4 (já existia) |
| `snapshot_leitura_smart_read` | `status_fluxo_snapshot_leitura_smart_read` | Espelho para Lista/Insights (congelamento) |
| `snapshot_leitura_smart_read` | `passo_atual_snapshot_leitura_smart_read` | Passo no momento do snapshot |
| `snapshot_leitura_smart_read` | `status_leitura_snapshot_leitura_smart_read` | **Inalterado** — só status IA legado |

Migration: `20260625120000_add_status_fluxo_leitura_smart_read` (aplicada em Railway `gravity-smart-read-producao`).

**Backfill na migration:**

| Tabela | Regra |
|--------|--------|
| `progresso_leitura_smart_read` | Por `passo_atual`: ≥4 → `DADOS_VALIDADOS_PELO_USUARIO`; 3 → `CONFERENCIA_PELO_USUARIO`; 2 → `IA_ANALISANDO`; senão `PRONTO_PARA_ANALISE` |
| `snapshot_leitura_smart_read` | `FAILED` → `FALHOU` + passo 2; `COMPLETED` → `FINALIZADO` + passo 4; demais → `IA_ANALISANDO` + passo 2 |

### 14.2 Artefatos entregues nesta task

| Artefato | Caminho |
|----------|---------|
| Contrato Zod + derivação | `shared/status-fluxo-leitura-smart-read.ts` (`derivarStatusFluxoLeitura`, `statusFluxoPorPassoEPersistencia`, `ROTULO_STATUS_FLUXO_LEITURA`) |
| Colunas Prisma | `prisma/fragment.prisma` |
| Pill (componente isolado, **não ligado** à lista) | `client/src/components/pill-status-fluxo-leitura-smart-read.tsx` |
| Testes unitários | `testes/testes-unitarios/smart-read/status-fluxo-leitura.test.ts` |

### 14.3 Wiring pendente (próxima entrega)

| Camada | Arquivo | O que falta |
|--------|---------|-------------|
| BFF schemas | `server/src/schemas/leitura-smart-read.ts`, `progresso-leitura-smart-read.ts` | Campos `status_fluxo_leitura`, `passo_atual_leitura`, `fluxo_finalizado` |
| BFF rotas/libs | `progresso-leitura-smart-read.ts`, `snapshot-leitura-smart-read.ts`, `registrar-vinculo-leitura-usuario-smart-read.ts`, `normalizar-transacao-leitura-smart-read.ts`, `montar-lista-transacoes-leitura-smart-read.ts` | Gravar/ler colunas `status_fluxo_*`; expor na lista |
| Client schemas | `client/src/shared/schemas.ts` | Bilateral com BFF |
| Lista UI | `colunas-lista-leitura-smart-read.tsx`, `filtrar-transacoes-lista-smart-read.ts`, `smart-read-leituras.css`, `formatacao-leitura-smart-read.ts` | Trocar pill; filtros por rótulo de fluxo; classes `.sr-pill-fluxo-*` |
| Wizard | `modal-nova-leitura-smart-read.tsx` | Enviar `fluxo_finalizado: true` ao concluir passo 4 |
| Cards KPI | `lista-leitura-cards-smart-read.tsx` | *(opcional)* contagem «concluídas» por `FINALIZADO` em vez de `COMPLETED` |

### 14.4 Fora do escopo desta entrega (continuam em `status_leitura`)

- **Insights** — filtros e KPIs (`use-dados-insights-leitura-smart-read.ts`, `calcular-metricas-insights-leitura-smart-read.ts`).
- **Kanban** — colunas por `status_leitura` (`KanbanLeituraSmartRead.tsx`; aba oculta no seletor).
- **Polling do wizard** — `modal-nova-leitura-smart-read.tsx` ainda decide passo inicial pelo legado.
