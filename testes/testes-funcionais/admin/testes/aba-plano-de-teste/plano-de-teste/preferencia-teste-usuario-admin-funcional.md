# 📋 Plano de Teste Funcional — Preferência de Teste do Usuário (Admin)

**ID:** TST-FUN-PREFERENCIA-TESTE-USUARIO-ADMIN-000092
**Escopo pasta:** `testes/testes-funcionais/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-FUN-PREFERENCIA-TESTE-USUARIO-ADMIN-000092.test.ts`
**Rotas-alvo:** `GET/POST/DELETE /api/v1/admin/testes-favoritos` (`server/routes/admin.ts`)
**Tipo:** [ ] Unitário | [x] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

---

## Escopo

Rotas REST do recurso `testes-favoritos` (model `TesteFavoritoUsuario`), com Prisma mockado
(`vi.hoisted`) e `requireAuth` mockado. Valida Zod, escopo por `id_usuario`, deduplicação,
limite (20) e ownership no DELETE.

## Check-list de análise

### 1. Leitura (GET)
- [x] **F01** — GET → 200 com `findMany({ where: { id_usuario } })`
- [x] **F02** — GET → 200 lista vazia

### 2. Criação (POST) — persistência + validação
- [x] **F03** — POST feliz → 201, `create.data` recebe `id_usuario` + todos os campos DDD
- [x] **F04** — POST sem `planos_resumo` (opcional) → 201
- [x] **F05** — POST combinação duplicada → 409 `FAVORITO_DUPLICADO`, sem `create`
- [x] **F06** — POST 21º favorito → 409 `FAVORITO_LIMITE`, sem `create`
- [x] **F07** — POST sem tipos → 400 `VALIDATION_ERROR`, sem `create`

### 3. Remoção (DELETE) — ownership
- [x] **F08** — DELETE → 200, `deleteMany({ where: { id, id_usuario } })`
- [x] **F09** — DELETE inexistente/de outro usuário (`count: 0`) → 404 `NOT_FOUND`

### 4. Autorização
- [x] **F10** — `PADRAO` bloqueado por `requireGravityAdmin` → 403, sem tocar o banco

## Como rodar

```bash
npx vitest run --config testes/testes-funcionais/admin/vitest.config.ts TST-FUN-PREFERENCIA-TESTE-USUARIO-ADMIN-000092
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
