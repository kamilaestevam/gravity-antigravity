# Smart Read — Documentação Técnica

> **Produto:** `smart-read`  
> **Código:** `servicos-global/produto/smart-read/`  
> **Skill operacional:** *(ainda não criada — ver Coordenador se necessário)*

---

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) | Dashboard Insights: acerto/erro, emissor responsável, contrato BFF, rankings |

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
| TASK-000307 | Menu lateral no padrão do sistema + tela de Configurações (estado local; PR #388) |
| TASK-000306 | Ocultar abas Dashboard e Kanban do seletor (mantidas só Insights e Lista) |
| TASK-000303 | Dashboard Insights (KPIs, savings, rankings) — ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) |
| Refatoração Insights | Fonte única acerto/erro por edição do usuário; emissor responsável por tipo de documento; `dados_original` no contrato bilateral |
