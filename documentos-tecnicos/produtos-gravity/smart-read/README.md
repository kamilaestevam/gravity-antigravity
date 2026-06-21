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

## Entregas recentes (2026-06)

| Task / entrega | Escopo |
|----------------|--------|
| TASK-000306 | Ocultar abas Dashboard e Kanban do seletor (mantidas só Insights e Lista) |
| TASK-000303 | Dashboard Insights (KPIs, savings, rankings) — ver [INSIGHTS-TECNICO.md](./INSIGHTS-TECNICO.md) |
| Refatoração Insights | Fonte única acerto/erro por edição do usuário; emissor responsável por tipo de documento; `dados_original` no contrato bilateral |
