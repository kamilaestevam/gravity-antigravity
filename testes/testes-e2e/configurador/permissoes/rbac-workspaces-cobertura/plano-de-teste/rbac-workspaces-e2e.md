# 📋 Plano de Teste E2E — RBAC Workspaces + Permissões Granulares

**ID:** TST-E2E-CONFIG-RBAC-WORKSPACES-000144  
**Task:** TASK-000305  
**Escopo pasta:** `testes/testes-e2e/configurador/permissoes/rbac-workspaces-cobertura/`  
**Spec:** `plano-de-teste/TST-E2E-CONFIG-RBAC-WORKSPACES-000144.spec.ts`  
**Matriz compartilhada:** `../../../testes-unitarios/configurador/permissoes/rbac-workspaces-cobertura/MATRIZ-COBERTURA-RBAC.md`  
**Tipo:** [ ] Unitário | [ ] Funcional | [x] E2E | [ ] CRO | [ ] EMT

> Automação Playwright dos fluxos **repetíveis** da matriz. Cenários combinatórios massivos (EMT) ficam no plano 000145; este spec cobre **smoke + regressão CI** representativa.

---

## Escopo

Navegador real: login por `tipo_usuario`, HUB/Core, modal permissões Master, gating sidebar produto Pedido, negação 403 em rotas diretas.

**Fixtures:** variáveis env `E2E_RBAC_*` (ver § Pré-requisitos na matriz).

---

## Roteiro de execução

### ETAPA 0 — Setup (beforeAll)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E00** | Seed org QA com WS-Alpha, WS-Beta, WS-Gamma | 3 cards no HUB Master |
| **E01** | Produtos `pedido` + `bid-frete` ativos nos 3 WS | tiles visíveis Master |

### ETAPA 1 — Bypass Cadeia 1 (SUPER_ADMIN, ADMIN, MASTER)

| Passo | Usuário | Ação | APROVADO quando |
|-------|---------|------|-----------------|
| **E02** | USR-SA | Abrir `/hub` | 3 workspaces visíveis |
| **E03** | USR-SA | Abrir Pedido lista | carrega sem 403 |
| **E04** | USR-MST | Modal permissões próprio | toggles **disabled** + banner bypass |
| **E05** | USR-ADM | Admin Panel | acesso conforme perm admin |

### ETAPA 2 — Matriz workspace PADRAO (automação WS-01, WS-04, WS-07)

| Passo | Cenário | Ação | APROVADO quando |
|-------|---------|------|-----------------|
| **E06** | WS-01 | Master habilita só Alpha → login USR-STD | `[data-testid="hub-card-workspace"]` count = 1 |
| **E07** | WS-01 | Navegar URL workspace Beta forçada | redirect ou `[data-testid="acesso-negado"]` |
| **E08** | WS-04 | Master Alpha+Beta → login USR-STD | count = 2 |
| **E09** | WS-07 | Master todos → login USR-STD | count = 3 |
| **E10** | WS-07→WS-01 | Master revoga Gamma+Beta, refresh USR-STD | count = 1 |

### ETAPA 3 — Portão 3 + granular Pedido (amostra negação)

| Passo | Permissões | Ação | APROVADO quando |
|-------|------------|------|-----------------|
| **E11** | Sem Portão 3 | Login USR-STD WS-07 | tile Pedido ausente |
| **E12** | Portão 3 + só `lista:ver` | Abrir lista | `[data-testid="pedido-lista"]` visível |
| **E13** | Idem | Clicar «Novo pedido» / toolbar criar | botão disabled ou ausente |
| **E14** | + `lista:editar` | Toolbar criar | habilitado |
| **E15** | Revogar `lista:ver` | URL direta `/pedido/lista` | 403 ou página bloqueio |

### ETAPA 4 — FORNECEDOR + visão cotação

| Passo | Permissões | APROVADO quando |
|-------|------------|-----------------|
| **E16** | `bid-frete:visao_fornecedor:cotar` ON | portal agente acessível |
| **E17** | OFF | rota portal **403** / menu oculto |

### ETAPA 5 — Modal Master edita USR-STD

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E18** | Master abre Editar Usuário › Permissões USR-STD | 4 abas + grid pedido |
| **E19** | Toggle `pedido:kanban:ver` ON + Salvar | toast sucesso |
| **E20** | Reabrir modal | toggle persiste |
| **E21** | USR-STD login | menu Kanban Pedido visível |

### ETAPA 6 — Regressão console e network

| Passo | APROVADO quando |
|-------|-----------------|
| **E22** | Zero `console.error` não filtrado em E02–E21 |
| **E23** | Requests 403 não retornam body com PII |

---

## data-testid necessários (registrar gaps)

| Elemento | testid sugerido | Status |
|:---|:---|:---|
| Card workspace HUB | `hub-card-workspace` | verificar Hub.tsx |
| Página acesso negado | `acesso-negado` | verificar guard global |
| Tile produto | `hub-tile-produto-{slug}` | verificar Hub |
| Toggle permissão | `perm-{slug}-{secao}-{acao}` | verificar ModalEditarUsuario |

---

## Como rodar

```bash
npx playwright test testes/testes-e2e/configurador/permissoes/rbac-workspaces-cobertura/plano-de-teste/TST-E2E-CONFIG-RBAC-WORKSPACES-000144.spec.ts
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
