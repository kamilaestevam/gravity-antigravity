# 📋 Plano de Teste Cross-Organização — Preferência de Teste do Usuário (Admin)

**ID:** TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094
**Escopo pasta:** `testes/testes-cross-organizacao/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094.test.ts`
**Rotas-alvo:** `GET/POST/DELETE /api/v1/admin/testes-favoritos`
**Tipo:** [ ] Unitário | [ ] Funcional | [ ] E2E | [x] CRO | [ ] EMT

---

## Escopo e justificativa

A tabela `teste_favorito_usuario` mora no banco do Configurador (schema `public`) e é escopada
por `id_usuario` — **não há schema-per-organização** neste recurso. Portanto a fronteira de
isolamento aplicável é **cross-usuário**: dois admins Gravity de organizações distintas não podem
enxergar nem remover os favoritos um do outro. Os dois usuários do teste pertencem a organizações
diferentes (`org_alpha` / `org_beta`), cobrindo também o recorte cross-organização.

## Check-list de análise

- [x] **C01** — usuário B (org_beta) não enxerga favorito criado por A (org_alpha) — GET escopado
- [x] **C02** — usuário A continua enxergando o próprio favorito
- [x] **C03** — usuário B NÃO remove favorito de A (DELETE `count: 0` → 404); registro de A intacto
- [x] **C04** — POST de B grava com `id_usuario = usr_B` (nunca o de A)

## Como rodar

```bash
npx vitest run --config testes/testes-cross-organizacao/admin/vitest.config.ts TST-CRO-PREFERENCIA-TESTE-USUARIO-ADMIN-000094
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
