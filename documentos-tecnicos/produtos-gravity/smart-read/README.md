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
| [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) | Lista real, layout/paginação/painéis, BFF leituras, progresso Postgres, nome do wizard |

---

## Painéis da lista (padrão Pedido/BID)

O Smart Read replica o **mesmo model e contrato** de `ListaPainelUsuarioGlobal` (`lista_painel_usuario_global` no banco `gravity-smart-read`), com `id_produto_gravity = 'smart-read'`. SSOT do contrato transversal: [PAINEL-LISTA-CONTRATO.md](../pedido/PAINEL-LISTA-CONTRATO.md).

| Camada | Caminho |
|--------|---------|
| Model | `prisma/fragment.prisma` → `ListaPainelUsuarioGlobal` |
| API | `GET\|POST\|PUT\|DELETE /api/v1/smart-read/lista/paineis` |
| Zod | `shared/listaPainelConfigSchema.ts`, `shared/listaPainelApiSchema.ts` |
| Hook | `client/src/shared/use-lista-painel-smart-read.ts` |

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
| Insights | `/smart-read/insights` | Implementado (cockpit operacional) | **Sim** |
| Lista | `/smart-read/lista` | Implementado (default) | **Sim** |
| Dashboard | `/smart-read/dashboard` | Placeholder ("em breve") | **Oculto** |
| Kanban | `/smart-read/kanban` | Implementado | **Oculto** |

> **Dashboard e Kanban estão ocultos do seletor** (TASK-000306). As rotas continuam existindo; apenas os botões das abas foram removidos do array `TABS`. Para reexibir, basta voltar as entradas `dashboard` e `kanban` (e seus ícones `ChartBar` / `Kanban`).

---

## Rotas de entrada (configurador)

O Smart Read roda **embutido** no configurador (`/smart-read/*`). Rotas internas do produto (`lista`, `insights`, …) são **relativas** no `App.tsx` do Smart Read — mesmo padrão do BID Frete.

| URL de entrada | Destino canônico | Onde |
|----------------|------------------|------|
| `/smart-read` | `/smart-read/lista` | `configurador/src/App.tsx` + server 301 |
| `/smart-read-` | `/smart-read/lista` | typo/bookmark legado (hífen solto no final) |
| `/produto/smart-read` | `/smart-read/lista` | `configurador/src/App.tsx` + server 301 |
| `/produto/smart-read-` | `/smart-read/lista` | idem typo com prefixo legado |
| `/produto/smart-read/*` | `/smart-read/*` | `NavigateComPrefixo` (legado 90 dias) |

**SSOT da entrada:** `ROTA_ENTRADA_SMART_READ` em `servicos-global/shell/utils/resolver-rota-produto.ts` (exportada via `@gravity/shell`). Hub, Core e puzzle consomem `resolverRotaProdutoGravity('smart-read')`.

**Não fazer:** rotas absolutas `/smart-read/lista` dentro do `Routes` do produto embutido — quebra match local e deixa a tela em branco.

---

## Menu lateral (padrão do sistema)

Configurado em `client/src/shared/config.ts` (`PRODUCT_CONFIG.navigation`) e mapeado para `MenuLateralGlobal` em `client/src/App.tsx`. Segue o padrão dos demais produtos (Pedido/BID):

| Grupo / item | Rota | Observação |
|--------------|------|------------|
| Meu Espaço → Minhas Atividades / Email / WhatsApp | `/hub` | Desabilitados (badge "Em Breve") |
| Smart Read (divisor) → Leituras | `/smart-read/lista` | Default |
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
| Hotfix rotas (2026-06) | Entrada `/smart-read` e `/produto/smart-read` → `/smart-read/lista`; rotas internas relativas no produto embutido |
| TASK-000308 | Lista real (BFF + progresso Postgres), link nome→retomar wizard, nome customizado (sessao.nome), recarregar lista ao fechar modal — ver [LISTA-E-PROGRESSO-TECNICO.md](./LISTA-E-PROGRESSO-TECNICO.md) |
| TASK-000307 | Menu lateral no padrão do sistema + tela de Configurações (estado local; PR #388) |
| TASK-000306 | Ocultar abas Dashboard e Kanban do seletor (mantidas só Insights e Lista) |
| TASK-000318 | Snapshot de leitura no Postgres Gravity (`snapshot_leitura_smart_read`) — ver [PERSISTENCIA-DADOS-TECNICO.md](./PERSISTENCIA-DADOS-TECNICO.md) |
| TASK-000303 | Dashboard Insights (KPIs, savings, rankings) — ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) |
| Refatoração Insights | Fonte única acerto/erro por edição do usuário; emissor responsável por tipo de documento; `dados_original` no contrato bilateral |
