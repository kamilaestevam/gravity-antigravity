# 📋 Plano de Teste Funcional — Preferência de Teste do Usuário (Admin)

**ID:** TST-FUN-PREFERENCIA-TESTE-USUARIO-ADMIN-000092
**Escopo pasta:** `testes/testes-funcionais/admin/testes/aba-plano-de-teste/`
**Spec:** `plano-de-teste/TST-FUN-PREFERENCIA-TESTE-USUARIO-ADMIN-000092.test.ts`
**Rotas-alvo:** `GET/POST/DELETE /api/v1/admin/testes-favoritos` (`server/routes/admin.ts`)
**Tipo:** [ ] Unitário | [x] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Rotas REST do recurso `testes-favoritos` (model `TesteFavoritoUsuario`), com Prisma mockado
(`vi.hoisted`) e `requireAuth` mockado. Valida Zod, escopo por `id_usuario`, deduplicação,
limite (20) e ownership no DELETE.

**Objetivo geral:** garantir que a API só leia/grave/apague favoritos do usuário autenticado, rejeite payload inválido antes do banco e aplique as regras de negócio (duplicado → 409, limite de 20 → 409, ownership no DELETE → 404).

---

## Roteiro de execução

### ETAPA 1 — Leitura (GET)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | `GET /api/v1/admin/testes-favoritos` com usuário autenticado que possui favoritos | **200** e o Prisma recebe `findMany({ where: { id_usuario } })` — lista sempre escopada ao usuário logado |
| **F02** | `GET` com usuário sem nenhum favorito | **200** com lista vazia `[]` (nunca erro, nunca favoritos de terceiros) |

### ETAPA 2 — Criação (POST) — persistência + validação

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F03** | `POST` feliz com payload completo (produto, ambiente, tipos, planos, `planos_resumo`) | **201** e `create.data` recebe `id_usuario` do autenticado + todos os campos no padrão DDD (`*_teste_favorito_usuario`) |
| **F04** | `POST` sem `planos_resumo` (campo opcional) | **201** — snapshot ausente não bloqueia a criação |
| **F05** | `POST` de combinação já existente (mesmo produto/ambiente/tipos/planos) | **409** com código `FAVORITO_DUPLICADO` e `create` **não** é chamado |
| **F06** | `POST` do 21º favorito do usuário | **409** com código `FAVORITO_LIMITE` e `create` **não** é chamado (teto de 20 por usuário) |
| **F07** | `POST` com `tipos: []` (payload inválido) | **400** `VALIDATION_ERROR` barrado pelo Zod **antes** de qualquer acesso ao banco |

### ETAPA 3 — Remoção (DELETE) — ownership

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F08** | `DELETE /testes-favoritos/:id` de um favorito do próprio usuário | **200** e o Prisma recebe `deleteMany({ where: { id, id_usuario } })` — id sozinho nunca basta |
| **F09** | `DELETE` de id inexistente ou pertencente a outro usuário (`count: 0`) | **404** `NOT_FOUND` — impossível apagar favorito alheio mesmo conhecendo o id |

### ETAPA 4 — Autorização

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F10** | Qualquer rota chamada por usuário `PADRAO` (sem `gravity_admin`) | **403** barrado por `requireGravityAdmin`, sem nenhuma query no banco |

---

## Como rodar

```bash
npx vitest run --config testes/testes-funcionais/admin/vitest.config.ts TST-FUN-PREFERENCIA-TESTE-USUARIO-ADMIN-000092
```

## 📊 Resultado: [x] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
