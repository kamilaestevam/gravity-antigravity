# 📋 Plano de Teste Funcional — Convite Super Admin (Admin › Usuários)

**ID:** TST-FUN-CONVITE-SUPER-ADMIN-ADMIN-000117  
**Task:** TASK-000302  
**Escopo pasta:** `testes/testes-funcionais/admin/usuarios/novos-usuarios/`  
**Spec:** `plano-de-teste/TST-FUN-CONVITE-SUPER-ADMIN-ADMIN-000117.test.ts`  
**Rotas-alvo:** `POST /api/v1/admin/usuarios/convidar` (`server/routes/admin.ts`)  
**Tipo:** [ ] Unitário | [x] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Rota REST de convite cross-org com Prisma e serviços mockados (`vi.hoisted`).
Valida override de org Gravity-interna para convite `SUPER_ADMIN`, bloqueio de ADMIN read-only
e validação Zod de entrada (Mand. 04 — acesso global Super Admin).

**Objetivo geral:** garantir que o handler chame `resolverIdOrganizacaoGravity()` para SUPER_ADMIN,
ignore org errada do front e rejeite ator ADMIN ou payload inválido.

---

## Roteiro de execução

### ETAPA 1 — Convite SUPER_ADMIN feliz

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F01** | `POST` com ator `SUPER_ADMIN`, `tipo_usuario: SUPER_ADMIN`, `id_organizacao_alvo` errado no body | **201** · `resolverIdOrganizacaoGravity` chamado 1× · `convidarUsuarioService` recebe `id_organizacao_alvo` = org Gravity canônica |

### ETAPA 2 — Autorização

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F02** | `POST` com ator `ADMIN` (gravity_admin, read-only neste endpoint) | **403** · código `ADMIN_SOMENTE_LEITURA` · serviço **não** invocado |

### ETAPA 3 — Validação Zod

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **F03** | `POST` com `id_organizacao_alvo: ''` | **400** · código `VALIDATION_ERROR` · barrado antes do serviço |

---

## Como rodar

```bash
npx vitest run --config testes/testes-funcionais/admin/vitest.config.ts TST-FUN-CONVITE-SUPER-ADMIN-ADMIN-000117
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
