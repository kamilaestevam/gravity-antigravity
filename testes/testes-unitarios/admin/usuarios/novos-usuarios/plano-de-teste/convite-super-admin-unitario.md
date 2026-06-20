# 📋 Plano de Teste Unitário — Convite Super Admin (Admin › Usuários)

**ID:** TST-UNI-CONVITE-SUPER-ADMIN-ADMIN-000116  
**Task:** TASK-000302  
**Escopo pasta:** `testes/testes-unitarios/admin/usuarios/novos-usuarios/`  
**Spec:** `plano-de-teste/TST-UNI-CONVITE-SUPER-ADMIN-ADMIN-000116.test.ts`  
**Código-alvo:** `servicos-global/configurador/src/services/api-client.ts` (`adminConvidarUsuarioInputSchema`)  
**Tipo:** [x] Unitário | [ ] Funcional | [ ] E2E | [ ] CRO | [ ] EMT

> O modal Admin («O que será testado») agrupa os passos pelos títulos `### ETAPA …` abaixo. **Não remover** essa estrutura.

---

## Escopo

Contrato Zod do payload de convite admin (`adminConvidarUsuarioInputSchema`), espelhando
`AdminInviteSchema` no backend. Garante paridade front↔back antes do `fetch` (Mand. 06/09):
`id_organizacao_alvo` aceita cuid2 (`min(1)`, não `.cuid()` legado) e tipos de usuário válidos.

**Objetivo geral:** impedir envio de convite com org vazia e validar shapes de SUPER_ADMIN vs PADRAO.

---

## Roteiro de execução

### ETAPA 1 — `id_organizacao_alvo` obrigatório

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U01** | `safeParse` com `id_organizacao_alvo: ''` | `success === false` — string vazia barrada antes da API |

### ETAPA 2 — SUPER_ADMIN

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U02** | `safeParse` com `tipo_usuario: 'SUPER_ADMIN'` e id org não vazio (cuid2) | `success === true` — front pode enviar org placeholder; backend sobrescreve com Gravity-interna |

### ETAPA 3 — PADRAO (contraste)

| Passo | Ação | APROVADO quando |
|-------|------|-----------------|
| **U03** | `safeParse` com `tipo_usuario: 'PADRAO'`, org alvo e `workspaces_alvo: 'all'` | `success === true` — convite cliente exige org explícita no payload |

---

## Como rodar

```bash
npx vitest run --config testes/testes-unitarios/admin/vitest.config.ts TST-UNI-CONVITE-SUPER-ADMIN-ADMIN-000116
```

## 📊 Resultado: [ ] APROVADO | [ ] REPROVADO | [ ] RESSALVAS
