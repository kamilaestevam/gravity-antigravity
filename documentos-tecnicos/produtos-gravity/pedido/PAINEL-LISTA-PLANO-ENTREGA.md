# Painéis da Lista — Plano de entrega e gates

> **Aprovado pelo dono:** 2026-06-02  
> **Regra adicional:** após Pedido, **BID Frete Internacional é obrigatório** (não backlog opcional).  
> **Commit / push / PR:** somente após todos os gates abaixo.

---

## Consenso fechado

1. Seletor de Workspaces (sidebar) = única fonte de filiais (Pedido Fase 1).  
2. Painel da Lista = visão salva (colunas, filtros, aba, ordenação, cards).  
3. MVP = Pedido → em seguida BID Frete Internacional.  
4. Fase “escopo por painel” = fora até nova decisão do dono.

---

## Pipeline de entrega (ordem obrigatória)

```text
┌─────────────────────────────────────────────────────────────┐
│ A. Implementação (Fase 1 Pedido → Fase 2 BID Frete Int.)   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ B. QA — planos de teste (multi-agente) + execução + APROVADO │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ C. Dono — teste manual em ambiente local/staging + APROVADO  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ D. Atualizar documentos-tecnicos (status ✅, changelog)      │
│ E. Atualizar skills (pedido + bid-frete-internacional)       │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ F. Commit → Push → PR (somente aqui)                         │
└─────────────────────────────────────────────────────────────┘
```

### Detalhe dos gates

| Gate | Responsável | Critério de saída |
|------|-------------|-------------------|
| **B0** Plano de testes (design) | QA (pipeline `multi-agente-plano-teste`) | Planos unitário + funcional + E2E registrados **antes** ou em paralelo à implementação; dono pode revisar escopo |
| **A1** Fase 1 Pedido | Dev | Código + testes B0 executando verde local/CI |
| **A2** Fase 2 BID Frete Int. | Dev | Paridade contrato + UI lista + migração localStorage |
| **B** Aprovação QA | QA | Checklist 6 categorias (`skills/papeis/qa`) = **Aprovado** |
| **C** Aprovação dono | Dono | Testou sidebar + painéis Lista (Pedido e BID Frete Int.) |
| **D–E** Docs + skills | Dev/QA | `documentos-tecnicos` e `skills/produtos-gravity/*` atualizados no **mesmo PR** |
| **F** Git | Dev | `commit` → `push` → `gh pr create` |

**Proibido:** commit ou PR antes de **B + C + D + E**.

---

## Tasks por fase (checklist executável)

### Fase 0 — Documentação

- [x] `PAINEL-LISTA-GLOSSARIO.md`
- [x] `PAINEL-LISTA-CONTRATO.md`
- [x] `PAINEL-LISTA-PLANO-ENTREGA.md`
- [x] Stubs de teste + `test-plans-registry.json`
- [x] Teste unitário `lista-painel-config-schema.test.ts`

### Fase 1 — Pedido ✅ implementado

| ID | Task | Status |
|----|------|--------|
| 1.1 | `ListaPainelUsuarioGlobal` em `fragment.prisma` + compose | ✅ |
| 1.2 | Rotas `/api/v1/pedidos/lista/paineis` | ✅ |
| 1.3 | `listaPainelConfigV1Schema` (shared) | ✅ |
| 1.4 | `PedidosListaPainelBar` + `useListaPainelPedido` | ✅ |
| 1.5 | Escopo sidebar inalterado; persistência por painel | ✅ |
| 1.6 | `contracts.json` | Pendente Coordenador |
| 1.7 | Migration DB | Pendente deploy |

### Fase 2 — BID Frete Internacional ✅ implementado (lista cliente)

| ID | Task | Status |
|----|------|--------|
| 2.1 | Schema/rotas `/api/v1/bid-frete-internacional/lista/paineis` | ✅ |
| 2.2 | Migração localStorage → painel Principal (client) | ✅ |
| 2.3 | `BidFreteListaPainelBar` em `lista-bid-frete-internacional.tsx` | ✅ |
| 2.4 | Lista fornecedor | Backlog |
| 2.5 | Doc bid-frete | ✅ `PAINEL-LISTA-BID-FRETE-INTERNACIONAL.md` |

### Fase final — Antes do PR

| ID | Task |
|----|------|
| F.1 | QA veredito **Aprovado** |
| F.2 | Dono **Aprovado** após teste manual |
| F.3 | Atualizar `skills/produtos-gravity/pedido/SKILL.md` (seção Painéis da Lista) |
| F.4 | Atualizar skill BID Frete Internacional |
| F.5 | Marcar docs técnicos status ✅ + datas |
| F.6 | Commit, push, PR |

---

## Estimativa

| Bloco | Dias (1 dev) |
|-------|----------------|
| Fase 1 Pedido | 7–11 |
| Fase 2 BID Frete Int. | 5–8 |
| QA + dono + docs | 2–4 |
| **Total** | **~3–4 semanas** |

---

## Branch

`melhoria/lista-todos-produtos-gravity/novos-workspaces`
