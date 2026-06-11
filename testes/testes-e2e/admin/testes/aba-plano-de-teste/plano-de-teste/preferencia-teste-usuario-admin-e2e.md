# 📋 Plano de Teste E2E — Preferência de Teste do Usuário (Admin)

**ID:** TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093
**Escopo pasta:** `testes/testes-e2e/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-E2E-PREFERENCIA-TESTE-USUARIO-ADMIN-000093.spec.ts`
**Tela-alvo:** Admin › Testes → modal "Rodar Testes" (seção **Testes Favoritos**)
**Tipo:** [ ] Unitário | [ ] Funcional | [x] E2E | [ ] CRO | [ ] EMT

---

## Pré-condições

- Execução em **staging** (nunca produção) — `PLAYWRIGHT_BASE_URL`.
- Sessão autenticada de admin Gravity (`gravity_admin = true`) via `storageState`.
- Backend com a migration `teste_favorito_usuario` aplicada.
- **QA é quem executa** após aprovação do dono.

## Check-list de análise (fluxo do usuário)

- [ ] **E01** — modal abre, seção "Testes Favoritos" visível (Percy: estado inicial)
- [ ] **E02** — "Salvar configuração atual" cria favorito + toast de confirmação (Percy)
- [ ] **E03** — favoritar sem tipo marcado é bloqueado com aviso
- [ ] **E04** — "Aplicar esta configuração" repõe produto/ambiente/tipos selecionados
- [ ] **E05** — "Remover favorito" tira da lista e **persiste após reload** (banco, não localStorage) (Percy)

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
