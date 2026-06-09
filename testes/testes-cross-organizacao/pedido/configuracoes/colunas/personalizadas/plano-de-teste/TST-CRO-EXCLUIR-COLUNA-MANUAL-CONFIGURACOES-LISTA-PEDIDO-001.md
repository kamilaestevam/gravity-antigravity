# 📋 Plano Cross-Organização — Excluir Coluna Manual (Configurações)

**ID:** TST-CRO-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001  
**Produto:** Pedido  
**Tela:** Configurações → Colunas → Personalizadas  
**Feature:** Isolamento de organização na exclusão de coluna personalizada  
**Tipo:** Cross-organização (Vitest + mock dual-tenant)  
**Data:** 2026-06-09  
**Criticidade:** **crítica** — falha reprova imediatamente  
**Status:** Aguardando aprovação do dono

---

## Resumo executivo

Garante que a exclusão de coluna personalizada **nunca** afeta dados de outra organização: `DELETE` com ID de coluna da org B usando contexto da org A deve falhar; listagem e soft delete respeitam `id_organizacao` via `withOrganizacao`.

**Vetor crítico:** usuário autenticado na org A não pode excluir nem visualizar efeito colateral em coluna da org B.

**Fora do escopo:** teste em tela (`testes-em-tela`) — outro agente.

**Spec alvo:** `testes/testes-cross-organizacao/pedido/configuracoes/colunas/personalizadas/TST-CRO-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.test.ts`

---

## Arquivos fonte

| Camada | Arquivo |
|--------|---------|
| Rota | `servicos-global/produto/pedido/server/src/routes/colunas-usuario-pedido.ts` |
| Service | `servicos-global/produto/pedido/server/src/services/colunasUsuarioService.ts` |
| SDK | `@gravity/resolver-organizacao` — `withOrganizacao` |

---

## Setup dual-tenant

| Tenant | ID fixo no teste | Seed |
|--------|------------------|------|
| Org A | `org_a_test` | Coluna `col_a_1` ativa — nome `COLUNA ORG A` |
| Org B | `org_b_test` | Coluna `col_b_1` ativa — nome `COLUNA ORG B` |

- Mock Prisma separado por `id_organizacao`
- Cada request injeta `req.organizacao.idOrganizacao` do tenant correspondente
- **Proibido** `new PrismaClient()` direto no teste

---

## Casos de teste — anti cross-tenant

| ID | Cenário | Actor | Alvo | HTTP / Resultado |
|----|---------|-------|------|------------------|
| C-ECM-01 | Org A deleta coluna da Org B | JWT org A | `DELETE col_b_1` | **404** `NOT_FOUND` |
| C-ECM-02 | Coluna Org B intacta após C-ECM-01 | — | Query org B | `ativo_coluna_usuario_pedido=true` |
| C-ECM-03 | Org A lista colunas | GET org A | — | Retorna **somente** colunas org A |
| C-ECM-04 | Org B lista colunas | GET org B | — | Retorna **somente** colunas org B |
| C-ECM-05 | Org A deleta própria coluna | DELETE `col_a_1` org A | — | **204**; soft delete só em org A |
| C-ECM-06 | Org B inalterada após C-ECM-05 | GET org B | — | `col_b_1` ainda ativa |

---

## Casos de teste — service layer

| ID | Cenário | Chamada | Resultado esperado |
|----|---------|---------|-------------------|
| C-ECM-07 | `excluir(tenantA, col_b_1)` | Service direto | `AppError` 404 |
| C-ECM-08 | Query `findFirst` | `excluir` org A | `where.id_organizacao = tenantA` obrigatório |
| C-ECM-09 | Valores org B | Após tentativa cross-delete | Valores org B **intactos** |

---

## Casos de teste — cache e vazamento (se aplicável)

| ID | Cenário | Resultado esperado |
|----|---------|-------------------|
| C-ECM-10 | Chave cache colunas | Prefixo `organizacao:org_a:` — nunca `org_b` |
| C-ECM-11 | Pool / search_path | Handler org A não altera contexto da próxima request org B |

---

## Referência transversal

Alinha com `testes/security/cross-tenant-isolation.test.ts` — este plano cobre **escopo específico** colunas-usuario DELETE.

---

## Execução

```bash
npx vitest run testes/testes-cross-organizacao/pedido/configuracoes/colunas/personalizadas/TST-CRO-EXCLUIR-COLUNA-MANUAL-CONFIGURACOES-LISTA-PEDIDO-001.test.ts
```

---

## Resultado final

- [ ] **APROVADO**
- [ ] **REPROVADO**
- [ ] **RESSALVAS**
