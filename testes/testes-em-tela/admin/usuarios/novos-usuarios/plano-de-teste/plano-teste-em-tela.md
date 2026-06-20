# Teste em Tela — Convite Super Admin (Admin › Usuários Globais)

**ID:** TST-EMT-ADMIN-CONVITE-SUPER-ADMIN-ADMIN-000120  
**Task:** TASK-000302  
**Escopo pasta:** `testes/testes-em-tela/admin/usuarios/novos-usuarios/`  
**Plano + runner:** `plano-de-teste/` (`plano-teste-em-tela.md` + `run-TST-EMT-ADMIN-CONVITE-SUPER-ADMIN-ADMIN-000120.ts`)  
**Prints:** `../resultado-teste/<runId>/`  
**Tela-alvo:** Admin › Usuários Globais → modal «Convidar Usuário» → tipo Super Admin  
**Rota:** `/admin/usuarios`  
**Total passos no modal (roteiro):** 6  
**Total itens no modal (roteiro + prints):** 14

---

## Objetivo

Provar visualmente que Super Admin convida colega **sem selecionar organização** na UI,
botão Salvar responde, toast confirma sucesso e Network registra POST 201 — corrigindo
TASK-000302 (org obrigatória bloqueava erroneamente + botão inerte).

## Roteiro de execução

As ETAPAs começam colapsadas no modal Admin. Todo print é sufixado com `(sucesso ou erro)`.

### ETAPA 0 — PREPARAÇÃO (PASSOS 01–02)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **01** | Autenticar (Clerk) como Super Admin Gravity | Sessão ativa · Print `01-pos-login.png` (sucesso ou erro) |
| **02** | Navegar até Admin › Usuários Globais (`/admin/usuarios`) | Listagem visível · Print `02-admin-usuarios.png` (sucesso ou erro) |

### ETAPA 1 — ABRIR MODAL (PASSO 03)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **03** | Clicar «Convidar Usuário» | Modal aberto · Print `03-modal-convidar-aberto.png` (sucesso ou erro) |

### ETAPA 2 — TIPO SUPER ADMIN (PASSO 04)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **04** | Selecionar tipo **Super Admin** | Org alvo não exigida no banner de requisitos · Print `04-tipo-super-admin.png` (sucesso ou erro) |

### ETAPA 3 — PREENCHER E SALVAR (PASSOS 05–06)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **05** | Preencher nome + e-mail únicos · verificar botão «Convidar Usuário» habilitado | Salvar clicável sem org · Print `05-form-preenchido-antes.png` · Print `05-form-preenchido-selecao.png` |
| **06** | Clicar «Convidar Usuário» · aguardar toast | Toast sucesso + POST 201 na aba Network · Print `06-convite-resultado.png` (sucesso ou erro) |

---

## Prints planejados

| # | Arquivo | Estado capturado |
|---|---------|------------------|
| 01 | `01-pos-login.png` | Hub/pós-login |
| 02 | `02-admin-usuarios.png` | Listagem usuários globais |
| 03 | `03-modal-convidar-aberto.png` | Modal convite aberto |
| 04 | `04-tipo-super-admin.png` | Tipo Super Admin sem bloqueio de org |
| 05 | `05-form-preenchido-antes.png` | Nome/e-mail preenchidos |
| 05 | `05-form-preenchido-selecao.png` | Clique em Convidar Usuário |
| 06 | `06-convite-resultado.png` | Toast + estado pós-convite |

---

## Runner

```bash
npx tsx testes/testes-em-tela/admin/usuarios/novos-usuarios/plano-de-teste/run-TST-EMT-ADMIN-CONVITE-SUPER-ADMIN-ADMIN-000120.ts
```

Variáveis: `PLAYWRIGHT_BASE_URL`, `E2E_CLERK_USER_EMAIL`, `E2E_CLERK_USER_PASSWORD`, `CLERK_SECRET_KEY`.

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
