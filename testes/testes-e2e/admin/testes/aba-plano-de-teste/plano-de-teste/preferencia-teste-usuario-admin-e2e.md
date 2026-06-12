# 📋 Plano de Teste E2E — Preferência de Teste do Usuário (Admin)

**ID:** TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093
**Escopo pasta:** `testes/testes-e2e/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093.spec.ts`
**Tela-alvo:** Admin › Testes → modal "Rodar Testes" (seção **Testes Favoritos**)
**Tipo:** [ ] Unitário | [ ] Funcional | [x] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Pré-condições

- Execução em **staging** (nunca produção) — `PLAYWRIGHT_BASE_URL`.
- Sessão autenticada de admin Gravity (`gravity_admin = true`) via `storageState`.
- Backend com a migration `teste_favorito_usuario` aplicada.
- **QA é quem executa** após aprovação do dono.

**Objetivo geral:** validar o fluxo completo do usuário no navegador — salvar, aplicar e remover favorito — provando que a persistência é no banco (sobrevive a reload) e não em localStorage.

---

## Roteiro de execução

### ETAPA 1 — Abertura e estado inicial

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E01** | Logar como admin, abrir Admin › Testes e clicar em "Rodar Testes" | Modal abre com a seção **Testes Favoritos** visível · snapshot Percy "modal aberto (favoritos)" |

### ETAPA 2 — Salvar favorito

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E02** | Selecionar produto/ambiente/tipos e clicar em "Salvar configuração atual" | Favorito aparece na lista com rótulo correto + toast de confirmação · snapshot Percy "favorito salvo" |
| **E03** | Tentar salvar **sem nenhum tipo de teste marcado** | Ação bloqueada com aviso ao usuário — nenhum favorito criado (espelha o `min(1)` do Zod) |

### ETAPA 3 — Aplicar favorito

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E04** | Mudar a seleção atual e clicar em "Aplicar esta configuração" de um favorito | Produto, ambiente e tipos do modal voltam exatamente ao estado salvo no favorito |

### ETAPA 4 — Remover e persistência real

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **E05** | Clicar em "Remover favorito", recarregar a página (F5) e reabrir o modal | Favorito sumiu da lista **e continua ausente após reload** — prova de persistência no banco, não em localStorage · snapshot Percy "após exclusão" |

---

## Snapshots Percy

| # | Nome | Estado |
|---|------|--------|
| 1 | Admin/Rodar Testes — modal aberto (favoritos) | inicial |
| 2 | Admin/Rodar Testes — favorito salvo | após salvar |
| 3 | Admin/Rodar Testes — após exclusão de favorito | após remover + reload |

## Como rodar (QA, staging)

```bash
PLAYWRIGHT_BASE_URL=https://<staging> npx playwright test testes/testes-e2e/admin/testes/aba-plano-de-teste/plano-de-teste/TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093.spec.ts
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
