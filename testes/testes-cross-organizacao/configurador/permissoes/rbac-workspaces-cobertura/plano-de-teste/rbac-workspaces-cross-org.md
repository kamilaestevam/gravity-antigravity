# 📋 Plano de Teste Cross-Organização — RBAC Workspaces + Permissões

**ID:** TST-CRO-CONFIG-RBAC-WORKSPACES-000143  
**Task:** TASK-000305  
**Escopo pasta:** `testes/testes-cross-organizacao/configurador/permissoes/rbac-workspaces-cobertura/`  
**Spec:** `plano-de-teste/TST-CRO-CONFIG-RBAC-WORKSPACES-000143.test.ts`  
**Matriz compartilhada:** `../../../testes-unitarios/configurador/permissoes/rbac-workspaces-cobertura/MATRIZ-COBERTURA-RBAC.md`  
**Tipo:** [ ] Unitário | [ ] Funcional | [ ] E2E | [x] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Garantir **isolamento de tenant** quando permissões e workspaces cruzam fronteiras de `id_organizacao` — especialmente Fornecedor com vínculos multi-org, tentativas IDOR, e vazamento de permissões entre orgs.

---

## Pré-requisitos

| Recurso | Descrição |
|:---|:---|
| `org-qa-rbac` | Org cliente A (3 workspaces) |
| `org-qa-rbac-B` | Org cliente B (≥ 1 workspace) |
| `USR-FOR-MULTI` | Mesmo `id_usuario` / e-mail em A e B via `UsuarioWorkspace` distintos |
| `USR-STD-A` | PADRAO **somente** org A |

---

## Roteiro de execução

### ETAPA 1 — Permissão gravada org A não vale org B

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C01** | Master org A concede `pedido:lista:ver` a USR-STD-A em WS-A | **200** |
| **C02** | USR-STD-A autenticado com contexto org B (se aplicável) ou token org B | **403** ou zero dados org B |
| **C03** | GET permissões USR-STD-A com header/context org A vs B | conjuntos disjuntos por org |

### ETAPA 2 — IDOR workspace cross-org

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C04** | PUT permissão USR-STD-A com `id_workspace` de org B | **403** `WORKSPACE_FORA_DA_ORGANIZACAO` |
| **C05** | GET hub-init org A com cookie/context org B | não lista workspaces de B |
| **C06** | Rota produto pedido com `id_workspace` org B + token org A | **403** |

### ETAPA 3 — Fornecedor multi-organização

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C07** | USR-FOR-MULTI vinculado WS-A (org A) e WS-B1 (org B) | hub mostra cards **separados** por org após troca contexto |
| **C08** | Permissão `bid-frete:visao_fornecedor:cotar` só org A | portal cotação B **403** |
| **C09** | Revogar vínculo org A | org B intacta — sem cascade indevido |
| **C10** | Cadastros fornecedor inativo org A | PUT permissão fornecedor org A **400/403** códigos documentados |

### ETAPA 4 — SUPER_ADMIN cross-org (controle positivo)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C11** | SUPER_ADMIN edita permissões USR-STD org B estando logado org A | **200** — escopo admin global |
| **C12** | Audit registra `id_organizacao` **alvo** (org B) em metadata | rastreio cross-org |

### ETAPA 5 — Pool / session isolation

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **C13** | Sequência A→B→A requests mesmo pool | sem vazamento workspace count |
| **C14** | Crash simulado mid-handler org A → request org B | `SET LOCAL` reset (pool leak guard) |

---

## Como rodar

```bash
npx vitest run --config testes/testes-cross-organizacao/configurador/vitest.config.ts TST-CRO-CONFIG-RBAC-WORKSPACES-000143
```

> Criar `vitest.config.ts` nesta pasta se ausente — espelhar `testes-cross-organizacao/admin/vitest.config.ts`.

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
