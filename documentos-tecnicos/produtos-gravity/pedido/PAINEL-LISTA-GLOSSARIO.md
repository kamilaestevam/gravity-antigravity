# Painéis da Lista — Glossário

> **Produto:** Pedido (COMEX) — Fase 1; BID Frete Internacional — Fase 2 obrigatória após Pedido  
> **Versão:** 1.0  
> **Data:** 2026-06-02  
> **Status:** ✅ Implementado (2026-06-02) — aguarda migration DB, QA formal e teste do dono  
> **Branch:** `melhoria/lista-todos-produtos-gravity/novos-workspaces`

---

## 1. Termos oficiais

| Termo | Definição | Onde aparece na UI |
|--------|-----------|-------------------|
| **Workspace** | Filial / empresa da organização (`id_workspace`). Unidade de isolamento de dados de negócio. | Menu lateral: seletor com checkboxes, “Buscar workspace…”, “16 workspaces” |
| **Seletor de Workspaces** | Controle do menu lateral (`modoWorkspace="multiplo"`). Define **quais filiais** entram nas consultas do produto. | Sidebar Pedido |
| **Visualização** | Modo de tela do produto: Insights, Lista, Dashboard ou Kanban. | Abas abaixo do título (pills) |
| **Painel** | Visão **pessoal salva** dentro de uma visualização (nome, ordem, configuração). Não é filial. | Abas no topo do Dashboard (“Principal”, “Painel A”…); futuro: mesmo padrão na Lista |
| **Painel da Lista** | Painel cujo `config_json` guarda colunas, filtros, aba de status, ordenação e cards do topo — **não** guarda filiais no MVP. | Barra de abas acima da tabela em `/pedido/pedidos/lista` |
| **Painel do Dashboard** | Painel cujo `widgets_json` guarda layout de widgets. | `/pedido/pedidos/dashboard` |
| **Filtro local** | Refino dentro do escopo já definido pelo seletor (aba status, busca, filtro de coluna). | Toolbar da Lista |

---

## 2. Regra de ouro (Fase 1 — sem exceção de Painel)

**O seletor de Workspaces do menu lateral é mandatório para o escopo de filiais** em Insights, Lista, Dashboard e Kanban do Pedido.

- Trocar **Painel** (Dashboard ou Lista) → muda **como** se exibe; **não** muda filiais.
- Trocar **seletor de Workspaces** → muda **quais pedidos** entram em **todas** as visualizações acima.
- Implementação: `useEscopoWorkspacesPedido` → `resolverIdsWorkspacesParaApi` → query `ids_workspaces` ou contexto de sessão.

**Não usar** a palavra “workspace” para painel da lista na documentação nem na UI — usar **Painel**.

---

## 3. O que cada camada controla

```text
Seletor de Workspaces (sidebar)
    └── Quais id_workspace entram nos dados (global no produto)

Visualização (Insights | Lista | Dashboard | Kanban)
    └── Conjunto de componentes e rotas

Painel (dentro de Lista ou Dashboard)
    └── Configuração salva por usuário naquela visualização

Filtro local (Lista)
    └── Refino temporário ou persistido no config_json do Painel ativo
```

---

## 4. Fase 2 de negócio (fora do MVP)

**Escopo de filiais por Painel da Lista** (`ids_workspaces_escopo` dentro de `config_json`) só entra com decisão explícita do dono. Até lá, filiais vêm **somente** do seletor lateral.

---

## 5. Produtos

| Produto | Painéis da Lista | Seletor multi-workspace |
|---------|------------------|-------------------------|
| Pedido | Fase 1 (este MVP) | Sim (`useEscopoWorkspacesPedido`) |
| BID Frete Internacional | Fase 2 **obrigatória** após Pedido | A replicar (hoje prefs em localStorage) |
| Demais | Backlog | Por produto |

---

## 6. Referências

- [PAINEL-LISTA-CONTRATO.md](./PAINEL-LISTA-CONTRATO.md) — model, API, Zod, fases  
- [PAINEL-LISTA-PLANO-ENTREGA.md](./PAINEL-LISTA-PLANO-ENTREGA.md) — pipeline QA, dono, docs, commit  
- [FILTRO-MULTI-WORKSPACE-TECNICO.md](./FILTRO-MULTI-WORKSPACE-TECNICO.md) — seletor lateral (já em produção)  
- Dashboard painéis: `DashboardPainelUsuarioGlobal`, rotas `/api/v1/pedidos/dashboard/paineis`
