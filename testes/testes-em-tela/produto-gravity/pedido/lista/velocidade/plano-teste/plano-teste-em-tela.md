# Teste em Tela — Velocidade das Ações da Lista de Pedidos

> **ID EMT:** `TST-EMT-PEDIDO-LISTA-VELOCIDADE-000087`
> **Tipo:** performance / latência percebida (UI) + latência de backend, por ação.
> **Escopo:** medir o tempo das 14 ações da Lista de Pedidos — aberturas (UI puro) e execuções (UI + rede).
> **Por que existe:** a investigação de 2026-06-10/11 expôs lentidão real (`/me` 2×, agregações ~900ms, Portão 3 S2S sem cache). Este plano transforma "está lento" em **número medido por ação**, com threshold de aprovação.

---

## Metas (SLA — fonte: `skills/governanca/lei/sla-metas`)

- **Backend:** ≤ **200ms (p95)** end-to-end por chamada de API.
- **UI (abertura de modal/expand):** sem SLA formal → adotamos thresholds próprios abaixo (render React, sem rede).
- Reprovação de um item → investigar a camada estourada (budget por camada na skill SLA) **antes** de mergear.

| Classe de ação | Threshold p95 (UI percebida) | Threshold p95 (backend) |
|----------------|------------------------------|--------------------------|
| Abertura de modal | 300 ms | — (sem rede) |
| Expandir 1 linha (pedido/item) | 250 ms | — ou ≤200ms se buscar itens |
| Expandir TODOS | 800 ms | — |
| Execução (transferir/duplicar/consolidar/excluir/editar) | 800 ms (UI total) | **200 ms** |
| Importação (preview planilha) | 2000 ms | 1500 ms |
| Edição em massa (preview + aplicar) | 1200 ms | 200 ms (por chamada) |

---

## Metodologia de medição

- **Iterações:** cada ação roda **K = 8** vezes (configurável via `EMT_PERF_ITERACOES`). Descarta-se o 1º (warm-up).
- **Métrica de UI:** `performance.now()` no browser entre o **gatilho** (click) e o **resultado visível** (modal `visible` / linha expandida / lista atualizada).
- **Métrica de backend:** `page.on('response')` captura o status + `timing()` do endpoint da ação; reporta a duração da request.
- **Estatística:** p50, p95, min, max, média por ação (sobre as K−1 medições).
- **Estado controlado:** entre iterações, o runner **reseta** (fecha modal / desfaz seleção / recarrega se necessário) para medir sempre o mesmo caminho frio→quente.
- **Viewport fixo** 1440×900; `networkidle` antes de iniciar a bateria.
- **Dados:** usa uma org semeada com **≥ 50 pedidos / ≥ 200 itens** (perf realista). Sem isso → `SKIP (sem dado)`.

---

## As 14 ações medidas

| # | Ação | Classe | Gatilho | Resultado medido | Endpoint backend |
|---|------|--------|---------|------------------|------------------|
| A01 | **Abertura do pedido** | expand-linha | click no chevron `▾` da linha do pedido | itens da linha visíveis | (se lazy) `GET /pedidos/:id/itens` |
| A02 | **Abertura dos itens** | expand-item | expandir/abrir detalhe de um item | detalhe do item visível | — |
| A03 | **Expandir todos** | expand-todos | controle "expandir todos" da toolbar | todas as linhas expandidas | — |
| A04 | **Novo pedido** | abertura-modal | Novo → Manual (pedido) | `ModalNovoPedido` visível | — |
| A05 | **Novo item** | abertura-modal | Novo → Item → Manual | `ModalNovoItemPedido` visível | — |
| A06 | **Planilha (importação)** | abertura+preview | Novo → Importação | `SmartImport` visível (+ preview ao subir) | `POST /pedidos/importacoes-inteligentes/preview` |
| A07 | **Transferir → novo pedido** | execução | selecionar itens → Transferir → novo → Confirmar | sucesso + lista atualizada | `POST /pedidos/:id/transferencias/preview` + `/confirmar` |
| A08 | **Transferir → pedido existente** | execução | selecionar itens → Transferir → existente → Confirmar | sucesso | `…/transferencias/preview` + `/confirmar` |
| A09 | **Duplicar** | execução | selecionar → Duplicar → Confirmar | sucesso | `POST /pedidos/duplicacoes…` |
| A10 | **Consolidar** | execução | selecionar → Consolidar → Confirmar | sucesso | `POST /pedidos/consolidacoes/preview` + `/confirmar` |
| A11 | **Excluir** | execução | selecionar → Excluir → Confirmar | sucesso + linha some | `POST /pedidos/exclusoes…` ou `DELETE` |
| A12 | **Edição no pedido** | execução | edit inline de campo do pedido → salvar | célula atualizada | `PUT /pedidos/:id` |
| A13 | **Edição no item** | execução | edit inline de campo do item → salvar | célula atualizada | `PUT/PATCH /pedidos/:id/itens/:id` |
| A14 | **Edição em massa** | execução | selecionar → Edição em massa → aplicar → Confirmar | sucesso | `POST /pedidos/edicoes-em-massa/preview` + `/confirmar` |

> Seletores: ver `SELETORES` no `run-velocidade.ts`. A maioria usa role/texto (`pedido.barra.*`) porque o componente tem poucos `data-testid` — **recomendação de melhoria:** adicionar `data-testid` nos gatilhos (toolbar, chevron, botões de confirmar dos modais) para medições estáveis. Listado em §Follow-ups.

---

## Relatório (`RESULTADO.txt` + `velocidade.csv`)

Por ação: `runs`, `p50_ui`, `p95_ui`, `max_ui`, `p95_backend`, `threshold_ui`, `threshold_backend`, `veredicto`.
- `veredicto`: `✓ DENTRO` / `✗ ESTOUROU (ui|backend)` / `⊘ SKIP`.
- Cabeçalho com ambiente (org, nº pedidos/itens), `runId`, e total de ações `DENTRO` / `ESTOUROU`.
- `velocidade.csv` para abrir em planilha e acompanhar regressão entre runs.

Fechar com `Resultado: DENTRO_DO_SLA | ESTOUROU` e o `runId`.

---

## Pré-requisitos

1. Shell Vite (`PLAYWRIGHT_BASE_URL`, default `:8000`) + Configurador + sidecar Pedido.
2. `CLERK_SECRET_KEY` no `.env`.
3. Usuário de teste com org semeada (**≥50 pedidos / ≥200 itens**, ≥3 workspaces) — `EMT_PERF_EMAIL`.
4. Planilha modelo para A06 em `_fixtures/` (`pedido-import-50-linhas.xlsx`).
5. ⚠️ **Não medir durante incidente de infra** (ex.: AWS US West/East 2026-06-11) — falseia o backend. Reexecutar após normalização.

---

## Follow-ups (fora deste plano, mas recomendados)

- **Instrumentação:** adicionar `data-testid` nos gatilhos de cada ação (toolbar, chevron, confirmar de cada modal) → mede sem fragilidade de seletor.
- **Otimizações já identificadas:** deduplicar `/me` (2× por load); cachear Portão 3 S2S (`verificarAcessoProduto`); subir TTL do cache do resolver. Cada uma vira um item de "antes/depois" neste mesmo runner.
- **Baseline histórico:** versionar o `velocidade.csv` de cada run no `resultado-teste/<runId>/` para detectar regressão de performance entre entregas.
