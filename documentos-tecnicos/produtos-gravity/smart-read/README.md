# Smart Read — Documentação Técnica

> **Produto:** `smart-read`  
> **Código:** `servicos-global/produto/smart-read/`  
> **Skill operacional:** *(ainda não criada — ver Coordenador se necessário)*

---

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) | **Onde vive cada dado:** banco DATI = leituras reais (PDF, OCR, extração); Postgres Gravity = snapshot, progresso, painéis |
| [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) | Dashboard Insights: acerto/erro, emissor responsável, contrato BFF, rankings |
| [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) | Lista por workspace, layout/paginação/painéis, BFF leituras, progresso por usuário, nome do wizard, **KPI cards §13**, **status de fluxo §14** (fundação + wiring pendente) |

---

## Painéis da lista (padrão Pedido/BID)

O Smart Read replica o **mesmo model e contrato** de `ListaPainelUsuarioGlobal` (`lista_painel_usuario_global` no banco `gravity-smart-read`), com `id_produto_gravity = 'smart-read'`. SSOT do contrato transversal: [PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md).

| Camada | Caminho |
|--------|---------|
| Model | `prisma/fragment.prisma` → `ListaPainelUsuarioGlobal` |
| API | `GET\|POST\|PUT\|DELETE /api/v1/smart-read/lista/paineis` |
| Zod | `shared/listaPainelConfigSchema.ts`, `shared/listaPainelApiSchema.ts` |
| Hook | `client/src/shared/use-lista-painel-smart-read.ts` |
| UI faixa | `client/src/components/SmartReadListaPainelBar.tsx` + `client/src/shared/smart-read-lista-layout.css` |

---

## Identidade do produto

| Atributo | Valor |
|----------|-------|
| `id_produto_gravity` | `smart-read` |
| Client | `servicos-global/produto/smart-read/client/` |
| Server (BFF) | `servicos-global/produto/smart-read/server/` |

---

## Visualizações (abas)

Seletor em `client/src/components/SmartReadVisualizacaoTabs.tsx`.

| Aba | Rota | Estado | Visível |
|-----|------|--------|---------|
| Insights | `/smart-read/insights` | Implementado (cockpit operacional, **default**) | **Sim** |
| Lista | `/smart-read/lista` | Implementado | **Sim** |
| Dashboard | `/smart-read/dashboard` | Placeholder ("em breve") | **Oculto** |
| Kanban | `/smart-read/kanban` | Implementado | **Oculto** |

> **Dashboard e Kanban estão ocultos do seletor** (TASK-000306). As rotas continuam existindo; apenas os botões das abas foram removidos do array `TABS`. Para reexibir, basta voltar as entradas `dashboard` e `kanban` (e seus ícones `ChartBar` / `Kanban`).

---

## Rotas de entrada (configurador)

O Smart Read roda **embutido** no configurador (`/smart-read/*`). Rotas internas do produto (`lista`, `insights`, …) são **relativas** no `App.tsx` do Smart Read — mesmo padrão do BID Frete.

| URL de entrada | Destino canônico | Onde |
|----------------|------------------|------|
| `/smart-read` | `/smart-read/insights` | `configurador/src/App.tsx` + server 301 |
| `/smart-read-` | `/smart-read/insights` | typo/bookmark legado (hífen solto no final) |
| `/produto/smart-read` | `/smart-read/insights` | `configurador/src/App.tsx` + server 301 |
| `/produto/smart-read-` | `/smart-read/insights` | idem typo com prefixo legado |
| `/produto/smart-read/*` | `/smart-read/*` | `NavigateComPrefixo` (legado 90 dias) |

**SSOT da entrada:** `ROTA_ENTRADA_SMART_READ` em `servicos-global/shell/utils/resolver-rota-produto.ts` (exportada via `@gravity/shell`). Hub, Core e puzzle consomem `resolverRotaProdutoGravity('smart-read')`.

**Não fazer:** rotas absolutas `/smart-read/lista` dentro do `Routes` do produto embutido — quebra match local e deixa a tela em branco.

---

## Menu lateral (padrão do sistema)

Configurado em `client/src/shared/config.ts` (`PRODUCT_CONFIG.navigation`) e mapeado para `MenuLateralGlobal` em `client/src/App.tsx`. Segue o padrão dos demais produtos (Pedido/BID):

| Grupo / item | Rota | Observação |
|--------------|------|------------|
| Meu Espaço → Minhas Atividades / Email / WhatsApp | `/hub` | Desabilitados (badge "Em Breve") |
| Smart Read (divisor) → Lista | `/smart-read/lista` | Acesso direto à lista (toggle Insights\|Lista no topo) |
| Histórico | `/workspace/historico-organizacao?id_produto_historico_log=smart-read` | Link externo (tela centralizada do Configurador) |
| Configurações | `/smart-read/configuracoes` | Ver abaixo |

---

## Configurações (`/smart-read/configuracoes`)

Tela em `client/src/pages/configuracoes-smart-read/`, com paridade de layout 1:1 com a Configurações do Pedido (abas de visualização no topo + sidebar de categorias; só a categoria ativa é renderizada). Categorias: **Card**, **Visão Geral**, **Tabelas**, **Colunas Personalizadas** (criar/renomear/ocultar/excluir + reordenar por drag).

> **Estado é local (`useState`)** — o Smart Read ainda não tem backend de preferências. Sem botão "Salvar" e sem mock de persistência (Mandamentos 05/08). As preferências não sobrevivem ao refresh até existir endpoint/persistência.

---

## Entregas recentes (2026-06)

| Task / entrega | Escopo |
|----------------|--------|
| **PR #394** (merge 2026-06-22) | Lista com paridade Pedido/BID: altura flex até o rodapé, contagem/paginação no GTV, colunas/filtros/exportação, painéis persistidos em Postgres — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §9–11 |
| TASK-000311 | Layout lista (viewport flex) + rodapé `N leituras · M arquivos · página X de Y` |
| TASK-000310 | Colunas dinâmicas, filtros por coluna, seletor/arrastar colunas, exportação multi-formato |
| Hotfix rotas (2026-06) | Entrada `/smart-read` e `/produto/smart-read` → `/smart-read/insights`; rotas internas relativas no produto embutido |
| TASK-000308 | Lista real (BFF + progresso Postgres), link nome→retomar wizard, nome customizado (sessao.nome), recarregar lista ao fechar modal — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) |
| TASK-000307 | Menu lateral no padrão do sistema + tela de Configurações (estado local; PR #388) |
| TASK-000306 | Ocultar abas Dashboard e Kanban do seletor (mantidas só Insights e Lista) |
| TASK-000318 | Snapshot de leitura no Postgres Gravity (`snapshot_leitura_smart_read`) — ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) |
| TASK-000303 | Dashboard Insights (KPIs, savings, rankings) — ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) |
| **PR #409** (merge 2026-06-23) | Insights: modal **Base de cálculo** (tempos do estudo + observações documento médio), KPI Saving em Erros = contagem de campos, fallback degradado, cadeia GET snapshot→legado→progresso — ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) §5–6 e [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) §4.6 |
| **TASK-000317** / PR #409 | Lista: colunas de **métricas da leitura** (documentos, campos, saving, tempos) — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §12 |
| **TASK-000321** | Lista: ordem dos KPI cards (Performance de acertos = 2º) + card **Recursos reduzidos** agregando saving das leituras visíveis — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §13 |
| **TASK-000324** | Lista: faixa **Painéis** roxa no chrome da tabela (criar/trocar/renomear/reordenar/excluir) + segmento «Visão geral» / «Transações API» na faixa unificada — paridade Pedido/BID Frete — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §11 |
| **PR #449** (merge 2026-06-25) | Docs status fluxo (§14), fix crash wizard, fetch só aba ativa, rate limit off em dev — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §6 e §9 |
| **Status de fluxo** (2026-06) | **Fundação:** migration `20260625120000`, colunas `status_fluxo_*`, SSOT `shared/status-fluxo-leitura-smart-read.ts`, pill isolada + testes; **pendente:** wiring BFF/Lista (§14.3) — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) §14 |
| Refatoração Insights | Fonte única acerto/erro por edição do usuário; emissor responsável por tipo de documento; `dados_original` no contrato bilateral |
