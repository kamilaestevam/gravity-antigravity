# 📋 Plano de Teste Funcional — RBAC Workspaces + Permissões Granulares

**ID:** TST-FUN-CONFIG-RBAC-WORKSPACES-000142  
**Task:** TASK-000305  
**Escopo pasta:** `testes/testes-funcionais/configurador/permissoes/rbac-workspaces-cobertura/`  
**Spec:** `plano-de-teste/TST-FUN-CONFIG-RBAC-WORKSPACES-000142.test.ts`  
**Matriz compartilhada:** `../../../testes-unitarios/configurador/permissoes/rbac-workspaces-cobertura/MATRIZ-COBERTURA-RBAC.md`  
**Rotas-alvo:** `GET/PUT /api/v1/usuarios/:id/permissoes`, `GET /api/v1/me`, `GET /api/v1/hub-init`, middleware `requirePermissao`  
**Tipo:** [ ] Unitário | [x] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Provar **contratos HTTP** de autorização: quem pode ler/gravar permissões, filtro de workspace no hub/me, negação 403 em middleware de produto, e defesas IDOR documentadas em `skills/seguranca/permissoes/SKILL.md`.

Complementa `permissoes.test.ts` (legado escopo modal) com **matriz completa** TASK-000305.

---

## Roteiro de execução

### ETAPA 1 — PUT/GET permissões — hierarquia Cadeia 1

| Passo | Ator | Alvo | Ação | APROVADO quando |
|-------|------|------|------|-----------------|
| **F01** | MASTER | USR-STD (PADRAO) | PUT permissões válidas | **200** + persistência |
| **F02** | MASTER | USR-MST | PUT qualquer | **400** bypass — não edita Master |
| **F03** | MASTER | próprio USR-MST | PUT | **403** `EDICAO_PROPRIA_NAO_PERMITIDA` |
| **F04** | PADRAO | USR-STD colega | PUT | **403** |
| **F05** | SUPER_ADMIN | USR-STD org qualquer | PUT | **200** escopo global |
| **F06** | ADMIN | USR-STD | PUT | **403** `ADMIN_SOMENTE_LEITURA` (se read-only) ou **200** se perm explícita |

### ETAPA 2 — Validação Zod e produto no Set

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F07** | PUT chave `simula-custo:lista:ver` (produto fora Set) | **400** produto não implementado |
| **F08** | PUT slug body ≠ slug produto | **400** `PERMISSION_SLUG_MISMATCH` |
| **F09** | PUT array com duplicata | **400** Zod |
| **F10** | PUT `permissoes: []` | **200** wipe + `total_removidas` correto |
| **F11** | PUT idempotente — mesmo body 2× | estado final idêntico |

### ETAPA 3 — Anti-IDOR workspace

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F12** | PUT permissão com `id_workspace` de outra org | **403** `WORKSPACE_FORA_DA_ORGANIZACAO` |
| **F13** | GET permissões filtrado por `id_workspace` | só linhas daquele workspace |
| **F14** | GET permissões sem filtro | agregado cross-workspace do usuário na org |

### ETAPA 4 — `GET /api/v1/me` — memberships

| Passo | Sujeito | Vínculos | APROVADO quando |
|-------|---------|----------|-----------------|
| **F15** | USR-STD | WS-04 `{A,B}` | `memberships` length 2, ids corretos |
| **F16** | USR-MST | nenhum | bypass — todos workspaces org na resposta hub |
| **F17** | USR-SA | nenhum | acesso global Mand. 04 |
| **F18** | USR-STD | revogado WS-A pós-PUT vínculos | membership só B |

### ETAPA 5 — `GET /api/v1/hub-init` — filtro cards

| Passo | Cenário | APROVADO quando |
|-------|---------|-----------------|
| **F19** | WS-01 PADRAO | payload workspaces length 1 |
| **F20** | WS-07 PADRAO | length 3 |
| **F21** | MASTER | todos ativos |
| **F22** | PADRAO zero vínculos | `[]` ou estado Limbo documentado — **nunca** todos |

### ETAPA 6 — Middleware `requirePermissao` (produto pedido)

| Passo | Permissões USR-STD | Rota | APROVADO quando |
|-------|-------------------|------|-----------------|
| **F23** | só `pedido:lista:ver` | GET lista | **200** |
| **F24** | só `pedido:lista:ver` | POST criar pedido | **403** |
| **F25** | `pedido:lista:ver` + `editar` | POST criar | **200** ou conforme rota |
| **F26** | sem Portão 3 | qualquer rota pedido | **403** |
| **F27** | MASTER | qualquer | **200** bypass |

### ETAPA 7 — Histórico cross-workspace (`historico:ver`)

| Passo | Permissão | APROVADO quando |
|-------|-----------|-----------------|
| **F28** | `pedido:historico:ver` em **qualquer** WS | GET historico-org **200** |
| **F29** | zero `historico:ver` | **403** `FORBIDDEN_PERMISSION` |
| **F30** | MASTER | **200** bypass |

### ETAPA 8 — Audit e side-effects

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F31** | PUT com diff real | `securityAudit.permissionChanged` chamado |
| **F32** | PUT sem diff | audit **não** dispara |

---

## Como rodar

```bash
npx vitest run --config testes/testes-funcionais/configurador/vitest.config.ts TST-FUN-CONFIG-RBAC-WORKSPACES-000142
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
