# Teste em Tela — RBAC Workspaces + Permissões (cobertura total QA)

**ID:** TST-EMT-CONFIG-RBAC-WORKSPACES-000145  
**Task:** TASK-000305  
**Escopo pasta:** `testes/testes-em-tela/configurador/permissoes/rbac-workspaces-cobertura/`  
**Plano + runner:** `plano-de-teste/plano-teste-em-tela.md` + `run-TST-EMT-CONFIG-RBAC-WORKSPACES-000145.ts`  
**Prints:** `../resultado-teste/<runId>/`  
**Matriz compartilhada:** `../../../testes-unitarios/configurador/permissoes/rbac-workspaces-cobertura/MATRIZ-COBERTURA-RBAC.md`  
**Total passos roteiro:** ~120+ (7 workspace × 2 tipos + 13 negações × 2 produtos × 2 tipos)  
**Tipo:** [ ] Unitário | [ ] Funcional | [ ] E2E | [ ] CRO | [x] EMT

---

## Objetivo

Execução **manual assistida** (prints obrigatórios) da matriz combinatória completa:

1. **Workspaces** — cenários WS-01…WS-07 para PADRAO e FORNECEDOR.
2. **Permissões** — metodologia «uma variável por vez» (§6 da matriz).
3. **Baseline** — SUPER_ADMIN, ADMIN, MASTER documentados em ETAPA 0.

**Critério «tela travada»:** §7 da matriz — UI + rota + API.

---

## Papéis na execução

| Papel | Conta | Responsabilidade |
|:---|:---|:---|
| **Operador Master** | `qa-rbac-master@…` | Habilitar/revogar WS e toggles entre passos |
| **Sujeito PADRAO** | `qa-rbac-std@…` | Login under test PADRAO |
| **Sujeito FORNECEDOR** | `qa-rbac-for@…` | Login under test FORNECEDOR |
| **Observador QA** | — | Marca APROVADO/REPROVADO, arquiva prints |

Entre cada bloco: **logout sujeito** ou sessão anônima + login operador Master.

---

## Roteiro de execução

### ETAPA 0 — PREPARAÇÃO (prints 01–05)

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| **01** | Login Master · org QA | HUB 3 WS | `01-master-hub-baseline.png` |
| **02** | Configurador › Usuários › USR-STD | modal vínculos | `02-std-vinculos-inicial.png` |
| **03** | Idem USR-FOR | modal vínculos | `03-for-vinculos-inicial.png` |
| **04** | Documentar ids WS-Alpha/Beta/Gamma | anotado em RESULTADO.txt | — |
| **05** | Login SUPER_ADMIN · hub | todos WS org + admin | `05-super-admin-hub.png` |

### ETAPA 1 — BASELINE bypass (prints 06–10)

| Passo | Usuário | Ação | APROVADO quando | Print |
|-------|---------|------|-----------------|-------|
| **06** | SUPER_ADMIN | Abrir Pedido lista WS-Alpha | carrega | `06-sa-pedido-lista.png` |
| **07** | ADMIN | Admin Panel + org cliente | read OK | `07-admin-panel.png` |
| **08** | MASTER | Modal perm USR-STD | toggles editáveis | `08-master-modal-perm.png` |
| **09** | MASTER | Modal perm próprio | toggles disabled | `09-master-self-bypass.png` |
| **10** | PADRAO sem WS | Login USR-STD zero vínculos | Limbo / nenhum WS | `10-std-limbo.png` |

### ETAPA 2 — MATRIZ WORKSPACE × PADRAO (WS-01…WS-07)

Para **cada** linha da matriz §4 (`WS-0N`):

| Sub | Ação Master | Ação Sujeito USR-STD | APROVADO quando | Print |
|-----|-------------|----------------------|-----------------|-------|
| **2.N.a** | Set vínculos conforme WS-0N · salvar | — | toast OK | `20N-a-master-set-ws.png` |
| **2.N.b** | — | Login · abrir `/hub` | cards = esperado §4 | `20N-b-std-hub.png` |
| **2.N.c** | — | Abrir `/core` seletor WS | dropdown = esperado | `20N-c-std-seletor.png` |
| **2.N.d** | — | URL direta WS **excluído** | travado §7 | `20N-d-std-ws-bloqueado.png` |
| **2.N.e** | — | Abrir produto Pedido WS **incluído** | OK se Portão 3 ON | `20N-e-std-pedido-ok.png` |

> **N = 1…7** — total **35 sub-passos** PADRAO.

### ETAPA 3 — MATRIZ WORKSPACE × FORNECEDOR (WS-01…WS-07)

Repetir ETAPA 2 com **USR-FOR** e prints prefixo `30N-*`.

> Total **35 sub-passos** FORNECEDOR.

### ETAPA 4 — NEGAÇÃO ISOLADA × PADRAO × PEDIDO (WS-07)

Pré: Master habilita WS-07 + Portão 3 + **todas** 12 granulares pedido.

| Passo | Permissão revogada (só esta) | Superfície a verificar | Print |
|-------|------------------------------|------------------------|-------|
| **4.01** | `pedido:dashboard:ver` | Dashboard oculto/403 | `401-neg-dashboard-ver.png` |
| **4.02** | `pedido:dashboard:editar` | widgets read-only | `402-neg-dashboard-editar.png` |
| **4.03** | `pedido:kanban:ver` | Kanban inacessível | `403-neg-kanban-ver.png` |
| **4.04** | `pedido:kanban:editar` | cards sem ação | `404-neg-kanban-editar.png` |
| **4.05** | `pedido:lista:ver` | Lista bloqueada | `405-neg-lista-ver.png` |
| **4.06** | `pedido:lista:editar` | criar/editar bloqueado | `406-neg-lista-editar.png` |
| **4.07** | `pedido:configuracao:ver` | config inacessível | `407-neg-config-ver.png` |
| **4.08** | `pedido:configuracao:editar` | forms read-only | `408-neg-config-editar.png` |
| **4.09** | `pedido:relatorios:ver` | relatórios bloqueados | `409-neg-relatorios-ver.png` |
| **4.10** | `pedido:relatorios:editar` | export bloqueado | `410-neg-relatorios-editar.png` |
| **4.11** | `pedido:historico:ver` | link histórico oculto | `411-neg-historico-ver.png` |
| **4.12** | `pedido:historico:editar` | N/A ou read-only histórico | `412-neg-historico-editar.png` |
| **4.13** | Portão 3 `acesso_usuario_produtos_gravity:permitido` | tile Pedido sumiu | `413-neg-portao3.png` |

Após **cada** passo: Master **restaura** permissão antes do próximo.

### ETAPA 5 — NEGAÇÃO ISOLADA × FORNECEDOR × PEDIDO

Repetir ETAPA 4 com USR-FOR · prints prefixo `5xx-*`.

### ETAPA 6 — NEGAÇÃO ISOLADA × PADRAO × BID-FRETE

Repetir metodologia §6 para produto `bid-frete` (12 granulares) · prints `6xx-*`.

### ETAPA 7 — NEGAÇÃO ISOLADA × FORNECEDOR × BID-FRETE + COTAR

ETAPA 6 + passos extras:

| Passo | Permissão | APROVADO quando | Print |
|-------|-----------|-----------------|-------|
| **7.13** | `bid-frete:visao_fornecedor:cotar` OFF | portal cotação travado | `713-neg-cotar.png` |
| **7.14** | ON (restaurar) | portal acessível | `714-pos-cotar.png` |

### ETAPA 8 — REGRESSÃO FINAL

| Passo | Ação | APROVADO quando | Print |
|-------|------|-----------------|-------|
| **08.01** | Master restaura WS-07 + all perm pedido/bid USR-STD | baseline OK | `801-restore-std.png` |
| **08.02** | Idem USR-FOR | baseline OK | `802-restore-for.png` |
| **08.03** | Consolidar RESULTADO.txt | todos passos marcados | — |

---

## Checklist QA (marcar por ETAPA)

- [ ] ETAPA 0 Preparação
- [ ] ETAPA 1 Baseline bypass
- [ ] ETAPA 2 WS × PADRAO (7 cenários)
- [ ] ETAPA 3 WS × FORNECEDOR (7 cenários)
- [ ] ETAPA 4 Negação PADRAO × pedido (13)
- [ ] ETAPA 5 Negação FORNECEDOR × pedido (13)
- [ ] ETAPA 6 Negação PADRAO × bid-frete (12)
- [ ] ETAPA 7 Negação FORNECEDOR × bid-frete (13+1)
- [ ] ETAPA 8 Regressão final

---

## Runner (automacao parcial — blocos repetitivos)

```bash
npx tsx testes/testes-em-tela/configurador/permissoes/rbac-workspaces-cobertura/plano-de-teste/run-TST-EMT-CONFIG-RBAC-WORKSPACES-000145.ts
```

Variáveis: `PLAYWRIGHT_BASE_URL`, `E2E_RBAC_MASTER_EMAIL`, `E2E_RBAC_STD_EMAIL`, `E2E_RBAC_FOR_EMAIL`, senhas Clerk, `CLERK_SECRET_KEY`.

O runner automatiza **login + screenshot hub** por cenário WS; negações isoladas permanecem **manual** (Master toggles UI) até API seed disponível.

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
